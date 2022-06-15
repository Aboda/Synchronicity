/*
  General fetchers and setters for Script and User memory

  current properties are:

    script:
      tz_table
        a small list of USA cities from the tz table database.

    user:
      user_settings
        the collection of information pertaining a particular user
        here we store his preferences for the availability query.
      
      last_report
        here, the user settings AND the processed information of LAST
        CALL is stored. this is used for sending emails to the user with
        the details of the event. 
*/

function fetch_user_property(property_name){
  return JSON.parse(PropertiesService.getUserProperties()
  .getProperty(property_name))
}

function save_user_property(property_name,content){
  PropertiesService.getUserProperties()
  .setProperty(property_name,JSON.stringify(content))
}

function fetch_script_property(property_name){
  return JSON.parse(PropertiesService.getScriptProperties()
  .getProperty(property_name))
}

function save_script_property(property_name,content){
  PropertiesService.getScriptProperties()
  .setProperty(property_name,JSON.stringify(content))
}