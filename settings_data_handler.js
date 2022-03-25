
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
    let user_settings = fetch_user_property("user_settings")
    settings_translate_dotw(user_settings,data_received)
    settings_translate_duration(user_settings,data_received)
    settings_translate_date_frame(user_settings,data_received)
    settings_translate_hour_frame(user_settings,data_received)
    settings_translate_timezone(user_settings,data_received)
    settings_translate_guest_status(user_settings,data_received)
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
    user_settings.duration.hours = data_received.formInput.meeting_duration.hours
    user_settings.duration.minutes = data_received.formInput.meeting_duration.minutes;
  }
  
  function settings_translate_date_frame(user_settings,data_received){
    user_settings.date_frame.start = new Date(data_received.formInput.evaluate_from.msSinceEpoch)
    user_settings.date_frame.end = new Date(data_received.formInput.evaluate_to.msSinceEpoch)
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
      user_settings.appropiate_offset = search_offset(data_received.formInput.target_timezone)
    }else{
      user_settings.target_timezone = data_received.userTimezone.id
      user_settings.appropiate_offset = from_ms_to_offset_hours(data_received.userTimezone.offSet)
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