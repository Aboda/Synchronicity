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
  for time calculations
*/

function get_a_day_in_ms(){
  return 24 * 60 * 60 * 1000
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
  This returns a date element with tomorrows 00:00 hours epoch time
*/
function what_day_is_tomorrow(){
  let a_day_from_now = new Date(new Date().getTime() + get_a_day_in_ms())
  let that_day_start = new Date(a_day_from_now.getFullYear(),a_day_from_now.getMonth(),a_day_from_now.getDate())
  return that_day_start
}

/*
  This returns a date element with a 7 days from today
*/
function what_day_is_a_week_from_tomorrow(){
  let a_week_from_tomorrow = 
  new Date(
    new Date().getTime() + 
    (get_a_day_in_ms()*7)
  )
  let that_day_start = new Date(a_week_from_tomorrow.getFullYear(),a_week_from_tomorrow.getMonth(),a_week_from_tomorrow.getDate())
  return that_day_start
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