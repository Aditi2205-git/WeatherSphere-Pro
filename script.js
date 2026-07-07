/*==================================================
 WeatherSphere Pro v2
 Final Weather Engine
==================================================*/


let weatherChart = null;



const cityInput =
document.getElementById("cityInput");


const searchBtn =
document.getElementById("searchBtn");





// Default city

let currentCity = "Delhi";





/*==================================================
 WEATHER CODE MAPPING
==================================================*/


function getWeatherInfo(code){


const weather={


0:{
text:"Clear Sky",
icon:"☀️",
type:"clear"
},


1:{
text:"Mainly Clear",
icon:"🌤️",
type:"clear"
},


2:{
text:"Partly Cloudy",
icon:"⛅",
type:"cloud"
},


3:{
text:"Overcast",
icon:"☁️",
type:"cloud"
},


45:{
text:"Fog",
icon:"🌫️",
type:"cloud"
},


51:{
text:"Light Drizzle",
icon:"🌦️",
type:"rain"
},


53:{
text:"Drizzle",
icon:"🌦️",
type:"rain"
},


61:{
text:"Rain",
icon:"🌧️",
type:"rain"
},


63:{
text:"Heavy Rain",
icon:"🌧️",
type:"rain"
},


65:{
text:"Heavy Rain",
icon:"🌧️",
type:"rain"
},


71:{
text:"Snow",
icon:"❄️",
type:"snow"
},


80:{
text:"Rain Shower",
icon:"🌦️",
type:"rain"
},


95:{
text:"Thunderstorm",
icon:"⛈️",
type:"storm"
},


96:{
text:"Thunderstorm",
icon:"⛈️",
type:"storm"
},


99:{
text:"Heavy Storm",
icon:"⛈️",
type:"storm"
}


};


return weather[code] || {

text:"Unknown",

icon:"🌍",

type:"clear"

};


}







/*==================================================
 CITY SEARCH API
==================================================*/


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







/*==================================================
 WEATHER API CALL
==================================================*/


async function loadWeather(city){


try{


const place =
await getCoordinates(city);



const latitude =
place.latitude;


const longitude =
place.longitude;



document.getElementById("cityName")
.textContent =

`${place.name}, ${place.country}`;



const url =


`https://api.open-meteo.com/v1/forecast?
latitude=${latitude}&longitude=${longitude}
&timezone=auto
&current=
temperature_2m,
relative_humidity_2m,
apparent_temperature,
is_day,
precipitation,
weather_code,
surface_pressure,
wind_speed_10m,
cloud_cover,
visibility,
uv_index
&hourly=
temperature_2m,
weather_code
&daily=
weather_code,
temperature_2m_max,
temperature_2m_min,
sunrise,
sunset`;



const cleanURL =
url.replace(/\s/g,"");



const response =
await fetch(cleanURL);



const data =
await response.json();




updateCurrent(data);

updateMetrics(data);

updateHourly(data);

updateDaily(data);

updateAstronomy(data);

updateChart(data);

createInsight(data);



changeBackground(
data.current.weather_code
);



}

catch(error){


console.log(error);


alert(
"Unable to load weather data"
);


}



}
/*==================================================
 CURRENT WEATHER UPDATE
==================================================*/


function updateCurrent(data){


const current =
data.current;



const info =
getWeatherInfo(
current.weather_code
);



document.getElementById("weatherIcon")
.textContent =
info.icon;



document.getElementById("temperature")
.textContent =
Math.round(
current.temperature_2m
);



document.getElementById("weatherDescription")
.textContent =
info.text;



document.getElementById("currentDate")
.textContent =

new Date()
.toLocaleString(
[],
{
weekday:"long",
day:"numeric",
month:"long",
year:"numeric"
}
);



document.getElementById("tempHigh")
.textContent =

Math.round(
data.daily.temperature_2m_max[0]
);



document.getElementById("tempLow")
.textContent =

Math.round(
data.daily.temperature_2m_min[0]
);


}








/*==================================================
 WEATHER METRICS
==================================================*/


function updateMetrics(data){



const current =
data.current;



document.getElementById("feelsLike")
.textContent =

Math.round(
current.apparent_temperature
);



document.getElementById("humidity")
.textContent =

current.relative_humidity_2m;



document.getElementById("wind")
.textContent =

Math.round(
current.wind_speed_10m
);



document.getElementById("visibility")
.textContent =

Math.round(
current.visibility / 1000
);



document.getElementById("uvIndex")
.textContent =

current.uv_index;



document.getElementById("cloudCover")
.textContent =

current.cloud_cover;


}








/*==================================================
 HOURLY FORECAST
==================================================*/


function updateHourly(data){



const container =
document.getElementById(
"hourlyForecast"
);



container.innerHTML="";



for(
let i=0;
i<12;
i++
){



const info =
getWeatherInfo(
data.hourly.weather_code[i]
);



const time =

new Date(
data.hourly.time[i]
)
.toLocaleTimeString(
[],
{
hour:"numeric"
}
);



container.innerHTML += `


<div class="hour-card">


<div class="time">

${time}

</div>



<div class="weather-small-icon">

${info.icon}

</div>



<div class="degree">

${Math.round(
data.hourly.temperature_2m[i]
)}°

</div>


</div>


`;



}



}









/*==================================================
 DAILY FORECAST
==================================================*/


function updateDaily(data){



const container =
document.getElementById(
"dailyForecast"
);



container.innerHTML="";



for(
let i=0;
i<7;
i++
){



const info =
getWeatherInfo(
data.daily.weather_code[i]
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


<div class="daily-card">


<div class="day">

${day}

</div>


<div class="icon">

${info.icon}

</div>



<div class="max">

${Math.round(
data.daily.temperature_2m_max[i]
)}°

</div>



<div class="min">

${Math.round(
data.daily.temperature_2m_min[i]
)}°

</div>


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


formatTime(
data.daily.sunrise[0]
);



document.getElementById("sunset")
.textContent =


formatTime(
data.daily.sunset[0]
);



const moon =
calculateMoon();



document.getElementById("moonPhase")
.textContent =
moon.name;



document.getElementById("moonIllumination")
.textContent =
moon.percent;



}







function formatTime(value){



return new Date(value)
.toLocaleTimeString(
[],
{
hour:"2-digit",
minute:"2-digit"
}
);


}








/*==================================================
 MOON CALCULATION
==================================================*/


function calculateMoon(){


const known =
new Date(
"2000-01-06"
);



const today =
new Date();



const days =

(
today-known
)
/
86400000;



const phase =

days % 29.53;



let name;



if(phase<3.7)

name="🌑 New Moon";


else if(phase<7.4)

name="🌒 Crescent";


else if(phase<11.1)

name="🌓 First Quarter";


else if(phase<14.8)

name="🌔 Gibbous";


else if(phase<18.5)

name="🌕 Full Moon";


else if(phase<22.1)

name="🌖 Waning";


else if(phase<25.8)

name="🌗 Last Quarter";


else

name="🌘 Crescent";



return {


name:name,

percent:
Math.round(
(phase/29.53)*100
)


};


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



if(weatherChart){

weatherChart.destroy();

}




weatherChart =

new Chart(
ctx,
{


type:"line",



data:{


labels:

data.hourly.time
.slice(0,12)
.map(time=>

new Date(time)
.toLocaleTimeString(
[],
{
hour:"numeric"
}

)

),



datasets:[{


label:
"Temperature °C",



data:

data.hourly.temperature_2m
.slice(0,12),



borderWidth:3,


tension:.4,


fill:true


}]


},



options:{


responsive:true,


maintainAspectRatio:false,



plugins:{


legend:{


display:true


}


},



scales:{


y:{


beginAtZero:false


}


}


}


}

);


}









/*==================================================
 WEATHER INTELLIGENCE
==================================================*/


function createInsight(data){



const current =
data.current;



let message;



const temperature =
current.temperature_2m;



const humidity =
current.relative_humidity_2m;



const wind =
current.wind_speed_10m;




if(temperature>38){


message =

"Extreme heat detected. Stay hydrated and avoid prolonged outdoor activities.";


}



else if(humidity>80){


message =

"High humidity levels detected. The temperature may feel warmer than usual.";


}



else if(wind>30){


message =

"Strong winds detected. Outdoor activities may require caution.";


}



else if(current.uv_index>7){


message =

"High UV exposure expected. Sun protection is recommended.";


}



else{


message =

"Weather conditions are comfortable today. Enjoy your day with pleasant conditions.";


}



document
.getElementById(
"weatherInsight"
)
.textContent =
message;



}








/*==================================================
 DYNAMIC WEATHER BACKGROUND
==================================================*/


function changeBackground(code){



const body =
document.body;



const rain =
document.getElementById(
"rainContainer"
);



rain.innerHTML="";



const info =
getWeatherInfo(code);




body.style.background =

"linear-gradient(135deg,#2563eb,#38bdf8,#0f172a)";




if(info.type==="rain"){



body.style.background =

"linear-gradient(135deg,#334155,#2563eb,#0f172a)";



createRain();



}




if(info.type==="storm"){



body.style.background =

"linear-gradient(135deg,#111827,#312e81,#020617)";


createRain();



}



if(info.type==="cloud"){


body.style.background =

"linear-gradient(135deg,#64748b,#94a3b8,#334155)";


}




if(info.type==="snow"){


body.style.background =

"linear-gradient(135deg,#e0f2fe,#93c5fd,#64748b)";


}



}








function createRain(){



const container =
document.getElementById(
"rainContainer"
);



for(
let i=0;
i<120;
i++
){


const drop =
document.createElement(
"span"
);



drop.style.position="absolute";

drop.style.width="2px";

drop.style.height="20px";

drop.style.background=
"rgba(255,255,255,.5)";

drop.style.left =
Math.random()*100+"%";


drop.style.top =
Math.random()*100+"%";


drop.style.animation =
`rainFall ${1+Math.random()*2}s linear infinite`;



container.appendChild(drop);



}



}









/*==================================================
 SEARCH EVENTS
==================================================*/


searchBtn
.addEventListener(
"click",
()=>{


const city =
cityInput.value.trim();



if(city){

loadWeather(city);


}



});






cityInput
.addEventListener(
"keypress",
(event)=>{


if(event.key==="Enter"){


searchBtn.click();


}


});









/*==================================================
 START APPLICATION
==================================================*/


loadWeather(
currentCity
);
