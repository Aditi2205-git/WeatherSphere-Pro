/* ===========================================================
   WeatherSphere Pro 4.0
   script.js PART 1/5
   Open-Meteo API (No API Key Required)
   Author: Aditi Singh
=========================================================== */


/* ===========================================================
   GLOBAL VARIABLES
=========================================================== */

let currentCity = "New Delhi";
let currentLat = 28.6139;
let currentLon = 77.2090;

let temperatureUnit = "celsius";

let weatherData = null;

let temperatureChart;
let humidityChart;
let windChart;
let pressureChart;

let map;


/* ===========================================================
   DOM HELPER
=========================================================== */

const $ = (id) => document.getElementById(id);


/* ===========================================================
   TOAST MESSAGE
=========================================================== */

function showToast(message){

    const toast = $("toast");
    const toastMessage = $("toastMessage");

    if(!toast || !toastMessage) return;

    toastMessage.innerText = message;

    toast.classList.add("show");

    setTimeout(()=>{
        toast.classList.remove("show");
    },3000);

}



/* ===========================================================
   LOADER
=========================================================== */

window.addEventListener("load",()=>{

    setTimeout(()=>{

        const loader=$("loader");

        if(loader){
            loader.style.opacity="0";
            setTimeout(()=>{
                loader.style.display="none";
            },500);
        }

    },1200);

});



/* ===========================================================
   WEATHER CODE TO EMOJI + DESCRIPTION
=========================================================== */


function getWeatherInfo(code, isDay = 1){

    const weather = {

        0:{
            emoji: isDay ? "☀️" : "🌙",
            text: isDay ? "Clear Sky" : "Clear Night"
        },

        1:{
            emoji: isDay ? "🌤️" : "🌙",
            text: isDay ? "Mainly Clear" : "Mostly Clear Night"
        },

        2:{
            emoji: isDay ? "⛅" : "☁️",
            text: isDay ? "Partly Cloudy" : "Cloudy Night"
        },

        3:{
            emoji:"☁️",
            text:"Overcast"
        },

        45:{
            emoji:"🌫️",
            text:"Fog"
        },

        48:{
            emoji:"🌫️",
            text:"Depositing Rime Fog"
        },

        51:{
            emoji:"🌦️",
            text:"Light Drizzle"
        },

        53:{
            emoji:"🌧️",
            text:"Moderate Drizzle"
        },

        55:{
            emoji:"🌧️",
            text:"Heavy Drizzle"
        },

        61:{
            emoji:"🌧️",
            text:"Rain"
        },

        63:{
            emoji:"🌧️",
            text:"Moderate Rain"
        },

        65:{
            emoji:"⛈️",
            text:"Heavy Rain"
        },

        71:{
            emoji:"❄️",
            text:"Snow"
        },

        80:{
            emoji:"🌦️",
            text:"Rain Showers"
        },

        81:{
            emoji:"🌧️",
            text:"Heavy Showers"
        },

        95:{
            emoji:"⛈️",
            text:"Thunderstorm"
        },

        96:{
            emoji:"⛈️",
            text:"Thunderstorm + Hail"
        },

        99:{
            emoji:"⛈️",
            text:"Severe Thunderstorm"
        }

    };


    return weather[code] || {

        emoji: isDay ? "🌍" : "🌌",
        text:"Unknown"

    };


}



/* ===========================================================
   WIND DEGREE TO DIRECTION
=========================================================== */


function getWindDirection(degree){


    const directions=[

        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW"

    ];


    const index=Math.round(degree/45)%8;


    return `${directions[index]} (${Math.round(degree)}°)`;

}



/* ===========================================================
   CELSIUS / FAHRENHEIT
=========================================================== */


function convertTemperature(temp){


    if(temperatureUnit==="fahrenheit"){

        return Math.round((temp*9)/5+32)+"°F";

    }


    return Math.round(temp)+"°C";


}



/* ===========================================================
   GEOCODING API
=========================================================== */


async function searchCity(city){


    try{


        const url=

        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;



        const response=await fetch(url);


        const data=await response.json();



        if(!data.results){

            throw new Error("City not found");

        }



        const place=data.results[0];


        currentCity=place.name;

        currentLat=place.latitude;

        currentLon=place.longitude;



        await fetchWeather();



    }


    catch(error){

        showToast("Unable to find city");

        console.error(error);

    }


}



/* ===========================================================
   MAIN WEATHER API
=========================================================== */


async function fetchWeather(){


try{


const url =
`https://api.open-meteo.com/v1/forecast?
latitude=${currentLat}
&longitude=${currentLon}
&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,is_day,surface_pressure,cloud_cover,wind_speed_10m,wind_direction_10m
&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,surface_pressure,dew_point_2m,weather_code,is_day,visibility
&daily=weather_code,is_day,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum
&timezone=auto`;


const cleanURL=url.replace(/\s+/g,"");



const response=await fetch(cleanURL);


const data=await response.json();



weatherData=data;



updateCurrentWeather(data);


}


catch(error){

console.error(error);

showToast(
"Weather data loading failed"
);


}


}



/* ===========================================================
   UPDATE CURRENT WEATHER CARD
=========================================================== */


function updateCurrentWeather(data){


const current=data.current;


const info = getWeatherInfo(
    current.weather_code,
    current.is_day
);



/* Hero */


if($("heroTemp"))
$("heroTemp").innerText=
convertTemperature(current.temperature_2m);



if($("heroCity"))
$("heroCity").innerText=currentCity;



if($("heroDescription"))
$("heroDescription").innerText=info.text;



if($("heroHumidity"))
$("heroHumidity").innerText=
current.relative_humidity_2m+"%";



if($("heroWind"))
$("heroWind").innerText=
Math.round(current.wind_speed_10m)+" km/h";



/* Main Weather */


$("weatherEmoji").innerText=
info.emoji;



$("temperature").innerText=
convertTemperature(current.temperature_2m);



$("weatherCondition").innerText=
info.text;



$("cityName").innerText=
`${currentCity}`;


$("windSpeed").innerText=
Math.round(
current.wind_speed_10m
)+" km/h";



$("humidity").innerText=
current.relative_humidity_2m+"%";



$("pressure").innerText=
Math.round(
current.surface_pressure
)+" hPa";



$("clouds").innerText=
current.cloud_cover+"%";



$("precipitation").innerText=
current.precipitation+" mm";



$("windDirection").innerText=
getWindDirection(
current.wind_direction_10m
);



/* Time */


$("lastUpdated").innerText=
"Updated just now";



updateBackground(
current.weather_code
);



}



/* ===========================================================
   WEATHER BACKGROUND EFFECTS
=========================================================== */


function updateBackground(code){


const rain=$(".rain");
const snow=$(".snow");
const lightning=$(".lightning");



[rain,snow,lightning].forEach(el=>{

    if(el)
    el.classList.remove("active");

});



if([51,53,55,61,63,65,80,81].includes(code)){

    rain?.classList.add("active");

}


if([71].includes(code)){

    snow?.classList.add("active");

}


if([95,96,99].includes(code)){

    lightning?.classList.add("active");

}



}
 /* ===========================================================
    PART 2/5
    Forecast + Highlights Rendering
=========================================================== */


/* ===========================================================
   UPDATE DAILY HIGHLIGHTS
=========================================================== */

function updateDailyHighlights(data){


    const daily=data.daily;
    const hourly=data.hourly;


    /* Maximum Temperature */

    if($("maxTemp")){

        $("maxTemp").innerText =
        convertTemperature(
            daily.temperature_2m_max[0]
        );

    }



    /* Minimum Temperature */

    if($("minTemp")){

        $("minTemp").innerText =
        convertTemperature(
            daily.temperature_2m_min[0]
        );

    }



    /* Sunrise */

    if($("sunrise")){

        const sunriseTime =
        new Date(
            daily.sunrise[0]
        );


        $("sunrise").innerText =
        sunriseTime.toLocaleTimeString(
            [],
            {
                hour:"2-digit",
                minute:"2-digit"
            }
        );

    }




    /* Sunset */

    if($("sunset")){


        const sunsetTime =
        new Date(
            daily.sunset[0]
        );


        $("sunset").innerText =
        sunsetTime.toLocaleTimeString(
            [],
            {
                hour:"2-digit",
                minute:"2-digit"
            }
        );

    }




    /* UV Index */


    if($("uvIndex")){


        const uv =
        daily.uv_index_max[0];


        $("uvIndex").innerText =
        Math.round(uv);



        if($("uvLevel")){


            if(uv<=2){

                $("uvLevel").innerText=
                "Low";

            }

            else if(uv<=5){

                $("uvLevel").innerText=
                "Moderate";

            }

            else if(uv<=7){

                $("uvLevel").innerText=
                "High";

            }

            else{

                $("uvLevel").innerText=
                "Extreme";

            }


        }




        if($("uvBar")){

            $("uvBar").style.width=
            Math.min(
                uv*10,
                100
            )+"%";

        }


    }




    /* Precipitation */


    if($("precipitation")){


        $("precipitation").innerText =

        daily.precipitation_sum[0]
        +" mm";


    }




    /* Rain Probability */


    if($("rainChance")){


        let probability =
        hourly.precipitation_probability[0];


        $("rainChance").innerText =
        probability+"%";


    }



    /* Visibility */

    if($("visibility")){


        let visibility =
        hourly.visibility ?
        hourly.visibility[0]/1000 :
        10;



        $("visibility").innerText =
        visibility.toFixed(1)
        +" km";

    }



}



/* ===========================================================
   UPDATE DEW POINT
=========================================================== */


function updateDewPoint(data){


    const dew =
    data.hourly.dew_point_2m[0];


    if($("dewPoint")){


        $("dewPoint").innerText =
        convertTemperature(dew);

    }


}







/* ===========================================================
   HOURLY FORECAST
=========================================================== */


function renderHourlyForecast(data){


const container =
$("hourlyContainer");



if(!container)
return;



container.innerHTML="";



const hourly=data.hourly;



for(let i=0;i<24;i++){



    const time =
    new Date(
        hourly.time[i]
    );



   const info =
getWeatherInfo(
    hourly.weather_code
    ?
    hourly.weather_code[i]
    :
    data.current.weather_code,

    hourly.is_day
    ?
    hourly.is_day[i]
    :
    data.current.is_day
);



    const card=document.createElement("div");



    card.className="hour-card";



    card.innerHTML=`

        <h4>

        ${time.toLocaleTimeString(
            [],
            {
                hour:"2-digit"
            }
        )}

        </h4>


        <div class="emoji">

            ${info.emoji}

        </div>


        <h3>

        ${convertTemperature(
            hourly.temperature_2m[i]
        )}

        </h3>


        <p>

        💧
        ${hourly.relative_humidity_2m[i]}%

        </p>


        <p>

        🌧️
        ${hourly.precipitation_probability[i]}%

        </p>


    `;


    container.appendChild(card);



}



}







/* ===========================================================
   7 DAY FORECAST
=========================================================== */


function renderForecast(data){



const container =
$("forecastContainer");



if(!container)
return;



container.innerHTML="";



const daily=data.daily;



for(let i=0;i<7;i++){



const date =
new Date(
daily.time[i]
);



const sunrise =
new Date(daily.sunrise[i]);

const sunset =
new Date(daily.sunset[i]);

const now =
new Date();

const isDay =
now >= sunrise && now <= sunset ? 1 : 0;


const info =
getWeatherInfo(
daily.weather_code[i],
isDay
);


const card =
document.createElement("div");



card.className=
"forecast-card";



card.innerHTML=`

<h3>

${date.toLocaleDateString(
"en-US",
{
weekday:"short"
}
)}

</h3>



<div class="emoji">

${info.emoji}

</div>



<p>

${info.text}

</p>



<h2>

${convertTemperature(
daily.temperature_2m_max[i]
)}

</h2>


<span>

↓

${convertTemperature(
daily.temperature_2m_min[i]
)}

</span>



`;



container.appendChild(card);



}



}







/* ===========================================================
   UPDATE ALL FORECAST DATA
=========================================================== */


function updateForecastSections(data){


    updateDailyHighlights(data);


    updateDewPoint(data);


    renderHourlyForecast(data);


    renderForecast(data);


}
 /* ===========================================================
    PART 3/5
    AQI + CHARTS + MAP
=========================================================== */



/* ===========================================================
   AIR QUALITY API
=========================================================== */


async function fetchAirQuality(){


try{


const url=

`https://air-quality-api.open-meteo.com/v1/air-quality?
latitude=${currentLat}
&longitude=${currentLon}
&current=
us_aqi,
pm10,
pm2_5,
carbon_monoxide,
nitrogen_dioxide
&timezone=auto`;



const response =
await fetch(
url.replace(/\s+/g,"")
);



const data =
await response.json();



updateAQI(data);



}

catch(error){

console.error(
"AQI Error",
error
);


}



}




/* ===========================================================
   UPDATE AQI CARD
=========================================================== */


function updateAQI(data){



if(!data.current)
return;



const aqi =
data.current.us_aqi;



if($("aqiValue")){


$("aqiValue").innerText =
Math.round(aqi);


}



let status="";



if(aqi<=50){

status="Good";

}

else if(aqi<=100){

status="Moderate";

}

else if(aqi<=150){

status="Unhealthy for Sensitive Groups";

}

else if(aqi<=200){

status="Unhealthy";

}

else{

status="Hazardous";

}



if($("aqiStatus")){

$("aqiStatus").innerText=status;

}



if($("aqiCircle")){


const offset =
314 -
(314*(aqi/300));


$("aqiCircle").style.strokeDashoffset =
offset;


}




}





/* ===========================================================
   CHART GENERATOR
=========================================================== */


function createCharts(data){



const hourly =
data.hourly;



const labels=[];



for(let i=0;i<24;i++){


const time =
new Date(
hourly.time[i]
);



labels.push(

time.toLocaleTimeString(
[],
{
hour:"2-digit"
}

)

);



}




/* Destroy old charts */


[
temperatureChart,
humidityChart,
windChart,
pressureChart

].forEach(chart=>{


if(chart){

chart.destroy();

}


});






/* Temperature */


if($("temperatureChart")){


temperatureChart =
new Chart(

$("temperatureChart"),

{


type:"line",


data:{


labels:labels,


datasets:[{

label:"Temperature °C",

data:
hourly.temperature_2m.slice(
0,
24
),


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







/* Humidity */


if($("humidityChart")){


humidityChart =
new Chart(

$("humidityChart"),

{


type:"line",


data:{


labels:labels,


datasets:[{

label:"Humidity %",

data:
hourly.relative_humidity_2m.slice(
0,
24
),


tension:.4


}]


},


options:{


responsive:true

}


}

);



}








/* Wind */


if($("windChart")){


windChart =
new Chart(

$("windChart"),

{


type:"bar",


data:{


labels:labels,


datasets:[{


label:"Wind km/h",


data:
hourly.wind_speed_10m.slice(
0,
24
)



}]



},


options:{


responsive:true

}


}

);



}









/* Pressure */


if($("pressureChart")){


pressureChart =
new Chart(

$("pressureChart"),

{


type:"line",


data:{


labels:labels,


datasets:[{


label:"Pressure hPa",


data:
hourly.surface_pressure.slice(
0,
24
),


tension:.4


}]



},


options:{


responsive:true


}



}

);



}





}








/* ===========================================================
   LEAFLET MAP
=========================================================== */


function initializeMap(){



if(!$("weatherMap"))
return;



map =
L.map(
"weatherMap"
);



L.tileLayer(

"https://tile.openstreetmap.org/{z}/{x}/{y}.png",

{


maxZoom:18,


attribution:
"© OpenStreetMap"


}

).addTo(map);



updateMap();


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

`

<h3>
${currentCity}
</h3>

<p>
Live Weather Location
</p>

`

)

.openPopup();



}






/* ===========================================================
   EXTEND WEATHER LOADING
=========================================================== */


const oldFetchWeather =
fetchWeather;



fetchWeather = async function(){



await oldFetchWeather();



if(weatherData){


updateForecastSections(
weatherData
);



fetchAirQuality();



createCharts(
weatherData
);



updateMap();



}


};

 /* ===========================================================
    PART 4/5
    UI CONTROLS + USER FEATURES
=========================================================== */



/* ===========================================================
   SEARCH CITY BUTTON
=========================================================== */


if($("searchBtn")){


$("searchBtn").addEventListener(
"click",
()=>{


const city =
$("cityInput").value.trim();



if(city){

addSearchHistory(city);

searchCity(city);


}



});


}





/* ENTER KEY SEARCH */


if($("cityInput")){


$("cityInput")
.addEventListener(
"keypress",
(e)=>{


if(e.key==="Enter"){


const city =
$("cityInput").value.trim();



if(city){

addSearchHistory(city);

searchCity(city);

}


}



});



}







/* ===========================================================
   CURRENT LOCATION
=========================================================== */


if($("locationBtn")){


$("locationBtn")
.addEventListener(
"click",
()=>{


if(
navigator.geolocation
){



navigator.geolocation.getCurrentPosition(

async(position)=>{


currentLat =
position.coords.latitude;


currentLon =
position.coords.longitude;



await reverseLocation();


fetchWeather();



},


()=>{


showToast(
"Location permission denied"
);


}



);



}


});


}








/* ===========================================================
   REVERSE GEOCODING
=========================================================== */


async function reverseLocation(){


try{


const url =

`https://geocoding-api.open-meteo.com/v1/reverse?
latitude=${currentLat}
&longitude=${currentLon}
&count=1`;



const response =
await fetch(
url.replace(/\s+/g,"")
);



const data =
await response.json();



if(data.results){


currentCity =
data.results[0].name;



}



}

catch(error){


console.log(error);


}



}







/* ===========================================================
   VOICE SEARCH
=========================================================== */


if($("voiceBtn")){


$("voiceBtn")
.addEventListener(
"click",
()=>{


const SpeechRecognition =
window.SpeechRecognition ||
window.webkitSpeechRecognition;



if(!SpeechRecognition){


showToast(
"Voice search not supported"
);


return;


}



const recognition =
new SpeechRecognition();



recognition.lang="en-US";



const modal =
$("voiceModal");



modal.style.display="flex";



recognition.start();



recognition.onresult=
(event)=>{


const text =
event.results[0][0].transcript;



$("cityInput").value=text;



modal.style.display="none";



searchCity(text);



};



recognition.onerror=
()=>{


modal.style.display="none";


};



recognition.onend=
()=>{


modal.style.display="none";


};



});


}









/* ===========================================================
   SEARCH HISTORY
=========================================================== */


function addSearchHistory(city){



let history =
JSON.parse(
localStorage.getItem(
"weatherHistory"
)
)
|| [];



history =
history.filter(
(item)=>item!==city
);



history.unshift(city);



history =
history.slice(
0,
8
);



localStorage.setItem(
"weatherHistory",
JSON.stringify(history)
);



renderHistory();


}







function renderHistory(){



const container =
$("searchHistory");



if(!container)
return;



container.innerHTML="";



const history =
JSON.parse(
localStorage.getItem(
"weatherHistory"
)
)
|| [];



history.forEach(city=>{


const item =
document.createElement("div");



item.className =
"history-item";



item.innerText=city;



item.onclick=
()=>searchCity(city);



container.appendChild(item);



});



}









/* ===========================================================
   FAVORITE CITIES
=========================================================== */


if($("addFavoriteBtn")){


$("addFavoriteBtn")
.addEventListener(
"click",
()=>{


let favorites =
JSON.parse(
localStorage.getItem(
"favorites"
)
)
|| [];



if(
!favorites.includes(currentCity)
){


favorites.push(currentCity);


localStorage.setItem(
"favorites",
JSON.stringify(favorites)
);


showToast(
"Added to favorites"
);



renderFavorites();



}


});


}







function renderFavorites(){



const container =
$("favoriteCities");



if(!container)
return;



container.innerHTML="";



let favorites =
JSON.parse(
localStorage.getItem(
"favorites"
)
)
|| [];



favorites.forEach(city=>{


const card =
document.createElement("div");



card.className =
"favorite-card";



card.innerHTML=`

<h3>

❤️ ${city}

</h3>


<p>
Click to view weather
</p>


`;



card.onclick=
()=>searchCity(city);



container.appendChild(card);



});


}








/* ===========================================================
   TEMPERATURE SWITCH
=========================================================== */


if($("celsiusBtn")){


$("celsiusBtn")
.onclick=()=>{


temperatureUnit="celsius";


$("celsiusBtn")
.classList.add("active");


$("fahrenheitBtn")
.classList.remove("active");


if(weatherData)
updateCurrentWeather(weatherData);


};



}




if($("fahrenheitBtn")){


$("fahrenheitBtn")
.onclick=()=>{


temperatureUnit="fahrenheit";


$("fahrenheitBtn")
.classList.add("active");


$("celsiusBtn")
.classList.remove("active");


if(weatherData)
updateCurrentWeather(weatherData);



};



}








/* ===========================================================
   DARK / LIGHT THEME
=========================================================== */


if($("themeToggle")){


$("themeToggle")
.onclick=()=>{


document.body.classList.toggle(
"day"
);



};



}








/* ===========================================================
   REFRESH WEATHER
=========================================================== */


if($("refreshBtn")){


$("refreshBtn")
.onclick=()=>{


fetchWeather();


showToast(
"Weather refreshed"
);


};



}







/* ===========================================================
   SCROLL TOP
=========================================================== */


if($("scrollTopBtn")){


$("scrollTopBtn")
.onclick=()=>{


window.scrollTo({

top:0,

behavior:"smooth"

});


};



}







/* ===========================================================
   MOBILE MENU
=========================================================== */


if($("menuBtn")){


$("menuBtn")
.onclick=()=>{


$("mobileMenu")
.classList.add(
"active"
);


};


}




if($("closeMenu")){


$("closeMenu")
.onclick=()=>{


$("mobileMenu")
.classList.remove(
"active"
);


};


}









/* ===========================================================
   INTERNET STATUS
=========================================================== */


window.addEventListener(
"offline",
()=>{


$("offlineBanner")
?.classList.add(
"show"
);



});



window.addEventListener(
"online",
()=>{


$("offlineBanner")
?.classList.remove(
"show"
);



showToast(
"Internet restored"
);


});

 /* ===========================================================
    PART 5/5
    FINAL INITIALIZATION
=========================================================== */





/* ===========================================================
   LIVE CLOCK
=========================================================== */


function updateClock(){


const now =
new Date();



if($("currentTime")){


$("currentTime").innerText =

now.toLocaleTimeString(
[],
{
hour:"2-digit",
minute:"2-digit",
second:"2-digit"
}

);



}



if($("currentDate")){


$("currentDate").innerText =

now.toLocaleDateString(
"en-US",
{

weekday:"long",

day:"numeric",

month:"long"

}

);



}



}



setInterval(
updateClock,
1000
);


updateClock();








/* ===========================================================
   WEATHER INSIGHTS
=========================================================== */


function updateWeatherAdvice(){



if(!weatherData)
return;



const temp =
weatherData.current.temperature_2m;


const rain =
weatherData.current.precipitation;



let advice =
"";


let activity =
"";


let health =
"";





if(temp>35){


advice=
"Very hot today. Stay hydrated and avoid direct sunlight.";


activity=
"Indoor activities are recommended.";


health=
"High temperature may cause heat stress.";


}


else if(rain>0){


advice=
"Rain expected. Carry an umbrella before going outside.";


activity=
"Enjoy indoor activities or short outdoor trips.";


health=
"Humidity may feel higher. Stay comfortable.";


}


else{


advice=
"Weather looks pleasant. Good day for outdoor activities.";


activity=
"Perfect time for walking or outdoor plans.";


health=
"Weather conditions are comfortable.";


}






if($("weatherAdvice"))

$("weatherAdvice").innerText=
advice;




if($("activityAdvice"))

$("activityAdvice").innerText=
activity;




if($("healthAdvice"))

$("healthAdvice").innerText=
health;



}









/* ===========================================================
   WORLD WEATHER
=========================================================== */


const worldCities=[


{
name:"London",
lat:51.5072,
lon:-0.1276
},


{
name:"Tokyo",
lat:35.6762,
lon:139.6503
},


{
name:"New York",
lat:40.7128,
lon:-74.0060
},


{
name:"Paris",
lat:48.8566,
lon:2.3522
},


{
name:"Dubai",
lat:25.2048,
lon:55.2708
}


];






async function loadWorldWeather(){



const container =
$("worldCities");



if(!container)
return;



container.innerHTML="";



for(
const city of worldCities
){



try{


const response =
await fetch(

`https://api.open-meteo.com/v1/forecast?
latitude=${city.lat}
&longitude=${city.lon}
&current=
temperature_2m,
weather_code`
.replace(/\s+/g,"")

);



const data =
await response.json();



const info =
getWeatherInfo(
data.current.weather_code,
data.current.is_day
);



const card =
document.createElement("div");



card.className=
"world-card";



card.innerHTML=`

<h3>

${city.name}

</h3>


<div class="emoji">

${info.emoji}

</div>


<h2>

${Math.round(
data.current.temperature_2m
)}°C

</h2>


<p>

${info.text}

</p>


`;



container.appendChild(card);



}

catch(error){


console.log(error);


}



}




}









/* ===========================================================
   ERROR MODAL
=========================================================== */


function showError(message){



if($("errorModal")){


$("errorText").innerText=
message;


$("errorModal").style.display=
"flex";


}



}




if(document.querySelector(".close-modal")){


document
.querySelector(".close-modal")
.onclick=()=>{


$("errorModal")
.style.display="none";


};


}





if($("retryBtn")){


$("retryBtn")
.onclick=()=>{


$("errorModal")
.style.display="none";


fetchWeather();


};



}









/* ===========================================================
   ANIMATION TOGGLE
=========================================================== */


if($("animationToggle")){


$("animationToggle")
.onchange=function(){



if(this.checked){


document.body.style.animationPlayState=
"running";


}


else{


document.body.style.animationPlayState=
"paused";


}


};


}









/* ===========================================================
   INITIAL APP START
=========================================================== */


async function initializeApp(){



try{


initializeMap();



renderHistory();



renderFavorites();



await fetchWeather();



loadWorldWeather();



setTimeout(()=>{


updateWeatherAdvice();



},1500);



}


catch(error){


console.error(error);


showError(
"Unable to load weather information"
);


}



}





document.addEventListener(
"DOMContentLoaded",
()=>{


initializeApp();



});



/* ===========================================================
   END OF WEATHERSPHERE PRO 4.0 JS
=========================================================== */
