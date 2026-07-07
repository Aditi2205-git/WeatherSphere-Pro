/*====================================================
 WeatherSphere Pro
 Main JavaScript
====================================================*/


const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const cityName = document.getElementById("cityName");
const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("weatherDescription");

const weatherIcon = document.getElementById("weatherIcon");

const feelsLike = document.getElementById("feelsLike");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");

const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const updatedTime = document.getElementById("updatedTime");
const localTime = document.getElementById("localTime");

const forecastContainer =
document.getElementById("forecastContainer");


const loader =
document.getElementById("loader");



let chart;






/* DEFAULT CITY */


window.onload=()=>{

    getWeather(
        "Delhi",
        28.6139,
        77.2090,
        "India"
    );

};








/* SEARCH BUTTON */


searchBtn.addEventListener(
"click",
()=>{

let city =
cityInput.value.trim();


if(city){

searchCity(city);

}


});





cityInput.addEventListener(
"keypress",
(e)=>{


if(e.key==="Enter"){

searchCity(cityInput.value);

}


});








/* CITY SEARCH */


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

alert("City not found");

return;

}



const place=data.results[0];


getWeather(

place.name,
place.latitude,
place.longitude,
place.country

);



saveSearch(place.name);



}

catch(error){

console.log(error);

}



finally{

hideLoader();

}


}










/* WEATHER API */


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
latitude=${lat}&longitude=${lon}
&current=
temperature_2m,
relative_humidity_2m,
apparent_temperature,
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
await fetch(url.replace(/\s+/g,""));



const data =
await response.json();



updateWeather(
data,
city,
country
);



}

catch(error){

console.log(error);

}



finally{

hideLoader();

}



}









/* UPDATE UI */


function updateWeather(
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
)+"°C";



humidity.innerHTML =
current.relative_humidity_2m
+"%";



wind.innerHTML =
Math.round(
current.wind_speed_10m
)
+" km/h";





let weather =
getWeatherInfo(
current.weather_code
);



weatherDescription.innerHTML =
weather.text;


weatherIcon.innerHTML =
weather.icon;



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
new Date()
.toLocaleString();





changeBackground(
current.weather_code
);



createChart(
data.hourly
);



createForecast(
data.daily
);



}










/* WEATHER CONDITIONS */


function getWeatherInfo(code){


const weather={


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


95:{
text:"Thunderstorm",
icon:"⛈️"
}


};



return weather[code] || {

text:"Weather",
icon:"🌍"

};



}









/* DAY NIGHT BACKGROUND */


function changeBackground(code){


let hour =
new Date()
.getHours();



document.body.className="";



if(hour>=6 && hour<=18){

document.body.classList.add("day");

}

else{

document.body.classList.add("night");

}




if(code>=60 && code<70){

document.body.classList.add("rain");

}



if(code>=95){

document.body.classList.add("storm");

}



}









/* TIME FORMAT */


function formatTime(time){


let date =
new Date(time);



return date.toLocaleTimeString(
[],
{
hour:"2-digit",
minute:"2-digit"
}
);



}









/* FORECAST */


function createForecast(data){


forecastContainer.innerHTML="";



for(let i=0;i<7;i++){



let weather =
getWeatherInfo(
data.weather_code[i]
);



let card =
document.createElement("div");



card.className=
"forecast-card glass-card";



card.innerHTML=


`

<h3>
${new Date(data.time[i])
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









/* CHART */


function createChart(hourly){


const ctx =
document
.getElementById(
"hourlyChart"
);



if(chart){

chart.destroy();

}




chart =
new Chart(
ctx,
{

type:"line",


data:{


labels:
hourly.time
.slice(0,12)
.map(
x=>
new Date(x)
.getHours()+"h"
),



datasets:[{


label:"Temperature °C",


data:
hourly.temperature_2m
.slice(0,12),



borderWidth:3,


tension:.4



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



});



}










/* LOCAL STORAGE */


function saveSearch(city){


let searches =
JSON.parse(
localStorage.getItem(
"weatherSearches"
)
)||[];



if(!searches.includes(city)){


searches.unshift(city);


searches =
searches.slice(0,5);


localStorage.setItem(

"weatherSearches",

JSON.stringify(searches)

);


}



}









/* LOADER */


function showLoader(){

loader.classList.remove("hidden");

}


function hideLoader(){

loader.classList.add("hidden");

}
