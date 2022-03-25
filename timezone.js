/*
  Returns timezone table, if it does not exist, creates it with default values
*/

function state_fetch_or_create_timezones_table(){
  return [
    ['America/Adak','-10:00','-09:00'],
    ['America/Anchorage','-09:00','-08:00'],
    ['America/Atka','-10:00','-09:00'],
    ['America/Boise','-07:00','-06:00'],
    ['America/Chicago','-06:00','-05:00'],
    ['America/Denver','-07:00','-06:00'],
    ['America/Detroit','-05:00','-04:00'],
    ['America/Fort_Wayne','-05:00','-04:00'],
    ['America/Indiana/Indianapolis','-05:00','-04:00'],
    ['America/Indiana/Knox','-06:00','-05:00'],
    ['America/Indiana/Marengo','-05:00','-04:00'],
    ['America/Indiana/Petersburg','-05:00','-04:00'],
    ['America/Indiana/Tell_City','-06:00','-05:00'],
    ['America/Indiana/Vevay','-05:00','-04:00'],
    ['America/Indiana/Vincennes','-05:00','-04:00'],
    ['America/Indiana/Winamac','-05:00','-04:00'],
    ['America/Juneau','-09:00','-08:00'],
    ['America/Kentucky/Louisville','-05:00','-04:00'],
    ['America/Kentucky/Monticello','-05:00','-04:00'],
    ['America/Los_Angeles','-08:00','-07:00'],
    ['America/Menominee','-06:00','-05:00'],
    ['America/Metlakatla','-09:00','-08:00'],
    ['America/New_York','-05:00','-04:00'],
    ['America/Nome','-09:00','-08:00'],
    ['America/North_Dakota/Beulah','-06:00','-05:00'],
    ['America/North_Dakota/Center','-06:00','-05:00'],
    ['America/North_Dakota/New_Salem','-06:00','-05:00'],
    ['America/Shiprock','-07:00','-06:00'],
    ['America/Sitka','-09:00','-08:00'],
    ['America/Yakutat','-09:00','-08:00']
  ]
}

function search_offset(zone_name){

  let user_settings = fetch_user_property("user_settings")
  if (zone_name == user_settings.script_user_timezone) {
    return from_ms_to_offset_hours(user_settings.script_user_offset)
  }
  let tz_table = state_fetch_or_create_timezones_table()
  for (let i = 0; i < tz_table.length; i++) {
    if (zone_name == tz_table[i][0]){
      if (is_it_savings_time()) {
        //here is the savings case
        return read_time(tz_table[i][2])
      }else{
        //here is the standard case
        return read_time(tz_table[i][1])
      }
    }
  }
}

function read_time(timestring){
  let significant = timestring.split(":")[0]
  return Number(significant)
}

/* 
  TODO: This takes the standard TZ names and writes them down to the user preferred
  format
*/
function standard_to_user_preference_transformer(){

}

