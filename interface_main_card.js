/*
  This serves the card that is loaded at launch of a Workspace Add On, cards are
  the preferred method for interaction with the user for this type of deployment

  Cards cannot be modified once printed, an entire new card needs to be built to
  perform any interface update. This is again, part of the encouraged strategy.

  Cards abstract multiple tools and features requiring consideration in the dev
  process to attain proper integration and desired functionality.

  Cards have special capabilities like "contextual" menus, these are integrated
  to the google product user experience based on the context. For example, in
  our case, we should be able to create a small card that reacts to the user
  selecting an event on his google calendar interface* 
  
  While currently calendar cards are not available on mobile applications, there
  is a strong implication that they will be. 
  
  Additionally a consideration is that this code is run in and as apps script
  itself, meaning that a) it is single threaded synchronous and b) it can run
  apps scripts resources without google.script.run/asynchronous methods
*/

function build_card_main(user_settings){
  return CardService.newCardBuilder()
    .setName("Main")
    .addSection(build_widget_output_main(user_settings))
    .build();  
}

/*
  Main output and three interface buttons presented
*/
function build_widget_output_main(user_settings){
  return CardService.newCardSection()
  .setHeader("Availability")
  .addWidget(build_main_output(user_settings))
  .addWidget(
    CardService.newButtonSet()
      .addButton(build_item_button_refresh())
      .addButton(build_item_button_settings())
      .addButton(build_item_button_display())
      .addButton(build_item_button_delete())
  );
}



/*
  This is the text buttons creation
*/

function build_item_button_refresh(){
  return cards_text_button("Refresh","interface_action_refresh_output")
}

function build_item_button_settings(){
  return cards_text_button("Settings","build_card_settings")
}

/*
  These are dev buttons
*/

function build_item_button_delete(){
  return cards_text_button("delete mem","delete_user_settings")
}

function build_item_button_display(){
  return cards_text_button("show mem","show_user_memory")
}



/*
  Here the actions enabled by each button
*/

function interface_action_refresh_output(e) {
  /*
    This seems easily doable as it will only mean a restart of the cycle
  */

  let user_settings = state_fetch_or_create_user(e)
  return build_card_main(user_settings)
}