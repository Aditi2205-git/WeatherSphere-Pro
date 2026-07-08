/* ============================================================
   WeatherSphere Pro 4.0
   Final Polished Script.js
   Image-free Emoji Weather System
============================================================ */


/* ===========================
   CONFIGURATION
=========================== */

const WEATHER_API =
"https://api.open-meteo.com/v1/forecast";

const GEO_API =
"https://geocoding-api.open-meteo.com/v1/search";


let currentLocation = {
    city: "Delhi",
    lat: 28.6139,
    lon: 77.2090
};



/* ===========================
   WEATHER ICON SYSTEM
   (NO IMAGES REQUIRED)
=========================== */

function getWeatherEmoji(code, isDay = true){

    const icons = {

        0: isDay ? "☀️" : "🌙",

        1: "🌤️",
        2: "⛅",
        3: "☁️",

        45: "🌫️",
        48: "🌫️",

        51: "🌦️",
        53: "🌦️",
        55: "🌧️",

        61: "🌧️",
        63: "🌧️",
        65: "🌧️",

        71: "❄️",
        73: "❄️",
        75: "❄️",

        80: "🌦️",
        81: "🌧️",
        82: "⛈️",

        95: "⛈️",
        96: "⛈️",
        99: "⛈️"
    };


    return icons[code] || "🌍";
}



/* ===========================
   DOM ELEMENT HELPER
=========================== */

const $ = (id)=>document.getElementById(id);



/* ===========================
   FETCH WEATHER DATA
=========================== */


async function getWeather(
    lat=currentLocation.lat,
    lon=currentLocation.lon,
    city=currentLocation.city
){

try{

    showLoading();


    const url =
`${WEATHER_API}?latitude=${lat}
&longitude=${lon}
&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,is_day,wind_speed_10m
&hourly=temperature_2m,weather_code
&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset
&timezone=auto`;


    const response = await fetch(
        url.replace(/\s/g,"")
    );


    if(!response.ok)
        throw new Error("Weather unavailable");


    const data = await response.json();



    updateCurrentWeather(
        data,
        city
    );


    updateForecast(
        data
    );


    updateTheme(
        data.current.is_day
    );


}
catch(error){

    console.error(error);

    showError(
        "Unable to fetch weather data"
    );

}

}



/* ===========================
   UPDATE CURRENT WEATHER
=========================== */


function updateCurrentWeather(data,city){

const current =
data.current;


const emoji =
getWeatherEmoji(
current.weather_code,
current.is_day
);



if($("weatherIcon"))
$("weatherIcon").textContent = emoji;



if($("temperature"))
$("temperature").textContent =
Math.round(
current.temperature_2m
)
+"°";



if($("city"))
$("city").textContent =
city;



if($("feelsLike"))
$("feelsLike").textContent =
Math.round(
current.apparent_temperature
)
+"°";



if($("humidity"))
$("humidity").textContent =
current.relative_humidity_2m
+"%";



if($("wind"))
$("wind").textContent =
Math.round(
current.wind_speed_10m
)
+" km/h";



if($("updatedTime"))
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



/* ===========================
   FORECAST CARDS
=========================== */


function updateForecast(data){


const container =
$("forecastContainer");


if(!container)
return;


container.innerHTML="";


data.daily.time
.slice(0,7)
.forEach(
(day,index)=>{


const card =
document.createElement(
"div"
);


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

<div class="forecast-day">
${date}
</div>


<div class="forecast-icon">
${getWeatherEmoji(
data.daily.weather_code[index]
)}
</div>


<div class="forecast-temp">
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



/* ===========================
   SEARCH LOCATION
=========================== */


async function searchCity(city){


try{


const response =
await fetch(
`${GEO_API}?name=${city}&count=1`
);



const data =
await response.json();



if(!data.results)
throw new Error();


const place =
data.results[0];



currentLocation =
{
city:place.name,
lat:place.latitude,
lon:place.longitude
};



getWeather();



}
catch{

alert(
"City not found"
);

}

}



/* ===========================
   USER LOCATION
=========================== */


function getUserLocation(){


if(!navigator.geolocation)
return;


navigator.geolocation.getCurrentPosition(

(position)=>{


currentLocation.lat =
position.coords.latitude;


currentLocation.lon =
position.coords.longitude;


getWeather(
currentLocation.lat,
currentLocation.lon,
"My Location"
);


},

()=>{

getWeather();

}

);

}




/* ===========================
   DARK / LIGHT AUTO MODE
=========================== */


function updateTheme(isDay){


document.body.classList.toggle(
"night-mode",
!isDay
);


}



/* ===========================
   LOADING STATE
=========================== */


function showLoading(){

if($("temperature"))
$("temperature").textContent="--°";

}



function showError(message){


if($("temperature"))
$("temperature").textContent="--";


console.warn(message);

}




/* ===========================
   SEARCH BUTTON EVENTS
=========================== */


document.addEventListener(
"DOMContentLoaded",
()=>{


const searchBtn =
$("searchBtn");


const input =
$("searchInput");



if(searchBtn){

searchBtn.onclick=()=>{

if(input.value.trim())
searchCity(
input.value.trim()
);

};

}



if(input){

input.addEventListener(
"keypress",
(e)=>{

if(e.key==="Enter")
searchCity(
input.value.trim()
);

});

}



getUserLocation();



}
);




/* ===========================
   CLOCK UPDATE
=========================== */


setInterval(()=>{


const clock =
$("currentTime");


if(clock){

clock.textContent =
new Date()
.toLocaleTimeString();

}


},1000);
