/*
  TODO: This function must create the totality of the cycle text output. 
*/
function build_main_output(user_settings){
  let events_from_blocking_calendars = check_calendars(user_settings)
  user_settings.evaluated_events = Object.keys(events_from_blocking_calendars).length
  user_settings.events_from_blocking_calendars = events_from_blocking_calendars
 
    /*
      Bugfix 05/24/22
      The offset application happens at
        a) default state creation
        and
        b) at output creation time, this check

      This is in order to fix a bug where if you select a timezone on the
      settings section of the google calendar, this will shift the script
      timezone to what you selected. 

      This caused a conflict at output printout time, since calculations where
      being done with browser local time and this could not properly pair up
      with the calendar timezone.    
  */
  let tomorrow = what_day_is_tomorrow(user_settings)
  if (user_settings.date_frame.start > user_settings.date_frame.end || 
    user_settings.date_frame.start < tomorrow) {
      default_state_date_frame(user_settings)
    save_user_property("user_settings",user_settings)
  }  
  do_the_thing(events_from_blocking_calendars,user_settings)
  save_user_property("last_report",user_settings)
  return CardService.newTextParagraph().setText(user_settings.output)
}

function update_available_calendars(user_settings){
  let cal_array = CalendarApp.getAllCalendars()
  let available_calendars = {}
  for (let cals of cal_array) {
    available_calendars[cals.getId()] = cals
  }
  /*
    Upon first start or memory reset, the only email considered / requested is
    the user one
  */
  if (user_settings.blocking_calendars == undefined){
    user_settings.blocking_calendars = {[user_settings.email]:{"blocking":true,"name":user_settings.email}}

    /*
      In the following scenarios, if there are existing items in both the 
      blocking list and the available list, these are ignored
    */
  }else{
    /*remove inaccesible elements from the blocking list*/
    for(let bcal in user_settings.blocking_calendars){
      if (available_calendars[bcal] == undefined) {
        delete user_settings.blocking_calendars[bcal]
      }
    }

    /*add new accesible elements to the blocking initialized as false*/
    for(let bcal in available_calendars){
      if (user_settings.blocking_calendars[bcal] == undefined) {
        user_settings.blocking_calendars[bcal] = {
          "blocking":false,
          "name":available_calendars[bcal].getName()
        }
      }
    }
  }
}

function check_calendars(user_settings) {
  try{
    let start_date = user_settings.date_frame.start
    let end_date = user_settings.date_frame.end
    let blocking_calendars = user_settings.blocking_calendars
    let cal_object = CalendarApp.getAllCalendars()
    let reminder = {}
    for (let cal of cal_object) {
      if (blocking_calendars[cal.getId()].blocking){
        let events_in_range = cal.getEvents(start_date,end_date)
        for (let events of events_in_range) {
          reminder[events.getId()] = {
            "calendar":cal.getName(),
            "c_id":cal.getId(),
            "timezone":cal.getTimeZone(),
            "title":events.getTitle(),
            "startTime":events.getStartTime(),
            "endTime":events.getEndTime(),
            "status":""+events.getMyStatus()
          }
        }
      }   
    }
    return reminder
  }catch(err){
      throw err
  }
}

/*
    This is the core availability calculator, takes the events
    from the visible calendars and compares against filters to create the text output
*/
function do_the_thing(events_from_blocking_calendars,user_settings){
  /*
    Step 1: assert the dates that will be evaluated
  */
  main_process_date_array(user_settings)

  /*
    Step 2:
      for each date, we will derive a timeframe to compare,
      this is controlled by the appropiate filter in settings
  */
  main_process_specific_timeframe_array(user_settings)


  /*
    Step 3:
      Now we will create a final array that will hold an array
      per entry with the length of the evaluated timeframe
  */
  main_process_slotted_timeframe_array(user_settings)
  
  /*
    Step 4:
      now we can run the cycle for each required day!
      here we build the output as it becomes available

      ex

      - Fri 9/17, 3:30p - 4p, 4:30p - 5p CT
      - Mon 9/20, 11a - 11:30a, 3p - 4:30p CT
      - Wed 9/22, 11a - 12p, 1p - 3p CT
      - Thu 9/23, 2p - 3p, 3:30p - 4p CT

      available references:
      date_array
      specific_timeframe_array
      slotted_timeframe_array

      data source:
      ao.cal_events
  */
  let to = ""
  /*
    First main cycle, iterates over the selected dates
    !!!all evaluations are performed within this array!!!
  */
  user_settings.report = []
  for (var i = 0 ; i < user_settings.number_of_days ; i++) {
    let od = offset_date(user_settings.date_array[i], user_settings.offset_as_ms)
    let spef_tf = user_settings.specific_timeframe_array[i]
    let slot_tf = user_settings.slotted_timeframe_array[i]
    let dt = user_settings.weekdays[od.getDay()] + " " + (od.getMonth()+1) + "/" + od.getDate()
    to = to + dt

    user_settings.report.push([user_settings.date_array[i],od])
    /*
      Second and pontentially most expensive loop under an scenario of too many events
    */
    let matched_events = 0
    for (let event_id in events_from_blocking_calendars) {
      let events = events_from_blocking_calendars[event_id]
      /*
        This checks that the status of the calendar in blocking events is true
        if so, it proceeds, else it skips
      */
      if (user_settings.guest_status[events.status]) {

      /*
        This checks if the event timeframe intersects with the day evaluated timeframe
        with (or) over the two (ands) answers the question:
        
        ¿Do start or end time fall within the evaluated timeframe?
      */
        if (
          events.startTime > spef_tf[0] && events.startTime < spef_tf[1] ||
          events.endTime > spef_tf[0] && events.endTime < spef_tf[1]
          ) {
            matched_events++
            /*
              TODO: Explain later
            */
          let event_start_distance_to_timeframe_start = events.startTime - spef_tf[0]
          let event_end_distance_to_timeframe_start = events.endTime - spef_tf[0]
          if (event_start_distance_to_timeframe_start > 0) {
            /*
              Standard case, the event began within the revised timeframe
              tag_minute_array(array_to_tag,array_moment_0,epoch_start,epoch_end)
            */
            tag_minute_array(slot_tf,spef_tf[0],events.startTime,events.endTime)
          }else{
            /*
              The event started before the start time and ends within its timeframe
              (it could not intersect if it also ended out of the evaluated time) --> 
              this means that if you have an all day event, or events larger than the 
              explored timeframe, it could not be accounted for, later we can add a
              condition to answer to those cases, perhaps in earlier steps

              So this case stars from moment 0 of evaluation and blocks all time until
              the end time of that event
            */
            tag_pre_start(slot_tf,spef_tf[0],events.endTime)
          }
        }
      }        
    }
    /*
      Finally we run over the minute memory array to find the adjacent blocks
      that add up to the required meeting time
    */
    let desired_meeting_duration = user_settings.duration
    let last_start_index = 0
    let progress_counter = 0
    let action_index = 0
    let available_minutes = 0
    let assembled_packs = 0
    let maximum_range = slot_tf.length
    for (let m_slot of slot_tf) {
      if (m_slot == true) {
        /*slot is available, add to informative count*/
        available_minutes++
        /*if first true, initialize last start*/
        if (progress_counter == 0) {
          last_start_index = action_index
        }
        /*available slot found towards objective*/
        progress_counter++
        /*
          if time limit is achieved pack and send
          verify if it satisfices the minimum lenght and decide to send or not
        */
        if (action_index == maximum_range - 1 && progress_counter >= desired_meeting_duration) {
            /*
              write_available_timeframe(
              timeframe_epoch_start,
              index_of_availability_start,
              index_of_availability_end,
              current_index,
              close)
            */
            assembled_packs++
            to = to + write_available_timeframe(spef_tf[0],last_start_index,action_index + 1,action_index,false,user_settings)
        }          
      }else{
        /*check if accumulated progress satisfies minimum desired minutes*/
        if (progress_counter >= desired_meeting_duration) {
            assembled_packs++
            to = to + write_available_timeframe(spef_tf[0],last_start_index,action_index,action_index,false,user_settings)
            last_start_index = action_index
        }
        /*slot is unavailable*/
        progress_counter = 0
      }   
      action_index++
    }
    to = to + "\n"
  }
  to = to + `
  Browser Offset:${local_utc_offset()}

  Script Timezone:${user_settings.script_user_timezone}
  Script Offset:${user_settings.script_user_offset}
  Difference:${user_settings.script_offset_distance}

  Output Timezone:${user_settings.target_timezone}
  Output Offset:${user_settings.target_offset}
  Difference:${user_settings.offset_distance}
  `

  user_settings.output = to
}

function write_available_timeframe(
  timeframe_epoch_start,
  index_of_availability_start,
  index_of_availability_end,
  current_index,
  close,
  user_settings){
      /*
        This is where we will implement the timezone changer. 
      */

    /*target output of this section looks like "3:30p - 4p, 4:30p - 5p" */
    let proposed_start_time = new Date(timeframe_epoch_start -  user_settings.offset_as_ms + (index_of_availability_start * 60000))
    let proposed_end_time = new Date(timeframe_epoch_start - user_settings.offset_as_ms + (index_of_availability_end * 60000))
    let p_start_hours = proposed_start_time.getHours()
    let p_start_minutes = proposed_start_time.getMinutes()
    let p_end_hours = proposed_end_time.getHours()
    let p_end_minutes = proposed_end_time.getMinutes()

    let reply_body = ", "+hour_formatter(p_start_hours)
    if (p_start_minutes != 0) {
      reply_body = reply_body + ":"+add_trail(p_start_minutes)
    }

    reply_body = reply_body + aorp(p_start_hours) + " - "+hour_formatter(p_end_hours)
    if (p_end_minutes != 0) {
      reply_body = reply_body + ":"+add_trail(p_end_minutes)
    }
    reply_body = reply_body + aorp(p_end_hours)
    return reply_body
  }

    //converts hours from 24 hours to 12 hours format along with function aorp
    function hour_formatter(hour){
      if (hour == 0){return hour}
      if (hour <= 12){
        return hour
      }else{
        return  hour - 12
      }
    }
  
    //decides wheter the tag for (am or pm) is applied to output
    function aorp(number){
      if (number == 0){return "a"}
      if (number < 12) {return "a"}
      if (number >= 12) {return "p"}
    }
  
    //adds a 0 to numbers 0 trough 9 to express minutes on a clock format XX:0N
    function add_trail(number){
      if (number < 10){
        return "0"+number
      }else{
        return number
      }
    }

 /*Tags a timeframe unavailable in a slot array*/
 function tag_minute_array(array_to_tag,array_moment_0,epoch_start,epoch_end){
  /*
    this is the moment in which the minute 0 of the event begins
  */
  let block_1_epoch = epoch_start - array_moment_0
  /*
    this is the index in the slotted time array where to start
    if all tags play nice and it is always divisible to a minute as it should be
    it should always be divisible for by 60000, if this provides a non natural number
    it wont work, we can do modulo, but I would like to know the scenarios that merit it
  */
  let block_1_index = block_1_epoch / 60000
  /*
    This counts the amount of blocks by dividing among ms in a second
  */
  let number_of_blocks = (epoch_end - epoch_start) / 60000
  /*
    While we have calculated the size of the events these might be longer
    than the expected timeframe
    we tag the memory slot now
  */
  let sought_size = array_to_tag.length
  for (let i = 0;i < number_of_blocks && i + block_1_index < sought_size; i++) {
    array_to_tag[i+block_1_index] = false
  }
}

/*Tags unavailable slots from pos 0 until given epoch*/
function tag_pre_start (array_to_tag,array_moment_0,epoch_end){
  /*
    This function blocks when the event started before the spotted timeframe
  */
  let difference = epoch_end - array_moment_0
  let number_of_blocks = (difference) / 60000
  let sought_size = array_to_tag.length

  for (let i = 0;i < number_of_blocks && i < sought_size; i++) {
    array_to_tag[i] = false
  }
}

/*
  Date Array constructor:

  This is the base for the rest of the calculations
  It creates an array with a number of dates equal to the difference between
  start deate and end date. 
*/

function main_process_date_array(user_settings){
  let date_array = []
  let day_array = []

  let start_date = user_settings.date_frame.start
  let end_date = user_settings.date_frame.end

  let limit = 30
  let progressor = 0

  while (progressor < limit) {
    let tomorrows = new Date(start_date.getTime() + (get_a_day_in_ms() * (progressor)))
    if (tomorrows.getTime() < end_date.getTime()) {
      let clock_shifted_tomorrow = offset_date(tomorrows,user_settings.script_offset_as_ms)
      let evd_short = user_settings.weekdays[clock_shifted_tomorrow.getDay()]
      day_array.push([evd_short,user_settings.dotw[evd_short]])
      if (user_settings.dotw[evd_short]){
        date_array.push(tomorrows)  
      }        
    }else{
        break
    }
    progressor++
  }
  user_settings.date_range = progressor
  user_settings.number_of_days = date_array.length
  user_settings.date_array = date_array
  user_settings.day_array = day_array
}

/*
  Specific Timeframe Array Constructor
  This is an array that adds to the times set at 0 hours of the date_array to
  the desired start and end service hours.
*/
function main_process_specific_timeframe_array(user_settings){
  let specific_timeframe_array = []
  let start_hour = user_settings.hour_frame.start.hours
  let start_minute = user_settings.hour_frame.start.minutes
  let end_hour = user_settings.hour_frame.end.hours
  let end_minute = user_settings.hour_frame.end.minutes 
  let start_miliseconds = (start_hour * 60 * 60 * 1000)+(start_minute * 60 * 1000)
  let end_miliseconds = (end_hour * 60 * 60 * 1000)+(end_minute * 60 * 1000)
  for (let dates of user_settings.date_array) {
    specific_timeframe_array.push([dates.getTime()+start_miliseconds,dates.getTime()+end_miliseconds])
  }
  user_settings.specific_timeframe_array = specific_timeframe_array
  user_settings.start_miliseconds = start_miliseconds
  user_settings.end_miliseconds = end_miliseconds
}

/*
  Slotted Timeframe Array Constructor
  This function returns a boolean array with one slot per minute in the
  evaluated timeframe. 
  It is used by the algorithm to tag the timeframes in which there are blocking
  events and to later create the available time packages. 
*/
function main_process_slotted_timeframe_array(user_settings){
  let slotted_timeframe_array = []
  let sought_timeframe = ((user_settings.end_miliseconds - user_settings.start_miliseconds) / 1000) / 60
  for (let j = 0; j < user_settings.number_of_days ; j++) {
    let truearray = []
    for (let k = 0; k < sought_timeframe; k++){
      truearray.push(true)
    }
    slotted_timeframe_array.push(truearray)
  }
  user_settings.slotted_timeframe_array = slotted_timeframe_array
}