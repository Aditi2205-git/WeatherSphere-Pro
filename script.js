/*==================================================
 WeatherSphere Pro
 Premium Weather Dashboard
 Final Production JavaScript
==================================================*/


// ===============================
// GLOBAL VARIABLES
// ===============================


let temperatureChart;



let currentCity = "Delhi";



const API_BASE =
"https://api.open-meteo.com/v1/forecast";





// ===============================
// DOM ELEMENTS
// ===============================


const cityInput =
document.getElementById("cityInput");


const searchBtn =
document.getElementById("searchBtn");





// ===============================
// WEATHER CODE HANDLER
// ===============================


function getWeatherInfo(code){


const weatherCodes = {


0:{
text:"Clear Sky",
icon:"☀️"
},


1:{
text:"Mainly Clear",
icon:"🌤️"
},


2:{
text:"Partly Cloudy",
icon:"⛅"
},


3:{
text:"Overcast",
icon:"☁️"
},


45:{
text:"Fog",
icon:"🌫️"
},


48:{
text:"Rime Fog",
icon:"🌫️"
},


51:{
text:"Light Drizzle",
icon:"🌦️"
},


53:{
text:"Drizzle",
icon:"🌦️"
},


55:{
text:"Heavy Drizzle",
icon:"🌧️"
},


61:{
text:"Light Rain",
icon:"🌦️"
},


63:{
text:"Rain",
icon:"🌧️"
},


65:{
text:"Heavy Rain",
icon:"🌧️"
},


71:{
text:"Snow",
icon:"❄️"
},


80:{
text:"Rain Showers",
icon:"🌦️"
},


95:{
text:"Thunderstorm",
icon:"⛈️"
},


96:{
text:"Thunderstorm With Hail",
icon:"⛈️"
},


99:{
text:"Heavy Thunderstorm",
icon:"⛈️"
}


};


return weatherCodes[code] || {

text:"Unknown Weather",

icon:"🌍"

};


}







// ===============================
// CITY SEARCH
// ===============================


async function getCoordinates(city){


const url =
`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;



const response =
await fetch(url);



const data =
await response.json();



if(!data.results){

throw new Error("City not found");

}



return data.results[0];


}








// ===============================
// WEATHER FETCH
// ===============================


async function fetchWeather(city){


try{


const location =
await getCoordinates(city);



const {

latitude,

longitude,

name,

country


}=location;



document.getElementById("cityName")
.textContent =
`${name}, ${country}`;





const url =

`${API_BASE}?latitude=${latitude}&longitude=${longitude}&timezone=auto&forecast_days=7&hourly=temperature_2m,weathercode,relativehumidity_2m,visibility,cloudcover,uv_index&daily=sunrise,sunset`;





const response =
await fetch(url);



const data =
await response.json();




updateCurrentWeather(data);



updateHourlyForecast(data);



updateDailyForecast(data);



updateHighlights(data);



updateAstronomy(data);



updateChart(data);



generateInsight(data);



}

catch(error){


console.error(error);


alert(
"Unable to fetch weather data"
);


}



}
/*==================================================
 CURRENT WEATHER UPDATE
==================================================*/


function updateCurrentWeather(data){


const current =
data.current;



const info =
getWeatherInfo(
current.weather_code
);



document.getElementById("temperature")
.textContent =
Math.round(current.temperature_2m);



document.getElementById("weatherIcon")
.textContent =
info.icon;



document.getElementById("weatherDescription")
.textContent =
info.text;



document.getElementById("feelsLike")
.textContent =
Math.round(current.apparent_temperature);



document.getElementById("humidity")
.textContent =
current.relative_humidity_2m || "--";



document.getElementById("windSpeed")
.textContent =
Math.round(current.wind_speed_10m);



document.getElementById("dateTime")
.textContent =
new Date()
.toLocaleString();



}






/*==================================================
 WEATHER HIGHLIGHTS
==================================================*/


function updateHighlights(data){


const current =
data.current;



document.getElementById("visibility")
.textContent =

current.visibility
?
Math.round(
current.visibility / 1000
)
:
"--";



document.getElementById("cloudCover")
.textContent =

current.cloud_cover
||
"--";



document.getElementById("uvIndex")
.textContent =

current.uv_index
||
"--";



document.getElementById("pressure")
.textContent =

current.pressure_msl
||
"--";


}








/*==================================================
 HOURLY FORECAST
==================================================*/


function updateHourlyForecast(data){


const container =
document.getElementById(
"hourlyForecast"
);



container.innerHTML="";



for(let i=0;i<12;i++){


const temp =
data.hourly.temperature_2m[i];



const code =
data.hourly.weathercode[i];



const info =
getWeatherInfo(code);



const time =
new Date(
data.hourly.time[i]
)
.toLocaleTimeString(
[],
{
hour:"2-digit"
}
);



container.innerHTML += `


<div class="hour-card">


<h4>${time}</h4>


<div class="icon">
${info.icon}
</div>


<p>
${Math.round(temp)}°
</p>


</div>


`;

}



}








/*==================================================
 DAILY FORECAST
==================================================*/


function updateDailyForecast(data){


const container =
document.getElementById(
"dailyForecast"
);



container.innerHTML="";



for(let i=0;i<7;i++){



const info =
getWeatherInfo(
data.daily.weathercode[i]
);



const day =
new Date(
data.daily.time[i]
)
.toLocaleDateString(
"en-US",
{
weekday:"short"
}
);



container.innerHTML += `


<div class="forecast-card">


<h4>
${day}
</h4>


<div class="forecast-icon">
${info.icon}
</div>


<strong>
${Math.round(
data.daily.temperature_2m_max[i]
)}°
</strong>


<p>
${Math.round(
data.daily.temperature_2m_min[i]
)}°
</p>


</div>


`;



}



}








/*==================================================
 ASTRONOMY
==================================================*/


function updateAstronomy(data){



document.getElementById("sunrise")
.textContent =

new Date(
data.daily.sunrise[0]
)
.toLocaleTimeString(
[],
{
hour:"2-digit",
minute:"2-digit"
}
);



document.getElementById("sunset")
.textContent =

new Date(
data.daily.sunset[0]
)
.toLocaleTimeString(
[],
{
hour:"2-digit",
minute:"2-digit"
}
);



const moon =
calculateMoonPhase();



document.getElementById("moonPhase")
.textContent =
moon.name;



document.getElementById("moonIllumination")
.textContent =
moon.percent;



}








/*==================================================
 MOON PHASE CALCULATOR
==================================================*/


function calculateMoonPhase(){


const knownNewMoon =
new Date("2000-01-06");



const today =
new Date();



const days =

(
today-knownNewMoon
)
/
86400000;



const cycle =
days % 29.53;



const illumination =
Math.round(
(cycle/29.53)*100
);



let name;



if(cycle<3.7)
name="New Moon 🌑";

else if(cycle<7.4)
name="Waxing Crescent 🌒";

else if(cycle<11.1)
name="First Quarter 🌓";

else if(cycle<14.8)
name="Waxing Gibbous 🌔";

else if(cycle<18.5)
name="Full Moon 🌕";

else if(cycle<22.1)
name="Waning Gibbous 🌖";

else if(cycle<25.8)
name="Last Quarter 🌗";

else
name="Waning Crescent 🌘";



return {

name:name,

percent:illumination

};



}








/*==================================================
 WEATHER INSIGHTS
==================================================*/


function generateInsight(data){


const temp =
data.current.temperature_2m;



const humidity =
data.current.relative_humidity_2m;



let message;



if(temp>35){

message =
"Very hot conditions detected. Stay hydrated and avoid long outdoor exposure.";

}

else if(humidity>80){

message =
"High humidity levels detected. The weather may feel warmer than actual temperature.";

}

else if(temp<15){

message =
"Cool weather conditions. Light warm clothing is recommended.";

}

else{

message =
"Weather conditions are comfortable today. Enjoy your day!";

}



document.getElementById(
"weatherInsight"
)
.textContent =
message;



}








/*==================================================
 TEMPERATURE CHART
==================================================*/


function updateChart(data){



const ctx =
document
.getElementById(
"temperatureChart"
)
.getContext("2d");



if(temperatureChart){

temperatureChart.destroy();

}



temperatureChart =
new Chart(ctx,{


type:"line",


data:{


labels:
data.hourly.time.slice(0,12)
.map(t=>
new Date(t)
.toLocaleTimeString(
[],
{
hour:"2-digit"
}
)
),



datasets:[{


label:
"Temperature °C",



data:
data.hourly.temperature_2m.slice(0,12),



tension:.4



}]


},



options:{


responsive:true,

maintainAspectRatio:false,


plugins:{


legend:{


display:true


}


}



}



});



}








/*==================================================
 SEARCH EVENTS
==================================================*/


searchBtn.addEventListener(
"click",
()=>{


const city =
cityInput.value.trim();



if(city){

fetchWeather(city);

}


});





cityInput.addEventListener(
"keypress",
(e)=>{


if(e.key==="Enter"){


searchBtn.click();


}



});







/*==================================================
 INITIAL LOAD
==================================================*/


fetchWeather(
currentCity
);
