
function build_card_settings(e){
  let user_settings = rez_settings()
  
  let inputs_section = CardService.newCardSection()
    .setHeader("Settings")
    .addWidget(build_widget_input_meeting_duration(user_settings))
    .addWidget(build_widget_input_evaluate_from_date(user_settings))
    .addWidget(build_widget_input_evaluate_to_date(user_settings))
    .addWidget(build_widget_input_available_hours_start(user_settings))
    .addWidget(build_widget_input_available_hours_end(user_settings))
    .addWidget(build_widget_target_timezone(user_settings))
    .addWidget(build_widget_input_dotw(user_settings))
    .addWidget(build_widget_input_guest_status(user_settings))
    .addWidget(build_widget_input_considered_calendars(user_settings))

  return CardService.newCardBuilder()
  .setName("Config")
  .addSection(inputs_section)
  .build();
}

function build_widget_input_evaluate_from_date(user_settings){
  return CardService.newDatePicker()
    .setTitle("Evaluate from")
    .setFieldName("evaluate_from")
    .setValueInMsSinceEpoch(user_settings.date_frame.start.getTime())
    .setOnChangeAction(CardService.newAction()
        .setFunctionName("settings_data_handler"))
}
  
function build_widget_input_evaluate_to_date(user_settings){
  return CardService.newDatePicker()
    .setTitle("to")
    .setFieldName("evaluate_to")
    .setValueInMsSinceEpoch(user_settings.date_frame.end.getTime())
    .setOnChangeAction(CardService.newAction()
        .setFunctionName("settings_data_handler"))
}

function build_widget_input_meeting_duration(user_settings){
  return CardService.newTextInput()
  .setTitle("Meeting Duration")
  .setFieldName("meeting_duration")
  .setHint("30")
  .setOnChangeAction(CardService.newAction()
  .setFunctionName("settings_data_handler"))
}

function build_widget_input_available_hours_start(user_settings){
  return CardService.newTimePicker()
  .setTitle("Daily availability start")
  .setFieldName("active_start")
  .setHours(user_settings.hour_frame.start.hours)
  .setMinutes(user_settings.hour_frame.start.minutes)
  .setOnChangeAction(CardService.newAction()
      .setFunctionName("settings_data_handler"))
}
function build_widget_input_available_hours_end(user_settings){
  return CardService.newTimePicker()
  .setTitle("Daily availability end")
  .setFieldName("active_end")
  .setHours(user_settings.hour_frame.end.hours)
  .setMinutes(user_settings.hour_frame.end.minutes)
  .setOnChangeAction(CardService.newAction()
      .setFunctionName("settings_data_handler"));
}

function build_widget_input_dotw(user_settings){
  let stored_selection = user_settings.dotw
  let order = user_settings.weekdays

  var checkboxGroup = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    .setTitle("Available Days")
    .setFieldName("available_days")

  for (let day of order) {
    checkboxGroup.addItem(day, day.toLowerCase(), stored_selection[day])
  }

  checkboxGroup.setOnChangeAction(CardService.newAction()
  .setFunctionName("settings_data_handler"))

  return checkboxGroup
}

function build_widget_input_guest_status(user_settings){
  let stored_selection = user_settings.guest_status
  let order = ["OWNER","YES","NO","INVITED","MAYBE"]

  var checkboxGroup = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    .setTitle("Guest Status")
    .setFieldName("guest_status");

  for (let status of order) {
    checkboxGroup.addItem(status, status.toLowerCase(), stored_selection[status])
  }

  checkboxGroup.setOnChangeAction(CardService.newAction()
  .setFunctionName("settings_data_handler"))

  return checkboxGroup
}
  
function build_widget_target_timezone(user_settings){
  /*
    Shift this to script properties storage as the data source for all
    calculations regarding offsets among serviced clients.
  */
  let options = state_fetch_or_create_timezones_table()
  
  let suggestions = CardService.newSuggestions()
  suggestions.addSuggestion(user_settings.script_user_timezone)

  for (let zones of options){
    suggestions.addSuggestion(zones[0])
  }
  return CardService.newTextInput()
  .setTitle("Target Timezone")
  .setFieldName("target_timezone")
  .setSuggestions(suggestions)
  .setHint(user_settings.target_timezone)
  .setOnChangeAction(CardService.newAction()
  .setFunctionName("settings_data_handler"))
}

function build_widget_input_considered_calendars(user_settings){

  var checkboxGroup = CardService.newSelectionInput()
    .setType(CardService.SelectionInputType.CHECK_BOX)
    .setTitle("Considered Calendars")
    .setFieldName("blocking_calendars");


  for (let cal_id in user_settings.blocking_calendars) {
    let cal = user_settings.blocking_calendars[cal_id]
    checkboxGroup.addItem(cal.name, cal_id, cal.blocking)
  }

  checkboxGroup.setOnChangeAction(CardService.newAction()
  .setFunctionName("settings_data_handler"))

  return checkboxGroup
}