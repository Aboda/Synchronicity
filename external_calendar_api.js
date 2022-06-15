/*
    Google Calendar API endpoint
    https://developers.google.com/calendar/api/v3/reference/freebusy/query
*/

function basic_call(e){
    let endpoint = "https://www.googleapis.com/calendar/v3/freeBusy"
    let options = {
        "timeMin": new Date(),
        "timeMax": new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7),
        "timeZone": e.userTimezone.id,
        "groupExpansionMax": 10,
        "calendarExpansionMax": 10,
        "items": [
            {
            "id": e.formInput.queried_gmail
            }
        ],
        "header":{"Authorization":"Bearer " + ScriptApp.getOAuthToken()},
        "muteHttpExceptions":true
    }
    let reply = UrlFetchApp.fetch(endpoint,options)
    return general_cb_handler(reply)
}