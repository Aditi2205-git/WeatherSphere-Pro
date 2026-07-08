/*=========================================================
 WeatherSphere Pro 4.0
 Premium Weather Dashboard
 Main JavaScript
=========================================================*/


"use strict";





/*=========================================================
 GLOBAL CONFIGURATION
=========================================================*/


const APP_CONFIG = {


    api: {


        weather:
        "https://api.open-meteo.com/v1/forecast",


        geo:
        "https://geocoding-api.open-meteo.com/v1/search",


        air:
        "https://air-quality-api.open-meteo.com/v1/air-quality"


    },


    defaults:{


        city:
        "Delhi",


        latitude:
        28.6139,


        longitude:
        77.2090


    },


    settings:{


        temperatureUnit:
        "celsius",


        theme:
        "light",


        autoLocation:
        true


    }


};








/*=========================================================
 APPLICATION STATE
=========================================================*/


const WeatherState = {


    currentLocation:{


        city:
        APP_CONFIG.defaults.city,


        latitude:
        APP_CONFIG.defaults.latitude,


        longitude:
        APP_CONFIG.defaults.longitude


    },



    weatherData:null,


    airQualityData:null,


    favorites:
    JSON.parse(
        localStorage.getItem("favorites")
    ) || [],



    recentSearches:
    JSON.parse(
        localStorage.getItem("recentSearches")
    ) || [],



    unit:
    localStorage.getItem("unit")
    || "celsius",



    theme:
    localStorage.getItem("theme")
    || "light"


};








/*=========================================================
 DOM ELEMENT CACHE
=========================================================*/


const DOM = {


    loader:
    document.getElementById("loader"),



    menuToggle:
    document.getElementById("menuToggle"),



    sidebar:
    document.querySelector(".sidebar"),



    searchInput:
    document.getElementById("searchInput"),



    searchSuggestions:
    document.getElementById("searchSuggestions"),



    currentLocationBtn:
    document.getElementById("currentLocationBtn"),



    themeToggle:
    document.getElementById("themeToggle"),



    unitToggle:
    document.getElementById("unitToggle"),



    refreshBtn:
    document.getElementById("refreshWeather"),



    currentCity:
    document.getElementById("currentCity"),



    temperature:
    document.getElementById("currentTemperature"),



    weatherCondition:
    document.getElementById("weatherCondition"),



    weatherDescription:
    document.getElementById("weatherDescription"),



    weatherIcon:
    document.getElementById("weatherIcon"),



    lastUpdated:
    document.getElementById("lastUpdated"),



    hourlyContainer:
    document.getElementById("hourlyContainer"),



    forecastContainer:
    document.getElementById("forecastContainer"),



    favoritesContainer:
    document.getElementById("favoritesContainer"),



    recentContainer:
    document.getElementById("recentSearchContainer"),



    alertContainer:
    document.getElementById("alertContainer")


};








/*=========================================================
 APPLICATION START
=========================================================*/


document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);







async function initializeApp(){



    console.log(
        "WeatherSphere Pro 4.0 Started"
    );



    loadSavedSettings();



    initializeAnimations();



    initializeEventListeners();



    await detectUserLocation();



    await loadWeatherData();



    await loadAirQuality();



    renderFavorites();



    renderRecentSearches();



    hideLoader();



}








/*=========================================================
 LOAD SAVED SETTINGS
=========================================================*/


function loadSavedSettings(){



    document.body.classList.toggle(

        "dark",

        WeatherState.theme === "dark"

    );



    updateUnitButton();



}








/*=========================================================
 HIDE LOADER
=========================================================*/


function hideLoader(){



    setTimeout(()=>{


        if(DOM.loader){


            DOM.loader.classList.add(
                "hide"
            );


        }



    },800);


}








/*=========================================================
 INITIALIZE ANIMATIONS
=========================================================*/


function initializeAnimations(){



    if(typeof AOS !== "undefined"){


        AOS.init({

            duration:800,

            once:true

        });


    }


}
/*=========================================================
 EVENT LISTENERS
=========================================================*/


function initializeEventListeners(){



    /* Mobile Sidebar */

    if(DOM.menuToggle){


        DOM.menuToggle.addEventListener(

            "click",

            ()=>{


                DOM.sidebar.classList.toggle(
                    "active"
                );


            }

        );


    }






    /* Theme Toggle */


    if(DOM.themeToggle){


        DOM.themeToggle.addEventListener(

            "click",

            toggleTheme

        );


    }







    /* Unit Toggle */


    if(DOM.unitToggle){


        DOM.unitToggle.addEventListener(

            "click",

            toggleTemperatureUnit

        );


    }








    /* Refresh Weather */


    if(DOM.refreshBtn){


        DOM.refreshBtn.addEventListener(

            "click",

            async()=>{


                await loadWeatherData();


                await loadAirQuality();


            }


        );


    }








    /* Current Location */


    if(DOM.currentLocationBtn){


        DOM.currentLocationBtn.addEventListener(

            "click",

            detectUserLocation

        );


    }








    /* Search Input */


    if(DOM.searchInput){


        DOM.searchInput.addEventListener(

            "input",

            handleSearchInput

        );


        DOM.searchInput.addEventListener(

            "keydown",

            handleSearchEnter

        );


    }


}








/*=========================================================
 THEME SYSTEM
=========================================================*/


function toggleTheme(){



    const isDark =
    document.body.classList.toggle(
        "dark"
    );



    WeatherState.theme =
    isDark
    ? "dark"
    : "light";



    localStorage.setItem(

        "theme",

        WeatherState.theme

    );



    updateThemeIcon();


}








function updateThemeIcon(){



    if(!DOM.themeToggle)
    return;



    const icon =
    DOM.themeToggle.querySelector(
        "span"
    );



    if(icon){


        icon.textContent =
        WeatherState.theme === "dark"

        ? "light_mode"

        : "dark_mode";


    }


}









/*=========================================================
 TEMPERATURE UNIT SYSTEM
=========================================================*/


function toggleTemperatureUnit(){



    WeatherState.unit =

    WeatherState.unit === "celsius"

    ? "fahrenheit"

    : "celsius";



    localStorage.setItem(

        "unit",

        WeatherState.unit

    );



    updateUnitButton();



    if(WeatherState.weatherData){


        renderWeather(
            WeatherState.weatherData
        );


    }



}








function updateUnitButton(){



    if(!DOM.unitToggle)
    return;



    DOM.unitToggle.textContent =


    WeatherState.unit === "celsius"

    ? "°C"

    : "°F";


}








/*=========================================================
 LOCATION DETECTION
=========================================================*/


async function detectUserLocation(){



    if(
        !navigator.geolocation ||
        !APP_CONFIG.settings.autoLocation
    ){


        return;


    }




    navigator.geolocation.getCurrentPosition(

        async(position)=>{


            const {

                latitude,

                longitude

            } = position.coords;




            WeatherState.currentLocation.latitude =
            latitude;



            WeatherState.currentLocation.longitude =
            longitude;




            await reverseGeocode(

                latitude,

                longitude

            );



            await loadWeatherData();



            await loadAirQuality();



        },



        error=>{


            console.warn(

                "Location access denied"

            );


        }


    );


}








/*=========================================================
 REVERSE GEOCODING
=========================================================*/


async function reverseGeocode(

    latitude,

    longitude

){



    try{


        const response =
        await fetch(

            `https://geocoding-api.open-meteo.com/v1/search?name=${WeatherState.currentLocation.city}&count=1`

        );



        const data =
        await response.json();



        if(data.results?.length){



            WeatherState.currentLocation.city =
            data.results[0].name;


        }



    }

    catch(error){


        console.error(
            error
        );


    }


}
/*=========================================================
 SEARCH SYSTEM
=========================================================*/


async function handleSearchInput(e){



    const query =
    e.target.value.trim();



    if(query.length < 2){


        DOM.searchSuggestions.innerHTML =
        "";


        return;


    }




    try{


        const response =
        await fetch(

            `${APP_CONFIG.api.geo}?name=${query}&count=5`

        );



        const data =
        await response.json();




        renderSearchSuggestions(

            data.results || []

        );



    }


    catch(error){


        console.error(

            "Search Error",

            error

        );


    }


}








function renderSearchSuggestions(results){



    DOM.searchSuggestions.innerHTML =
    "";



    results.forEach(place=>{


        const item =
        document.createElement(
            "div"
        );



        item.className =
        "search-result";



        item.innerHTML = `

            <span class="material-symbols-rounded">
                location_on
            </span>

            <div>

                <strong>
                    ${place.name}
                </strong>

                <small>
                    ${place.country || ""}
                </small>

            </div>

        `;



        item.addEventListener(

            "click",

            ()=>{


                selectLocation(place);


                DOM.searchSuggestions.innerHTML =
                "";


                DOM.searchInput.value =
                "";


            }

        );



        DOM.searchSuggestions.appendChild(
            item
        );


    });


}








async function handleSearchEnter(e){



    if(e.key !== "Enter")
    return;



    const query =
    e.target.value.trim();



    if(!query)
    return;



    await searchCity(query);


}








async function searchCity(city){



    try{


        const response =
        await fetch(

            `${APP_CONFIG.api.geo}?name=${city}&count=1`

        );



        const data =
        await response.json();



        if(data.results?.length){



            selectLocation(

                data.results[0]

            );


        }



    }

    catch(error){


        console.error(error);


    }


}








async function selectLocation(place){



    WeatherState.currentLocation = {


        city:
        place.name,


        latitude:
        place.latitude,


        longitude:
        place.longitude



    };




    saveRecentSearch(

        place

    );



    await loadWeatherData();


    await loadAirQuality();



}








/*=========================================================
 WEATHER API ENGINE
=========================================================*/


async function loadWeatherData(){



    const {

        latitude,

        longitude

    } = WeatherState.currentLocation;



    try{


        const url =

        `${APP_CONFIG.api.weather}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,visibility&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max&timezone=auto`;




        const response =
        await fetch(url);



        const data =
        await response.json();



        WeatherState.weatherData =
        data;



        renderWeather(data);



        renderHourlyForecast(data);



        renderDailyForecast(data);



        renderAstronomy(data);



    }



    catch(error){


        console.error(

            "Weather API Error",

            error

        );


    }


}
/*=========================================================
 CURRENT WEATHER RENDERING
=========================================================*/


function renderWeather(data){



    const current =
    data.current;



    if(!current)
    return;




    const temperature =
    convertTemperature(

        current.temperature_2m

    );




    const feelsLike =
    convertTemperature(

        current.apparent_temperature

    );




    const weather =
    getWeatherCondition(

        current.weather_code

    );





    /* Location */


    DOM.currentCity.textContent =

    WeatherState.currentLocation.city;





    /* Temperature */


    DOM.temperature.textContent =

    `${temperature}°`;



    const mainTemp =
    document.getElementById(
        "mainTemperature"
    );



    if(mainTemp){


        mainTemp.textContent =
        `${temperature}°`;


    }






    /* Condition */


    DOM.weatherCondition.textContent =

    weather.name;



    DOM.weatherDescription.textContent =

    weather.description;






    /* Weather Icon */


    DOM.weatherIcon.src =

    weather.icon;







    /* Details */


    updateElement(

        "feelsLike",

        `Feels like ${feelsLike}°`

    );



    updateElement(

        "humidityValue",

        `${current.relative_humidity_2m}%`

    );



    updateElement(

        "windValue",

        `${Math.round(current.wind_speed_10m)} km/h`

    );



    updateElement(

        "visibilityValue",

        `${Math.round(
            current.visibility / 1000
        )} km`

    );





    updateElement(

        "pressureValue",

        `${current.surface_pressure} hPa`

    );



    updateElement(

        "windDirection",

        getWindDirection(
            current.wind_direction_10m
        )

    );



    updateElement(

        "cloudCover",

        `${current.cloud_cover}%`

    );






    /* Update Time */


    updateElement(

        "lastUpdated",

        new Date()
        .toLocaleTimeString()

    );






    updateDynamicBackground(

        current.is_day,

        current.weather_code

    );


}








/*=========================================================
 ELEMENT UPDATE HELPER
=========================================================*/


function updateElement(id,value){



    const element =
    document.getElementById(id);



    if(element){


        element.textContent =
        value;


    }


}








/*=========================================================
 TEMPERATURE CONVERSION
=========================================================*/


function convertTemperature(value){



    if(
        WeatherState.unit === "fahrenheit"
    ){


        return Math.round(

            (value * 9/5) + 32

        );


    }



    return Math.round(value);


}








/*=========================================================
 WEATHER CODE MAPPING
=========================================================*/


function getWeatherCondition(code){



    const weatherMap = {


        0:{


            name:"Clear Sky",

            description:
            "Perfect sunny weather",

            icon:
            "assets/icons/clear.png"


        },


        1:{


            name:"Mainly Clear",

            description:
            "Mostly clear skies",

            icon:
            "assets/icons/partly-cloudy.png"


        },


        2:{


            name:"Partly Cloudy",

            description:
            "Clouds and sunshine",

            icon:
            "assets/icons/cloudy.png"


        },


        3:{


            name:"Overcast",

            description:
            "Cloudy conditions",

            icon:
            "assets/icons/cloud.png"


        },


        61:{


            name:"Rain",

            description:
            "Light rainfall",

            icon:
            "assets/icons/rain.png"


        },


        63:{


            name:"Heavy Rain",

            description:
            "Heavy rainfall expected",

            icon:
            "assets/icons/heavy-rain.png"


        },


        71:{


            name:"Snow",

            description:
            "Snowfall conditions",

            icon:
            "assets/icons/snow.png"


        },


        95:{


            name:"Thunderstorm",

            description:
            "Storm activity detected",

            icon:
            "assets/icons/storm.png"


        }



    };



    return (

        weatherMap[code]

        ||

        {


            name:"Unknown",

            description:
            "Weather data unavailable",

            icon:
            "assets/icons/weather.png"


        }

    );


}








/*=========================================================
 WIND DIRECTION
=========================================================*/


function getWindDirection(degree){



    const directions = [

        "N",

        "NE",

        "E",

        "SE",

        "S",

        "SW",

        "W",

        "NW"

    ];



    return directions[

        Math.round(degree / 45) % 8

    ];

}








/*=========================================================
 DYNAMIC WEATHER BACKGROUND
=========================================================*/


function updateDynamicBackground(

    isDay,

    code

){



    let background;



    if(!isDay){


        background =
        "linear-gradient(135deg,#020617,#1e293b)";


    }

    else if(code >= 60){


        background =
        "linear-gradient(135deg,#475569,#2563eb)";


    }

    else{


        background =
        "linear-gradient(135deg,#4f8ef7,#8b5cf6)";


    }



    const hero =
    document.querySelector(
        ".hero-banner"
    );



    if(hero){


        hero.style.background =
        background;


    }


}

/*=========================================================
 HOURLY FORECAST RENDERING
=========================================================*/


function renderHourlyForecast(data){



    if(!DOM.hourlyContainer)
    return;



    DOM.hourlyContainer.innerHTML =
    "";



    const hourly =
    data.hourly;



    if(!hourly)
    return;





    for(
        let i = 0;
        i < 24;
        i++
    ){



        const temperature =
        convertTemperature(

            hourly.temperature_2m[i]

        );



        const weather =
        getWeatherCondition(

            hourly.weather_code[i]

        );



        const time =
        new Date(

            hourly.time[i]

        )
        .toLocaleTimeString(

            [],
            {
                hour:"2-digit"
            }

        );




        const card =
        document.createElement(
            "div"
        );



        card.className =
        "hourly-card";



        card.innerHTML = `

            <p>
                ${time}
            </p>


            <img
                src="${weather.icon}"
                alt="${weather.name}">


            <h4>
                ${temperature}°
            </h4>


            <small>
                ${hourly.precipitation_probability[i] || 0}%
                rain
            </small>


        `;



        DOM.hourlyContainer.appendChild(
            card
        );

    }


}









/*=========================================================
 DAILY FORECAST RENDERING
=========================================================*/


function renderDailyForecast(data){



    if(!DOM.forecastContainer)
    return;



    DOM.forecastContainer.innerHTML =
    "";



    const daily =
    data.daily;



    if(!daily)
    return;





    for(
        let i = 0;
        i < daily.time.length;
        i++
    ){



        const weather =
        getWeatherCondition(

            daily.weather_code[i]

        );



        const max =
        convertTemperature(

            daily.temperature_2m_max[i]

        );



        const min =
        convertTemperature(

            daily.temperature_2m_min[i]

        );





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






        const card =
        document.createElement(
            "div"
        );



        card.className =
        "daily-card";



        card.innerHTML = `


            <div class="day">

                ${day}

            </div>



            <img

                src="${weather.icon}"

                alt="${weather.name}">



            <div class="condition">

                ${weather.name}

            </div>



            <div class="temperature">

                ${max}°

                <span>

                    ${min}°

                </span>

            </div>



        `;



        DOM.forecastContainer.appendChild(
            card
        );

    }


}








/*=========================================================
 ASTRONOMY RENDERING
=========================================================*/


function renderAstronomy(data){



    const daily =
    data.daily;



    if(!daily)
    return;




    updateElement(

        "sunriseTime",

        formatTime(
            daily.sunrise[0]
        )

    );



    updateElement(

        "sunsetTime",

        formatTime(
            daily.sunset[0]
        )

    );



    const sunrise =
    new Date(
        daily.sunrise[0]
    );



    const sunset =
    new Date(
        daily.sunset[0]
    );



    const difference =
    sunset - sunrise;



    const hours =
    Math.floor(

        difference /
        (1000*60*60)

    );



    const minutes =
    Math.floor(

        (
            difference %
            (1000*60*60)
        )
        /
        (1000*60)

    );



    updateElement(

        "dayLength",

        `${hours}h ${minutes}m`

    );



    updateElement(

        "moonPhase",

        calculateMoonPhase()

    );



    updateElement(

        "uvIndex",

        daily.uv_index_max[0]

    );


    updateElement(

        "uvStatus",

        getUVStatus(
            daily.uv_index_max[0]
        )

    );


}








/*=========================================================
 TIME FORMATTER
=========================================================*/


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








/*=========================================================
 UV STATUS
=========================================================*/


function getUVStatus(value){



    if(value < 3)

        return "Low";


    if(value < 6)

        return "Moderate";


    if(value < 8)

        return "High";


    return "Very High";


}








/*=========================================================
 SIMPLE MOON PHASE CALCULATION
=========================================================*/


function calculateMoonPhase(){



    const phases = [

        "New Moon",

        "Waxing Crescent",

        "First Quarter",

        "Waxing Gibbous",

        "Full Moon",

        "Waning Gibbous",

        "Last Quarter",

        "Waning Crescent"

    ];



    const date =
    new Date();



    const day =
    date.getDate();



    return phases[
        day % phases.length
    ];

}
/*=========================================================
 AIR QUALITY SYSTEM
=========================================================*/


async function loadAirQuality(){



    const {

        latitude,

        longitude

    } = WeatherState.currentLocation;



    try{


        const url =


        `${APP_CONFIG.api.air}?latitude=${latitude}&longitude=${longitude}&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi&timezone=auto`;




        const response =
        await fetch(url);



        const data =
        await response.json();



        WeatherState.airQualityData =
        data;



        renderAirQuality(data);



        generateHealthAdvice(data);



    }


    catch(error){


        console.error(

            "AQI Loading Error",

            error

        );


    }


}








/*=========================================================
 AQI RENDERING
=========================================================*/


function renderAirQuality(data){



    const hourly =
    data.hourly;



    if(!hourly)
    return;




    const index =
    hourly.us_aqi?.[0] || 0;



    updateElement(

        "aqiValue",

        index

    );



    updateElement(

        "aqiStatus",

        getAQIStatus(index)

    );



    updateElement(

        "pm25Value",

        `${hourly.pm2_5?.[0] || 0} μg/m³`

    );



    updateElement(

        "pm10Value",

        `${hourly.pm10?.[0] || 0} μg/m³`

    );



    updateElement(

        "coValue",

        `${hourly.carbon_monoxide?.[0] || 0}`

    );



    updateElement(

        "no2Value",

        `${hourly.nitrogen_dioxide?.[0] || 0}`

    );



    updateElement(

        "so2Value",

        `${hourly.sulphur_dioxide?.[0] || 0}`

    );



    updateElement(

        "o3Value",

        `${hourly.ozone?.[0] || 0}`

    );



}








function getAQIStatus(value){



    if(value <= 50)

        return "Good";



    if(value <= 100)

        return "Moderate";



    if(value <= 150)

        return "Unhealthy for Sensitive Groups";



    if(value <= 200)

        return "Unhealthy";



    if(value <= 300)

        return "Very Unhealthy";



    return "Hazardous";


}








/*=========================================================
 HEALTH & ACTIVITY ADVISOR
=========================================================*/


function generateHealthAdvice(data){



    const container =
    document.querySelector(
        ".health-grid"
    );



    if(!container)
    return;



    const aqi =
    data.hourly.us_aqi?.[0] || 0;




    let advice = [];





    if(aqi < 50){


        advice = [

            {

                icon:"directions_run",

                title:"Outdoor Exercise",

                text:
                "Excellent air quality. Perfect for running and outdoor activities."

            },


            {

                icon:"wb_sunny",

                title:"Sun Exposure",

                text:
                "Enjoy outdoor sunlight with normal protection."

            },


            {

                icon:"pedal_bike",

                title:"Cycling",

                text:
                "Good conditions for cycling and walking."

            }

        ];


    }

    else {


        advice = [

            {

                icon:"masks",

                title:"Wear Protection",

                text:
                "Consider wearing a mask outdoors."

            },


            {

                icon:"home",

                title:"Indoor Activity",

                text:
                "Prefer indoor workouts during poor air quality."

            },


            {

                icon:"water_drop",

                title:"Stay Hydrated",

                text:
                "Drink enough water and protect your health."

            }


        ];


    }






    container.innerHTML =
    "";



    advice.forEach(item=>{


        const card =
        document.createElement(
            "div"
        );



        card.className =
        "health-card";



        card.innerHTML = `


            <span class="material-symbols-rounded">

                ${item.icon}

            </span>



            <h4>

                ${item.title}

            </h4>



            <p>

                ${item.text}

            </p>


        `;



        container.appendChild(card);


    });


}








/*=========================================================
 FAVORITES SYSTEM
=========================================================*/


function addFavorite(place){



    const exists =
    WeatherState.favorites.some(

        city =>
        city.name === place.name

    );



    if(exists)
    return;




    WeatherState.favorites.push(place);



    localStorage.setItem(

        "favorites",

        JSON.stringify(
            WeatherState.favorites
        )

    );



    renderFavorites();


}








function renderFavorites(){



    if(!DOM.favoritesContainer)
    return;




    DOM.favoritesContainer.innerHTML =
    "";



    WeatherState.favorites.forEach(city=>{


        const card =
        document.createElement(
            "div"
        );



        card.className =
        "favorite-card";



        card.innerHTML = `


            <div class="city">

                ${city.name}

            </div>


            <p>

                Saved location

            </p>


            <button>

                Open

            </button>


        `;




        card.querySelector("button")
        .addEventListener(

            "click",

            ()=>{


                selectLocation(city);


            }

        );



        DOM.favoritesContainer.appendChild(card);


    });


}








/*=========================================================
 RECENT SEARCH STORAGE
=========================================================*/


function saveRecentSearch(place){



    WeatherState.recentSearches =

    WeatherState.recentSearches.filter(

        item =>
        item.name !== place.name

    );



    WeatherState.recentSearches.unshift(

        place

    );



    WeatherState.recentSearches =

    WeatherState.recentSearches.slice(
        0,
        6
    );



    localStorage.setItem(

        "recentSearches",

        JSON.stringify(
            WeatherState.recentSearches
        )

    );



    renderRecentSearches();


}








function renderRecentSearches(){



    if(!DOM.recentContainer)
    return;




    DOM.recentContainer.innerHTML =
    "";



    WeatherState.recentSearches.forEach(city=>{


        const item =
        document.createElement(
            "div"
        );



        item.className =
        "recent-city";



        item.innerHTML = `

            <span class="material-symbols-rounded">
                history
            </span>


            ${city.name}

        `;



        item.onclick =
        ()=>selectLocation(city);



        DOM.recentContainer.appendChild(item);


    });


}
/*=========================================================
 WEATHER CHART SYSTEM (CHART.JS)
=========================================================*/


let temperatureChart = null;

let precipitationChart = null;






function initializeCharts(){



    if(
        !WeatherState.weatherData ||
        typeof Chart === "undefined"
    )
    return;



    const hourly =
    WeatherState.weatherData.hourly;




    const labels =
    hourly.time
    .slice(0,24)
    .map(time=>{


        return new Date(time)
        .toLocaleTimeString(

            [],

            {

                hour:"2-digit"

            }

        );


    });






    const temperatures =

    hourly.temperature_2m
    .slice(0,24)
    .map(value=>

        convertTemperature(value)

    );





    const precipitation =

    hourly.precipitation_probability
    .slice(0,24);






    const tempCanvas =
    document.getElementById(
        "temperatureChart"
    );



    const rainCanvas =
    document.getElementById(
        "rainChart"
    );






    if(tempCanvas){



        if(temperatureChart)

            temperatureChart.destroy();




        temperatureChart =

        new Chart(

            tempCanvas,

            {


                type:"line",


                data:{


                    labels,


                    datasets:[

                        {


                            label:
                            "Temperature",


                            data:
                            temperatures,


                            tension:
                            0.4,


                            fill:true


                        }


                    ]


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








    if(rainCanvas){



        if(precipitationChart)

            precipitationChart.destroy();




        precipitationChart =

        new Chart(

            rainCanvas,

            {


                type:"bar",


                data:{


                    labels,


                    datasets:[

                        {


                            label:
                            "Rain Probability %",


                            data:
                            precipitation


                        }


                    ]


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



}








/*=========================================================
 LEAFLET WEATHER MAP
=========================================================*/


let weatherMap = null;



let mapMarker = null;







function initializeMap(){



    const mapElement =
    document.getElementById(
        "weatherMap"
    );



    if(
        !mapElement ||
        typeof L === "undefined"
    )
    return;





    const {

        latitude,

        longitude

    } =
    WeatherState.currentLocation;





    weatherMap =

    L.map(
        "weatherMap"
    )

    .setView(

        [
            latitude,
            longitude
        ],

        8

    );






    L.tileLayer(

        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",

        {

            attribution:
            "OpenStreetMap"

        }

    )

    .addTo(weatherMap);






    mapMarker =

    L.marker(

        [

            latitude,

            longitude

        ]

    )

    .addTo(weatherMap);



}








function updateMapLocation(){



    if(
        !weatherMap ||
        !mapMarker
    )
    return;





    const {

        latitude,

        longitude

    } =
    WeatherState.currentLocation;





    weatherMap.setView(

        [

            latitude,

            longitude

        ],

        8

    );




    mapMarker.setLatLng(

        [

            latitude,

            longitude

        ]

    );


}








/*=========================================================
 WEATHER ALERT SYSTEM
=========================================================*/


function generateWeatherAlerts(){



    if(!DOM.alertContainer)
    return;




    const current =
    WeatherState.weatherData?.current;



    if(!current)
    return;





    let alert = null;





    if(current.wind_speed_10m > 50){


        alert = {

            title:
            "Strong Wind Alert",

            message:
            "High wind speeds detected. Stay cautious outdoors."

        };


    }






    if(current.precipitation > 20){


        alert = {

            title:
            "Rain Alert",

            message:
            "Rain activity detected in your area."

        };


    }






    if(!alert){


        DOM.alertContainer.innerHTML = `


            <div class="no-alert">


                <span class="material-symbols-rounded">

                    check_circle

                </span>


                <p>

                    No active weather alerts

                </p>


            </div>


        `;


        return;


    }






    DOM.alertContainer.innerHTML = `


        <div class="weather-alert">


            <h4>

                ${alert.title}

            </h4>



            <p>

                ${alert.message}

            </p>



        </div>


    `;


}








/*=========================================================
 FINAL WEATHER UPDATE PIPELINE
=========================================================*/


async function refreshDashboard(){



    await loadWeatherData();



    await loadAirQuality();



    initializeCharts();



    generateWeatherAlerts();



    updateMapLocation();



}








/*=========================================================
 AUTO START ADVANCED MODULES
=========================================================*/


window.addEventListener(

    "load",

    ()=>{


        setTimeout(()=>{


            initializeCharts();


            initializeMap();


            generateWeatherAlerts();



        },1000);



    }

);
/*=========================================================
 NOTIFICATION PANEL
=========================================================*/


function initializeNotifications(){



    const openBtn =
    document.getElementById(
        "notificationBtn"
    );



    const closeBtn =
    document.getElementById(
        "closeNotification"
    );



    const panel =
    document.getElementById(
        "notificationPanel"
    );



    if(
        !panel
    )
    return;





    if(openBtn){


        openBtn.addEventListener(

            "click",

            ()=>{


                panel.classList.add(
                    "active"
                );


            }

        );


    }






    if(closeBtn){


        closeBtn.addEventListener(

            "click",

            ()=>{


                panel.classList.remove(
                    "active"
                );


            }

        );


    }


}








/*=========================================================
 ADD FAVORITE BUTTON
=========================================================*/


function initializeFavorites(){



    const button =
    document.getElementById(
        "addFavoriteBtn"
    );



    if(!button)
    return;





    button.addEventListener(

        "click",

        ()=>{


            const location = {


                name:
                WeatherState.currentLocation.city,


                latitude:
                WeatherState.currentLocation.latitude,


                longitude:
                WeatherState.currentLocation.longitude


            };




            addFavorite(location);



        }

    );


}








/*=========================================================
 SETTINGS CONTROLS
=========================================================*/


function initializeSettings(){



    const themeBtn =
    document.getElementById(
        "settingsThemeToggle"
    );



    const unitBtn =
    document.getElementById(
        "settingsUnitToggle"
    );



    const locationBtn =
    document.getElementById(
        "locationToggle"
    );






    if(themeBtn){



        themeBtn.addEventListener(

            "click",

            ()=>{


                themeBtn.classList.toggle(
                    "active"
                );


                toggleTheme();


            }

        );


    }







    if(unitBtn){



        unitBtn.addEventListener(

            "click",

            ()=>{


                toggleTemperatureUnit();


            }

        );


    }






    if(locationBtn){



        locationBtn.addEventListener(

            "click",

            ()=>{


                locationBtn.classList.toggle(
                    "active"
                );


                APP_CONFIG.settings.autoLocation =

                !APP_CONFIG.settings.autoLocation;


            }

        );


    }



}








/*=========================================================
 SCROLL TO TOP
=========================================================*/


function initializeScrollButton(){



    const button =
    document.getElementById(
        "scrollTopBtn"
    );



    if(!button)
    return;






    window.addEventListener(

        "scroll",

        ()=>{


            if(window.scrollY > 400){


                button.classList.add(
                    "show"
                );


            }

            else{


                button.classList.remove(
                    "show"
                );


            }


        }

    );






    button.addEventListener(

        "click",

        ()=>{


            window.scrollTo({

                top:0,

                behavior:"smooth"

            });


        }

    );


}








/*=========================================================
 SEARCH CLICK OUTSIDE
=========================================================*/


document.addEventListener(

    "click",

    (event)=>{


        if(

            DOM.searchSuggestions &&

            !event.target.closest(
                ".search-box"
            )

        ){


            DOM.searchSuggestions.innerHTML =
            "";


        }


    }

);








/*=========================================================
 ERROR HANDLER
=========================================================*/


function showError(message){



    console.error(

        message

    );



    const notification =
    document.getElementById(
        "notificationContent"
    );



    if(notification){


        notification.innerHTML = `


            <div class="weather-alert">

                ${message}

            </div>


        `;


    }


}








/*=========================================================
 FINAL APPLICATION BOOTSTRAP
=========================================================*/


window.addEventListener(

    "DOMContentLoaded",

    ()=>{



        initializeNotifications();



        initializeFavorites();



        initializeSettings();



        initializeScrollButton();




    }

);








/*=========================================================
 WEATHERSPHERE PRO READY
=========================================================*/


console.log(

    "%c WeatherSphere Pro 4.0 Loaded Successfully ",

    "background:#4f8ef7;color:white;font-size:16px;padding:10px"

);
