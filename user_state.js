/*
  Controls the creation of default settings or the loading of existing ones

    Parameters are:

    email
    first time the user connected
    days of the week to check for availability
    duration of the desired timeframe to look for
    range of dates in which to check for availability
    range of hours in which to check for availibility
    guest status to consider unavailable on reviewed events
    last seen date and time
    application loaded count
*/

function state_fetch_or_create_user(){
    let mem_fetch = fetch_user_property("user_settings")
    let user_settings
    if (mem_fetch.email === undefined) {
      user_settings = current_user_settings_default()
      save_user_property("user_settings",user_settings)
    }else{
      user_settings = mem_fetch
      user_settings.last_connection = new Date()
      user_settings.load_event = user_settings.load_event + 1
      save_user_property("user_settings",user_settings)
    } 

    return user_settings
}

/*
    Here are the default settings at user launch (or after a memory reset)
*/
function current_user_settings_default(){
    let user_settings = {}
    user_settings.version = "0.0.1 Reconstruction of webapp features"
    user_settings.email = Session.getActiveUser().getEmail()
    user_settings.load_event = 1
    user_settings.first_connection = new Date()
    user_settings.last_connection = new Date()
    user_settings.dotw = {
        "Mon":true,
        "Tue":true,
        "Wed":true,
        "Thu":true,
        "Fri":true,
        "Sat":false,
        "Sun":false
    }
    user_settings.duration = {
        "hours":0,
        "minutes":30
    }
    user_settings.date_frame = {
        "start":new Date().toJSON(),
        "end":new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7).toJSON()
    }
    user_settings.hour_frame = {
        "start":{
            "hours":9,
            "minutes":0
        },
        "end":{
            "hours":17,
            "minutes":0
        }
    }
    user_settings.guest_status = {
        "OWNER":false,
        "YES":true,
        "NO":false,
        "MAYBE":true,
        "INVITED":false
    }
    
    return user_settings
}

/*
    This function extracts key information from the available calendars
    in the user profile, from what has been observed, we might make this an
    automated call at query execution so that only the visible calendars are
    considered as blocking 03/08/2022
*/
function update_settings_with_available_calendars(){
    let calendars = CalendarApp.getAllCalendars()
    let processed = {}
    for (let calendar of calendars){
        processed[calendar.getId()] = {
            "id":calendar.getId(),
            "name":calendar.getName(),
            "tz":calendar.getTimeZone(),
            "hidden":calendar.isHidden(),
            "owned":calendar.isOwnedByMe(),
            "selected":calendar.isSelected(),
            "primary":calendar.isMyPrimaryCalendar()
        }
    }
    return processed
}

/*
    This is meant as a development tool to clear memory and ensure it behabes as
    expected. 
*/
function delete_user_settings(){
    save_user_property("user_settings",{})
    return card_quick_feedback("User settings property has been emptied, please restart the app")
}

/*
    Meant as developer tool as well, returns a card with current user settings
*/
function show_user_memory(){
    return general_cb_handler(fetch_user_property("user_settings"))
}