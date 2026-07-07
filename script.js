/*==========================================================
 WeatherSphere Pro 3.0
 Premium Weather Dashboard
 JavaScript Controller
 PART 1/3

 Features:
 - Open Meteo API
 - City Search
 - Geolocation
 - Current Weather
 - AQI
 - Weather Mapping
==========================================================*/


/*==========================================================
 GLOBAL CONFIG
==========================================================*/

const CONFIG = {

    weatherAPI:
    "https://api.open-meteo.com/v1/forecast",

    geoAPI:
    "https://geocoding-api.open-meteo.com/v1/search",

    airAPI:
    "https://air-quality-api.open-meteo.com/v1/air-quality",

    defaultCity:
    "New Delhi",

    defaultLat:
    28.6139,

    defaultLon:
    77.2090

};



/*==========================================================
 DOM ELEMENTS
==========================================================*/


const DOM = {

    cityInput:
    document.getElementById("cityInput"),

    searchBtn:
    document.getElementById("searchBtn"),

    locationBtn:
    document.getElementById("locationBtn"),

    themeToggle:
    document.getElementById("themeToggle"),


    cityName:
    document.getElementById("cityName"),

    currentDate:
    document.getElementById("currentDate"),

    temperature:
    document.getElementById("temperature"),

    weatherIcon:
    document.getElementById("weatherIcon"),

    weatherDescription:
    document.getElementById("weatherDescription"),

    feelsLike:
    document.getElementById("feelsLike"),


    localTime:
    document.getElementById("localTime"),

    lastUpdated:
    document.getElementById("lastUpdated"),

    timezone:
    document.getElementById("timezone"),



    humidity:
    document.getElementById("humidity"),

    windSpeed:
    document.getElementById("windSpeed"),

    pressure:
    document.getElementById("pressure"),

    visibility:
    document.getElementById("visibility"),

    uv:
    document.getElementById("uv"),

    cloudCover:
    document.getElementById("cloudCover"),

    dewPoint:
    document.getElementById("dewPoint"),

    rainChance:
    document.getElementById("rainChance"),



    aqiValue:
    document.getElementById("aqiValue"),

    aqiStatus:
    document.getElementById("aqiStatus"),

    pm25:
    document.getElementById("pm25"),

    pm10:
    document.getElementById("pm10"),

    co:
    document.getElementById("co"),

    no2:
    document.getElementById("no2"),

    ozone:
    document.getElementById("ozone"),



    hourlyForecast:
    document.getElementById("hourlyForecast"),

    dailyForecast:
    document.getElementById("dailyForecast"),


    radarFrame:
    document.getElementById("radarFrame"),


    footerUpdated:
    document.getElementById("footerUpdated")


};



/*==========================================================
 GLOBAL STATE
==========================================================*/


let weatherState = {

    city:
    CONFIG.defaultCity,

    latitude:
    CONFIG.defaultLat,

    longitude:
    CONFIG.defaultLon,

    timezone:
    "Asia/Kolkata",

    data:null

};



/*==========================================================
 WEATHER CODE DATABASE
==========================================================*/


const WEATHER_CODES = {


    0:{
        text:"Clear Sky",
        icon:"☀️",
        theme:"sunny"
    },


    1:{
        text:"Mainly Clear",
        icon:"🌤️",
        theme:"sunny"
    },


    2:{
        text:"Partly Cloudy",
        icon:"⛅",
        theme:"cloudy"
    },


    3:{
        text:"Overcast",
        icon:"☁️",
        theme:"cloudy"
    },


    45:{
        text:"Fog",
        icon:"🌫️",
        theme:"cloudy"
    },


    48:{
        text:"Rime Fog",
        icon:"🌫️",
        theme:"cloudy"
    },


    51:{
        text:"Light Drizzle",
        icon:"🌦️",
        theme:"rain"
    },


    53:{
        text:"Drizzle",
        icon:"🌧️",
        theme:"rain"
    },


    55:{
        text:"Heavy Drizzle",
        icon:"🌧️",
        theme:"rain"
    },


    61:{
        text:"Light Rain",
        icon:"🌧️",
        theme:"rain"
    },


    63:{
        text:"Rain",
        icon:"🌧️",
        theme:"rain"
    },


    65:{
        text:"Heavy Rain",
        icon:"🌧️",
        theme:"rain"
    },


    71:{
        text:"Light Snow",
        icon:"❄️",
        theme:"snow"
    },


    73:{
        text:"Snow",
        icon:"❄️",
        theme:"snow"
    },


    75:{
        text:"Heavy Snow",
        icon:"❄️",
        theme:"snow"
    },


    80:{
        text:"Rain Showers",
        icon:"🌦️",
        theme:"rain"
    },


    81:{
        text:"Heavy Showers",
        icon:"🌧️",
        theme:"rain"
    },


    95:{
        text:"Thunderstorm",
        icon:"⛈️",
        theme:"thunder"
    },


    96:{
        text:"Thunderstorm Hail",
        icon:"⛈️",
        theme:"thunder"
    },


    99:{
        text:"Severe Thunderstorm",
        icon:"⛈️",
        theme:"thunder"
    }


};



/*==========================================================
 ICON GENERATOR

 Uses emoji fallback so dashboard works
 without external assets
==========================================================*/


function setWeatherIcon(code){


    let weather =
    WEATHER_CODES[code] ||
    WEATHER_CODES[0];


    if(DOM.weatherIcon){

        DOM.weatherIcon.src =
        `data:image/svg+xml,
        <svg xmlns="http://www.w3.org/2000/svg"
        width="120"
        height="120">

        <text x="50%"
        y="65%"
        text-anchor="middle"
        font-size="80">
        ${weather.icon}
        </text>

        </svg>`;

    }


}



/*==========================================================
 CITY SEARCH
==========================================================*/


async function searchCity(city){


    try{


        const response =
        await fetch(
        `${CONFIG.geoAPI}?name=${city}&count=1`
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


        weatherState.city =
        place.name;


        weatherState.latitude =
        place.latitude;


        weatherState.longitude =
        place.longitude;


        weatherState.timezone =
        place.timezone;



        loadWeather();



    }
    catch(error){


        alert(
        "Unable to find city"
        );


        console.error(error);

    }


}



/*==========================================================
 WEATHER FETCH
==========================================================*/


async function fetchWeather(){


    const url =

    `${CONFIG.weatherAPI}?
    latitude=${weatherState.latitude}
    &longitude=${weatherState.longitude}
    &timezone=auto

    &current=
    temperature_2m,
    relative_humidity_2m,
    apparent_temperature,
    precipitation,
    weather_code,
    pressure_msl,
    wind_speed_10m,
    cloud_cover

    &hourly=
    temperature_2m,
    relative_humidity_2m,
    wind_speed_10m,
    precipitation_probability,
    weather_code,
    uv_index

    &daily=
    weather_code,
    temperature_2m_max,
    temperature_2m_min,
    sunrise,
    sunset`;



    const cleanURL =
    url.replace(/\s+/g,"");



    const response =
    await fetch(cleanURL);



    if(!response.ok){

        throw new Error(
        "Weather API error"
        );

    }


    return await response.json();



}



/*==========================================================
 LOAD WEATHER
==========================================================*/


async function loadWeather(){


    try{


        const data =
        await fetchWeather();


        weatherState.data =
        data;



        renderCurrentWeather(data);



        loadAirQuality();



        applyWeatherTheme(
        data.current.weather_code
        );



    }


    catch(error){


        console.error(
        "Weather loading failed",
        error
        );


    }



}



/*==========================================================
 CURRENT WEATHER RENDER
==========================================================*/


function renderCurrentWeather(data){


    const current =
    data.current;


    const weather =
    WEATHER_CODES[
        current.weather_code
    ]
    ||
    WEATHER_CODES[0];



    DOM.cityName.textContent =
    weatherState.city;



    DOM.currentDate.textContent =
    new Date()
    .toLocaleDateString(
    "en-US",
    {
        weekday:"long",
        month:"long",
        day:"numeric"
    });



    DOM.temperature.textContent =
    Math.round(
    current.temperature_2m
    )
    +"°";



    DOM.weatherDescription.textContent =
    weather.text;



    DOM.feelsLike.textContent =
    `Feels like ${Math.round(current.apparent_temperature)}°C`;



    DOM.humidity.textContent =
    current.relative_humidity_2m
    +"%";



    DOM.windSpeed.textContent =
    Math.round(
    current.wind_speed_10m
    )
    +" km/h";



    DOM.pressure.textContent =
    Math.round(
    current.pressure_msl
    )
    +" hPa";



    DOM.cloudCover.textContent =
    current.cloud_cover
    +"%";



    DOM.rainChance.textContent =
    current.precipitation
    +" mm";



    DOM.lastUpdated.textContent =
    new Date()
    .toLocaleTimeString();



    DOM.footerUpdated.textContent =
    new Date()
    .toLocaleTimeString();



    DOM.timezone.textContent =
    data.timezone;



    DOM.localTime.textContent =
    new Date()
    .toLocaleTimeString(
        "en-US",
        {
            timeZone:data.timezone
        }
    );



    setWeatherIcon(
    current.weather_code
    );



}
/*==========================================================
 PART 2/3

 - AQI System
 - Hourly Forecast
 - Daily Forecast
 - Astronomy
 - Recommendations
 - Recent Searches
 - Weather Themes
==========================================================*/



/*==========================================================
 AIR QUALITY
==========================================================*/


async function loadAirQuality(){


    try{


        const url =

        `${CONFIG.airAPI}?
        latitude=${weatherState.latitude}
        &longitude=${weatherState.longitude}
        &hourly=
        pm10,
        pm2_5,
        carbon_monoxide,
        nitrogen_dioxide,
        ozone,
        us_aqi
        &timezone=auto`;


        const response =
        await fetch(
        url.replace(/\s+/g,"")
        );


        const data =
        await response.json();


        renderAQI(data);


    }
    catch(error){


        console.error(
        "AQI Error:",
        error
        );


    }

}




function renderAQI(data){


    if(!data.hourly)
    return;


    const index = 0;



    const aqi =
    Math.round(
    data.hourly.us_aqi[index] || 0
    );



    DOM.aqiValue.textContent =
    aqi;



    DOM.pm25.textContent =
    `${Math.round(
    data.hourly.pm2_5[index] || 0
    )} µg/m³`;



    DOM.pm10.textContent =
    `${Math.round(
    data.hourly.pm10[index] || 0
    )} µg/m³`;



    DOM.co.textContent =
    `${Math.round(
    data.hourly.carbon_monoxide[index] || 0
    )}`;

    

    DOM.no2.textContent =
    `${Math.round(
    data.hourly.nitrogen_dioxide[index] || 0
    )}`;

    

    DOM.ozone.textContent =
    `${Math.round(
    data.hourly.ozone[index] || 0
    )}`;



    let status =
    "Good";



    if(aqi > 50)
    status="Moderate";


    if(aqi >100)
    status="Unhealthy";


    if(aqi >200)
    status="Very Unhealthy";


    if(aqi >300)
    status="Hazardous";



    DOM.aqiStatus.textContent =
    status;



}




/*==========================================================
 HOURLY FORECAST
==========================================================*/


function renderHourlyForecast(data){


    const hourly =
    data.hourly;



    DOM.hourlyForecast.innerHTML="";



    for(
        let i=0;
        i<24;
        i++
    ){


        const card =
        document.createElement(
        "div"
        );


        card.className =
        "hour-card glass";



        const weather =
        WEATHER_CODES[
        hourly.weather_code[i]
        ]
        ||
        WEATHER_CODES[0];



        const time =
        new Date(
        hourly.time[i]
        )
        .toLocaleTimeString(
        [],
        {
            hour:"2-digit"
        });



        card.innerHTML = `

        <h4>${time}</h4>

        <div style="
        font-size:45px">
        ${weather.icon}
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


        `;



        DOM.hourlyForecast
        .appendChild(card);



    }



}




/*==========================================================
 DAILY FORECAST
==========================================================*/


function renderDailyForecast(data){



    const daily =
    data.daily;



    DOM.dailyForecast.innerHTML="";



    for(
        let i=0;
        i<7;
        i++
    ){



        const card =
        document.createElement(
        "div"
        );


        card.className =
        "day-card glass";



        const weather =
        WEATHER_CODES[
        daily.weather_code[i]
        ]
        ||
        WEATHER_CODES[0];



        const day =
        new Date(
        daily.time[i]
        )
        .toLocaleDateString(
        "en-US",
        {
            weekday:"short"
        }
        );



        card.innerHTML=`

        <h3>
        ${day}
        </h3>


        <div style="
        font-size:55px">
        ${weather.icon}
        </div>


        <p>
        ${weather.text}
        </p>


        <h2>
        ${Math.round(
        daily.temperature_2m_max[i]
        )}°
        /
        ${Math.round(
        daily.temperature_2m_min[i]
        )}°
        </h2>


        `;



        DOM.dailyForecast
        .appendChild(card);



    }



}




/*==========================================================
 ASTRONOMY
==========================================================*/


function renderAstronomy(data){



    const daily =
    data.daily;



    const sunrise =
    new Date(
    daily.sunrise[0]
    );



    const sunset =
    new Date(
    daily.sunset[0]
    );



    const format =
    time =>
    time.toLocaleTimeString(
    [],
    {
        hour:"2-digit",
        minute:"2-digit"
    });



    const sunriseEl =
    document.getElementById(
    "sunrise"
    );


    const sunsetEl =
    document.getElementById(
    "sunset"
    );


    const solar =
    document.getElementById(
    "solarNoon"
    );


    const length =
    document.getElementById(
    "dayLength"
    );


    const golden =
    document.getElementById(
    "goldenHour"
    );


    const moon =
    document.getElementById(
    "moonPhase"
    );



    sunriseEl.textContent =
    format(sunrise);



    sunsetEl.textContent =
    format(sunset);



    const noon =
    new Date(
    (
    sunrise.getTime()
    +
    sunset.getTime()
    )/2
    );



    solar.textContent =
    format(noon);



    const diff =
    sunset-sunrise;



    const hours =
    Math.floor(
    diff/3600000
    );


    const minutes =
    Math.floor(
    (diff%3600000)/60000
    );



    length.textContent =
    `${hours}h ${minutes}m`;



    golden.textContent =
    format(
    new Date(
    sunset.getTime()-3600000
    )
    );



    const phases=[

    "🌑 New Moon",

    "🌒 Waxing Crescent",

    "🌓 First Quarter",

    "🌔 Waxing Gibbous",

    "🌕 Full Moon",

    "🌖 Waning Gibbous",

    "🌗 Last Quarter",

    "🌘 Waning Crescent"

    ];



    moon.textContent =
    phases[
    new Date().getDate()%8
    ];



}




/*==========================================================
 HEALTH RECOMMENDATIONS
==========================================================*/


function updateRecommendations(temp,aqi){



    const hydration =
    document.getElementById(
    "hydrationTip"
    );


    const exercise =
    document.getElementById(
    "exerciseTip"
    );


    const clothing =
    document.getElementById(
    "clothingTip"
    );


    const travel =
    document.getElementById(
    "travelTip"
    );




    if(temp>35){

        hydration.textContent =
        "Drink extra water and avoid long sun exposure.";

        exercise.textContent =
        "Prefer indoor workouts or early morning walks.";

        clothing.textContent =
        "Wear light cotton breathable clothes.";

    }

    else{

        hydration.textContent =
        "Maintain regular hydration throughout the day.";

        exercise.textContent =
        "Great weather for outdoor activities.";

        clothing.textContent =
        "Comfortable seasonal clothing recommended.";

    }




    if(aqi>150){

        travel.textContent =
        "Air quality is poor. Consider reducing outdoor travel.";

    }

    else{

        travel.textContent =
        "Good conditions for outdoor travel.";

    }



}




/*==========================================================
 WEATHER THEME
==========================================================*/


function applyWeatherTheme(code){



    const body =
    document.body;



    body.classList.remove(

    "sunny",
    "cloudy",
    "rain",
    "snow",
    "thunder"

    );



    const theme =
    WEATHER_CODES[code]
    ?.theme
    ||
    "sunny";



    body.classList.add(
    theme
    );



}




/*==========================================================
 RECENT SEARCH STORAGE
==========================================================*/


function saveRecent(city){


    let history =
    JSON.parse(
    localStorage.getItem(
    "recentCities"
    )
    )
    ||
    [];



    history =
    [
    city,
    ...history.filter(
    c=>c!==city
    )
    ].slice(0,6);



    localStorage.setItem(
    "recentCities",
    JSON.stringify(history)
    );



    renderRecent();



}



function renderRecent(){


    const box =
    document.getElementById(
    "recentSearches"
    );


    if(!box)
    return;



    const history =
    JSON.parse(
    localStorage.getItem(
    "recentCities"
    )
    )
    ||
    [];



    box.innerHTML="";



    history.forEach(city=>{


        const item =
        document.createElement(
        "div"
        );


        item.className =
        "search-chip";



        item.textContent =
        city;



        item.onclick =
        ()=>searchCity(city);



        box.appendChild(item);



    });



}
/*==========================================================
 PART 3/3

 FINAL INTEGRATION

 - Charts
 - Leaflet Map
 - RainViewer Radar
 - Dark/Light Mode
 - Location Detection
 - Event Listeners
 - Final Initialization
==========================================================*/



/*==========================================================
 CHART SYSTEM
==========================================================*/


let charts = {};



function createCharts(data){


    if(typeof Chart === "undefined")
    return;



    const hourly =
    data.hourly;



    const labels =
    hourly.time
    .slice(0,24)
    .map(time=>

        new Date(time)
        .toLocaleTimeString(
        [],
        {
            hour:"2-digit"
        })

    );



    const temperature =
    hourly.temperature_2m
    .slice(0,24);



    const humidity =
    hourly.relative_humidity_2m
    .slice(0,24);



    const wind =
    hourly.wind_speed_10m
    .slice(0,24);



    buildChart(

        "temperatureChart",

        "Temperature °C",

        labels,

        temperature

    );



    buildChart(

        "humidityChart",

        "Humidity %",

        labels,

        humidity

    );



    buildChart(

        "windChart",

        "Wind km/h",

        labels,

        wind

    );



}




function buildChart(
id,
label,
labels,
values
){



    const canvas =
    document.getElementById(id);



    if(!canvas)
    return;



    if(charts[id]){

        charts[id].destroy();

    }



    charts[id] =

    new Chart(

        canvas,

        {

        type:"line",


        data:{


            labels:labels,


            datasets:[{

                label:label,

                data:values,

                tension:.4,

                fill:true


            }]


        },


        options:{


            responsive:true,


            maintainAspectRatio:false,


            plugins:{


                legend:{


                    labels:{


                        color:
                        "white"


                    }


                }


            },


            scales:{


                x:{


                    ticks:{


                        color:
                        "white"


                    }


                },


                y:{


                    ticks:{


                        color:
                        "white"


                    }


                }


            }


        }


    });


}




/*==========================================================
 LEAFLET MAP
==========================================================*/


let weatherMap;



function initMap(){



    const mapElement =
    document.getElementById(
    "weatherMap"
    );



    if(!mapElement)
    return;



    weatherMap =
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

    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",

    {

        maxZoom:18

    }

    )
    .addTo(weatherMap);



}




function updateMap(){



    if(!weatherMap)
    return;



    weatherMap
    .setView(

        [

        weatherState.latitude,

        weatherState.longitude

        ],

        10

    );



    L.marker(

        [

        weatherState.latitude,

        weatherState.longitude

        ]

    )

    .addTo(weatherMap)

    .bindPopup(

        weatherState.city

    )

    .openPopup();



}




/*==========================================================
 RADAR
==========================================================*/


function updateRadar(){



    const frame =
    document.getElementById(
    "radarFrame"
    );



    if(!frame)
    return;



    frame.src =

    `https://www.rainviewer.com/map.html?
    loc=${weatherState.latitude},
    ${weatherState.longitude},
    8`;



}





/*==========================================================
 THEME SWITCH
==========================================================*/


function setupTheme(){


    const saved =
    localStorage.getItem(
    "theme"
    );



    if(saved==="dark"){

        document.body
        .classList
        .add("dark");

    }




    DOM.themeToggle
    ?.addEventListener(

    "click",

    ()=>{


        document.body
        .classList
        .toggle(
        "dark"
        );



        localStorage.setItem(

            "theme",

            document.body
            .classList
            .contains("dark")

            ?

            "dark"

            :

            "light"

        );


    });


}




/*==========================================================
 LOCATION BUTTON
==========================================================*/


function setupLocation(){



    DOM.locationBtn
    ?.addEventListener(

    "click",

    ()=>{


        if(!navigator.geolocation){

            alert(
            "Location not supported"
            );

            return;

        }



        navigator.geolocation
        .getCurrentPosition(

        position=>{


            weatherState.latitude =
            position.coords.latitude;



            weatherState.longitude =
            position.coords.longitude;



            loadWeather();



            updateMap();



        },

        ()=>{


            alert(
            "Unable to access location"
            );


        }


        );


    });


}




/*==========================================================
 SEARCH BUTTON
==========================================================*/


function setupSearch(){



    DOM.searchBtn
    ?.addEventListener(

    "click",

    ()=>{


        const city =
        DOM.cityInput
        .value
        .trim();



        if(city){

            searchCity(city);

        }



    });



    DOM.cityInput
    ?.addEventListener(

    "keypress",

    event=>{


        if(event.key==="Enter"){


            const city =
            DOM.cityInput
            .value
            .trim();



            if(city){

                searchCity(city);

            }


        }


    });


}




/*==========================================================
 CONNECT EXISTING LOAD WEATHER
==========================================================*/


const originalLoadWeather =
window.loadWeather;



window.loadWeather =
async function(){



    await originalLoadWeather();



    if(weatherState.data){


        createCharts(
        weatherState.data
        );



        updateMap();



        updateRadar();



        renderHourlyForecast(
        weatherState.data
        );



        renderDailyForecast(
        weatherState.data
        );



        renderAstronomy(
        weatherState.data
        );



        updateRecommendations(

            weatherState.data
            .current
            .temperature_2m,

            50

        );


    }


};




/*==========================================================
 INITIAL START
==========================================================*/


document.addEventListener(

"DOMContentLoaded",

()=>{


    setupTheme();


    setupLocation();


    setupSearch();


    initMap();


    renderRecent();


    loadWeather();



});

/*==========================================================
 WEATHERSPHERE PRO 3.0
 ADVANCED DYNAMIC BACKGROUND ENGINE
==========================================================*/


function updateDynamicBackground(data){


    const body = document.body;


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



    const isNight =
    now < sunrise ||
    now > sunset;



    // remove old themes

    body.classList.remove(

        "sunny",
        "cloudy",
        "rain",
        "snow",
        "thunder",
        "night"

    );



    clearWeatherParticles();



    /*
    NIGHT MODE
    */


    if(isNight){


        body.classList.add(
        "night"
        );


        createStars();


    }



    /*
    WEATHER BASED THEMES
    */


    else{


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
        code===45 ||
        code===48
        ){


            body.classList.add(
            "cloudy"
            );


            createCloudParticles();


        }



        else if(
        code>=51 &&
        code<=67 ||
        code>=80 &&
        code<=82
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


}




/*==========================================================
 REMOVE OLD EFFECTS
==========================================================*/


function clearWeatherParticles(){


    const container =
    document.querySelector(
    ".weather-particles"
    );


    if(container){

        container.innerHTML="";

    }


}




/*==========================================================
 STAR EFFECT NIGHT
==========================================================*/


function createStars(){


    const container =
    document.querySelector(
    ".weather-particles"
    );


    if(!container)
    return;



    for(
    let i=0;i<80;i++
    ){


        const star =
        document.createElement(
        "span"
        );


        star.style.position="absolute";

        star.style.width="3px";

        star.style.height="3px";

        star.style.background="white";

        star.style.borderRadius="50%";

        star.style.left=
        Math.random()*100+"%";


        star.style.top=
        Math.random()*100+"%";


        star.style.opacity=
        Math.random();



        container.appendChild(star);


    }


}




/*==========================================================
 SUN EFFECT
==========================================================*/


function createSunGlow(){


    const icon =
    document.getElementById(
    "weatherIcon"
    );


    if(icon){

        icon.classList.add(
        "sun-glow"
        );

    }


}





/*==========================================================
 CLOUD PARTICLES
==========================================================*/


function createCloudParticles(){


    const container =
    document.querySelector(
    ".weather-particles"
    );


    if(!container)
    return;



    for(
    let i=0;i<5;i++
    ){


        const cloud =
        document.createElement(
        "div"
        );


        cloud.className=
        "floating-cloud";


        cloud.style.top=
        Math.random()*80+"%";


        cloud.style.animationDuration=
        40+i*10+"s";


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
    let i=0;i<120;i++
    ){


        const drop =
        document.createElement(
        "span"
        );


        drop.className=
        "rain-drop";


        drop.style.left=
        Math.random()*100+"%";


        drop.style.animationDuration=
        (
        .5+
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
    let i=0;i<70;i++
    ){


        const snow =
        document.createElement(
        "span"
        );


        snow.style.position=
        "absolute";


        snow.style.width=
        "8px";


        snow.style.height=
        "8px";


        snow.style.background=
        "white";


        snow.style.borderRadius=
        "50%";


        snow.style.left=
        Math.random()*100+"%";


        snow.style.top=
        "-20px";


        snow.style.animation=
        `snowFall ${5+
        Math.random()*5}s linear infinite`;



        container.appendChild(
        snow
        );

    }


}




/*==========================================================
 THUNDER EFFECT
==========================================================*/


function createLightning(){


    setInterval(()=>{


        document.body.style.filter=
        "brightness(1.4)";


        setTimeout(()=>{


            document.body.style.filter=
            "brightness(1)";


        },150);


    },5000);


}





/*==========================================================
 OVERRIDE WEATHER LOADER
==========================================================*/


const oldWeatherThemeLoader =
window.loadWeather;



window.loadWeather =
async function(){


    await oldWeatherThemeLoader();



    if(weatherState.data){


        updateDynamicBackground(
        weatherState.data
        );


    }


};
