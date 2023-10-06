var quota_data;
var interview_data;
var today_flight_list;
var this_month_flight_list;
var daily_plan_data;
var removed_ids_data;

var currentDate; //dd-mm-yyyy
var currentMonth; //mm
var nextDate; //dd-mm-yyyy

var download_time;

var total_quota = 3666;
var total_completed;
var total_completed_percent;
var T1_completed;
var T2_completed;
var T3_completed;
var T4_completed;

var total_quota_completed;
var total_hard_quota;

var less_than_2_flights_list;
var less_than_6_flights_list;
/************************************/

function clean_data ()
{
  for (i = 0; i<interview_data.length; i++ )
  {
    if (interview_data[i].InterviewEndDate.substring(3,10) == "10-2023") {
      if ( interview_data[i].quota_id == "T2_TR_BKK") interview_data[i].quota_id = "T1_TR_BKK";
      if ( interview_data[i].quota_id == "T3_TR_LGK") interview_data[i].quota_id = "T1_TR_LGK";
      
    }  
  }
}
/************************************/
function initCurrentTimeVars() {
  var today = new Date();

  var day = '' + today.getDate();
  var month = '' + (today.getMonth() + 1); //month start from 0;
  var year = today.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  currentDate = [day, month, year].join('-');
  currentMonth =[month, year].join('-');;

  //return [day, month,year].join('-');
  if (document.getElementById('year_month') && document.getElementById('year_month').value.length > 0)
  {
    if (document.getElementById('year_month').value != "current-month")
    {
      currentMonth = document.getElementById('year_month').value;
    }
  }
    console.log("currentMonth: ", currentMonth);

  //////////
  var tomorrow = new Date();
  tomorrow.setDate(today.getDate()+1);
  var tomorrowMonth = '' + (tomorrow.getMonth() + 1); //month start from 0;
  var tomorrowDay = '' + tomorrow.getDate();
  var tomorrowYear = tomorrow.getFullYear();

  if (tomorrowMonth.length < 2) tomorrowMonth = '0' + tomorrowMonth;
  if (tomorrowDay.length < 2) tomorrowDay = '0' + tomorrowDay;

  nextDate  = [tomorrowDay, tomorrowMonth, tomorrowYear].join('-');
  //////////
  switch(currentMonth) {
      case "08-2023":
      total_quota = 1400;
      break;      
    case "09-2023":      
      total_quota = 1400;
      break;    
    case "10-2023":      
      total_quota = 1400;
      break;      
                    
    default:
      total_quota = 1600;
      break;
  }
}

function isCurrentMonth(interviewEndDate)
{
// Input: "2023-04-03 10:06:22 GMT"
  var interviewDateParsed = interviewEndDate.split("-")

  var interviewYear = (interviewDateParsed[2]);
  var interviewMonth =(interviewDateParsed[1]);
  
  var result = false;

  if ( currentMonth ==[interviewMonth,interviewYear].join('-'))
  {
    result = true;
  }

   return result;
}

function notDeparted(flight_time) {
  var current_time = new Date().toLocaleString('en-SG', {timeZone: 'Asia/Singapore', hour12: false});
  //15:13:27
  var current_time_value  = current_time.substring(current_time.length-8,current_time.length-6) * 60;
  current_time_value += current_time.substring(current_time.length-5,current_time.length-3)*1;

  //Time: 0805    
  var flight_time_value = flight_time.substring(0,2) * 60 + flight_time.substring(2,4)*1;

  var result = (flight_time_value > current_time_value);
  return (result);
}

function isvalid_id(id)
{
  valid = true;

  var i = 0;
  for (i = 0; i < removed_ids_data.length; i++) 
  { 
    if (removed_ids_data[i].removed_id == id)
    {
      valid = false;
    }
  }
  return valid;
}
function prepareInterviewData() {
  var quota_data_temp = JSON.parse(quota_info);
  removed_ids_data = JSON.parse(removed_ids);

  var interview_data_temp  = JSON.parse(interview_statistics);
  var flight_list_temp  = JSON.parse(flight_list_raw);

  initCurrentTimeVars();	

  //get quota data
  quota_data = [];
  quota_data.length = 0;
  for (i = 0; i < quota_data_temp.length; i++) {
    var quota_month =  quota_data_temp[i].Month + "-"  + quota_data_temp[i].Year; 
    if ((quota_month == currentMonth) && (quota_data_temp[i].Quota>0))
    {
      quota_data.push(quota_data_temp[i]);
    }
  }

  //get relevant interview data
  //empty the list
  interview_data = [];
  interview_data.length = 0;

  download_time = interview_data_temp[0].download_time;
  for (i = 0; i < interview_data_temp.length; i++) {
    var interview = interview_data_temp[i];
    //only get complete interview & not test

    if (isCurrentMonth(interview.InterviewDate))
    {
      var quota_id = '"quota_id"' + ":" + '"' +  interview["quota_id"] + '", ';
      var InterviewEndDate = '"InterviewEndDate"' + ":" + '"' +  interview["InterviewDate"]+ '", ' ;
      var Completed_of_interviews = '"Completed_of_interviews"' + ":" + '"' +  interview["Number of interviews"] ;
      var str = '{' + quota_id + InterviewEndDate + Completed_of_interviews + '"}';
      interview_data.push(JSON.parse(str));
      clean_data();
    }
  }

  //prepare flight list
  //empty the list
  today_flight_list = [];
  today_flight_list.length = 0;
  
  this_month_flight_list  = [];
  this_month_flight_list.length = 0;
  
  for (i = 0; i < flight_list_temp.length; i++) {
    let flight = flight_list_temp[i];

    flight.quota_id = flight.DTerm + "_" + flight.AirlineCode + "_" + flight.Dest_Airport;//code for compare
	  flight.Dest = flight.Dest_Airport;
    flight.Next = ""; //flight.Next + "-" + flight.NextName;

    //for sorting: YYYY-MM-DD
    flight.DateTimeID = flight.Date.substring(6,10) +  flight.Date.substring(3,5) +  flight.Date.substring(0,2) + flight.Time;
    flight.Date_Time = flight.Date.substring(6,10) + "-" +  flight.Date.substring(3,5) + "-" + flight.Date.substring(0,2) + " " + flight.Time;

    //currentMonth: 02-2023
    //flight.Date: 08-02-2023
    if (currentMonth ==  flight.Date.substring(3,10)) { 
      this_month_flight_list.push(flight);
    }	
    
    //only get (today || tomorrow) & not departed flight
    if (((currentDate == flight.Date) && notDeparted(flight.Time))
        //|| (nextDate == flight.Date)
        )
    { 
      today_flight_list.push(flight);
    }
			   
  }
  
    //add quota data
    //empty the list
  daily_plan_data = [];
  daily_plan_data.length = 0;
  
  for (i = 0; i < today_flight_list.length; i++) {
    let flight = today_flight_list[i];
    for (j = 0; j < quota_data.length; j++) {
      let quota = quota_data[j];
      if ((quota.quota_id == flight.quota_id) && (quota.Quota>0))
      {
        flight.Quota = quota.Quota;
        daily_plan_data.push(flight);
       }
    }
  }

  //console.log("quota_data: ", quota_data);
  //console.log("today_flight_list: ", today_flight_list);
  //console.log("interview_data_temp: ", interview_data_temp);
}
