/*
  Development use, returns a card with content of a stringified JSON
*/
function general_cb_handler(data_received){
  return CardService.newCardBuilder()
  .addSection(
    CardService.newCardSection()
    .addWidget(
      CardService.newTextParagraph()
      .setText(
        "Received data:\n"+JSON.stringify(data_received,null,2)
      )
    )
  )
  .build()
}

/*
  Development tool, shows a message that indicates than that feature
  is under development
*/
function still_under_dev()  {
  card_quick_feedback("That feature is still under development!")
}

/*
  General cards feedback tool, used for short messages that appear at the bottom
  of the cards interface as brief semi transparent banners
*/
function card_quick_feedback(message){
  return CardService.newActionResponseBuilder()
  .setNotification(CardService.newNotification()
      .setText(message))
  .build();
}

/*
  Makes a button in the cards ui that has the named function attached as an on
  click. These functions are limited to preset options. 
*/
function cards_text_button(button_text,attached_function_name){
  return CardService
  .newTextButton()
  .setOnClickAction(CardService.newAction().setFunctionName(attached_function_name))
  .setText(button_text);
}

/*
  This year (2022) daylight savings range is: Sun, Mar 13, 2022 – Sun, Nov 6, 2022
*/
function is_it_savings_time(){
  let start_day_2022 = new Date(2022,2,13).getTime()
  let end_day_2022 = new Date(2022,8,6).getTime()
  let now = new Date().getTime()
  if(now > start_day_2022 && now < end_day_2022){
    return true
  }else{
    return false
  }
}

/*
  This turns the offset received in positive or negative hours from ms as 
  received from the workspace event. 
*/
function from_ms_to_offset_hours(asnumber){
  return asnumber / 1000 / 60 / 60
}

/*
  this fetches user settings and updates the JSON representation of the date range to be a javascript date object.
*/
function rez_settings(){
  user_settings = fetch_user_property("user_settings")
  user_settings.date_frame.start = new Date(user_settings.date_frame.start)
  user_settings.date_frame.end = new Date(user_settings.date_frame.end)
  return user_settings
}


/*
  Used to extract the emails of contacts from the Apps Script provided object
*/
function list_contacts_emails(contacts_object){
  let global_email_array = []
  for (let contact of contacts_object){
    let item_email_array = contact.getEmailAddresses()
    for (let email of item_email_array) {
      global_email_array.push(email)
    }
  }
  return global_email_array
}

function calculate_browser_to_target_offset(user_settings){
  /*
    Offset distance is the difference between the browser timezone and the one
    selected for the output,
  */
  user_settings.offset_distance = local_utc_offset() - user_settings.target_offset
  user_settings.offset_as_ms = from_UTC_to_ms(user_settings.offset_distance)
}