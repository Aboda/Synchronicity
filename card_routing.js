/*
    Builds the main card client at the begining of the application launch
*/
function workspace_add_on() {
    return build_card_main(state_fetch_or_create_user())
}

/*
    Builds the calendar event contextual menu card when an event is selected
    on the interactive google calendar window
*/
function mini_event_menu(e) {
    //TODO build a small display of the available event data

    /*
        {
            "calendar": {
                "capabilities": {
                "canSeeConferenceData": true,
                "canSeeAttendees": true
                },
                "id": "2022_BIRTHDAY_6",
                "calendarId": "addressbook#contacts@group.v.calendar.google.com",
                "organizer": {
                "email": "addressbook#contacts@group.v.calendar.google.com"
                }
            },
            "clientPlatform": "web",
            "commonEventObject": {
                "platform": "WEB",
                "hostApp": "CALENDAR"
            },
            "hostApp": "calendar"
        }
    */

    return general_cb_handler(e)
}