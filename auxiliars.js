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