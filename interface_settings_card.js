
function build_card_settings(){
    let user_settings = fetch_user_property("user_settings")
    
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
  
    return CardService.newCardBuilder()
    .setName("Config")
    .addSection(inputs_section)
    .build();
  }
  function build_widget_input_evaluate_from_date(user_settings){
    return CardService.newDatePicker()
      .setTitle("Evaluate from")
      .setFieldName("evaluate_from")
      .setValueInMsSinceEpoch(new Date(user_settings.date_frame.start).getTime())
      .setOnChangeAction(CardService.newAction()
          .setFunctionName("settings_data_handler"));
  }
  
  function build_widget_input_evaluate_to_date(user_settings){
    return CardService.newDatePicker()
      .setTitle("to")
      .setFieldName("evaluate_to")
      .setValueInMsSinceEpoch(new Date(user_settings.date_frame.end).getTime())
      .setOnChangeAction(CardService.newAction()
          .setFunctionName("settings_data_handler"));
  
  }
  
  function build_widget_input_meeting_duration(user_settings){
    return CardService.newTimePicker()
    .setTitle("Meeting duration")
    .setFieldName("meeting_duration")
    .setHours(user_settings.duration.hours)
    .setMinutes(user_settings.duration.minutes)
    .setOnChangeAction(CardService.newAction()
        .setFunctionName("settings_data_handler"));
  }
  
  function build_widget_input_available_hours_start(user_settings){
    return CardService.newTimePicker()
    .setTitle("Daily availability start")
    .setFieldName("active_start")
    .setHours(user_settings.hour_frame.start.hours)
    .setMinutes(user_settings.hour_frame.start.minutes)
    .setOnChangeAction(CardService.newAction()
        .setFunctionName("settings_data_handler"));
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
    let order = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]
  
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
    
  function build_widget_target_timezone(){
    /*
      Shift this to script properties storage as the data source for all
      calculations regarding offsets among serviced clients.
    */
    let options = state_fetch_or_create_timezones_table()
    
    let suggestions = CardService.newSuggestions()
    for (let zones of options){
      suggestions.addSuggestion(zones[0])
    }
    return CardService.newTextInput()
    .setTitle("Target Timezone")
    .setFieldName("target_timezone")
    .setSuggestions(suggestions)
    .setOnChangeAction(CardService.newAction()
    .setFunctionName("still_under_dev"))
  }