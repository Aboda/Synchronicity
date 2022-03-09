    /*
  Returns timezone table, if it does not exist, creates it with default values
*/

function state_fetch_or_create_timezones_table(){
    let tz_table = fetch_script_property("tz_table")
    if (tz_table === null || tz_table === {}){
      tz_table = [
        ['America/Adak','−10:00','−09:00'],
        ['America/Anchorage','−09:00','−08:00'],
        ['America/Atka','−10:00','−09:00'],
        ['America/Boise','−07:00','−06:00'],
        ['America/Chicago','−06:00','−05:00'],
        ['America/Denver','−07:00','−06:00'],
        ['America/Detroit','−05:00','−04:00'],
        ['America/Fort_Wayne','−05:00','−04:00'],
        ['America/Indiana/Indianapolis','−05:00','−04:00'],
        ['America/Indiana/Knox','−06:00','−05:00'],
        ['America/Indiana/Marengo','−05:00','−04:00'],
        ['America/Indiana/Petersburg','−05:00','−04:00'],
        ['America/Indiana/Tell_City','−06:00','−05:00'],
        ['America/Indiana/Vevay','−05:00','−04:00'],
        ['America/Indiana/Vincennes','−05:00','−04:00'],
        ['America/Indiana/Winamac','−05:00','−04:00'],
        ['America/Indianapolis','−05:00','−04:00'],
        ['America/Juneau','−09:00','−08:00'],
        ['America/Kentucky/Louisville','−05:00','−04:00'],
        ['America/Kentucky/Monticello','−05:00','−04:00'],
        ['America/Knox_IN','−06:00','−05:00'],
        ['America/Los_Angeles','−08:00','−07:00'],
        ['America/Louisville','−05:00','−04:00'],
        ['America/Menominee','−06:00','−05:00'],
        ['America/Metlakatla','−09:00','−08:00'],
        ['America/New_York','−05:00','−04:00'],
        ['America/Nome','−09:00','−08:00'],
        ['America/North_Dakota/Beulah','−06:00','−05:00'],
        ['America/North_Dakota/Center','−06:00','−05:00'],
        ['America/North_Dakota/New_Salem','−06:00','−05:00'],
        ['America/Shiprock','−07:00','−06:00'],
        ['America/Sitka','−09:00','−08:00'],
        ['America/Yakutat','−09:00','−08:00']
      ]
      save_script_property("tz_table",tz_table)
    }
    return tz_table
  }