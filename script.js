/*====================================================
 WeatherSphere Pro
 Final Production JavaScript
====================================================*/


/*=========================
 DOM ELEMENTS
=========================*/


const cityInput = document.getElementById("cityInput");

const searchBtn = document.getElementById("searchBtn");

const locationBtn = document.getElementById("locationBtn");

const themeBtn = document.getElementById("themeBtn");


const cityName = document.getElementById("cityName");

const temperature = document.getElementById("temperature");

const weatherDescription =
document.getElementById("weatherDescription");


const weatherIcon =
document.getElementById("weatherIcon");


const feelsLike =
document.getElementById("feelsLike");


const humidity =
document.getElementById("humidity");


const wind =
document.getElementById("wind");


const pressure =
document.getElementById("pressure");


const sunrise =
document.getElementById("sunrise");


const sunset =
document.getElementById("sunset");


const aqi =
document.getElementById("aqi");


const updatedTime =
document.getElementById("updatedTime");


const localTime =
document.getElementById("localTime");


const forecastContainer =
document.getElementById("forecastContainer");


const loader =
document.getElementById("loader");


const errorBox =
document.getElementById("errorBox");


const errorText =
document.getElementById("errorText");



let temperatureChart;








/*=========================
 INITIAL LOAD
=========================*/


window.addEventListener(
"load",
()=>{


getWeather(

"Delhi",

28.6139,

77.2090,

"India"

);


});










/*=========================
 SEARCH
=========================*/


searchBtn.addEventListener(
"click",
()=>{


const city =
cityInput.value.trim();


if(city){

searchCity(city);

}


});




cityInput.addEventListener(
"keypress",
(e)=>{


if(e.key==="Enter"){

searchCity(
cityInput.value
);

}


});








async function searchCity(city){


showLoader();


try{


const response =
await fetch(

`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`

);



const data =
await response.json();



if(!data.results){

throw new Error(
"City not found"
);

}



const place =
data.results[0];



getWeather(

place.name,

place.latitude,

place.longitude,

place.country

);



saveSearch(place.name);



}

catch(error){

showError(
error.message
);

}



finally{


hideLoader();


}



}










/*=========================
 WEATHER API
=========================*/


async function getWeather(

city,

lat,

lon,

country

){


showLoader();



try{


const url =


`https://api.open-meteo.com/v1/forecast?
latitude=${lat}
&longitude=${lon}
&current=
temperature_2m,
relative_humidity_2m,
apparent_temperature,
pressure_msl,
weather_code,
wind_speed_10m
&hourly=
temperature_2m
&daily=
weather_code,
temperature_2m_max,
temperature_2m_min,
sunrise,
sunset
&timezone=auto`;




const response =
await fetch(
url.replace(/\s+/g,"")
);



const data =
await response.json();



updateUI(
data,
city,
country
);



getAQI(
lat,
lon
);



}

catch(error){


showError(
"Unable to load weather"
);



}



finally{


hideLoader();


}



}









/*=========================
 UPDATE UI
=========================*/


function updateUI(

data,

city,

country

){



const current =
data.current;



cityName.innerHTML =

`${city}, ${country}`;





temperature.innerHTML =

Math.round(
current.temperature_2m
);





feelsLike.innerHTML =

Math.round(
current.apparent_temperature
)
+"°C";





humidity.innerHTML =

current.relative_humidity_2m
+"%";





wind.innerHTML =

Math.round(
current.wind_speed_10m
)
+" km/h";





pressure.innerHTML =

Math.round(
current.pressure_msl
)
+" hPa";






const condition =

getWeatherInfo(
current.weather_code
);





weatherIcon.innerHTML =

condition.icon;





weatherDescription.innerHTML =

condition.text;







sunrise.innerHTML =

formatTime(
data.daily.sunrise[0]
);





sunset.innerHTML =

formatTime(
data.daily.sunset[0]
);





updatedTime.innerHTML =

new Date()
.toLocaleTimeString();





localTime.innerHTML =

new Date(
data.current.time
)
.toLocaleString();






changeTheme(
current.weather_code,
data.current.time
);





createForecast(
data.daily
);



createChart(
data.hourly
);



}









/*=========================
 WEATHER DATABASE
=========================*/


function getWeatherInfo(code){


const weather = {



0:{
text:"Clear Sky",
icon:"☀️"
},


1:{
text:"Mostly Clear",
icon:"🌤️"
},


2:{
text:"Partly Cloudy",
icon:"⛅"
},


3:{
text:"Cloudy",
icon:"☁️"
},


45:{
text:"Fog",
icon:"🌫️"
},


51:{
text:"Drizzle",
icon:"🌦️"
},


61:{
text:"Rain",
icon:"🌧️"
},


63:{
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
}



};


return weather[code] ||

{

text:"Unknown",

icon:"🌍"

};


}









/*=========================
 DYNAMIC THEME
=========================*/


function changeTheme(

code,

time

){


document.body.className="";



let hour =

new Date(time)
.getHours();



if(
hour>=6 &&
hour<18
){

document.body.classList.add(
"day"
);

}

else{

document.body.classList.add(
"night"
);

}





if(code>=50 && code<70)

document.body.classList.add(
"rain"
);



if(code>=95)

document.body.classList.add(
"storm"
);



if(code>=70 && code<80)

document.body.classList.add(
"snow"
);



}









/*=========================
 AQI
=========================*/


async function getAQI(

lat,

lon

){


try{


const response =

await fetch(

`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`

);



const data =
await response.json();



const value =
data.current.us_aqi;



aqi.innerHTML =

value+
" "+
aqiStatus(value);



}


catch{


aqi.innerHTML =
"N/A";


}


}





function aqiStatus(value){


if(value<=50)

return "🟢 Good";


if(value<=100)

return "🟡 Moderate";


return "🔴 Poor";


}









/*=========================
 FORECAST
=========================*/


function createForecast(data){


forecastContainer.innerHTML="";



for(
let i=0;
i<7;
i++
){



const weather =

getWeatherInfo(
data.weather_code[i]
);




const card =

document.createElement(
"div"
);



card.className =

"forecast-card glass-card";




card.innerHTML =

`

<h3>

${new Date(
data.time[i]
)
.toLocaleDateString(
"en",
{
weekday:"short"
}
)}

</h3>


<div style="font-size:40px">

${weather.icon}

</div>


<h2>

${Math.round(
data.temperature_2m_max[i]
)}°

</h2>


<p>

${weather.text}

</p>

`;



forecastContainer.appendChild(card);


}



}









/*=========================
 CHART
=========================*/


function createChart(data){


const ctx =

document
.getElementById(
"hourlyChart"
);



if(temperatureChart)

temperatureChart.destroy();




temperatureChart =

new Chart(
ctx,
{

type:"line",


data:{


labels:

data.time
.slice(0,12)
.map(
time=>

new Date(time)
.getHours()+"h"

),




datasets:[{


data:

data.temperature_2m
.slice(0,12),


borderWidth:3,


tension:.4,


label:"Temperature"



}]

},



options:{


responsive:true,


plugins:{


legend:{


display:false


}


}



}


}

);



}









/*=========================
 LOCATION
=========================*/


locationBtn.addEventListener(
"click",
()=>{


navigator.geolocation.getCurrentPosition(

position=>{


getWeather(

"Current Location",

position.coords.latitude,

position.coords.longitude,

""

);


},

()=>{


showError(
"Location permission denied"
);


}

);


});









/*=========================
 THEME BUTTON
=========================*/


themeBtn.addEventListener(
"click",
()=>{


document.body.classList.toggle(
"manual-dark"
);


});









/*=========================
 RECENT SEARCH
=========================*/


function saveSearch(city){


let data =

JSON.parse(
localStorage.getItem(
"recentCities"
)
)||[];



if(!data.includes(city)){


data.unshift(city);


data=data.slice(0,5);



localStorage.setItem(

"recentCities",

JSON.stringify(data)

);



}



}









/*=========================
 HELPERS
=========================*/


function formatTime(time){


return new Date(time)

.toLocaleTimeString(
[],
{
hour:"2-digit",
minute:"2-digit"
}
);


}



function showLoader(){

loader.classList.remove(
"hidden"
);

}



function hideLoader(){

loader.classList.add(
"hidden"
);

}




function showError(message){


errorText.innerHTML =
message;


errorBox.classList.remove(
"hidden"
);



setTimeout(()=>{


errorBox.classList.add(
"hidden"
);



},3000);


}
