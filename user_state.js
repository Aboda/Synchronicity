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

function state_fetch_or_create_user(e){
    let mem_fetch = fetch_user_property("user_settings")
    let user_settings = {}
    if (mem_fetch.email === undefined) {
      user_settings = current_user_settings_default(e)
    }else{
      user_settings = mem_fetch
      user_settings.last_connection = new Date()
      user_settings.load_event = user_settings.load_event + 1
      user_settings.date_frame.start = new Date(user_settings.date_frame.start)
      user_settings.date_frame.end = new Date(user_settings.date_frame.end)
    } 
    if (e != undefined){
        user_settings.script_user_timezone = e.userTimezone.id
        user_settings.script_user_offset = Number(e.userTimezone.offSet)
    }
    save_user_property("user_settings",user_settings)
    return user_settings
}

/*
    Here are the default settings at user launch (or after a memory reset)
*/
function current_user_settings_default(e){
    let user_settings = {}
    user_settings.version = "0.0.1 Reconstruction of webapp features"
    user_settings.email = Session.getActiveUser().getEmail()
    user_settings.load_event = 1
    user_settings.first_connection = new Date()
    user_settings.last_connection = new Date()
    user_settings.weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
    user_settings.tz = [
        "-11",
        "-10",
        "-9",
        "-8",
        "-7",
        "-6",
        "-5",
        "-4",
        "-3",
        "-2",
        "-1",
        "0",
        "+1",
        "+2",
        "+3",
        "+4",
        "+5",
        "+6",
        "+7",
        "+8",
        "+9",
        "+10",
        "+11"
    ]
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
        "start":what_day_is_tomorrow(),
        "end":what_day_is_a_week_from_tomorrow()
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
    if (e != undefined){
        user_settings.target_timezone = e.userTimezone.id
        user_settings.appropiate_offset = from_ms_to_offset_hours(Number(e.userTimezone.offSet))
    }
    return user_settings
}

/*
    This is meant as a development tool to clear memory and ensure it behaves as
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