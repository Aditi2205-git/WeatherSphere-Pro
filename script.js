/*==========================================================
    WeatherSphere Pro 3.0
    Premium Weather Dashboard
    Google Weather + Apple Weather Inspired
    Version : 3.0
==========================================================*/

"use strict";

/*==========================================================
    API ENDPOINTS
==========================================================*/

const GEO_API =
    "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";

const AIR_API =
    "https://air-quality-api.open-meteo.com/v1/air-quality";

/*==========================================================
    DOM ELEMENTS
==========================================================*/

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const themeToggle = document.getElementById("themeToggle");

const cityName = document.getElementById("cityName");
const currentDate = document.getElementById("currentDate");
const localTime = document.getElementById("localTime");
const timezone = document.getElementById("timezone");
const lastUpdated = document.getElementById("lastUpdated");

const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("weatherDescription");
const feelsLike = document.getElementById("feelsLike");
const weatherIcon = document.getElementById("weatherIcon");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const uv = document.getElementById("uv");
const cloudCover = document.getElementById("cloudCover");
const dewPoint = document.getElementById("dewPoint");
const rainChance = document.getElementById("rainChance");

const hourlyForecast =
    document.getElementById("hourlyForecast");

const dailyForecast =
    document.getElementById("dailyForecast");

const favoriteCities =
    document.getElementById("favoriteCities");

const recentSearches =
    document.getElementById("recentSearches");

/* AQI */

const aqiValue = document.getElementById("aqiValue");
const aqiStatus = document.getElementById("aqiStatus");

const pm25 = document.getElementById("pm25");
const pm10 = document.getElementById("pm10");
const co = document.getElementById("co");
const no2 = document.getElementById("no2");
const ozone = document.getElementById("ozone");

/* Astronomy */

const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");
const solarNoon = document.getElementById("solarNoon");
const dayLength = document.getElementById("dayLength");
const moonPhase = document.getElementById("moonPhase");
const goldenHour = document.getElementById("goldenHour");

/* Recommendation */

const hydrationTip =
    document.getElementById("hydrationTip");

const exerciseTip =
    document.getElementById("exerciseTip");

const clothingTip =
    document.getElementById("clothingTip");

const travelTip =
    document.getElementById("travelTip");

/*==========================================================
    GLOBAL VARIABLES
==========================================================*/

let latitude = 28.6139;
let longitude = 77.2090;

let weatherData = null;
let airData = null;

let temperatureChart = null;
let humidityChart = null;
let windChart = null;

let map = null;
let marker = null;

/*==========================================================
    LOCAL STORAGE
==========================================================*/

const STORAGE_KEYS = {

    theme: "weatherTheme",

    favorites: "favoriteCities",

    recent: "recentCities"

};

let favorites =
    JSON.parse(
        localStorage.getItem(STORAGE_KEYS.favorites)
    ) || [];

let recent =
    JSON.parse(
        localStorage.getItem(STORAGE_KEYS.recent)
    ) || [];

/*==========================================================
    WEATHER CODE MAP
==========================================================*/

const weatherCodes = {

0:{
text:"Clear Sky",
icon:"https://openweathermap.org/img/wn/01d@2x.png"
},

1:{
text:"Mainly Clear",
icon:"https://openweathermap.org/img/wn/02d@2x.png"
},

2:{
text:"Partly Cloudy",
icon:"https://openweathermap.org/img/wn/03d@2x.png"
},

3:{
text:"Overcast",
icon:"https://openweathermap.org/img/wn/04d@2x.png"
},

45:{
text:"Fog",
icon:"https://openweathermap.org/img/wn/50d@2x.png"
},

48:{
text:"Fog",
icon:"https://openweathermap.org/img/wn/50d@2x.png"
},

51:{
text:"Light Drizzle",
icon:"https://openweathermap.org/img/wn/09d@2x.png"
},

53:{
text:"Moderate Drizzle",
icon:"https://openweathermap.org/img/wn/09d@2x.png"
},

55:{
text:"Dense Drizzle",
icon:"https://openweathermap.org/img/wn/09d@2x.png"
},

61:{
text:"Light Rain",
icon:"https://openweathermap.org/img/wn/10d@2x.png"
},

63:{
text:"Rain",
icon:"https://openweathermap.org/img/wn/10d@2x.png"
},

65:{
text:"Heavy Rain",
icon:"https://openweathermap.org/img/wn/10d@2x.png"
},

71:{
text:"Light Snow",
icon:"https://openweathermap.org/img/wn/13d@2x.png"
},

73:{
text:"Snow",
icon:"https://openweathermap.org/img/wn/13d@2x.png"
},

75:{
text:"Heavy Snow",
icon:"https://openweathermap.org/img/wn/13d@2x.png"
},

80:{
text:"Rain Showers",
icon:"https://openweathermap.org/img/wn/09d@2x.png"
},

95:{
text:"Thunderstorm",
icon:"https://openweathermap.org/img/wn/11d@2x.png"
}

};

/*==========================================================
    INITIALIZE APP
==========================================================*/

document.addEventListener("DOMContentLoaded", () => {

    loadTheme();

    renderFavorites();

    renderRecent();

    attachEvents();

    getCurrentLocation();

});

/*==========================================================
    EVENT LISTENERS
==========================================================*/

function attachEvents(){

    searchBtn.addEventListener("click", () => {

        const city = cityInput.value.trim();

        if(city){

            searchCity(city);

        }

    });

    cityInput.addEventListener("keypress",(e)=>{

        if(e.key==="Enter"){

            searchBtn.click();

        }

    });

    locationBtn.addEventListener("click",()=>{

        getCurrentLocation();

    });

    themeToggle.addEventListener("click",()=>{

        toggleTheme();

    });

}
/*==========================================================
    THEME MANAGEMENT
==========================================================*/

function loadTheme() {

    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);

    if (savedTheme === "dark") {

        document.body.classList.add("dark");

        themeToggle.innerHTML =
            '<i class="fa-solid fa-sun"></i>';

    } else {

        document.body.classList.remove("dark");

        themeToggle.innerHTML =
            '<i class="fa-solid fa-moon"></i>';

    }

}

function toggleTheme() {

    document.body.classList.toggle("dark");

    const darkMode =
        document.body.classList.contains("dark");

    localStorage.setItem(
        STORAGE_KEYS.theme,
        darkMode ? "dark" : "light"
    );

    themeToggle.innerHTML = darkMode
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';

}

/*==========================================================
    LOADING
==========================================================*/

function showLoading() {

    temperature.textContent = "--°";
    weatherDescription.textContent = "Loading...";
    cityName.textContent = "Loading...";

}

function hideLoading() {

    // Reserved for future loader animation

}

/*==========================================================
    SEARCH CITY
==========================================================*/

async function searchCity(city) {

    showLoading();

    try {

        const response = await fetch(

            `${GEO_API}?name=${encodeURIComponent(city)}&count=1`

        );

        const data = await response.json();

        if (!data.results || data.results.length === 0) {

            alert("City not found.");

            return;

        }

        const place = data.results[0];

        latitude = place.latitude;
        longitude = place.longitude;

        cityName.textContent = place.name;

        if (place.country) {

            cityName.textContent +=
                ", " + place.country;

        }

        saveRecent(place.name);

        await loadWeather();

    }

    catch (error) {

        console.error(error);

        alert("Unable to fetch city.");

    }

}

/*==========================================================
    CURRENT LOCATION
==========================================================*/

function getCurrentLocation() {

    if (!navigator.geolocation) {

        alert("Geolocation is not supported.");

        loadWeather();

        return;

    }

    navigator.geolocation.getCurrentPosition(

        async (position) => {

            latitude = position.coords.latitude;

            longitude = position.coords.longitude;

            await reverseGeocode();

            await loadWeather();

        },

        async () => {

            await loadWeather();

        },

        {

            enableHighAccuracy: true,

            timeout: 10000

        }

    );

}

/*==========================================================
    REVERSE GEOCODE
==========================================================*/

async function reverseGeocode() {

    try {

        const url =

            `${GEO_API}?latitude=${latitude}&longitude=${longitude}`;

        const response = await fetch(url);

        const data = await response.json();

        if (data.results && data.results.length > 0) {

            const place = data.results[0];

            cityName.textContent = place.name;

        }

    }

    catch (error) {

        console.error(error);

    }

}

/*==========================================================
    WEATHER REQUEST
==========================================================*/

async function loadWeather() {

    showLoading();

    try {

        const url =

`${WEATHER_API}?latitude=${latitude}&longitude=${longitude}

&current=

temperature_2m,

relative_humidity_2m,

apparent_temperature,

pressure_msl,

cloud_cover,

visibility,

wind_speed_10m,

weather_code,

is_day

&hourly=

temperature_2m,

relative_humidity_2m,

precipitation_probability,

weather_code,

wind_speed_10m

&daily=

weather_code,

temperature_2m_max,

temperature_2m_min,

sunrise,

sunset

&timezone=auto`

.replace(/\s+/g,"");

        const response = await fetch(url);

        weatherData = await response.json();

        await loadAirQuality();

        renderWeather();

        hideLoading();

    }

    catch (error) {

        console.error(error);

        alert("Unable to load weather.");

    }

}

/*==========================================================
    AIR QUALITY
==========================================================*/

async function loadAirQuality() {

    try {

        const url =

`${AIR_API}?latitude=${latitude}

&longitude=${longitude}

&hourly=

pm10,

pm2_5,

carbon_monoxide,

nitrogen_dioxide,

ozone,

european_aqi`

.replace(/\s+/g,"");

        const response = await fetch(url);

        airData = await response.json();

    }

    catch (error) {

        console.error(error);

    }

}

/*==========================================================
    FAVORITES
==========================================================*/

function addFavorite(city) {

    if (favorites.includes(city))

        return;

    favorites.push(city);

    localStorage.setItem(

        STORAGE_KEYS.favorites,

        JSON.stringify(favorites)

    );

    renderFavorites();

}

function renderFavorites() {

    favoriteCities.innerHTML = "";

    favorites.forEach(city => {

        const li = document.createElement("li");

        li.className = "search-chip";

        li.textContent = city;

        li.onclick = () => {

            cityInput.value = city;

            searchCity(city);

        };

        favoriteCities.appendChild(li);

    });

}

/*==========================================================
    RECENT SEARCHES
==========================================================*/

function saveRecent(city) {

    recent = recent.filter(

        item => item !== city

    );

    recent.unshift(city);

    recent = recent.slice(0,8);

    localStorage.setItem(

        STORAGE_KEYS.recent,

        JSON.stringify(recent)

    );

    renderRecent();

}

function renderRecent() {

    recentSearches.innerHTML = "";

    recent.forEach(city=>{

        const div = document.createElement("div");

        div.className = "search-chip";

        div.textContent = city;

        div.onclick=()=>{

            cityInput.value = city;

            searchCity(city);

        };

        recentSearches.appendChild(div);

    });

}
/*==========================================================
    RENDER CURRENT WEATHER
==========================================================*/

function renderWeather() {

    if (!weatherData) return;

    const current = weatherData.current;

    const code =
        current.weather_code;

    const weather =
        weatherCodes[code] || weatherCodes[0];

    /*----------------------------
        Hero Section
    ----------------------------*/

    temperature.textContent =
        `${Math.round(current.temperature_2m)}°`;

    weatherDescription.textContent =
        weather.text;

    feelsLike.textContent =
        `Feels like ${Math.round(current.apparent_temperature)}°C`;

    weatherIcon.src =
        weather.icon;

    weatherIcon.alt =
        weather.text;

    /*----------------------------
        Date
    ----------------------------*/

    const now = new Date();

    currentDate.textContent =
        now.toLocaleDateString(
            "en-US",
            {
                weekday:"long",
                day:"numeric",
                month:"long",
                year:"numeric"
            }
        );

    /*----------------------------
        Time
    ----------------------------*/

    updateClock();

    clearInterval(window.weatherClock);

    window.weatherClock =
        setInterval(updateClock,1000);

    timezone.textContent =
        weatherData.timezone;

    lastUpdated.textContent =
        now.toLocaleTimeString([],{

            hour:"2-digit",

            minute:"2-digit"

        });

    /*----------------------------
        Highlights
    ----------------------------*/

    humidity.textContent =
        `${current.relative_humidity_2m}%`;

    windSpeed.textContent =
        `${current.wind_speed_10m} km/h`;

    pressure.textContent =
        `${Math.round(current.pressure_msl)} hPa`;

    visibility.textContent =
        `${(current.visibility/1000).toFixed(1)} km`;

    cloudCover.textContent =
        `${current.cloud_cover}%`;

    uv.textContent =
        "--";

    dewPoint.textContent =
        "--°";

    rainChance.textContent =
        weatherData.hourly
            .precipitation_probability[0] + "%";

    /*----------------------------
        Background Theme
    ----------------------------*/

    applyWeatherTheme(code);

    /*----------------------------
        Render Remaining Sections
    ----------------------------*/

    renderHourly();

    renderDaily();

    renderAQI();

    renderAstronomy();

    updateRecommendations();

}

/*==========================================================
    LOCAL CLOCK
==========================================================*/

function updateClock(){

    const time =
        new Date();

    localTime.textContent =
        time.toLocaleTimeString([],{

            hour:"2-digit",

            minute:"2-digit",

            second:"2-digit"

        });

}

/*==========================================================
    WEATHER BACKGROUND
==========================================================*/

function applyWeatherTheme(code){

    document.body.classList.remove(

        "sunny",

        "cloudy",

        "rain",

        "snow",

        "thunder",

        "night"

    );

    if(code===0){

        document.body.classList.add("sunny");

    }

    else if([1,2,3].includes(code)){

        document.body.classList.add("cloudy");

    }

    else if([51,53,55,61,63,65,80].includes(code)){

        document.body.classList.add("rain");

    }

    else if([71,73,75].includes(code)){

        document.body.classList.add("snow");

    }

    else if(code===95){

        document.body.classList.add("thunder");

    }

    if(

        weatherData.current.is_day===0

    ){

        document.body.classList.add("night");

    }

}

/*==========================================================
    AIR QUALITY
==========================================================*/

function renderAQI(){

    if(!airData) return;

    const index = 0;

    const aqi =
        airData.hourly.european_aqi[index];

    aqiValue.textContent =
        Math.round(aqi);

    pm25.textContent =
        airData.hourly.pm2_5[index];

    pm10.textContent =
        airData.hourly.pm10[index];

    co.textContent =
        airData.hourly.carbon_monoxide[index];

    no2.textContent =
        airData.hourly.nitrogen_dioxide[index];

    ozone.textContent =
        airData.hourly.ozone[index];

    if(aqi<=20){

        aqiStatus.textContent="Excellent";

    }

    else if(aqi<=40){

        aqiStatus.textContent="Good";

    }

    else if(aqi<=60){

        aqiStatus.textContent="Moderate";

    }

    else if(aqi<=80){

        aqiStatus.textContent="Poor";

    }

    else{

        aqiStatus.textContent="Very Poor";

    }

}

/*==========================================================
    HEALTH RECOMMENDATIONS
==========================================================*/

function updateRecommendations(){

    const temp =
        weatherData.current.temperature_2m;

    const rain =
        weatherData.hourly
        .precipitation_probability[0];

    const wind =
        weatherData.current.wind_speed_10m;

    /* Hydration */

    if(temp>=35){

        hydrationTip.textContent=

        "Drink plenty of water and avoid prolonged exposure to direct sunlight.";

    }

    else if(temp>=28){

        hydrationTip.textContent=

        "Carry a water bottle and stay hydrated throughout the day.";

    }

    else{

        hydrationTip.textContent=

        "Maintain your regular hydration routine.";

    }

    /* Exercise */

    if(rain>60){

        exerciseTip.textContent=

        "Indoor workouts are recommended today.";

    }

    else if(temp>33){

        exerciseTip.textContent=

        "Morning or evening walks are the best option.";

    }

    else{

        exerciseTip.textContent=

        "Great weather for running, cycling or outdoor exercise.";

    }

    /* Clothing */

    if(temp<12){

        clothingTip.textContent=

        "Wear a warm jacket and layered clothing.";

    }

    else if(temp<22){

        clothingTip.textContent=

        "A light sweater or full sleeves are recommended.";

    }

    else{

        clothingTip.textContent=

        "Light cotton clothing will be comfortable today.";

    }

    /* Travel */

    if(rain>70){

        travelTip.textContent=

        "Carry an umbrella and expect slower traffic.";

    }

    else if(wind>40){

        travelTip.textContent=

        "Drive carefully due to strong winds.";

    }

    else{

        travelTip.textContent=

        "Weather conditions are suitable for travel.";

    }

}
/*==========================================================
    FORMAT DATE
==========================================================*/

function formatHour(dateString){

    const date = new Date(dateString);

    return date.toLocaleTimeString([],{

        hour:"numeric",

        minute:"2-digit"

    });

}

function formatDay(dateString){

    const date = new Date(dateString);

    return date.toLocaleDateString([],{

        weekday:"short"

    });

}

/*==========================================================
    HOURLY FORECAST
==========================================================*/

function renderHourly(){

    hourlyForecast.innerHTML = "";

    const hourly = weatherData.hourly;

    for(let i = 0; i < 24; i++){

        const code =
            hourly.weather_code[i];

        const weather =
            weatherCodes[code] || weatherCodes[0];

        const card =
            document.createElement("div");

        card.className =
            "hour-card glass fade-in";

        card.innerHTML = `

            <h4>${formatHour(hourly.time[i])}</h4>

            <img
                src="${weather.icon}"
                alt="${weather.text}"
            >

            <h3>
                ${Math.round(
                    hourly.temperature_2m[i]
                )}°
            </h3>

            <p>${weather.text}</p>

            <small>

                💧
                ${hourly.precipitation_probability[i]}%

            </small>

        `;

        hourlyForecast.appendChild(card);

    }

}

/*==========================================================
    DAILY FORECAST
==========================================================*/

function renderDaily(){

    dailyForecast.innerHTML = "";

    const daily =
        weatherData.daily;

    for(

        let i = 0;

        i < daily.time.length;

        i++

    ){

        const code =
            daily.weather_code[i];

        const weather =
            weatherCodes[code] || weatherCodes[0];

        const card =
            document.createElement("div");

        card.className =
            "day-card glass fade-in";

        card.innerHTML = `

            <h3>

                ${formatDay(daily.time[i])}

            </h3>

            <img

                src="${weather.icon}"

                alt="${weather.text}"

            >

            <p>

                ${weather.text}

            </p>

            <h2>

                ${Math.round(

                    daily.temperature_2m_max[i]

                )}°

            </h2>

            <span>

                ${Math.round(

                    daily.temperature_2m_min[i]

                )}°

            </span>

        `;

        dailyForecast.appendChild(card);

    }

}

/*==========================================================
    WEATHER ICON HELPER
==========================================================*/

function getWeatherIcon(code){

    const icons={

        0:"☀️",

        1:"🌤️",

        2:"⛅",

        3:"☁️",

        45:"🌫️",

        48:"🌫️",

        51:"🌦️",

        53:"🌦️",

        55:"🌧️",

        61:"🌧️",

        63:"🌧️",

        65:"🌧️",

        71:"❄️",

        73:"❄️",

        75:"❄️",

        80:"🌦️",

        81:"🌧️",

        82:"⛈️",

        95:"⛈️",

        96:"⛈️",

        99:"⛈️"

    };

    return icons[code] || "🌤️";

}

/*==========================================================
    WEATHER STATUS COLOR
==========================================================*/

function getWeatherColor(code){

    if(code===0){

        return "#FFD54F";

    }

    if([1,2,3].includes(code)){

        return "#90CAF9";

    }

    if(

        [51,53,55,61,63,65,80,81,82]

        .includes(code)

    ){

        return "#4FC3F7";

    }

    if([71,73,75].includes(code)){

        return "#E1F5FE";

    }

    if([95,96,99].includes(code)){

        return "#9575CD";

    }

    return "#ffffff";

}

/*==========================================================
    REFRESH WEATHER
==========================================================*/

function refreshWeather(){

    loadWeather();

}

/*==========================================================
    AUTO REFRESH
==========================================================*/

setInterval(()=>{

    if(weatherData){

        refreshWeather();

    }

},600000); // every 10 minutes
/*==========================================================
    AQI COLORS
==========================================================*/

function getAQILevel(aqi){

    if(aqi <= 20){

        return{
            text:"Excellent",
            color:"#00C853",
            progress:"#00C853"
        };

    }

    if(aqi <= 40){

        return{
            text:"Good",
            color:"#64DD17",
            progress:"#64DD17"
        };

    }

    if(aqi <= 60){

        return{
            text:"Moderate",
            color:"#FFD600",
            progress:"#FFD600"
        };

    }

    if(aqi <= 80){

        return{
            text:"Poor",
            color:"#FF9100",
            progress:"#FF9100"
        };

    }

    return{

        text:"Very Poor",

        color:"#FF1744",

        progress:"#FF1744"

    };

}

/*==========================================================
    UPDATE AQI CARD
==========================================================*/

function updateAQICard(){

    if(!airData) return;

    const index = 0;

    const value =
        Math.round(
            airData.hourly.european_aqi[index]
        );

    const level =
        getAQILevel(value);

    aqiValue.textContent =
        value;

    aqiStatus.textContent =
        level.text;

    aqiStatus.style.color =
        level.color;

    const circle =
        document.querySelector(".aqi-circle");

    const degree =
        Math.min(value,100) * 3.6;

    circle.style.background =

        `conic-gradient(
            ${level.progress} ${degree}deg,
            rgba(255,255,255,.18) ${degree}deg
        )`;

}

/*==========================================================
    WEATHER ALERTS
==========================================================*/

function generateAlert(){

    const temp =
        weatherData.current.temperature_2m;

    const rain =
        weatherData.hourly
        .precipitation_probability[0];

    const wind =
        weatherData.current.wind_speed_10m;

    const alerts = [];

    if(temp >= 38){

        alerts.push(
            "🔥 Extreme heat expected today."
        );

    }

    if(rain >= 70){

        alerts.push(
            "🌧 Carry an umbrella."
        );

    }

    if(wind >= 45){

        alerts.push(
            "💨 Strong winds expected."
        );

    }

    if(alerts.length===0){

        alerts.push(
            "✅ No severe weather alerts."
        );

    }

    console.log(alerts);

}

/*==========================================================
    SMART HEALTH SCORE
==========================================================*/

function calculateHealthScore(){

    let score = 100;

    const temp =
        weatherData.current.temperature_2m;

    const rain =
        weatherData.hourly
        .precipitation_probability[0];

    if(temp > 35){

        score -= 20;

    }

    if(rain > 70){

        score -= 15;

    }

    if(airData){

        const aqi =
            airData.hourly
            .european_aqi[0];

        score -= Math.min(

            Math.floor(aqi/8),

            35

        );

    }

    return Math.max(score,0);

}

/*==========================================================
    CLOTHING SUGGESTION
==========================================================*/

function getClothingSuggestion(){

    const temp =
        weatherData.current.temperature_2m;

    if(temp < 10){

        return "🧥 Heavy winter jacket";

    }

    if(temp < 20){

        return "🧥 Light jacket";

    }

    if(temp < 30){

        return "👕 Comfortable casual wear";

    }

    return "🩳 Cotton clothes & cap";

}

/*==========================================================
    EXERCISE SUGGESTION
==========================================================*/

function getExerciseSuggestion(){

    const temp =
        weatherData.current.temperature_2m;

    const rain =
        weatherData.hourly
        .precipitation_probability[0];

    if(rain > 60){

        return "🏋 Indoor Workout";

    }

    if(temp > 35){

        return "🚶 Evening Walk";

    }

    if(temp > 25){

        return "🚴 Cycling";

    }

    return "🏃 Running";

}

/*==========================================================
    UPDATE RECOMMENDATION CARDS
==========================================================*/

function updateRecommendationCards(){

    clothingTip.textContent =
        getClothingSuggestion();

    exerciseTip.textContent =
        getExerciseSuggestion();

    hydrationTip.textContent =

        weatherData.current.temperature_2m > 32

        ? "Drink at least 3L water today."

        : "Stay hydrated.";

    travelTip.textContent =

        weatherData.hourly
        .precipitation_probability[0] > 60

        ? "Carry umbrella before travelling."

        : "Road conditions are good.";

}

/*==========================================================
    FINAL DASHBOARD UPDATE
==========================================================*/

function updateDashboard(){

    renderWeather();

    updateAQICard();

    updateRecommendationCards();

    generateAlert();

    console.log(

        "Health Score :",

        calculateHealthScore()

    );

}
/*==========================================================
    FORMAT TIME
==========================================================*/

function formatTime(timeString){

    const date = new Date(timeString);

    return date.toLocaleTimeString([],{

        hour:"2-digit",

        minute:"2-digit"

    });

}

/*==========================================================
    DAY LENGTH
==========================================================*/

function calculateDayLength(sunriseTime,sunsetTime){

    const rise = new Date(sunriseTime);

    const set = new Date(sunsetTime);

    const diff = set - rise;

    const hours = Math.floor(diff / 3600000);

    const minutes = Math.floor(

        (diff % 3600000) / 60000

    );

    return `${hours}h ${minutes}m`;

}

/*==========================================================
    SOLAR NOON
==========================================================*/

function calculateSolarNoon(sunriseTime,sunsetTime){

    const rise = new Date(sunriseTime);

    const set = new Date(sunsetTime);

    const middle =

        new Date(

            (rise.getTime()+set.getTime())/2

        );

    return middle.toLocaleTimeString([],{

        hour:"2-digit",

        minute:"2-digit"

    });

}

/*==========================================================
    GOLDEN HOUR
==========================================================*/

function calculateGoldenHour(sunsetTime){

    const sunset = new Date(sunsetTime);

    sunset.setHours(

        sunset.getHours()-1

    );

    return sunset.toLocaleTimeString([],{

        hour:"2-digit",

        minute:"2-digit"

    });

}

/*==========================================================
    RENDER ASTRONOMY
==========================================================*/

function renderAstronomy(){

    if(!weatherData) return;

    const daily = weatherData.daily;

    const rise = daily.sunrise[0];

    const set = daily.sunset[0];

    sunrise.textContent =

        formatTime(rise);

    sunset.textContent =

        formatTime(set);

    dayLength.textContent =

        calculateDayLength(

            rise,

            set

        );

    solarNoon.textContent =

        calculateSolarNoon(

            rise,

            set

        );

    goldenHour.textContent =

        calculateGoldenHour(

            set

        );

    moonPhase.textContent =

        "Coming Soon";

}

/*==========================================================
    LEAFLET MAP
==========================================================*/

function initializeMap(){

    if(map) return;

    map = L.map("weatherMap",{

        zoomControl:true

    }).setView(

        [latitude,longitude],

        10

    );

    L.tileLayer(

        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            attribution:

            "&copy; OpenStreetMap"

        }

    ).addTo(map);

    marker =

        L.marker(

            [latitude,longitude]

        ).addTo(map);

}

/*==========================================================
    UPDATE MAP
==========================================================*/

function updateMap(){

    if(!map){

        initializeMap();

        return;

    }

    map.setView(

        [latitude,longitude],

        10

    );

    marker.setLatLng(

        [latitude,longitude]

    );

}

/*==========================================================
    RADAR
==========================================================*/

function initializeRadar(){

    const radar =

        document.getElementById(

            "radarFrame"

        );

    radar.src =

        `https://www.rainviewer.com/map.html?loc=${latitude},${longitude},10&oFa=0&oC=1&oU=0&oCS=1&oF=0`;

}

/*==========================================================
    UPDATE LOCATION COMPONENTS
==========================================================*/

function updateLocationComponents(){

    updateMap();

    initializeRadar();

}
/*==========================================================
    CHART INITIALIZATION
==========================================================*/

function initializeCharts(){

    createTemperatureChart();

    createHumidityChart();

    createWindChart();

}


/*==========================================================
    DESTROY EXISTING CHARTS
==========================================================*/

function destroyCharts(){

    if(temperatureChart){

        temperatureChart.destroy();

    }

    if(humidityChart){

        humidityChart.destroy();

    }

    if(windChart){

        windChart.destroy();

    }

}


/*==========================================================
    CHART OPTIONS
==========================================================*/

const chartOptions = {

    responsive:true,

    maintainAspectRatio:false,

    plugins:{

        legend:{

            labels:{

                color:"#ffffff",

                font:{

                    family:"Poppins"

                }

            }

        }

    },

    scales:{

        x:{

            ticks:{

                color:"#ffffff"

            },

            grid:{

                display:false

            }

        },

        y:{

            ticks:{

                color:"#ffffff"

            },

            grid:{

                color:"rgba(255,255,255,.15)"

            }

        }

    }

};


/*==========================================================
    GET HOURLY LABELS
==========================================================*/

function getChartLabels(){

    if(!weatherData) return [];

    return weatherData.hourly.time

    .slice(0,24)

    .map(time=>{

        return new Date(time)

        .toLocaleTimeString([],{

            hour:"numeric"

        });

    });

}


/*==========================================================
    TEMPERATURE CHART
==========================================================*/

function createTemperatureChart(){

    const canvas =

        document.getElementById(

            "temperatureChart"

        );


    if(!canvas || !weatherData)

        return;


    temperatureChart =

    new Chart(canvas,{

        type:"line",

        data:{


            labels:getChartLabels(),


            datasets:[{

                label:"Temperature °C",


                data:

                weatherData.hourly

                .temperature_2m

                .slice(0,24),


                tension:.4,


                fill:true,


                borderWidth:3,


                pointRadius:3

            }]

        },


        options:chartOptions

    });

}


/*==========================================================
    HUMIDITY CHART
==========================================================*/

function createHumidityChart(){

    const canvas =

        document.getElementById(

            "humidityChart"

        );


    if(!canvas || !weatherData)

        return;



    humidityChart =

    new Chart(canvas,{

        type:"line",


        data:{


            labels:getChartLabels(),


            datasets:[{


                label:"Humidity %",


                data:

                weatherData.hourly

                .relative_humidity_2m

                .slice(0,24),


                tension:.4,


                fill:true,


                borderWidth:3


            }]


        },


        options:chartOptions

    });


}



/*==========================================================
    WIND CHART
==========================================================*/

function createWindChart(){

    const canvas =

        document.getElementById(

            "windChart"

        );


    if(!canvas || !weatherData)

        return;



    windChart =

    new Chart(canvas,{

        type:"bar",


        data:{


            labels:getChartLabels(),


            datasets:[{


                label:"Wind Speed km/h",


                data:

                weatherData.hourly

                .wind_speed_10m

                .slice(0,24),


                borderWidth:1


            }]


        },


        options:chartOptions

    });


}



/*==========================================================
    UPDATE ALL CHARTS
==========================================================*/

function updateCharts(){

    destroyCharts();

    initializeCharts();

}
/*==========================================================
    CHART INITIALIZATION
==========================================================*/

function initializeCharts(){

    createTemperatureChart();

    createHumidityChart();

    createWindChart();

}


/*==========================================================
    DESTROY EXISTING CHARTS
==========================================================*/

function destroyCharts(){

    if(temperatureChart){

        temperatureChart.destroy();

    }

    if(humidityChart){

        humidityChart.destroy();

    }

    if(windChart){

        windChart.destroy();

    }

}


/*==========================================================
    CHART OPTIONS
==========================================================*/

const chartOptions = {

    responsive:true,

    maintainAspectRatio:false,

    plugins:{

        legend:{

            labels:{

                color:"#ffffff",

                font:{

                    family:"Poppins"

                }

            }

        }

    },

    scales:{

        x:{

            ticks:{

                color:"#ffffff"

            },

            grid:{

                display:false

            }

        },

        y:{

            ticks:{

                color:"#ffffff"

            },

            grid:{

                color:"rgba(255,255,255,.15)"

            }

        }

    }

};


/*==========================================================
    GET HOURLY LABELS
==========================================================*/

function getChartLabels(){

    if(!weatherData) return [];

    return weatherData.hourly.time

    .slice(0,24)

    .map(time=>{

        return new Date(time)

        .toLocaleTimeString([],{

            hour:"numeric"

        });

    });

}


/*==========================================================
    TEMPERATURE CHART
==========================================================*/

function createTemperatureChart(){

    const canvas =

        document.getElementById(

            "temperatureChart"

        );


    if(!canvas || !weatherData)

        return;


    temperatureChart =

    new Chart(canvas,{

        type:"line",

        data:{


            labels:getChartLabels(),


            datasets:[{

                label:"Temperature °C",


                data:

                weatherData.hourly

                .temperature_2m

                .slice(0,24),


                tension:.4,


                fill:true,


                borderWidth:3,


                pointRadius:3

            }]

        },


        options:chartOptions

    });

}


/*==========================================================
    HUMIDITY CHART
==========================================================*/

function createHumidityChart(){

    const canvas =

        document.getElementById(

            "humidityChart"

        );


    if(!canvas || !weatherData)

        return;



    humidityChart =

    new Chart(canvas,{

        type:"line",


        data:{


            labels:getChartLabels(),


            datasets:[{


                label:"Humidity %",


                data:

                weatherData.hourly

                .relative_humidity_2m

                .slice(0,24),


                tension:.4,


                fill:true,


                borderWidth:3


            }]


        },


        options:chartOptions

    });


}



/*==========================================================
    WIND CHART
==========================================================*/

function createWindChart(){

    const canvas =

        document.getElementById(

            "windChart"

        );


    if(!canvas || !weatherData)

        return;



    windChart =

    new Chart(canvas,{

        type:"bar",


        data:{


            labels:getChartLabels(),


            datasets:[{


                label:"Wind Speed km/h",


                data:

                weatherData.hourly

                .wind_speed_10m

                .slice(0,24),


                borderWidth:1


            }]


        },


        options:chartOptions

    });


}



/*==========================================================
    UPDATE ALL CHARTS
==========================================================*/

function updateCharts(){

    destroyCharts();

    initializeCharts();

}
/*==========================================================
    FINAL APPLICATION INITIALIZATION
==========================================================*/


async function initializeWeatherSphere(){

    try{


        showLoading();


        await loadWeather();


        createMap();


        updateMapLocation();


        updateMapPopup();


        loadRadar();


        initializeCharts();


        updateAQICard();


        updateRecommendationCards();


        hideLoading();


        showNotification(

            "WeatherSphere Pro Ready 🌤️"

        );


    }

    catch(error){

        console.error(

            "Initialization Error:",
            error

        );


        showNotification(

            "Unable to load weather data"

        );

    }

}



/*==========================================================
    SEARCH EVENT IMPROVEMENT
==========================================================*/


searchBtn.addEventListener(

    "click",

    async()=>{


        const city =

        cityInput.value.trim();


        if(!city)

            return;



        await searchCity(city);


        refreshMapFeatures();


        updateCharts();


    }

);



/*==========================================================
    LOCATION BUTTON
==========================================================*/


locationBtn.addEventListener(

    "click",

    ()=>{


        getCurrentLocation();


        setTimeout(()=>{


            refreshMapFeatures();


            updateCharts();


        },3000);


    }

);



/*==========================================================
    DOUBLE CLICK FAVORITE
==========================================================*/


cityName.addEventListener(

    "dblclick",

    ()=>{


        saveCurrentCityAsFavorite();


    }

);



/*==========================================================
    KEYBOARD SHORTCUTS
==========================================================*/


document.addEventListener(

    "keydown",

    (event)=>{


        if(event.key==="Escape"){


            cityInput.value="";


        }



        if(

            event.ctrlKey &&

            event.key==="k"

        ){

            event.preventDefault();


            cityInput.focus();


        }


    }

);



/*==========================================================
    NETWORK STATUS
==========================================================*/


window.addEventListener(

    "online",

    ()=>{


        showNotification(

            "Internet connection restored"

        );


        loadWeather();


    }

);



window.addEventListener(

    "offline",

    ()=>{


        showNotification(

            "You are offline"

        );


    }

);



/*==========================================================
    SAFE API WRAPPER
==========================================================*/


async function safeFetch(url){


    try{


        const response =

        await fetch(url);



        if(!response.ok){

            throw new Error(

                "API Error"

            );

        }


        return await response.json();


    }

    catch(error){


        console.error(error);


        showNotification(

            "Weather service unavailable"

        );


        return null;


    }


}



/*==========================================================
    LAST UPDATED FOOTER
==========================================================*/


function updateFooterTime(){


    const footer =

    document.getElementById(

        "footerUpdated"

    );



    if(footer){


        footer.textContent =

        new Date()

        .toLocaleTimeString();


    }


}



setInterval(

    updateFooterTime,

    1000

);



/*==========================================================
    PERIODIC WEATHER UPDATE
==========================================================*/


setInterval(

    ()=>{


        if(

            navigator.onLine

        ){

            loadWeather();


        }


    },

    15 * 60 * 1000

);



/*==========================================================
    START APPLICATION
==========================================================*/


window.addEventListener(

    "load",

    ()=>{


        initializeWeatherSphere();


    }

);
