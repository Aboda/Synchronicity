/*
    Development use, prints contacts array object in the apps script console log
    manual function to explore structure and manipulation of the item
*/
function show_contacts_structure(){
    let options = ContactsApp.getContacts();
    console.log(options[0])
}
  
/*
    Development use, shows the output of f list_contacts_emails
*/
function show_contacts_emails(){
    console.log(list_contacts_emails(ContactsApp.getContacts()))
}

/*
  Used to develop the blocking calendar selector
*/
function read_calendars(){
    let user_settings = state_fetch_or_create_user()
    console.log(user_settings)
    let events = check_calendars(user_settings) 
    console.log(events)
}
  
function read_last_event_report(){
    console.log(fetch_user_property("last_report"))
}

function read_stored_blocking(){
    let user_settings = state_fetch_or_create_user()
    console.log(user_settings.blocking_calendars)
}