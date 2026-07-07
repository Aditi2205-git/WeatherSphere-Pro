/*==========================================================
 WeatherSphere Pro 3.0
 Final JavaScript v4.0

 Premium Weather Dashboard Engine
==========================================================*/


/*==========================================================
 GLOBAL STATE
==========================================================*/


const weatherState = {


    city:"New Delhi",

    latitude:28.6139,

    longitude:77.2090,


    timezone:"Asia/Kolkata",


    data:null,


    charts:{},


    map:null,


    marker:null


};





/*==========================================================
 DOM ELEMENT SHORTCUT
==========================================================*/


const $ = id =>
document.getElementById(id);







/*==========================================================
 API CONFIG
==========================================================*/


const API = {


weather:

"https://api.open-meteo.com/v1/forecast",


air:

"https://air-quality-api.open-meteo.com/v1/air-quality",


geo:

"https://geocoding-api.open-meteo.com/v1/search"


};







/*==========================================================
 WEATHER CODE MAP
==========================================================*/


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


51:{
text:"Light Drizzle",
icon:"🌦️"
},


61:{
text:"Rain",
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
}


};







/*==========================================================
 INITIAL LOAD
==========================================================*/


document.addEventListener(
"DOMContentLoaded",
()=>{


init();


});







async function init(){


loadTheme();


await loadWeather(
weatherState.city
);



setupEvents();


}
/*==========================================================
 CITY SEARCH SYSTEM
==========================================================*/


async function searchCity(city){


    if(!city) return;



    try{


        const response =
        await fetch(
        `${API.geo}?name=${city}&count=1&language=en`
        );



        const result =
        await response.json();



        if(!result.results){

            alert("City not found");

            return;

        }



        const location =
        result.results[0];



        weatherState.city =
        location.name;



        weatherState.latitude =
        location.latitude;



        weatherState.longitude =
        location.longitude;



        weatherState.timezone =
        location.timezone;



        addRecentSearch(
        location.name
        );



        await fetchWeather();



    }


    catch(error){


        console.error(
        "City Search Error:",
        error
        );


    }


}







/*==========================================================
 FETCH WEATHER DATA
==========================================================*/


async function fetchWeather(){


try{


const url =

`${API.weather}?latitude=${weatherState.latitude}
&longitude=${weatherState.longitude}
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
relative_humidity_2m,
wind_speed_10m,
weather_code
&daily=
weather_code,
temperature_2m_max,
temperature_2m_min,
sunrise,
sunset`;



const response =
await fetch(
url.replace(/\s+/g,"")
);



const data =
await response.json();



weatherState.data =
data;



renderCurrentWeather();



renderHighlights();



renderHourly();



renderDaily();



updateDynamicBackground(
data
);



loadAQI();



updateMap();



loadCharts();



updateRadar();



updateAstronomy();



updateRecommendations();



updateFooter();



}


catch(error){


console.error(
"Weather Fetch Failed:",
error
);


}



}








/*==========================================================
 CURRENT WEATHER RENDER
==========================================================*/


function renderCurrentWeather(){



const data =
weatherState.data;



const current =
data.current;



const code =
weatherCodes[
current.weather_code
]
||
{

text:"Unknown",

icon:"🌎"

};





$("cityName").innerText =
weatherState.city;




$("temperature").innerText =

Math.round(
current.temperature_2m
)
+"°";




$("weatherDescription").innerText =
code.text;




$("feelsLike").innerText =

`Feels like ${Math.round(
current.apparent_temperature
)}°C`;





$("humidity").innerText =

current.relative_humidity_2m
+"%";





$("windSpeed").innerText =

Math.round(
current.wind_speed_10m
)
+" km/h";





$("pressure").innerText =

Math.round(
current.surface_pressure
)
+" hPa";





$("visibility").innerText =

Math.round(
current.visibility/1000
)
+" km";





$("uv").innerText =

current.uv_index
?? "--";





$("cloudCover").innerText =

current.cloud_cover
+"%";





$("rainChance").innerText =

current.precipitation
+" mm";





$("dewPoint").innerText =

calculateDewPoint(
current.temperature_2m,
current.relative_humidity_2m
)
+"°";





const icon =
$("weatherIcon");



icon.src =
getWeatherIcon(
current.weather_code
);



icon.alt =
code.text;






updateLocalTime();


}







/*==========================================================
 WEATHER ICONS
==========================================================*/


function getWeatherIcon(code){


const icons = {


0:
"https://cdn-icons-png.flaticon.com/512/869/869869.png",


1:
"https://cdn-icons-png.flaticon.com/512/1163/1163661.png",


2:
"https://cdn-icons-png.flaticon.com/512/1163/1163624.png",


3:
"https://cdn-icons-png.flaticon.com/512/1163/1163624.png",


45:
"https://cdn-icons-png.flaticon.com/512/4005/4005901.png",


61:
"https://cdn-icons-png.flaticon.com/512/1163/1163657.png",


71:
"https://cdn-icons-png.flaticon.com/512/642/642102.png",


95:
"https://cdn-icons-png.flaticon.com/512/1146/1146869.png"


};



return (

icons[code]

||

icons[0]

);


}








/*==========================================================
 DEW POINT CALCULATION
==========================================================*/


function calculateDewPoint(
temp,
humidity
){


const a=17.27;

const b=237.7;



const alpha =

((a*temp)/(b+temp))

+

Math.log(
humidity/100
);



return Math.round(

(b*alpha)/(a-alpha)

);


}






/*==========================================================
 LOCAL TIME
==========================================================*/


function updateLocalTime(){



const time =

new Date()
.toLocaleTimeString(
[],
{
hour:"2-digit",
minute:"2-digit"
}
);



$("localTime").innerText =
time;



$("lastUpdated").innerText =
new Date()
.toLocaleString();



$("currentDate").innerText =

new Date()
.toDateString();



$("timezone").innerText =
weatherState.timezone;


}
/*==========================================================
 HOURLY FORECAST
==========================================================*/


function renderHourly(){


const container =
$("hourlyForecast");



container.innerHTML="";



const hourly =
weatherState.data.hourly;



for(
let i=0;
i<24;
i++
){



const card =
document.createElement("div");



card.className =
"hour-card glass";



const code =
weatherCodes[
hourly.weather_code[i]
]
||
{
text:"Weather",
icon:"🌍"
};




card.innerHTML = `

<h4>
${formatHour(
hourly.time[i]
)}
</h4>


<div style="font-size:2rem">
${code.icon}
</div>


<h3>
${Math.round(
hourly.temperature_2m[i]
)}°
</h3>


<p>
💧
${hourly.relative_humidity_2m[i]}%
</p>


<p>
💨
${Math.round(
hourly.wind_speed_10m[i]
)}
km/h
</p>

`;



container.appendChild(card);


}



}







/*==========================================================
 DAILY FORECAST
==========================================================*/


function renderDaily(){



const container =
$("dailyForecast");



container.innerHTML="";



const daily =
weatherState.data.daily;




for(
let i=0;
i<7;
i++
){



const code =
weatherCodes[
daily.weather_code[i]
]
||
{
icon:"🌍",
text:"Weather"
};




const card =
document.createElement("div");



card.className =
"day-card glass";



card.innerHTML=`

<h3>

${formatDay(
daily.time[i]
)}

</h3>


<div style="font-size:3rem">

${code.icon}

</div>


<p>
${code.text}
</p>


<h2>

${Math.round(
daily.temperature_2m_max[i]
)}°

</h2>


<p>

Low:

${Math.round(
daily.temperature_2m_min[i]
)}°

</p>


`;



container.appendChild(card);


}


}







/*==========================================================
 DATE FORMATTERS
==========================================================*/


function formatHour(date){


return new Date(date)
.toLocaleTimeString(
[],
{
hour:"2-digit",
minute:"2-digit"
}
);


}




function formatDay(date){


return new Date(date)
.toLocaleDateString(
[],
{
weekday:"short"
}
);


}









/*==========================================================
 AQI SYSTEM
==========================================================*/


async function loadAQI(){


try{


const url =

`${API.air}?latitude=${weatherState.latitude}
&longitude=${weatherState.longitude}
&current=
pm2_5,
pm10,
carbon_monoxide,
nitrogen_dioxide,
ozone,
us_aqi`;



const response =
await fetch(
url.replace(/\s+/g,"")
);



const data =
await response.json();



const air =
data.current;



$("aqiValue").innerText =

Math.round(
air.us_aqi
);



$("aqiStatus").innerText =

getAQIStatus(
air.us_aqi
);



$("pm25").innerText =

air.pm2_5.toFixed(1);



$("pm10").innerText =

air.pm10.toFixed(1);



$("co").innerText =

Math.round(
air.carbon_monoxide
);



$("no2").innerText =

air.nitrogen_dioxide.toFixed(1);



$("ozone").innerText =

air.ozone.toFixed(1);



}

catch(error){


console.log(
"AQI Error",
error
);


}



}








function getAQIStatus(aqi){



if(aqi<=50)
return "Good 🌿";

if(aqi<=100)
return "Moderate 🙂";

if(aqi<=150)
return "Unhealthy for Sensitive Groups ⚠️";

if(aqi<=200)
return "Unhealthy 😷";

if(aqi<=300)
return "Very Unhealthy";

return "Hazardous";


}







/*==========================================================
 CHART SYSTEM
==========================================================*/


function loadCharts(){



createChart(

"temperatureChart",

"Temperature",

weatherState.data.hourly.time.slice(0,12),

weatherState.data.hourly.temperature_2m.slice(0,12)

);





createChart(

"humidityChart",

"Humidity",

weatherState.data.hourly.time.slice(0,12),

weatherState.data.hourly.relative_humidity_2m.slice(0,12)

);





createChart(

"windChart",

"Wind Speed",

weatherState.data.hourly.time.slice(0,12),

weatherState.data.hourly.wind_speed_10m.slice(0,12)

);


}







function createChart(
id,
label,
labels,
values
){



if(weatherState.charts[id]){


weatherState.charts[id].destroy();


}



const ctx =
$(id)
.getContext("2d");



weatherState.charts[id] =

new Chart(
ctx,
{


type:"line",



data:{


labels:

labels.map(
x=>formatHour(x)
),



datasets:[{


label,

data:values,

borderWidth:3,

tension:.4,

fill:true


}]


},



options:{


responsive:true,



plugins:{


legend:{


labels:{


color:"#fff"


}


}


},



scales:{


x:{


ticks:{


color:"#fff"


}


},


y:{


ticks:{


color:"#fff"


}


}


}



}



}

);


}
/*==========================================================
 DYNAMIC WEATHER BACKGROUND ENGINE
==========================================================*/


function updateDynamicBackground(data){



const body =
document.body;



const current =
data.current;



const code =
current.weather_code;



const sunrise =
new Date(
data.daily.sunrise[0]
);



const sunset =
new Date(
data.daily.sunset[0]
);



const now =
new Date();



const night =

now < sunrise ||
now > sunset;





body.classList.remove(

"sunny",

"cloudy",

"rain",

"snow",

"thunder",

"night"

);



clearParticles();





/* NIGHT */


if(night){


body.classList.add(
"night"
);


createStars();


return;


}







/* WEATHER BASED */


if(
code===0 ||
code===1
){


body.classList.add(
"sunny"
);


createSunGlow();


}



else if(

code===2 ||
code===3 ||
code===45

){


body.classList.add(
"cloudy"
);


createCloudEffect();


}



else if(

(code>=51 && code<=67)

||

(code>=80 && code<=82)

){


body.classList.add(
"rain"
);


createRain();


}




else if(

code>=71 &&
code<=77

){


body.classList.add(
"snow"
);


createSnow();


}




else if(

code>=95

){


body.classList.add(
"thunder"
);


createLightning();


}



}








/*==========================================================
 CLEAR PARTICLES
==========================================================*/


function clearParticles(){


const container =
document.querySelector(
".weather-particles"
);



if(container)

container.innerHTML="";


}








/*==========================================================
 STARS
==========================================================*/


function createStars(){


const container =
document.querySelector(
".weather-particles"
);



if(!container)
return;




for(
let i=0;
i<100;
i++
){


const star =
document.createElement(
"span"
);



star.style.position =
"absolute";



star.style.width =
"3px";



star.style.height =
"3px";



star.style.background =
"white";



star.style.borderRadius =
"50%";



star.style.left =
Math.random()*100+"%";



star.style.top =
Math.random()*100+"%";



star.style.opacity =
Math.random();



container.appendChild(
star
);



}


}








/*==========================================================
 SUN EFFECT
==========================================================*/


function createSunGlow(){



const icon =
$("weatherIcon");



if(icon)

icon.classList.add(
"sun-glow"
);


}








/*==========================================================
 CLOUD EFFECT
==========================================================*/


function createCloudEffect(){



const container =
document.querySelector(
".weather-particles"
);



if(!container)
return;




for(
let i=0;
i<5;
i++
){


const cloud =
document.createElement(
"div"
);



cloud.className =
"floating-cloud";



cloud.style.top =
Math.random()*90+"%";



cloud.style.animationDuration =
40+i*15+"s";



container.appendChild(
cloud
);



}


}








/*==========================================================
 RAIN EFFECT
==========================================================*/


function createRain(){



const container =
document.querySelector(
".weather-particles"
);



if(!container)
return;




for(
let i=0;
i<150;
i++
){


const drop =
document.createElement(
"span"
);



drop.className =
"rain-drop";



drop.style.left =
Math.random()*100+"%";



drop.style.animationDuration =

(
0.5+
Math.random()
)

+"s";



container.appendChild(
drop
);



}


}








/*==========================================================
 SNOW EFFECT
==========================================================*/


function createSnow(){



const container =
document.querySelector(
".weather-particles"
);



if(!container)
return;




for(
let i=0;
i<80;
i++
){


const snow =
document.createElement(
"span"
);



snow.style.position =
"absolute";



snow.style.width =
"8px";



snow.style.height =
"8px";



snow.style.background =
"white";



snow.style.borderRadius =
"50%";



snow.style.left =
Math.random()*100+"%";



snow.style.animation =

`snowFall ${
5+
Math.random()*5
}s linear infinite`;



container.appendChild(
snow
);



}


}








/*==========================================================
 THUNDER FLASH
==========================================================*/


function createLightning(){



setInterval(()=>{



document.body.style.filter =
"brightness(1.4)";



setTimeout(()=>{


document.body.style.filter =
"brightness(1)";


},120);



},5000);



}









/*==========================================================
 DARK / LIGHT MODE
==========================================================*/


function setupTheme(){


const btn =
$("themeToggle");



if(!btn)
return;




btn.onclick = ()=>{



document.body.classList.toggle(
"dark"
);



localStorage.setItem(

"theme",

document.body.classList.contains(
"dark"
)

?
"dark"

:
"light"

);



};



}







function loadTheme(){



const theme =
localStorage.getItem(
"theme"
);



if(theme==="dark"){


document.body.classList.add(
"dark"
);


}



}







/*==========================================================
 CONNECT THEME BUTTON
==========================================================*/


document.addEventListener(
"DOMContentLoaded",
()=>{


setupTheme();


});
/*==========================================================
 LEAFLET WEATHER MAP
==========================================================*/


function initMap(){


if(weatherState.map)
return;



weatherState.map =

L.map(
"weatherMap"
)
.setView(

[
weatherState.latitude,

weatherState.longitude

],

10

);





L.tileLayer(

"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

{

attribution:
"© OpenStreetMap"

}

)

.addTo(
weatherState.map
);





weatherState.marker =

L.marker(

[
weatherState.latitude,

weatherState.longitude

]

)

.addTo(
weatherState.map
);



}








function updateMap(){



initMap();



const lat =
weatherState.latitude;



const lon =
weatherState.longitude;




weatherState.map.setView(

[
lat,
lon
],

10

);



weatherState.marker
.setLatLng(

[
lat,
lon

]

);



weatherState.marker
.bindPopup(

`

<b>${weatherState.city}</b>

<br>

Live Weather Location

`

)

.openPopup();



}








/*==========================================================
 USER LOCATION
==========================================================*/


function getUserLocation(){



if(!navigator.geolocation){


alert(
"Location not supported"
);


return;


}





navigator.geolocation.getCurrentPosition(

async position=>{


weatherState.latitude =

position.coords.latitude;



weatherState.longitude =

position.coords.longitude;



await reverseGeocode();


fetchWeather();



},

error=>{


alert(
"Location permission denied"
);


}


);



}








async function reverseGeocode(){


try{


const response =

await fetch(

`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${weatherState.latitude}&longitude=${weatherState.longitude}`

);



const data =
await response.json();



if(data.results){


weatherState.city =

data.results[0].name;


}



}

catch(e){


console.log(e);


}


}









/*==========================================================
 RAINVIEWER RADAR
==========================================================*/


function updateRadar(){



const frame =
$("radarFrame");



if(!frame)
return;




frame.src =

`

https://www.rainviewer.com/map.html?

loc=

${weatherState.latitude},

${weatherState.longitude},

7

`

;



}









/*==========================================================
 ASTRONOMY SECTION
==========================================================*/


function updateAstronomy(){



const daily =
weatherState.data.daily;



const sunrise =
new Date(
daily.sunrise[0]
);



const sunset =
new Date(
daily.sunset[0]
);





$("sunrise").innerText =

formatTime(
sunrise
);



$("sunset").innerText =

formatTime(
sunset
);





const dayLength =

(
sunset -
sunrise
)

/
1000;



$("dayLength").innerText =

formatDuration(
dayLength
);





$("solarNoon").innerText =

formatTime(

new Date(

(
sunrise.getTime()
+
sunset.getTime()

)/2

)

);



$("moonPhase").innerText =

getMoonPhase();





$("goldenHour").innerText =

formatTime(

new Date(

sunset.getTime()
-
3600000

)

);



}









function formatTime(date){



return date.toLocaleTimeString(

[],

{

hour:"2-digit",

minute:"2-digit"

}

);


}






function formatDuration(seconds){



const hours =

Math.floor(
seconds/3600
);



const minutes =

Math.floor(
(seconds%3600)/60
);



return `${hours}h ${minutes}m`;

}







function getMoonPhase(){



const phases = [


"🌑 New Moon",

"🌒 Waxing Crescent",

"🌓 First Quarter",

"🌔 Waxing Gibbous",

"🌕 Full Moon",

"🌖 Waning Gibbous",

"🌗 Last Quarter",

"🌘 Waning Crescent"


];



const date =
new Date();



const cycle =

Math.floor(
(
date.getTime()
/
86400000
)

%8
);



return phases[cycle];


}









/*==========================================================
 HEALTH RECOMMENDATIONS
==========================================================*/


function updateRecommendations(){



const temp =

weatherState.data.current.temperature_2m;



const rain =

weatherState.data.current.precipitation;



const aqi =

Number(
$("aqiValue").innerText
);






$("hydrationTip").innerText =

temp>35

?

"High temperature. Drink extra water and stay hydrated."

:

"Maintain regular hydration throughout the day.";





$("exerciseTip").innerText =

rain>0

?

"Indoor workout is better due to rain."

:

"Good weather for walking and outdoor exercise.";





$("clothingTip").innerText =

temp>30

?

"Light cotton clothes recommended."

:

"Carry a light jacket.";





$("travelTip").innerText =

aqi>150

?

"Poor air quality. Reduce outdoor exposure."

:

"Travel conditions are comfortable.";






}









/*==========================================================
 RECENT SEARCHES
==========================================================*/


function addRecentSearch(city){



let searches =

JSON.parse(

localStorage.getItem(
"recentCities"
)

)

|| [];





searches =

searches.filter(
c=>c!==city
);



searches.unshift(city);



searches =

searches.slice(
0,
6
);



localStorage.setItem(

"recentCities",

JSON.stringify(searches)

);



renderRecentSearches();



}







function renderRecentSearches(){



const container =
$("recentSearches");



if(!container)
return;




container.innerHTML="";



const searches =

JSON.parse(

localStorage.getItem(
"recentCities"
)

)

|| [];





searches.forEach(city=>{


const chip =

document.createElement(
"div"
);



chip.className =
"search-chip";



chip.innerText =
city;



chip.onclick=()=>{


searchCity(city);



};



container.appendChild(
chip
);



});


}









/*==========================================================
 FAVORITE CITIES
==========================================================*/


function addFavorite(city){



let fav =

JSON.parse(

localStorage.getItem(
"favorites"
)

)

|| [];



if(!fav.includes(city)){


fav.push(city);


}



localStorage.setItem(

"favorites",

JSON.stringify(fav)

);



renderFavorites();



}







function renderFavorites(){



const list =
$("favoriteCities");



if(!list)
return;




list.innerHTML="";



const fav =

JSON.parse(

localStorage.getItem(
"favorites"
)

)

|| [];





fav.forEach(city=>{


const li =
document.createElement(
"li"
);



li.innerText =
city;



li.onclick=()=>{


searchCity(city);



};



list.appendChild(
li
);



});


}
/*==========================================================
 LEAFLET WEATHER MAP
==========================================================*/


function initMap(){


if(weatherState.map)
return;



weatherState.map =

L.map(
"weatherMap"
)
.setView(

[
weatherState.latitude,

weatherState.longitude

],

10

);





L.tileLayer(

"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

{

attribution:
"© OpenStreetMap"

}

)

.addTo(
weatherState.map
);





weatherState.marker =

L.marker(

[
weatherState.latitude,

weatherState.longitude

]

)

.addTo(
weatherState.map
);



}








function updateMap(){



initMap();



const lat =
weatherState.latitude;



const lon =
weatherState.longitude;




weatherState.map.setView(

[
lat,
lon
],

10

);



weatherState.marker
.setLatLng(

[
lat,
lon

]

);



weatherState.marker
.bindPopup(

`

<b>${weatherState.city}</b>

<br>

Live Weather Location

`

)

.openPopup();



}








/*==========================================================
 USER LOCATION
==========================================================*/


function getUserLocation(){



if(!navigator.geolocation){


alert(
"Location not supported"
);


return;


}





navigator.geolocation.getCurrentPosition(

async position=>{


weatherState.latitude =

position.coords.latitude;



weatherState.longitude =

position.coords.longitude;



await reverseGeocode();


fetchWeather();



},

error=>{


alert(
"Location permission denied"
);


}


);



}








async function reverseGeocode(){


try{


const response =

await fetch(

`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${weatherState.latitude}&longitude=${weatherState.longitude}`

);



const data =
await response.json();



if(data.results){


weatherState.city =

data.results[0].name;


}



}

catch(e){


console.log(e);


}


}









/*==========================================================
 RAINVIEWER RADAR
==========================================================*/


function updateRadar(){



const frame =
$("radarFrame");



if(!frame)
return;




frame.src =

`

https://www.rainviewer.com/map.html?

loc=

${weatherState.latitude},

${weatherState.longitude},

7

`

;



}









/*==========================================================
 ASTRONOMY SECTION
==========================================================*/


function updateAstronomy(){



const daily =
weatherState.data.daily;



const sunrise =
new Date(
daily.sunrise[0]
);



const sunset =
new Date(
daily.sunset[0]
);





$("sunrise").innerText =

formatTime(
sunrise
);



$("sunset").innerText =

formatTime(
sunset
);





const dayLength =

(
sunset -
sunrise
)

/
1000;



$("dayLength").innerText =

formatDuration(
dayLength
);





$("solarNoon").innerText =

formatTime(

new Date(

(
sunrise.getTime()
+
sunset.getTime()

)/2

)

);



$("moonPhase").innerText =

getMoonPhase();





$("goldenHour").innerText =

formatTime(

new Date(

sunset.getTime()
-
3600000

)

);



}









function formatTime(date){



return date.toLocaleTimeString(

[],

{

hour:"2-digit",

minute:"2-digit"

}

);


}






function formatDuration(seconds){



const hours =

Math.floor(
seconds/3600
);



const minutes =

Math.floor(
(seconds%3600)/60
);



return `${hours}h ${minutes}m`;

}







function getMoonPhase(){



const phases = [


"🌑 New Moon",

"🌒 Waxing Crescent",

"🌓 First Quarter",

"🌔 Waxing Gibbous",

"🌕 Full Moon",

"🌖 Waning Gibbous",

"🌗 Last Quarter",

"🌘 Waning Crescent"


];



const date =
new Date();



const cycle =

Math.floor(
(
date.getTime()
/
86400000
)

%8
);



return phases[cycle];


}









/*==========================================================
 HEALTH RECOMMENDATIONS
==========================================================*/


function updateRecommendations(){



const temp =

weatherState.data.current.temperature_2m;



const rain =

weatherState.data.current.precipitation;



const aqi =

Number(
$("aqiValue").innerText
);






$("hydrationTip").innerText =

temp>35

?

"High temperature. Drink extra water and stay hydrated."

:

"Maintain regular hydration throughout the day.";





$("exerciseTip").innerText =

rain>0

?

"Indoor workout is better due to rain."

:

"Good weather for walking and outdoor exercise.";





$("clothingTip").innerText =

temp>30

?

"Light cotton clothes recommended."

:

"Carry a light jacket.";





$("travelTip").innerText =

aqi>150

?

"Poor air quality. Reduce outdoor exposure."

:

"Travel conditions are comfortable.";






}









/*==========================================================
 RECENT SEARCHES
==========================================================*/


function addRecentSearch(city){



let searches =

JSON.parse(

localStorage.getItem(
"recentCities"
)

)

|| [];





searches =

searches.filter(
c=>c!==city
);



searches.unshift(city);



searches =

searches.slice(
0,
6
);



localStorage.setItem(

"recentCities",

JSON.stringify(searches)

);



renderRecentSearches();



}







function renderRecentSearches(){



const container =
$("recentSearches");



if(!container)
return;




container.innerHTML="";



const searches =

JSON.parse(

localStorage.getItem(
"recentCities"
)

)

|| [];





searches.forEach(city=>{


const chip =

document.createElement(
"div"
);



chip.className =
"search-chip";



chip.innerText =
city;



chip.onclick=()=>{


searchCity(city);



};



container.appendChild(
chip
);



});


}









/*==========================================================
 FAVORITE CITIES
==========================================================*/


function addFavorite(city){



let fav =

JSON.parse(

localStorage.getItem(
"favorites"
)

)

|| [];



if(!fav.includes(city)){


fav.push(city);


}



localStorage.setItem(

"favorites",

JSON.stringify(fav)

);



renderFavorites();



}







function renderFavorites(){



const list =
$("favoriteCities");



if(!list)
return;




list.innerHTML="";



const fav =

JSON.parse(

localStorage.getItem(
"favorites"
)

)

|| [];





fav.forEach(city=>{


const li =
document.createElement(
"li"
);



li.innerText =
city;



li.onclick=()=>{


searchCity(city);



};



list.appendChild(
li
);



});


}

/*==========================================================
 FINAL MOBILE + DESKTOP SAFE INITIALIZER
==========================================================*/


let appStarted = false;



async function startApp(){


    if(appStarted) return;


    appStarted = true;



    console.log(
        "WeatherSphere Pro Started"
    );



    loadTheme();



    setupEvents();



    renderRecentSearches();



    renderFavorites();



    setTimeout(()=>{


        initMap();


        if(weatherState.map){

            weatherState.map.invalidateSize();

        }


    },600);



    await fetchWeather();



}






/*==========================================================
 WAIT FOR COMPLETE PAGE LOAD
==========================================================*/


if(
document.readyState === "loading"
){


document.addEventListener(

"DOMContentLoaded",

()=>{


startApp();


}

);



}

else{


startApp();


}







/*==========================================================
 MOBILE MAP RESIZE FIX
==========================================================*/


window.addEventListener(

"resize",

()=>{


if(weatherState.map){


setTimeout(()=>{


weatherState.map.invalidateSize();



},300);


}



}

);







/*==========================================================
 MOBILE SIDEBAR TOGGLE
==========================================================*/


document.addEventListener(

"DOMContentLoaded",

()=>{


const menuButton =
document.getElementById(
"menuToggle"
);



const sidebar =
document.querySelector(
".sidebar"
);



if(
menuButton &&
sidebar
){



menuButton.onclick = ()=>{


sidebar.classList.toggle(
"active"
);


};



/* close sidebar after clicking menu item */


document
.querySelectorAll(
".sidebar a"
)
.forEach(link=>{


link.onclick=()=>{


sidebar.classList.remove(
"active"
);



};


});



}



});







/*==========================================================
 AUTO WEATHER UPDATE
==========================================================*/


setInterval(

()=>{


if(weatherState.city){


fetchWeather();


}


},

15*60*1000

);







/*==========================================================
 INTERNET STATUS
==========================================================*/


window.addEventListener(

"offline",

()=>{


console.warn(
"Internet disconnected"
);


}
);



window.addEventListener(

"online",

()=>{


console.log(
"Internet restored"
);


fetchWeather();


}
);





/*==========================================================
 END FINAL JS MOBILE PATCH
==========================================================*/
