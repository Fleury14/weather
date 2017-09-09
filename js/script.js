let todaysDate = getTodaysDate();
let currentUnit = 'F';
let currentTemp = 0;
let globalForecastData;

function getTodaysDate() {

  let today = new Date(); // Get todays date and loale
  let locale = "en-us";

  // Get Day, month, and date. make suffix 'Error' for debug
  let fullMonth = today.toLocaleString(locale , {month : 'long'});
  let fullWeekday = today.toLocaleString(locale , {weekday : 'long'});
  let fullDay = today.toLocaleString(locale, {day : 'numeric'});
  let dateSuffix = 'Error';

  // Check the day of the month and apply the correct suffix
  switch (fullDay)
  {
  	case '1':
    case '21':
    case '31':
    	dateSuffix = 'st';
      break;

    case '2':
    case '22':
    	dateSuffix = 'nd';
      break;

    case '3':
    case '23':
    	dateSuffix = 'rd';
      break;

    default:
    	dateSuffix = 'th';
  } // end switch

  // Put it all together for the date string and return
  let dateString = fullWeekday + ', ' + fullMonth + ' ' + fullDay.concat(dateSuffix);
  return dateString;
} //end getTodaysDate()11

$(document).ready(function(){
  //retrieve our location info
  let locationData = $.get('https://ipapi.co/json/');
  //Make sure to declare variables to store data

  locationData.then(function(response, status){
    // Declare location variables (lat, lon, city, state) then activate api call
    // console.log(response);
    let lat = response.latitude;
    let lon = response.longitude;
    let city = response.city;
    let state = response.region;
    getWeatherData(lat, lon, city, state);
    getForecast(lat, lon, city, state);
  }); //end locationdata then



  function getWeatherData(lat, lon, city, state) {
    var weatherAPI = 'https://api.openweathermap.org/data/2.5/weather?';
    var apiKEY = '13467721f3c66a39a0fab56acefa3531';
    var weatherData = $.getJSON(`${weatherAPI}lat=${lat}&lon=${lon}&APPID=${apiKEY}`);

    weatherData.then(function(response, status){
      // Insert your data into the html! hint: log the api response and see what data is available
      console.log(response, status); //log response
      let cityString = `${city}, ${state}`;
      document.querySelector('.city').innerText = cityString; //put together a city, state string and put it in the html
      // put icon in next -- note: this is icon is dependent on owm hosting the icon
      document.querySelector('.weather-icon').src = `https://openweathermap.org/img/w/${response.weather[0].icon}.png`;
      currentTemp=Math.round(kelvToFare(response.main.temp));
      document.querySelector('.temp').innerHTML = currentTemp + '&deg;F';
      document.querySelector('#weatherStatus').innerText = response.weather[0].main;

      //put date in and let the date object translate from unix to an actual time
      let sunset = new Date (response.sys.sunset * 1000);
      let sunrise = new Date (response.sys.sunrise * 1000);
      let sunriseSuffix = checkSuffix(sunrise);
      let sunsetSuffix = checkSuffix(sunset);
      //create the string for sunrise and sunset
      let sunsetString = `Sunset: ${sunsetSuffix[0]}:${sunset.getMinutes()}${sunsetSuffix[1]}`;
      let sunriseString = `Sunrise: ${sunriseSuffix[0]}:${sunrise.getMinutes()}${sunriseSuffix[1]}`;
      //and put them in the document
      document.querySelector('.sunrise').innerText = sunriseString;
      document.querySelector('.sunset').innerText = sunsetString;

      //get and put in humidity and wind
      document.querySelector('.humidity').innerText = 'Humidity: ' + response.main.humidity + '%';
      document.querySelector('.wind').innerText = 'Wind: ' + mSecToMPH(response.wind.speed) + ' mph ' + degreesToDir(response.wind.deg);


    }); //end weather data then
   } //end get weather data

   function getForecast(lat, lon, city, state) { //function to get 5 day forecast
     let weatherAPI = 'https://api.openweathermap.org/data/2.5/forecast?';
     let apiKEY = '13467721f3c66a39a0fab56acefa3531';
     let forecastData = $.getJSON(`${weatherAPI}lat=${lat}&lon=${lon}&units=imperial&APPID=${apiKEY}`);

     forecastData.then(function(response, status) {
       console.log('forecast', response);
       globalForecastData = response; //assign forecase data to global scope to allow unit switches.. sloppy, i know
       response.list.forEach(function(el, index){ //go through each listing
         console.log('el', el);
         el.date = new Date(el.dt*1000); //put unix time in new date object for conversion
         //create the string that will be appended
         let forecastString = `${el.date.getMonth()}/${el.date.getDate()} ${el.date.getHours()}:00 -- ${Math.round(el.main.temp)}&deg;`;
         let newEntry = document.createElement('p');
         newEntry.innerHTML = forecastString;
         if(index<10) { //0-9 first column
           document.querySelector('#forecast1').appendChild(newEntry);
         } else if(index<20) { //10-19 second column
           document.querySelector('#forecast2').appendChild(newEntry);
         } else if(index<30) { //20-29 second column
           document.querySelector('#forecast3').appendChild(newEntry);
         } else { //everything else 4th column
           document.querySelector('#forecast4').appendChild(newEntry);
         } //end if
       }); //end foreach
     }); // end forecastdata then
   }// end getforecast

    function kelvToFare(kelvin) {
    return (9/5*(kelvin-273))+32;
    } //end kelvtofare

    function checkSuffix(date) { //function that takes in a take and spits out the correct hour and suffix
      if(date.getHours()>12) {
        return [date.getHours()-12, 'pm'];
      } else {
        return [date.getHours(), 'am'];
      }
    } // end check suffix

    function degreesToDir(deg) { //function to conver from degrees to cardinal directions
      if(deg == undefined) {return '';} //if there's no direction, return nothing
      let result = Math.floor((deg/22.5)+0.5); //with 16 directions, theres a direction change every 22.5 degrees.
      let direction = ["N","NNE","NE","ENE","E","ESE", "SE", "SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
      // so with 16 directions, we simply divide degrees by 22.5, round it, and take the result of val mod 16
      return direction[(result%16)];
    } //end degreesToDir

    function mSecToMPH(msec) { //function to translate from meters/second to miles/hr
      let result = msec / 1609.34 * 60 * 60;
      return Math.round(result);
    }


}); //end window.onload

function toggleUnitSwitch() { //function to toggle between farenheit and celsius
  if(currentUnit == 'F') { //if its farenheit
    currentTemp = Math.round((currentTemp-32) * 5/9); // change the temp
    currentUnit = 'C'; //change the current unit
    document.querySelector('.temp').innerHTML = currentTemp + '&deg;' + currentUnit; //redraw temp
    document.querySelector('.temp-button').innerText = 'Convert to Farenheit'; // change button info
    //forecast changes
    for(let i=1; i<5; i++) {//reset forecast elements
        document.querySelector('#forecast' + i).innerHTML = '';
    } //end for
    globalForecastData.list.forEach(function(el, index){ //go through each listing
      el.date = new Date(el.dt*1000); //put unix time in new date object for conversion
      //create the string that will be appended
      let forecastString = `${el.date.getMonth()}/${el.date.getDate()} ${el.date.getHours()}:00 -- ${Math.round((el.main.temp-32)*5/9)}&deg;`;
      let newEntry = document.createElement('p');
      newEntry.innerHTML = forecastString;
      if(index<10) { //0-9 first column
        document.querySelector('#forecast1').appendChild(newEntry);
      } else if(index<20) { //10-19 second column
        document.querySelector('#forecast2').appendChild(newEntry);
      } else if(index<30) { //20-29 second column
        document.querySelector('#forecast3').appendChild(newEntry);
      } else { //everything else 4th column
        document.querySelector('#forecast4').appendChild(newEntry);
      } //end if
    }); //end foreach

  } else { //if it aint F, it can only be C
    currentTemp = Math.round((currentTemp * 9/5) + 32); //convert..
    currentUnit = 'F'; //..change unit..
    document.querySelector('.temp').innerHTML = currentTemp + '&deg;' + currentUnit; //redraw temp
    document.querySelector('.temp-button').innerText = 'Convert to Celsius'; // change button info
    //forecasr changes
    //forecast changes
    for(let i=1; i<5; i++) {//reset forecast elements
        document.querySelector('#forecast' + i).innerHTML = '';
    } //end for
    globalForecastData.list.forEach(function(el, index){ //go through each listing
      el.date = new Date(el.dt*1000); //put unix time in new date object for conversion
      //create the string that will be appended
      let forecastString = `${el.date.getMonth()}/${el.date.getDate()} ${el.date.getHours()}:00 -- ${Math.round(el.main.temp)}&deg;`;
      let newEntry = document.createElement('p');
      newEntry.innerHTML = forecastString;
      if(index<10) { //0-9 first column
        document.querySelector('#forecast1').appendChild(newEntry);
      } else if(index<20) { //10-19 second column
        document.querySelector('#forecast2').appendChild(newEntry);
      } else if(index<30) { //20-29 second column
        document.querySelector('#forecast3').appendChild(newEntry);
      } else { //everything else 4th column
        document.querySelector('#forecast4').appendChild(newEntry);
      } //end if
    }); //end foreach
  } // end f/c if else
} //end function toggleUnitSwitch

// add date to the top
document.querySelector('.date-header-cont p').innerText = todaysDate;

document.querySelector('.temp-button').addEventListener('click', toggleUnitSwitch);
