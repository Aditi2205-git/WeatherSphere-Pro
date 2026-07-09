/* ===========================================================
WeatherSphere Pro 4.0
Premium Weather Dashboard
script.js PART 1/5

Author : Aditi Singh

API:
Open-Meteo
No API Key Required
=========================================================== */


/* ===========================================================
GLOBAL VARIABLES
=========================================================== */


let currentCity = "New Delhi";

let currentLat = 28.6139;

let currentLon = 77.2090;


let weatherData = null;


let temperatureUnit = "celsius";


let map = null;



/* ===========================================================
DOM SELECTOR HELPER
=========================================================== */


const $ = id => document.getElementById(id);



/* ===========================================================
WEATHER CODE DATABASE
=========================================================== */


const weatherCodes = {


0:{
    text:"Clear Sky",
    day:"☀️",
    night:"🌙"
},


1:{
    text:"Mainly Clear",
    day:"🌤️",
    night:"🌙"
},


2:{
    text:"Partly Cloudy",
    day:"⛅",
    night:"☁️"
},


3:{
    text:"Overcast",
    day:"☁️",
    night:"☁️"
},


45:{
    text:"Fog",
    day:"🌫️",
    night:"🌫️"
},


48:{
    text:"Rime Fog",
    day:"🌫️",
    night:"🌫️"
},


51:{
    text:"Light Drizzle",
    day:"🌦️",
    night:"🌧️"
},


53:{
    text:"Drizzle",
    day:"🌦️",
    night:"🌧️"
},


55:{
    text:"Heavy Drizzle",
    day:"🌧️",
    night:"🌧️"
},


61:{
    text:"Light Rain",
    day:"🌦️",
    night:"🌧️"
},


63:{
    text:"Rain",
    day:"🌧️",
    night:"🌧️"
},


65:{
    text:"Heavy Rain",
    day:"🌧️",
    night:"🌧️"
},


71:{
    text:"Snow",
    day:"❄️",
    night:"🌨️"
},


73:{
    text:"Snowfall",
    day:"❄️",
    night:"🌨️"
},


75:{
    text:"Heavy Snow",
    day:"❄️",
    night:"🌨️"
},


80:{
    text:"Rain Showers",
    day:"🌦️",
    night:"🌧️"
},


81:{
    text:"Rain Showers",
    day:"🌧️",
    night:"🌧️"
},


82:{
    text:"Heavy Showers",
    day:"⛈️",
    night:"⛈️"
},


95:{
    text:"Thunderstorm",
    day:"⛈️",
    night:"⛈️"
},


96:{
    text:"Thunderstorm Hail",
    day:"⛈️",
    night:"⛈️"
},


99:{
    text:"Severe Storm",
    day:"⛈️",
    night:"⛈️"
}


};



/* ===========================================================
GET WEATHER INFO
=========================================================== */


function getWeatherInfo(code,isDay=true){


    let data = weatherCodes[code] || weatherCodes[0];


    return {


        text:data.text,


        icon:isDay ? data.day : data.night


    };


}





/* ===========================================================
TEMPERATURE CONVERSION
=========================================================== */


function convertTemperature(value){


    if(value===undefined || value===null)
        return "--°";


    if(temperatureUnit==="fahrenheit"){

        return Math.round((value*9/5)+32)+"°F";

    }


    return Math.round(value)+"°C";


}





/* ===========================================================
CHECK DAY OR NIGHT
USING COUNTRY SUNRISE SUNSET
=========================================================== */


function isDayTime(current,sunrise,sunset){


    let now=new Date(current);


    let rise=new Date(sunrise);


    let set=new Date(sunset);



    return now>=rise && now<=set;


}





/* ===========================================================
FETCH CITY COORDINATES
=========================================================== */


async function getCityCoordinates(city){


try{


let response =
await fetch(

`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`

);



let data = await response.json();



if(!data.results)
    throw "City not found";



return {

name:data.results[0].name,

lat:data.results[0].latitude,

lon:data.results[0].longitude,

country:data.results[0].country

};


}

catch(error){


showToast("City not found");


return null;


}


}




/* ===========================================================
MAIN WEATHER FETCH
=========================================================== */


async function fetchWeather(){


try{


showLoader();



let url = `https://api.open-meteo.com/v1/forecast?


latitude=${currentLat}


&longitude=${currentLon}


&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,pressure_msl,cloud_cover,visibility,is_day


&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code


&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max


&timezone=auto`;



let response =
await fetch(url.replace(/\s/g,""));



let data =
await response.json();



weatherData=data;



updateAllWeather(data);



hideLoader();



}


catch(error){


console.error(error);


showError("Weather data loading failed");


hideLoader();


}


}

/* ===========================================================
UPDATE ALL WEATHER DATA
=========================================================== */


function updateAllWeather(data){


    const current = data.current;


    const daily = data.daily;



    let sunrise = daily.sunrise[0];

    let sunset  = daily.sunset[0];



    let isDay = isDayTime(

        current.time,

        sunrise,

        sunset

    );



    let weather = getWeatherInfo(

        current.weather_code,

        isDay

    );



    updateHero(

        current,

        weather

    );



    updateCurrentWeather(

        current,

        weather

    );



    updateSunData(

        daily

    );



    updateHighlights(

        current,

        daily

    );



    updateForecast(

        daily

    );



    updateHourly(

        data.hourly

    );



    updateWeatherTheme(

        current.weather_code,

        isDay

    );



    updateAdvice(

        current

    );



    updateTime(

        current.time

    );


}







/* ===========================================================
HERO WEATHER UPDATE
=========================================================== */


function updateHero(current,weather){



    if($("heroTemp"))

        $("heroTemp").innerText =

        convertTemperature(

            current.temperature_2m

        );





    if($("heroCity"))

        $("heroCity").innerText = currentCity;





    if($("heroDescription"))

        $("heroDescription").innerText =

        weather.text;





    let icon = document.querySelector(".hero-weather-card .weather-icon");



    if(icon)

        icon.innerHTML = weather.icon;





    if($("heroHumidity"))

        $("heroHumidity").innerText =

        current.relative_humidity_2m+"%";





    if($("heroWind"))

        $("heroWind").innerText =

        Math.round(current.wind_speed_10m)+" km/h";


}







/* ===========================================================
CURRENT WEATHER CARD
=========================================================== */


function updateCurrentWeather(current,weather){



    if($("weatherEmoji"))

        $("weatherEmoji").innerHTML =

        weather.icon;





    if($("temperature"))

        $("temperature").innerText =

        convertTemperature(

            current.temperature_2m

        );





    if($("weatherCondition"))

        $("weatherCondition").innerText =

        weather.text;





    if($("cityName"))

        $("cityName").innerText =

        currentCity;







    /*
       IMPORTANT FIX:
       Open Meteo sends:
       apparent_temperature

       Not:
       feels_like
    */



    if($("feelsLike"))

        $("feelsLike").innerText =

        convertTemperature(

            current.apparent_temperature

        );







    if($("windSpeed"))

        $("windSpeed").innerText =

        Math.round(

            current.wind_speed_10m

        )+" km/h";





    if($("humidity"))

        $("humidity").innerText =

        current.relative_humidity_2m+"%";



}








/* ===========================================================
SUNRISE SUNSET
=========================================================== */


function updateSunData(daily){



    if($("sunrise")){


        $("sunrise").innerText =

        formatTime(

            daily.sunrise[0]

        );


    }




    if($("sunset")){


        $("sunset").innerText =

        formatTime(

            daily.sunset[0]

        );


    }


}








/* ===========================================================
HIGHLIGHTS UPDATE
=========================================================== */


function updateHighlights(current,daily){



    if($("visibility"))

        $("visibility").innerText =

        current.visibility ?

        Math.round(

        current.visibility/1000

        )+" km"

        :

        "--";





    if($("pressure"))

        $("pressure").innerText =

        Math.round(

        current.pressure_msl

        )+" hPa";





    if($("clouds"))

        $("clouds").innerText =

        current.cloud_cover+"%";





    if($("dewPoint"))

        $("dewPoint").innerText =

        convertTemperature(

            current.dew_point_2m

        );





    if($("maxTemp"))

        $("maxTemp").innerText =

        convertTemperature(

            daily.temperature_2m_max[0]

        );





    if($("minTemp"))

        $("minTemp").innerText =

        convertTemperature(

            daily.temperature_2m_min[0]

        );


}







/* ===========================================================
WEATHER BACKGROUND CHANGER
=========================================================== */


function updateWeatherTheme(code,isDay){



let body=document.body;



if(isDay)

    body.classList.add("day");

else

    body.classList.remove("day");




let rain=document.querySelector(".rain");

let snow=document.querySelector(".snow");

let lightning=document.querySelector(".lightning");




rain.classList.remove("active");

snow.classList.remove("active");

lightning.classList.remove("active");





if([51,53,55,61,63,65,80,81,82].includes(code)){


    rain.classList.add("active");


}





if([71,73,75].includes(code)){


    snow.classList.add("active");


}





if([95,96,99].includes(code)){


    lightning.classList.add("active");


}



}


/* ===========================================================
HOURLY FORECAST UPDATE
=========================================================== */


function updateHourly(hourly){


    let container = $("hourlyContainer");


    if(!container) return;



    container.innerHTML="";



    for(let i=0;i<24;i++){


        let weather = getWeatherInfo(

            hourly.weather_code[i],

            true

        );



        let card=document.createElement("div");


        card.className="hour-card";



        let time =
        new Date(hourly.time[i])
        .toLocaleTimeString(
            [],
            {
                hour:"2-digit",
                minute:"2-digit"
            }
        );



        card.innerHTML=`

            <h4>${time}</h4>

            <div class="emoji">

                ${weather.icon}

            </div>

            <h3>

                ${convertTemperature(
                    hourly.temperature_2m[i]
                )}

            </h3>


            <p>

            💧 ${hourly.relative_humidity_2m[i]}%

            </p>


            <p>

            🌬️ ${Math.round(
                hourly.wind_speed_10m[i]
            )} km/h

            </p>

        `;



        container.appendChild(card);


    }


}








/* ===========================================================
7 DAY FORECAST UPDATE
=========================================================== */


function updateForecast(daily){



let container=$("forecastContainer");



if(!container) return;



container.innerHTML="";





for(let i=0;i<7;i++){



let date =
new Date(
daily.time[i]
);



let day =
date.toLocaleDateString(
[],
{
weekday:"short"
}
);




let weather =
getWeatherInfo(
daily.weather_code[i],
true
);





let card=document.createElement("div");



card.className="forecast-card";





card.innerHTML=`

<h3>

${day}

</h3>


<div class="emoji">

${weather.icon}

</div>



<p>

${weather.text}

</p>



<h2>

${convertTemperature(
daily.temperature_2m_max[i]
)}

</h2>



<span>

Low:

${convertTemperature(
daily.temperature_2m_min[i]
)}

</span>


`;



container.appendChild(card);



}


}










/* ===========================================================
UV INDEX
=========================================================== */


function updateUV(daily){



if(!$("uvIndex"))
return;




let uv =
daily.uv_index_max[0];



$("uvIndex").innerText =
Math.round(uv);



let level="Low";



if(uv>=3)
level="Moderate";


if(uv>=6)
level="High";


if(uv>=8)
level="Very High";



if($("uvLevel"))

$("uvLevel").innerText =
level;




if($("uvBar"))

$("uvBar").style.width =
Math.min(
uv*10,
100
)+"%";



}









/* ===========================================================
AIR QUALITY FETCH
=========================================================== */


async function fetchAQI(){



try{



let url=

`
https://air-quality-api.open-meteo.com/v1/air-quality?

latitude=${currentLat}

&longitude=${currentLon}

&current=us_aqi
`;



let response =
await fetch(
url.replace(/\s/g,"")
);



let data =
await response.json();





let aqi =
data.current.us_aqi;



if($("aqiValue"))

$("aqiValue").innerText =
aqi;



let status =
"Good";



if(aqi>50)
status="Moderate";


if(aqi>100)
status="Unhealthy";


if(aqi>200)
status="Very Unhealthy";



if($("aqiStatus"))

$("aqiStatus").innerText =
status;



}


catch(error){


console.log(
"AQI unavailable"
);


}


}










/* ===========================================================
SMART WEATHER ADVICE
=========================================================== */


function updateAdvice(current){



let temp =
current.temperature_2m;



let humidity =
current.relative_humidity_2m;



let advice =
"Weather conditions are comfortable today.";





let health =
"Air conditions are normal.";





let activity =
"Good time for outdoor activities.";





if(temp>35){


advice =
"Stay hydrated and avoid intense outdoor activities.";


activity =
"Prefer indoor activities during afternoon.";

}



if(humidity>80){


health =
"High humidity may cause discomfort.";


}



if(temp<10){


advice =
"Wear warm clothes and protect yourself from cold.";


activity =
"Outdoor activities are better during sunny hours.";

}





if($("weatherAdvice"))

$("weatherAdvice").innerText =
advice;




if($("healthAdvice"))

$("healthAdvice").innerText =
health;




if($("activityAdvice"))

$("activityAdvice").innerText =
activity;


}








/* ===========================================================
DATE TIME UPDATE
=========================================================== */


function updateTime(time){



let date =
new Date(time);



if($("currentTime"))

$("currentTime").innerText =

date.toLocaleTimeString();



if($("currentDate"))

$("currentDate").innerText =

date.toLocaleDateString(
[],
{
weekday:"long",
day:"numeric",
month:"long"
}
);



}
/* ===========================================================
CITY SEARCH
=========================================================== */


async function searchCity(){


    let input=$("cityInput");


    if(!input || !input.value.trim())
        return;



    let city=input.value.trim();



    let location =
    await getCityCoordinates(city);



    if(!location)
        return;




    currentCity =
    location.name;



    currentLat =
    location.lat;



    currentLon =
    location.lon;



    saveSearchHistory(
        currentCity
    );



    fetchWeather();


    fetchAQI();



}








/* ===========================================================
CURRENT LOCATION
=========================================================== */


function getCurrentLocation(){



if(!navigator.geolocation){


    showToast(
        "Location not supported"
    );


    return;

}





navigator.geolocation.getCurrentPosition(

(position)=>{


    currentLat =
    position.coords.latitude;



    currentLon =
    position.coords.longitude;




    currentCity =
    "Your Location";



    fetchWeather();


    fetchAQI();



},


()=>{


showToast(
"Location permission denied"
);


}



);


}









/* ===========================================================
VOICE SEARCH
=========================================================== */


function startVoiceSearch(){



if(
!"webkitSpeechRecognition" in window
){


showToast(
"Voice search not supported"
);


return;


}



let recognition =
new webkitSpeechRecognition();



recognition.lang="en-US";


recognition.start();





if($("voiceModal"))

$("voiceModal").style.display="flex";




recognition.onresult=function(event){



let city =
event.results[0][0].transcript;



if($("cityInput"))

$("cityInput").value =
city;



searchCity();



};




recognition.onend=function(){



if($("voiceModal"))

$("voiceModal").style.display="none";


};



}








/* ===========================================================
FAVORITE CITIES
=========================================================== */


function addFavorite(){



let favorites =
JSON.parse(
localStorage.getItem(
"favorites"
)
)
||
[];





if(!favorites.includes(currentCity)){


favorites.push(
currentCity
);



localStorage.setItem(

"favorites",

JSON.stringify(
favorites
)

);



renderFavorites();



showToast(
"Added to favorites"
);


}


}









function renderFavorites(){



let container =
$("favoriteCities");



if(!container)
return;



let favorites =
JSON.parse(
localStorage.getItem(
"favorites"
)
)
||
[];




container.innerHTML="";





favorites.forEach(city=>{



let card =
document.createElement(
"div"
);



card.className=
"favorite-card";




card.innerHTML=`

<h3>

${city}

</h3>


<p>

Click to view weather

</p>

`;




card.onclick=function(){


$("cityInput").value =
city;


searchCity();


};



container.appendChild(card);



});



}










/* ===========================================================
SEARCH HISTORY
=========================================================== */


function saveSearchHistory(city){



let history =
JSON.parse(

localStorage.getItem(
"history"
)

)
||
[];





history =
history.filter(
item=>item!==city
);



history.unshift(city);



history =
history.slice(
0,
8
);



localStorage.setItem(

"history",

JSON.stringify(
history
)

);



renderHistory();


}







function renderHistory(){



let box =
$("searchHistory");



if(!box)
return;



let history =
JSON.parse(

localStorage.getItem(
"history"
)

)
||
[];




box.innerHTML="";





history.forEach(city=>{



let item =
document.createElement(
"div"
);



item.className=
"history-item";



item.innerText =
city;



item.onclick=function(){



$("cityInput").value =
city;



searchCity();



};



box.appendChild(item);



});



}









/* ===========================================================
DARK / LIGHT THEME
=========================================================== */


function toggleTheme(){



document.body.classList.toggle(
"day"
);



let icon =
document.querySelector(
"#themeToggle span"
);



if(
document.body.classList.contains(
"day"
)
){


icon.innerText =
"light_mode";


}

else{


icon.innerText =
"dark_mode";


}



}









/* ===========================================================
REFRESH WEATHER
=========================================================== */


function refreshWeather(){


fetchWeather();


fetchAQI();


showToast(
"Weather updated"
);


}








/* ===========================================================
SCROLL TOP
=========================================================== */


function scrollTop(){



window.scrollTo({

top:0,

behavior:"smooth"

});


}









/* ===========================================================
MOBILE MENU
=========================================================== */


function openMobileMenu(){



let menu =
$("mobileMenu");



if(menu)

menu.classList.add(
"active"
);


}




function closeMobileMenu(){



let menu =
$("mobileMenu");



if(menu)

menu.classList.remove(
"active"
);


}









/* ===========================================================
EVENT LISTENERS
=========================================================== */


document.addEventListener(
"DOMContentLoaded",
()=>{



fetchWeather();


fetchAQI();



renderFavorites();


renderHistory();





if($("searchBtn"))

$("searchBtn")
.onclick =
searchCity;





if($("cityInput"))

$("cityInput")
.addEventListener(
"keypress",
(e)=>{


if(e.key==="Enter")

searchCity();


});





if($("locationBtn"))

$("locationBtn")
.onclick =
getCurrentLocation;





if($("voiceBtn"))

$("voiceBtn")
.onclick =
startVoiceSearch;





if($("themeToggle"))

$("themeToggle")
.onclick =
toggleTheme;





if($("refreshBtn"))

$("refreshBtn")
.onclick =
refreshWeather;





if($("scrollTopBtn"))

$("scrollTopBtn")
.onclick =
scrollTop;





if($("addFavoriteBtn"))

$("addFavoriteBtn")
.onclick =
addFavorite;




});
/* ===========================================================
LOADER CONTROL
=========================================================== */


function showLoader(){


    let loader=$("loader");


    if(loader)

        loader.style.display="flex";


}





function hideLoader(){


    let loader=$("loader");


    if(loader)

        loader.style.display="none";


}









/* ===========================================================
TOAST MESSAGE
=========================================================== */


function showToast(message){


    let toast=$("toast");


    let text=$("toastMessage");



    if(!toast)
        return;



    if(text)

        text.innerText=message;



    toast.classList.add(
        "show"
    );



    setTimeout(()=>{


        toast.classList.remove(
            "show"
        );


    },3000);



}









/* ===========================================================
ERROR MODAL
=========================================================== */


function showError(message){



let modal=$("errorModal");


let errorText=$("errorText");



if(errorText)

errorText.innerText=message;



if(modal)

modal.style.display="flex";



}







function closeError(){



let modal=$("errorModal");



if(modal)

modal.style.display="none";


}










/* ===========================================================
FORMAT TIME
=========================================================== */


function formatTime(date){



return new Date(date)

.toLocaleTimeString(

[],

{

hour:"2-digit",

minute:"2-digit"

}

);



}










/* ===========================================================
WEATHER CHARTS
=========================================================== */


function createCharts(hourly){



if(
typeof Chart==="undefined"
)

return;





let labels=[];

let temp=[];

let humidity=[];

let wind=[];




for(let i=0;i<24;i++){



labels.push(

new Date(
hourly.time[i]
)

.toLocaleTimeString(
[],
{
hour:"numeric"
}

)

);



temp.push(
hourly.temperature_2m[i]
);



humidity.push(
hourly.relative_humidity_2m[i]
);



wind.push(
hourly.wind_speed_10m[i]
);



}






createChart(

"temperatureChart",

labels,

temp,

"Temperature"

);



createChart(

"humidityChart",

labels,

humidity,

"Humidity"

);



createChart(

"windChart",

labels,

wind,

"Wind Speed"

);



}









function createChart(
id,
labels,
data,
label
){



let canvas=$(id);



if(!canvas)

return;




new Chart(

canvas,

{

type:"line",


data:{


labels:labels,


datasets:[{

label:label,


data:data,


borderWidth:2,


tension:.4


}]

},



options:{


responsive:true,


plugins:{


legend:{


display:true


}

}


}


}

);



}









/* ===========================================================
LEAFLET WEATHER MAP
=========================================================== */


function initMap(){



if(
typeof L==="undefined"
)

return;



if(map)

return;




map =
L.map(
"weatherMap"
)

.setView(

[
currentLat,
currentLon
],

10

);





L.tileLayer(

"https://tile.openstreetmap.org/{z}/{x}/{y}.png",

{

maxZoom:19

}

)

.addTo(map);





L.marker(

[
currentLat,
currentLon
]

)

.addTo(map)

.bindPopup(

currentCity

)

.openPopup();



}










function updateMap(){



if(!map)

return;



map.setView(

[
currentLat,
currentLon
],

10

);



L.marker(

[
currentLat,
currentLon
]

)

.addTo(map)

.bindPopup(
currentCity
);



}









/* ===========================================================
OFFLINE DETECTOR
=========================================================== */


function checkOnlineStatus(){



let banner=$("offlineBanner");



if(!banner)

return;



if(
navigator.onLine
){


banner.classList.remove(
"show"
);


}

else{


banner.classList.add(
"show"
);


}


}





window.addEventListener(

"online",

checkOnlineStatus

);



window.addEventListener(

"offline",

checkOnlineStatus

);









/* ===========================================================
ERROR MODAL EVENTS
=========================================================== */


document.addEventListener(

"click",

(e)=>{


if(
e.target.classList.contains(
"close-modal"
)
){


closeError();


}



}

);





if($("retryBtn")){


$("retryBtn").onclick=function(){



closeError();


fetchWeather();



};



}










/* ===========================================================
INITIAL APP START
=========================================================== */


window.addEventListener(

"load",

()=>{


hideLoader();


initMap();


checkOnlineStatus();


});









/* ===========================================================
PATCH FETCH WEATHER
(Connect Charts + Map)
=========================================================== */


const oldUpdateAllWeather =
updateAllWeather;



updateAllWeather=function(data){



oldUpdateAllWeather(data);



createCharts(
data.hourly
);



updateMap();



updateUV(
data.daily
);



};
