let todaysDate = getTodaysDate();

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


  });



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
      let tempF=Math.round(kelvToFare(response.main.temp));
      document.querySelector('.temp').innerHTML = tempF + '&deg;';
      document.querySelector('#weatherStatus').innerText = response.weather[0].main;

      //let sunset = new Date (response.sys.sunset * 1000);
      //let sunrise = new Date (response.sys.sunrise * 1000);

      //let sunsetString = `Sunset: ${sunset.getHours()}:${sunset.getMinutes()}`;

      //let sunriseString = `Sunrise: ${sunrise.getHours()}:${sunrise.getMinutes()}`;


      //document.querySelector('#sunrise').innerText = sunriseString;
      //document.querySelector('#sunset').innerText = sunsetString;



    }); //end weather data then
   } //end get weather data

    function kelvToFare(kelvin) {
    return (9/5*(kelvin-273))+32;
  } //end kelvtofare

});

document.querySelector('.date-header-cont p').innerText = todaysDate;
