/*
    Each browser will have a preset location, and will perform all javascript
    date related calculations from that perspective. 

    This function receives from the javascript date object the timezone offset
    in minutes to apply to the presented time so that it matches GMT and returns
    the offset in a single signed number (as offsets are usually presented)
*/
function local_utc_offset(){return new Date().getTimezoneOffset()/60*-1}

/*
    Transforms a UTC hour shift (usually +- 12) to ms
*/
function from_UTC_to_ms(utcshift){return utcshift * 60 * 60 * 1000}

/*
    Here we are taking any date object and a number of miliseconds to deduct from it
*/
function offset_date(date,offset_as_ms){return new Date(date.getTime() - offset_as_ms)}

/*
    Here we are taking any date object and a number of miliseconds to add to it
*/
function offset_date_inverse(date,offset_as_ms){return new Date(date.getTime() + offset_as_ms)}

/*
    Provides the number of miliseconds in a day
*/
function get_a_day_in_ms(){return 24 * 60 * 60 * 1000}

/*
  This returns a date object with tomorrow 00:00 hours Script offset
*/
function what_day_is_tomorrow(user_settings){
    /*This creates a new point 24 hours ahead of the point in time it is 
    called
    */
    let instant = new Date(new Date().getTime() + get_a_day_in_ms())
    /*Here we create a new date element with 0 hours at the begining of that day
    It is offset to browser default*/
    let reduced_to_local_0 = new Date(instant.getFullYear(),instant.getMonth(),instant.getDate())
    /*
        Here we follow double substraction process to transform the 0 hours to the appropiate
        time based on script offset. If Browser offset and Script offset match, there should
        be no changes.
    */
    return offset_date(reduced_to_local_0,user_settings.script_offset_as_ms)
}

/*
    This returns a date object with 7 days from tomorrow at 00:00 hours Script offset
*/
function what_day_is_a_week_from_tomorrow(user_settings){
    let instant = new Date(new Date().getTime() + (get_a_day_in_ms()*8))
    let reduced_to_local_0 = new Date(instant.getFullYear(),instant.getMonth(),instant.getDate())
    return offset_date(reduced_to_local_0,user_settings.script_offset_as_ms)
}

/*
    This presents a manually constructed clock input from a manually shifted
    date object
*/
function present_manually_offset_clock(date_object,label){
    return `${date_object.getFullYear()}/${date_object.getMonth() + 1}/${date_object.getDate()} ${date_object.getHours()}:${date_object.getMinutes()}:${date_object.getSeconds()} `+label
}


console.log(home_date_manager(new Date(),-8,"test").present())
/*
    Below test notes.

    You can run this file in nodejs to see the GMT clock and its offset to the
    indicated manually in "test_offsets"

    What lies below this comment is not necessary for operation, used to verify the accuracy of the time shifting / presenting algoritm. 
*/

/*
let local_offset = local_utc_offset()
let test_offsets = [
    [{"offset":8,"label":"China"}],
    [{"offset":0,"label":"GMT"}],
    [{"offset":-4,"label":"New York"}],
    [{"offset":-5,"label":"Mexico City"}],
    [{"offset":-7,"label":"Los Angeles"}]    
]    

for (let entry of test_offsets){
    let test_offset = entry[0]
    test_offset.distance_to_local = local_offset - test_offset.offset
    test_offset.to_local_as_ms = from_UTC_to_ms(test_offset.distance_to_local)
    test_offset.shifted_object = offset_date(new Date(),test_offset.to_local_as_ms)
    test_offset.output = present_manually_offset_clock(test_offset.shifted_object,test_offset.label)
    console.log(test_offset.output)
}
*/


/*
    This ought to be the date manager, it must
    a) take a live date event
    b) take a target timezone
    c) create an offset date event that is shifted(in order to obtain the proper calenda reading) to the target timezone
    d) 
*/
function home_date_manager(original_time,offset_in_hours,descriptor){
    return {
        "descriptor":descriptor,
        "original_time":original_time,
        "offset_in_hours":offset_in_hours,
        "distance_to_browser":browser,
        "offset_time":offset_date(original_time,from_UTC_to_ms(offset_in_hours)),
        "print_offset":function(){
            return present_manually_offset_clock(this.offset_time,offset_in_hours)
        },
        "present":function(){
            let to = `UTC 0 ${this.original_time.toJSON()},
            Local Offset Interpretation ${this.original_time.toLocaleString()},
            Shifted Offset Interpretation ${present_manually_offset_clock(this.offset_time,offset_in_hours)}
            `
            return to
        }
    }
}