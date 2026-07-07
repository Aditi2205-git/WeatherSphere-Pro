const API =
"https://geocoding-api.open-meteo.com/v1/search";


let currentLatitude = 28.6139;
let currentLongitude = 77.2090;

let manualDark = false;



const cityInput =
document.getElementById("cityInput");

const searchBtn =
document.getElementById("searchBtn");

const locationBtn =
document.getElementById("locationBtn");

const themeBtn =
document.getElementById("themeBtn");





// WEATHER CODE MAPPING

function weatherInfo(code){


const data={

0:["Clear Sky","☀️","day"],

1:["Mainly Clear","🌤️","day"],

2:["Partly Cloudy","⛅","cloudy"],

3:["Overcast","☁️","cloudy"],

45:["Fog","🌫️","cloudy"],

48:["Fog","🌫️","cloudy"],

51:["Light Drizzle","🌦️","rain"],

53:["Drizzle","🌦️","rain"],

55:["Heavy Drizzle","🌧️","rain"],

61:["Rain","🌧️","rain"],

63:["Heavy Rain","🌧️","rain"],

65:["Heavy Rain","🌧️","rain"],

71:["Snow","❄️","snow"],

73:["Snow","❄️","snow"],

75:["Heavy Snow","❄️","snow"],

95:["Thunderstorm","⛈️","storm"],

96:["Thunderstorm","⛈️","storm"],

99:["Thunderstorm","⛈️","storm"]

};


return data[code] || 
["Unknown","🌍","day"];

}







// CITY SEARCH


searchBtn.onclick=()=>{


let city =
cityInput.value.trim();


if(city){

findCity(city);

}


};





async function findCity(city){


try{


let response =
await fetch(
`${API}?name=${city}&count=1`
);


let data =
await response.json();



if(!data.results){

alert("City not found");

return;

}



let place =
data.results[0];


currentLatitude =
place.latitude;


currentLongitude =
place.longitude;



loadWeather(
place.name,
place.country
);



}
catch(error){

alert("Location error");

}

}








// CURRENT LOCATION


locationBtn.onclick=()=>{


navigator.geolocation.getCurrentPosition(

(position)=>{


currentLatitude =
position.coords.latitude;


currentLongitude =
position.coords.longitude;


loadWeather(
"Your Location",
""
);


},

()=>{

alert(
"Location permission denied"
);

}

);


};







async function loadWeather(city="Delhi",country="India"){



try{


const url =

`https://api.open-meteo.com/v1/forecast?latitude=${currentLatitude}&longitude=${currentLongitude}&timezone=auto&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m,visibility,cloud_cover,is_day,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset`;




let response =
await fetch(url);



let data =
await response.json();




updateCurrent(
data,
city,
country
);



updateForecast(
data
);



updateAstronomy(
data
);



}

catch(error){

console.log(error);

alert(
"Weather loading failed"
);

}

}







function updateCurrent(
data,
city,
country
){



let current =
data.current;



let info =
weatherInfo(
current.weather_code
);



document.getElementById(
"cityName"
)
.innerHTML =
`${city}, ${country}`;



document.getElementById(
"temperature"
)
.innerHTML =
`${Math.round(current.temperature_2m)}°C`;



document.getElementById(
"weatherDescription"
)
.innerHTML =
`${info[1]} ${info[0]}`;



document.getElementById(
"weatherIcon"
)
.innerHTML =
info[1];



document.getElementById(
"feelsLike"
)
.innerHTML =
`${Math.round(current.apparent_temperature)}°C`;



document.getElementById(
"humidity"
)
.innerHTML =
`${current.relative_humidity_2m}%`;



document.getElementById(
"wind"
)
.innerHTML =
`${current.wind_speed_10m} km/h`;



document.getElementById(
"pressure"
)
.innerHTML =
`${current.surface_pressure} hPa`;



document.getElementById(
"visibility"
)
.innerHTML =
`${(current.visibility/1000).toFixed(1)} km`;



document.getElementById(
"cloud"
)
.innerHTML =
`${current.cloud_cover}%`;



document.getElementById(
"uv"
)
.innerHTML =
current.uv_index;



document.getElementById(
"updatedTime"
)
.innerHTML =
"Last updated: "+
new Date()
.toLocaleString();



document.getElementById(
"latitude"
)
.innerHTML =
currentLatitude.toFixed(3);



document.getElementById(
"longitude"
)
.innerHTML =
currentLongitude.toFixed(3);



document.getElementById(
"timezone"
)
.innerHTML =
data.timezone;



applyWeatherTheme(
info[2],
current.is_day
);



}









function updateForecast(data){



let box =
document.getElementById(
"forecast"
);



box.innerHTML="";



for(
let i=0;
i<7;
i++
){



let info =
weatherInfo(
data.daily.weather_code[i]
);



box.innerHTML += `

<div class="forecast-card">

<h4>

${new Date(
data.daily.time[i]
)
.toLocaleDateString(
"en",
{
weekday:"short"
}
)}

</h4>


<div style="font-size:40px">

${info[1]}

</div>


<p>

${Math.round(
data.daily.temperature_2m_max[i]
)}

°C

</p>


<p>

Low

${Math.round(
data.daily.temperature_2m_min[i]
)}

°C

</p>


</div>

`;

}



}








function updateAstronomy(data){



let sunrise =
new Date(
data.daily.sunrise[0]
);



let sunset =
new Date(
data.daily.sunset[0]
);



document.getElementById(
"sunrise"
)
.innerHTML =
sunrise.toLocaleTimeString(
[],
{
hour:"2-digit",
minute:"2-digit"
}
);



document.getElementById(
"sunset"
)
.innerHTML =
sunset.toLocaleTimeString(
[],
{
hour:"2-digit",
minute:"2-digit"
}
);



let diff =
sunset-sunrise;



let hours =
Math.floor(
diff/3600000
);



let minutes =
Math.floor(
(diff%3600000)
/60000
);



document.getElementById(
"dayLength"
)
.innerHTML =
`${hours}h ${minutes}m`;



document.getElementById(
"moon"
)
.innerHTML =
getMoonPhase();



}







function getMoonPhase(){


let phases=[

"🌑 New Moon",

"🌒 Waxing Crescent",

"🌓 First Quarter",

"🌔 Waxing Gibbous",

"🌕 Full Moon",

"🌖 Waning Gibbous",

"🌗 Last Quarter",

"🌘 Waning Crescent"

];


let day =
new Date()
.getDate();



return phases[
day%8
];


}







function applyWeatherTheme(
weather,
isDay
){


document.body.className="";



if(manualDark){

document.body.classList.add(
"night"
);

return;

}



if(isDay){

document.body.classList.add(
"day"
);

}

else{

document.body.classList.add(
"night"
);

}



if(weather){

document.body.classList.add(
weather
);

}


}







// DARK MODE BUTTON


themeBtn.onclick=()=>{


manualDark =
!manualDark;



if(manualDark){

themeBtn.innerHTML=
"☀️ Light Mode";

document.body.classList.add(
"night"
);


}

else{


themeBtn.innerHTML=
"🌙 Dark Mode";


loadWeather();

}


};







// INITIAL LOAD


loadWeather();
