
/*
  This section is the one that takes the object emitted by every interface
  action from the user. The object contains the current state of all the inputs
  available in the same card.

  Current strategy is to pass the object trough a series of functions that
  process one by one the parameters used for the current availability query
  and passes them to the user_settings parameter stored in the user properties
  of the script.

  This preserves the current status of the pannel at all times and is user wide,
  meaning that if one user has 2 open clients, the latest change made is used. 
*/

function settings_data_handler(data_received){
  let user_settings = state_fetch_or_create_user(data_received)
  settings_translate_dotw(user_settings,data_received)
  settings_translate_duration(user_settings,data_received)
  settings_translate_date_frame(user_settings,data_received)
  settings_translate_hour_frame(user_settings,data_received)
  settings_translate_timezone(user_settings,data_received)
  settings_translate_guest_status(user_settings,data_received)
  settings_translate_blocking_calendars(user_settings,data_received)
  save_user_property("user_settings",user_settings)
  return card_quick_feedback("Settings change saved")
}

function settings_translate_dotw(user_settings,data_received){
  for (let available_days in user_settings.dotw) {
    if (data_received.formInputs.available_days.includes(available_days.toLowerCase())){
      user_settings.dotw[available_days] = true
    }else{
      user_settings.dotw[available_days] = false
    }
  }
}

function settings_translate_duration(user_settings,data_received){
  let userinput = data_received.formInput.meeting_duration
  let default_duration = 30
  let minutes_in_a_day = 60 * 24
  if(userinput == undefined){
    //do nothing, as there was no input
  }else
  if (isNaN(userinput)) {
    user_settings.duration = default_duration
  } else 
  if (userinput > minutes_in_a_day) {
    user_settings.duration = minutes_in_a_day
  } else
  if (userinput < 1) {
    user_settings.duration = 1
  }else{
    user_settings.duration = userinput
  }
}

function settings_translate_date_frame(user_settings,data_received) {
  /*
    2022/06/04 Bugfix

    It is important to note that this parameter comes as a timestamp dated to the
    selected days in the interface calendar at 00:00 hours in GMT 0

    This was causing irregular output when selecting dates with the calendar as
    the remainder of the algorithm was counting on the date to be the 00:00 hours
    of the selected date altough shifted to the CURRENT SCRIPT TIMEZONE

    This is to match the layout observed by the user in the calendar app when
    seeing the weekly display.

    *-*

    Note: 

    An alternate path could be to perform queries from the persepective of the
    target timezone. This because I think there will be problems when searching
    for availability between timezones that shift their date.
  */
  user_settings.date_frame.start = new Date(data_received.formInput.evaluate_from.msSinceEpoch - from_UTC_to_ms(user_settings.script_user_offset))
  user_settings.date_frame.end = new Date(data_received.formInput.evaluate_to.msSinceEpoch - from_UTC_to_ms(user_settings.script_user_offset))
}

function settings_translate_hour_frame(user_settings,data_received){
  user_settings.hour_frame.start.hours = data_received.formInput.active_start.hours
  user_settings.hour_frame.start.minutes = data_received.formInput.active_start.minutes

  user_settings.hour_frame.end.hours = data_received.formInput.active_end.hours
  user_settings.hour_frame.end.minutes = data_received.formInput.active_end.minutes
}

function settings_translate_timezone(user_settings,data_received) {
  if (data_received.formInput.target_timezone != undefined){
    user_settings.target_timezone = data_received.formInput.target_timezone
    user_settings.target_offset = search_offset(data_received.formInput.target_timezone,user_settings)
    calculate_browser_to_target_offset(user_settings)
  }
}

function settings_translate_guest_status(user_settings,data_received) {
  for (let settings_blocking_status in user_settings.guest_status){
    if(data_received.formInputs.guest_status.includes(settings_blocking_status.toLowerCase())){
      user_settings.guest_status[settings_blocking_status] = true
    }else{
      user_settings.guest_status[settings_blocking_status] = false
    }
  }
}

function settings_translate_blocking_calendars(user_settings,data_received){
  for (let cal_id in user_settings.blocking_calendars){
    if(data_received.formInputs.blocking_calendars.includes(user_settings.blocking_calendars[cal_id].name)){
      user_settings.blocking_calendars[cal_id].blocking = true
    }else{
      user_settings.blocking_calendars[cal_id].blocking = false
    }
  }
}