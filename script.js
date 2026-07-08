/* ==========================================================
   WeatherSphere Pro 4.0
   Final Production Script.js
   Dynamic Weather + Emoji System
========================================================== */


/* ==========================
   API CONFIG
========================== */


const WEATHER_API =
"https://api.open-meteo.com/v1/forecast";


const GEO_API =
"https://geocoding-api.open-meteo.com/v1/search";



let currentLocation = {

    city:"Delhi",

    lat:28.6139,

    lon:77.2090

};





/* ==========================
   DOM SHORTCUT
========================== */


const $ = (id)=>document.getElementById(id);





/* ==========================
   WEATHER EMOJI ENGINE
========================== */


function weatherEmoji(code,isDay=true){


const icons={


0:
isDay ? "☀️":"🌙",


1:
"🌤️",


2:
"⛅",


3:
"☁️",


45:
"🌫️",

48:
"🌫️",


51:
"🌦️",

53:
"🌦️",

55:
"🌧️",


61:
"🌧️",

63:
"🌧️",

65:
"🌧️",


71:
"❄️",

73:
"❄️",

75:
"❄️",


80:
🌦️",

81:
"🌧️",

82:
"⛈️",


95:
"⛈️",

96:
"⚡",

99:
"⚡"

};


return icons[code] || "🌍";


}







/* ==========================
   GET WEATHER
========================== */


async function getWeather(){


try{


setLoading();



const url=

`${WEATHER_API}?
latitude=${currentLocation.lat}
&longitude=${currentLocation.lon}
&current=
temperature_2m,
relative_humidity_2m,
apparent_temperature,
weather_code,
is_day,
wind_speed_10m
&daily=
weather_code,
temperature_2m_max,
temperature_2m_min
&timezone=auto`
.replace(/\s/g,"");




const response =
await fetch(url);



const data =
await response.json();



updateCurrent(data);


updateForecast(data);



changeBackground(

data.current.is_day,

data.current.weather_code

);



}

catch(error){


console.log(error);


showError();


}


}







/* ==========================
   UPDATE CURRENT WEATHER
========================== */


function updateCurrent(data){


const weather =
data.current;



$("weatherIcon").textContent =

weatherEmoji(

weather.weather_code,

weather.is_day

);



$("temperature").textContent =

Math.round(

weather.temperature_2m

)

+"°";



$("feelsLike").textContent =

Math.round(

weather.apparent_temperature

)

+"°";



$("humidity").textContent =

weather.relative_humidity_2m

+"%";



$("wind").textContent =

Math.round(

weather.wind_speed_10m

)

+" km/h";



$("city").textContent =

currentLocation.city;



$("updatedTime").textContent =

"Updated "

+

new Date()

.toLocaleTimeString(

[],

{

hour:"2-digit",

minute:"2-digit"

}

);


}







/* ==========================
   FORECAST
========================== */


function updateForecast(data){


const container =
$("forecastContainer");



container.innerHTML="";



data.daily.time

.slice(0,7)

.forEach((day,index)=>{


const card =
document.createElement("div");



card.className =
"forecast-card";



const date =
new Date(day)

.toLocaleDateString(

undefined,

{
weekday:"short"
}

);



card.innerHTML=`

<div>

${date}

</div>


<div class="forecast-icon">

${weatherEmoji(

data.daily.weather_code[index]

)}

</div>



<div>

${Math.round(

data.daily.temperature_2m_max[index]

)}°

/

${Math.round(

data.daily.temperature_2m_min[index]

)}°

</div>

`;



container.appendChild(card);



});


}








/* ==========================
   BACKGROUND ENGINE
========================== */


function changeBackground(isDay,code){


document.body.className="";



if(code>=95){


document.body.classList.add(
"storm"
);


}


else if(code>=51 && code<=82){


document.body.classList.add(
"rain"
);


}


else if(code>=71 && code<=75){


document.body.classList.add(
"snow"
);


}


else if(code===45 || code===48){


document.body.classList.add(
"fog"
);


}


else if(isDay){


document.body.classList.add(
"day"
);


}


else{


document.body.classList.add(
"night"
);


}


}








/* ==========================
   CITY SEARCH
========================== */


async function searchCity(city){


try{


const response =

await fetch(

`${GEO_API}?name=${city}&count=1`

);



const data =
await response.json();



if(!data.results)
throw Error();



const place =
data.results[0];



currentLocation={


city:

place.name,


lat:

place.latitude,


lon:

place.longitude


};



getWeather();



}

catch{


alert(

"City not found"

);


}



}








/* ==========================
   USER LOCATION
========================== */


function getLocation(){


if(!navigator.geolocation){


getWeather();

return;

}



navigator.geolocation.getCurrentPosition(

(position)=>{


currentLocation.lat =

position.coords.latitude;



currentLocation.lon =

position.coords.longitude;



currentLocation.city=

"My Location";



getWeather();



},


()=>{


getWeather();


}


);



}








/* ==========================
   CLOCK
========================== */


function startClock(){


setInterval(()=>{


if($("currentTime")){


$("currentTime").textContent =

new Date()

.toLocaleTimeString();



}


},1000);



}








/* ==========================
   LOADING
========================== */


function setLoading(){


$("temperature").textContent=

"--°";


$("weatherIcon").textContent=

"🌍";


}





function showError(){


$("temperature").textContent=

"--°";


$("weatherIcon").textContent=

"⚠️";


}








/* ==========================
   EVENTS
========================== */


document.addEventListener(

"DOMContentLoaded",

()=>{


const button =
$("searchBtn");


const input =
$("searchInput");



button.addEventListener(

"click",

()=>{


if(input.value.trim()){


searchCity(

input.value.trim()

);


}


}

);



input.addEventListener(

"keypress",

(e)=>{


if(e.key==="Enter"){


searchCity(

input.value.trim()

);


}


}

);



startClock();


getLocation();



}

);
