/*
  TODO: This function must create the totality of the cycle text output. 
*/
function build_main_output(user_settings){
    let events_from_visible_calendars = check_calendars(
        user_settings.date_frame.start,
        user_settings.date_frame.end
    )
    let text_output = do_the_thing(events_from_visible_calendars,user_settings)
    return CardService.newTextParagraph().setText(text_output)
}

/*
    This function extracts key information from the available calendars
    in the user profile, from what has been observed, we might make this an
    automated call at query execution so that only the visible calendars are
    considered as blocking 03/08/2022
*/
function get_not_hidden_calendars(){
    let calendars = CalendarApp.getAllCalendars()
    let processed = {}
    for (let calendar of calendars){
        if (!calendar.isHidden()) {
            processed[calendar.getId()] = calendar
            /*

            informational 

            {
              "id":calendar.getId(),
              "name":calendar.getName(),
              "tz":calendar.getTimeZone(),
              "hidden":calendar.isHidden(),
              "owned":calendar.isOwnedByMe(),
              "selected":calendar.isSelected(),
              "primary":calendar.isMyPrimaryCalendar()
            }
            */
        }
    }
    return processed
}

function check_calendars(start_date,end_date) {
  try{
    let cal_object = get_not_hidden_calendars()
    let reminder = {}

    for (let cal_id in cal_object) {
    let cal = cal_object[cal_id]
    let events_in_range = cal.getEvents(start_date,end_date)
      for (let events of events_in_range) {
        reminder[events.getId()] = {
          "calendar":cal.getName(),
          "c_id":cal.getId(),
          "title":events.getTitle(),
          "startTime":events.getStartTime(),
          "endTime":events.getEndTime(),
          "status":""+events.getMyStatus()
        }
      }    
    }

    return reminder

  }catch(err){
      console.log("check:calendars error",{err})
  }
}
/*
    This function is to control time
*/
function ohm(user_settings){
  my_clock = {}
  my_clock.now = new Date()
  my_clock.now_as_ms = my_clock.now.getTime()
  my_clock.locale = my_clock.now.toLocaleString()
  my_clock.now_in_utc = my_clock.now.toUTCString()
  my_clock.today_short = user_settings.weekdays[my_clock.now.getDay()]
  my_clock.local_offset = my_clock.now.getTimezoneOffset() / 60 * -1
  my_clock.target_offset = user_settings.appropiate_offset
  my_clock.offset_distance = my_clock.local_offset - my_clock.target_offset
  my_clock.offset_as_ms = my_clock.offset_distance * 60 * 60 * 1000
  my_clock.now_as_there = new Date(my_clock.now_as_ms - my_clock.offset_as_ms)
  return my_clock
}


/*
    This is the core availability calculator, takes the events
    from the visible calendars and compares against filters to create the text output
*/

function do_the_thing(events_from_visible_calendars,user_settings){
    
  /*
    Step 0:
      It is all about time, this function controls it
  */
  let my_clock = ohm(user_settings)
  
  /*
    Step 1:
      Calculate the dates that are being requested
      these are calculated from local time, offset is applied
      only on output
  */

  if (user_settings.date_frame.start > user_settings.date_frame.end) {
    user_settings.date_frame.start = what_day_is_tomorrow(),
    user_settings.date_frame.end = what_day_is_a_week_from_tomorrow()
    save_user_property("user_settings",user_settings)
  }

  let start_date = user_settings.date_frame.start
  let end_date = user_settings.date_frame.end

  let limit = 30
  let progressor = 0
  let date_array = []

  while (progressor < limit) {
      let tomorrows = new Date(start_date.getTime() + (get_a_day_in_ms() * (progressor)))
      if (tomorrows.getTime() < end_date.getTime()) {
        let evd_short = user_settings.weekdays[tomorrows.getDay()]
        if (user_settings.dotw[evd_short] == true){
          date_array.push(tomorrows)  
        }          
      }else{
          break
      }
      progressor++
  }

  let eval_date_number = date_array.length

  /*
    Step 2:
      for each date, we will derive a timeframe to compare,
      this controlled by the appropiate filter on the page
  */
  let specific_timeframe_array = []
  let start_hour = user_settings.hour_frame.start.hours
  let start_minute = user_settings.hour_frame.start.minutes
  let end_hour = user_settings.hour_frame.end.hours
  let end_minute = user_settings.hour_frame.end.minutes 
  let start_miliseconds = (start_hour * 60 * 60 * 1000)+(start_minute * 60 * 1000)
  let end_miliseconds = (end_hour * 60 * 60 * 1000)+(end_minute * 60 * 1000)
  for (let dates of date_array) {
    specific_timeframe_array.push([dates.getTime()+start_miliseconds,dates.getTime()+end_miliseconds])
  }

  /*
    Step 3:
      Now we will create a final array that will hold an array
      per entry with the length of the evaluated timeframe
  */
  let slotted_timeframe_array = []
  let sought_timeframe = ((end_miliseconds - start_miliseconds) / 1000) / 60
  for (let j = 0; j < eval_date_number ; j++) {
    let truearray = []
    for (let k = 0; k < sought_timeframe; k++){
      truearray.push(true)
    }
    slotted_timeframe_array.push(truearray)
  }
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
  for (var i = 0 ; i < eval_date_number ; i++) {
    let date = date_array[i]
    let offset_date = new Date(date.getTime() + my_clock.offset_as_ms)
    let spef_tf = specific_timeframe_array[i]
    let slot_tf = slotted_timeframe_array[i]
    let dt = user_settings.weekdays[offset_date.getDay()] + " " + (offset_date.getMonth()+1) + "/" + offset_date.getDate()
    to = to + dt
    /*
      Second and pontentially most most expensive loop under an scenario of too many events
    */
    let matched_events = 0
    for (let event_id in events_from_visible_calendars) {
      let events = events_from_visible_calendars[event_id]
      /*
        This checks that the status of the calendar in blocking events is true
        if so, it proceeds, else it skips

        Also commit_pass handles the guest participation status filter
      */

        if (user_settings.guest_status[events.status]) {
        /*
        This checks if the event timeframe intersects with the day evaluated timeframe
        with (or) over the two (ands) answers the question:
        
        ¿Do start or end time fall within the evaluated timeframe?
      */
        if (
          events.epoch[0] > spef_tf[0] && events.epoch[0] < spef_tf[1] ||
          events.epoch[1] > spef_tf[0] && events.epoch[1] < spef_tf[1]
          ) {
            matched_events++
            /*
              TODO: Explain later
            */
          let event_start_distance_to_timeframe_start = events.epoch[0] - spef_tf[0]
          let event_end_distance_to_timeframe_start = events.epoch[1] - spef_tf[0]
          if (event_start_distance_to_timeframe_start > 0) {
            /*
              Standard case, the event began within the revised timeframe
              tag_minute_array(array_to_tag,array_moment_0,epoch_start,epoch_end)
            */
            tag_minute_array(slot_tf,spef_tf[0],events.epoch[0],events.epoch[1])
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
            tag_pre_start(slot_tf,spef_tf[0],events.epoch[1])
          }
        }
      }        
    }
    /*
      Finally we run over the minute memory array to find the adjacent blocks
      that add up to the required meeting time
    */
    let desired_meeting_duration = (user_settings.duration.hours * 60) + user_settings.duration.minutes
    let desired_timezone = user_settings.appropiate_offset
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
            to = to + write_available_timeframe(spef_tf[0],last_start_index,action_index + 1,action_index,false,my_clock)
        }          
      }else{
        /*check if accumulated progress satisfies minimum desired minutes*/
        if (progress_counter >= desired_meeting_duration) {
            assembled_packs++
            to = to + write_available_timeframe(spef_tf[0],last_start_index,action_index,action_index,false)
            last_start_index = action_index
        }
        /*slot is unavailable*/
        progress_counter = 0
      }   
      action_index++
    }
        /*
    if (ao.flow.show_utc === true) {
      to = to +" "+desired_timezone  
    }

    if (ao.flow.append_to_output !== "") {
      to = to +" "+ao.flow.append_to_output
    }
    */
    to = to + "\n"
  }
  return to
}

function write_available_timeframe(
  timeframe_epoch_start,
  index_of_availability_start,
  index_of_availability_end,
  current_index,
  close,
  my_clock){
      /*
        This is where we will implement the timezone changer. 
      */

    /*target output of this section looks like "3:30p - 4p, 4:30p - 5p" */
    let modifier = my_clock.offset_as_ms
    let proposed_start_time = new Date(timeframe_epoch_start + modifier + (index_of_availability_start * 60000))
    let proposed_end_time = new Date(timeframe_epoch_start + modifier + (index_of_availability_end * 60000))
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