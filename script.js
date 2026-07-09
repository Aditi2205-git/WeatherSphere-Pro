/*=========================================================
    WeatherSphere Pro 4.0
    Open-Meteo Edition
    No API Key Required
=========================================================*/

"use strict";


/*=========================================================
    CONFIGURATION
=========================================================*/


const CONFIG = {

    WEATHER_API:
    "https://api.open-meteo.com/v1/forecast",

    GEO_API:
    "https://geocoding-api.open-meteo.com/v1/search",

    AIR_API:
    "https://air-quality-api.open-meteo.com/v1/air-quality",

    DEFAULT_CITY:
    "New Delhi"

};



/*=========================================================
    APPLICATION STATE
=========================================================*/


const appState = {


    city:
    CONFIG.DEFAULT_CITY,


    latitude:
    null,


    longitude:
    null,


    weather:
    null,


    forecast:
    null,


    air:
    null,


    favorites:
    [],


    history:
    [],


    charts:
    {},


    map:
    null,


    marker:
    null,


    theme:
    "dark"


};





/*=========================================================
    DOM HELPER FUNCTIONS
=========================================================*/


const get = (id) =>

document.getElementById(id);



const query = (selector)=>

document.querySelector(selector);





function setText(id,value){


    const element=get(id);


    if(element){

        element.textContent=value;

    }

}





function setHTML(id,value){


    const element=get(id);


    if(element){

        element.innerHTML=value;

    }

}





function show(element){


    if(element){

        element.style.display="flex";

    }

}





function hide(element){


    if(element){

        element.style.display="none";

    }

}





/*=========================================================
    DOM REFERENCES
=========================================================*/


const DOM={


    searchInput:
    get("cityInput"),


    searchBtn:
    get("searchBtn"),


    locationBtn:
    get("locationBtn"),


    voiceBtn:
    get("voiceBtn"),


    refreshBtn:
    get("refreshBtn"),


    themeBtn:
    get("themeToggle"),


    toast:
    get("toast"),


    toastMessage:
    get("toastMessage"),


    loader:
    get("loader")


};





/*=========================================================
    TOAST MESSAGE
=========================================================*/


function toast(message){


    if(!DOM.toast)
    return;



    if(DOM.toastMessage)

    DOM.toastMessage.textContent=message;



    DOM.toast.classList.add("show");



    setTimeout(()=>{


        DOM.toast.classList.remove("show");


    },3000);


}





/*=========================================================
    LOADING
=========================================================*/


function hideLoader(){


    if(!DOM.loader)
    return;



    DOM.loader.style.opacity="0";


    setTimeout(()=>{


        DOM.loader.style.display="none";


    },500);


}





/*=========================================================
    LOCAL STORAGE
=========================================================*/


function loadStorage(){


    appState.favorites =

    JSON.parse(

        localStorage.getItem(
            "weatherFavorites"
        )

    ) || [];



    appState.history =

    JSON.parse(

        localStorage.getItem(
            "weatherHistory"
        )

    ) || [];



    appState.theme =

    localStorage.getItem(
        "weatherTheme"
    )

    || "dark";


}





function saveStorage(){


    localStorage.setItem(

        "weatherFavorites",

        JSON.stringify(

            appState.favorites

        )

    );



    localStorage.setItem(

        "weatherHistory",

        JSON.stringify(

            appState.history

        )

    );



    localStorage.setItem(

        "weatherTheme",

        appState.theme

    );


}





/*=========================================================
    HISTORY
=========================================================*/


function addHistory(city){


    if(!city)
    return;



    appState.history =

    appState.history.filter(

        item=>item!==city

    );



    appState.history.unshift(city);



    appState.history =

    appState.history.slice(0,10);



    saveStorage();


}





/*=========================================================
    FAVORITES
=========================================================*/


function addFavorite(city){


    if(

        !city ||

        appState.favorites.includes(city)

    )

    return;



    appState.favorites.push(city);



    saveStorage();



    toast(

        "Added to favorites ❤️"

    );


}





function removeFavorite(city){


    appState.favorites =

    appState.favorites.filter(

        item=>item!==city

    );



    saveStorage();


}





/*=========================================================
    FORMATTERS
=========================================================*/


function temperature(value){


    return Math.round(value)+"°";


}





function time(timestamp){


    return new Date(timestamp)

    .toLocaleTimeString(

        "en-US",

        {

            hour:"2-digit",

            minute:"2-digit"

        }

    );


}





function date(value){


    return new Date(value)

    .toLocaleDateString(

        "en-US",

        {

            weekday:"long",

            month:"short",

            day:"numeric"

        }

    );


}





/*=========================================================
    WEATHER ICON SYSTEM
=========================================================*/


function weatherEmoji(code){


    const map={


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

        96:"⚡",

        99:"⚡"


    };


    return map[code] || "🌍";


}





/*=========================================================
    INITIAL SETUP
=========================================================*/


document.addEventListener(

"DOMContentLoaded",

()=>{


    loadStorage();


    hideLoader();


    console.log(

        "🌦️ WeatherSphere Pro 4.0 Ready"

    );


}

);
/*=========================================================
    CITY GEOCODING
=========================================================*/


async function getCoordinates(city){


    const url =

    `${CONFIG.GEO_API}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;



    const response = await fetch(url);


    const data = await response.json();



    if(!data.results || data.results.length===0){

        throw new Error(
            "City not found"
        );

    }



    return data.results[0];

}





/*=========================================================
    FETCH WEATHER DATA
=========================================================*/


async function fetchWeather(lat,lon){


    const url =

    `${CONFIG.WEATHER_API}?

latitude=${lat}

&longitude=${lon}

&current=

temperature_2m,

relative_humidity_2m,

apparent_temperature,

is_day,

precipitation,

weather_code,

wind_speed_10m,

surface_pressure

&hourly=

temperature_2m,

relative_humidity_2m,

wind_speed_10m,

precipitation_probability

&daily=

weather_code,

temperature_2m_max,

temperature_2m_min,

sunrise,

sunset,

uv_index_max

&timezone=auto`;



    const response = await fetch(

        url.replace(/\s+/g,"")

    );


    return await response.json();


}





/*=========================================================
    SEARCH WEATHER BY CITY
=========================================================*/


async function searchCity(city){


    try{


        toast(

            "Fetching weather..."

        );



        const location =

        await getCoordinates(city);



        const weather =

        await fetchWeather(

            location.latitude,

            location.longitude

        );



        appState.city =

        location.name;



        appState.latitude =

        location.latitude;



        appState.longitude =

        location.longitude;



        appState.weather = weather;



        addHistory(

            location.name

        );



        renderCurrentWeather();



        renderHourlyForecast();



        renderDailyForecast();



        updateMap();



    }


    catch(error){


        console.error(error);



        toast(

            "Unable to find city"

        );


    }


}





/*=========================================================
    CURRENT LOCATION
=========================================================*/


function getUserLocation(){


    if(!navigator.geolocation){


        toast(

            "Location not supported"

        );


        return;

    }



    navigator.geolocation.getCurrentPosition(

        async(position)=>{


            try{


                const lat =

                position.coords.latitude;



                const lon =

                position.coords.longitude;



                const weather =

                await fetchWeather(

                    lat,

                    lon

                );



                appState.latitude=lat;

                appState.longitude=lon;

                appState.weather=weather;



                appState.city="Your Location";



                renderCurrentWeather();


                renderHourlyForecast();


                renderDailyForecast();


                updateMap();



            }

            catch(error){


                toast(

                    "Location weather failed"

                );

            }


        },

        ()=>{


            toast(

                "Location permission denied"

            );


        }

    );


}





/*=========================================================
    CURRENT WEATHER RENDER
=========================================================*/


function renderCurrentWeather(){


    const data =

    appState.weather;



    if(!data)
    return;



    const current =

    data.current;



    const daily =

    data.daily;



    setText(

        "cityName",

        appState.city

    );



    setText(

        "heroCity",

        appState.city

    );



    setText(

        "temperature",

        temperature(

            current.temperature_2m

        )

    );



    setText(

        "heroTemp",

        temperature(

            current.temperature_2m

        )

    );



    setText(

        "feelsLike",

        temperature(

            current.apparent_temperature

        )

    );



    setText(

        "humidity",

        current.relative_humidity_2m+"%"

    );



    setText(

        "windSpeed",

        current.wind_speed_10m+" km/h"

    );



    setText(

        "pressure",

        current.surface_pressure+" hPa"

    );



    setText(

        "weatherEmoji",

        weatherEmoji(

            current.weather_code

        )

    );



    setText(

        "weatherIcon",

        weatherEmoji(

            current.weather_code

        )

    );



    setText(

        "sunrise",

        time(

            new Date(

                daily.sunrise[0]

            )

        )

    );



    setText(

        "sunset",

        time(

            new Date(

                daily.sunset[0]

            )

        )

    );



    setText(

        "uvIndex",

        daily.uv_index_max[0]

    );



}





/*=========================================================
    SEARCH EVENTS
=========================================================*/


DOM.searchBtn

?.addEventListener(

    "click",

    ()=>{


        const city =

        DOM.searchInput.value.trim();



        if(city)

        searchCity(city);


    }

);





DOM.searchInput

?.addEventListener(

    "keydown",

    (event)=>{


        if(event.key==="Enter"){


            searchCity(

                DOM.searchInput.value

            );


        }


    }

);





DOM.locationBtn

?.addEventListener(

    "click",

    getUserLocation

);





DOM.refreshBtn

?.addEventListener(

    "click",

    ()=>{


        if(

            appState.latitude &&

            appState.longitude

        ){


            fetchWeather(

                appState.latitude,

                appState.longitude

            )

            .then(data=>{


                appState.weather=data;


                renderCurrentWeather();


                renderHourlyForecast();


                renderDailyForecast();


            });


        }


    }

);
/*=========================================================
    WEATHER DESCRIPTION
=========================================================*/


function weatherDescription(code){


    const descriptions={


        0:"Clear Sky",

        1:"Mainly Clear",

        2:"Partly Cloudy",

        3:"Overcast",

        45:"Fog",

        48:"Depositing Rime Fog",

        51:"Light Drizzle",

        53:"Moderate Drizzle",

        55:"Heavy Drizzle",

        61:"Light Rain",

        63:"Moderate Rain",

        65:"Heavy Rain",

        71:"Light Snow",

        73:"Moderate Snow",

        75:"Heavy Snow",

        80:"Rain Showers",

        81:"Heavy Showers",

        82:"Violent Showers",

        95:"Thunderstorm",

        96:"Thunderstorm With Hail",

        99:"Thunderstorm With Heavy Hail"


    };


    return descriptions[code] || "Unknown";

}





/*=========================================================
    HOURLY FORECAST
=========================================================*/


function renderHourlyForecast(){


    const container =

    get("hourlyContainer")

    ||

    get("hourlyForecast");



    if(!container)

    return;



    const hourly =

    appState.weather?.hourly;



    if(!hourly)

    return;



    container.innerHTML="";



    for(let i=0;i<12;i++){


        const card=document.createElement("div");



        card.className=

        "hour-card";



        card.innerHTML=`

            <h4>

            ${new Date(

                hourly.time[i]

            )

            .toLocaleTimeString(

                "en-US",

                {

                    hour:"numeric"

                }

            )}

            </h4>


            <div class="forecast-icon">

            ${weatherEmoji(

                appState.weather.hourly.weather_code

                ?

                appState.weather.hourly.weather_code[i]

                :

                0

            )}

            </div>


            <h3>

            ${temperature(

                hourly.temperature_2m[i]

            )}

            </h3>


            <p>

            💧 ${hourly.relative_humidity_2m[i]}%

            </p>


        `;



        container.appendChild(card);



    }


}





/*=========================================================
    DAILY FORECAST
=========================================================*/


function renderDailyForecast(){


    const container =

    get("forecastContainer")

    ||

    get("dailyForecast");



    if(!container)

    return;



    const daily =

    appState.weather?.daily;



    if(!daily)

    return;



    container.innerHTML="";



    for(let i=0;i<7;i++){



        const card=document.createElement("div");



        card.className=

        "forecast-card";



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


            <div class="forecast-icon">

            ${weatherEmoji(

                daily.weather_code[i]

            )}

            </div>


            <h2>

            ${temperature(

                daily.temperature_2m_max[i]

            )}

            </h2>


            <p>

            Low:

            ${temperature(

                daily.temperature_2m_min[i]

            )}

            </p>


            <span>

            ${weatherDescription(

                daily.weather_code[i]

            )}

            </span>


        `;



        container.appendChild(card);


    }


}





/*=========================================================
    WEATHER BACKGROUND EFFECT
=========================================================*/


function updateWeatherBackground(){


    const code =

    appState.weather

    ?.current

    ?.weather_code;



    const body=document.body;



    if(!body)

    return;



    body.classList.remove(

        "clear",

        "rain",

        "storm",

        "cloud"

    );



    if(code===0 || code===1){


        body.classList.add(

            "clear"

        );


    }


    else if(

        code>=51 &&

        code<=82

    ){


        body.classList.add(

            "rain"

        );


    }


    else if(code>=95){


        body.classList.add(

            "storm"

        );


    }


    else{


        body.classList.add(

            "cloud"

        );


    }


}





/*=========================================================
    CONNECT WEATHER UPDATE
=========================================================*/


const oldWeatherRender =

renderCurrentWeather;



renderCurrentWeather=function(){


    oldWeatherRender();


    renderHourlyForecast();


    renderDailyForecast();


    updateWeatherBackground();


};

/*=========================================================
    AIR QUALITY FETCH (OPEN-METEO)
=========================================================*/


async function fetchAirQuality(lat, lon){


    try{


        const url =

        `${CONFIG.AIR_API}?

latitude=${lat}

&longitude=${lon}

&current=

us_aqi,

pm10,

pm2_5,

carbon_monoxide,

nitrogen_dioxide,

ozone

&timezone=auto`;



        const response = await fetch(

            url.replace(/\s+/g,"")

        );



        const data = await response.json();



        appState.air=data;



        renderAQI();



    }


    catch(error){


        console.error(

            "AQI Error",

            error

        );


    }


}





/*=========================================================
    AQI RENDER
=========================================================*/


function renderAQI(){


    const air =

    appState.air;



    if(!air || !air.current)

    return;



    const current=

    air.current;



    setText(

        "aqiValue",

        Math.round(

            current.us_aqi

        )

    );



    setText(

        "pm25",

        `${current.pm2_5} μg/m³`

    );



    setText(

        "pm10",

        `${current.pm10} μg/m³`

    );



    setText(

        "co",

        `${current.carbon_monoxide} μg/m³`

    );



    setText(

        "no2",

        `${current.nitrogen_dioxide} μg/m³`

    );



    setText(

        "ozone",

        `${current.ozone} μg/m³`

    );



    setText(

        "aqiStatus",

        getAQIStatus(

            current.us_aqi

        )

    );


}





/*=========================================================
    AQI STATUS
=========================================================*/


function getAQIStatus(value){


    if(value<=50)

        return "Good 🟢";


    if(value<=100)

        return "Moderate 🟡";


    if(value<=150)

        return "Unhealthy for Sensitive Groups 🟠";


    if(value<=200)

        return "Unhealthy 🔴";


    if(value<=300)

        return "Very Unhealthy 🟣";


    return "Hazardous ⚫";


}





/*=========================================================
    UV ANALYSIS
=========================================================*/


function renderUV(){


    const uv =

    appState.weather

    ?.daily

    ?.uv_index_max[0];



    if(uv===undefined)

    return;



    setText(

        "uvIndex",

        uv

    );



    setText(

        "uvStatus",

        getUVStatus(uv)

    );


}





function getUVStatus(value){


    if(value<=2)

        return "Low";


    if(value<=5)

        return "Moderate";


    if(value<=7)

        return "High";


    if(value<=10)

        return "Very High";


    return "Extreme";


}





/*=========================================================
    WEATHER INSIGHTS
=========================================================*/


function generateInsights(){


    const box =

    get("tipsContainer")

    ||

    get("weatherTips");



    if(!box)

    return;



    const current=

    appState.weather?.current;



    if(!current)

    return;



    let tips=[];



    const temp=

    current.temperature_2m;



    const humidity=

    current.relative_humidity_2m;



    const code=

    current.weather_code;



    if(temp>35){


        tips.push(

            "🥤 Stay hydrated. Temperature is high."

        );


    }



    if(temp<10){


        tips.push(

            "🧥 Wear warm clothes. Cold weather detected."

        );


    }



    if(humidity>70){


        tips.push(

            "💧 High humidity. Keep yourself comfortable."

        );


    }



    if(code>=51 && code<=82){


        tips.push(

            "☔ Rain expected. Carry an umbrella."

        );


    }



    if(code>=95){


        tips.push(

            "⚡ Thunderstorm possible. Stay alert."

        );


    }



    if(tips.length===0){


        tips.push(

            "🌍 Weather conditions are pleasant today."

        );


    }



    box.innerHTML="";



    tips.forEach(text=>{


        const item=document.createElement("div");


        item.className=

        "tip-card";



        item.textContent=text;



        box.appendChild(item);



    });



}





/*=========================================================
    WEATHER ALERTS
=========================================================*/


function generateAlerts(){


    const alertBox=

    get("alertContainer")

    ||

    get("weatherAlert");



    if(!alertBox)

    return;



    const code=

    appState.weather

    ?.current

    ?.weather_code;



    let message=

    "✅ No severe weather alerts";



    if(code>=95){


        message=

        "⚡ Thunderstorm warning. Stay safe.";


    }


    else if(code>=61 && code<=82){


        message=

        "🌧 Rain expected. Plan accordingly.";


    }



    alertBox.innerHTML=

    `

    <h3>

    Weather Alert

    </h3>


    <p>

    ${message}

    </p>

    `;


}





/*=========================================================
    UPDATE INTELLIGENCE
=========================================================*/


function updateWeatherIntelligence(){


    renderUV();


    generateInsights();


    generateAlerts();


}





/*=========================================================
    CONNECT WITH WEATHER DATA
=========================================================*/


const oldRender = renderCurrentWeather;



renderCurrentWeather=function(){


    oldRender();


    updateWeatherIntelligence();


    if(

        appState.latitude &&

        appState.longitude

    ){

        fetchAirQuality(

            appState.latitude,

            appState.longitude

        );

    }


};

/*=========================================================
    CHART.JS ANALYTICS SYSTEM
=========================================================*/


function renderCharts(){


    if(!appState.weather)

    return;



    createTemperatureChart();


    createHumidityChart();


    createWindChart();


    createRainChart();


}





/*=========================================================
    DESTROY OLD CHART
=========================================================*/


function destroyChart(name){


    if(appState.charts[name]){


        appState.charts[name].destroy();


        delete appState.charts[name];


    }


}





/*=========================================================
    CHART DATA PREPARATION
=========================================================*/


function getChartData(){


    const hourly =

    appState.weather.hourly;



    if(!hourly)

    return null;



    return {


        labels:

        hourly.time

        .slice(0,12)

        .map(time=>


            new Date(time)

            .toLocaleTimeString(

                "en-US",

                {

                    hour:"numeric"

                }

            )


        ),



        temperature:

        hourly.temperature_2m

        .slice(0,12),



        humidity:

        hourly.relative_humidity_2m

        .slice(0,12),



        wind:

        hourly.wind_speed_10m

        .slice(0,12),



        rain:

        hourly.precipitation_probability

        .slice(0,12)



    };


}





/*=========================================================
    COMMON OPTIONS
=========================================================*/


function chartOptions(title){


    return {


        responsive:true,


        maintainAspectRatio:false,



        plugins:{


            legend:{


                labels:{


                    color:"#ffffff"


                }


            },



            title:{


                display:true,


                text:title,


                color:"#ffffff"


            }


        },



        scales:{


            x:{


                ticks:{


                    color:"#aaa"


                }

            },



            y:{


                ticks:{


                    color:"#aaa"


                }

            }


        }


    };


}





/*=========================================================
    TEMPERATURE CHART
=========================================================*/


function createTemperatureChart(){


    const canvas=

    get("temperatureChart");



    if(!canvas)

    return;



    destroyChart(

        "temperature"

    );



    const data=getChartData();



    if(!data)

    return;



    appState.charts.temperature =

    new Chart(

        canvas,

        {


            type:"line",


            data:{


                labels:data.labels,



                datasets:[{


                    label:"Temperature °C",


                    data:data.temperature,


                    tension:.4,


                    fill:true,


                    borderColor:"#60a5fa"


                }]


            },



            options:

            chartOptions(

                "Temperature Forecast"

            )


        }

    );


}





/*=========================================================
    HUMIDITY CHART
=========================================================*/


function createHumidityChart(){


    const canvas=

    get("humidityChart");



    if(!canvas)

    return;



    destroyChart(

        "humidity"

    );



    const data=getChartData();



    if(!data)

    return;



    appState.charts.humidity =

    new Chart(

        canvas,

        {


            type:"bar",


            data:{


                labels:data.labels,



                datasets:[{


                    label:"Humidity %",


                    data:data.humidity,


                    backgroundColor:

                    "#8b5cf6"


                }]


            },


            options:

            chartOptions(

                "Humidity Forecast"

            )


        }

    );


}





/*=========================================================
    WIND CHART
=========================================================*/


function createWindChart(){


    const canvas=

    get("windChart");



    if(!canvas)

    return;



    destroyChart(

        "wind"

    );



    const data=getChartData();



    if(!data)

    return;



    appState.charts.wind =

    new Chart(

        canvas,

        {


            type:"line",


            data:{


                labels:data.labels,



                datasets:[{


                    label:"Wind km/h",


                    data:data.wind,


                    tension:.4,


                    borderColor:"#22c55e"


                }]


            },



            options:

            chartOptions(

                "Wind Speed"

            )


        }

    );


}





/*=========================================================
    RAIN CHART
=========================================================*/


function createRainChart(){


    const canvas=

    get("rainChart");



    if(!canvas)

    return;



    destroyChart(

        "rain"

    );



    const data=getChartData();



    if(!data)

    return;



    appState.charts.rain =

    new Chart(

        canvas,

        {


            type:"line",


            data:{


                labels:data.labels,



                datasets:[{


                    label:"Rain Probability %",


                    data:data.rain,


                    tension:.4,


                    borderColor:"#38bdf8"


                }]


            },



            options:

            chartOptions(

                "Rain Probability"

            )


        }

    );


}





/*=========================================================
    UPDATE CHARTS AFTER WEATHER LOAD
=========================================================*/


const oldRenderWeatherCharts =

renderCurrentWeather;



renderCurrentWeather=function(){


    oldRenderWeatherCharts();



    setTimeout(()=>{


        renderCharts();


    },300);


};
/*=========================================================
    LEAFLET WEATHER MAP SYSTEM
=========================================================*/


function initializeMap(){


    const mapElement =

    get("weatherMap");



    if(!mapElement)

    return;



    if(appState.map){

        return;

    }



    appState.map =

    L.map(

        "weatherMap",

        {

            zoomControl:true

        }

    )

    .setView(

        [

            appState.latitude || 28.6139,

            appState.longitude || 77.2090

        ],

        10

    );



    L.tileLayer(

        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",

        {


            maxZoom:19,


            attribution:

            "© OpenStreetMap"


        }

    )

    .addTo(

        appState.map

    );


}





/*=========================================================
    UPDATE MAP LOCATION
=========================================================*/


function updateMap(){


    if(

        !appState.latitude ||

        !appState.longitude

    )

    return;



    initializeMap();



    if(!appState.map)

    return;



    const position=[


        appState.latitude,


        appState.longitude


    ];



    appState.map.setView(

        position,

        10

    );



    updateMarker(position);


}





/*=========================================================
    MAP MARKER
=========================================================*/


function updateMarker(position){



    if(

        appState.marker

    ){


        appState.map.removeLayer(

            appState.marker

        );


    }



    const current=

    appState.weather?.current;



    const popup =

    `

    <div class="map-popup">


        <h3>

        ${appState.city}

        </h3>



        <h1>

        ${weatherEmoji(

            current?.weather_code

        )}

        </h1>



        <h2>

        ${temperature(

            current?.temperature_2m || 0

        )}

        </h2>



        <p>

        ${weatherDescription(

            current?.weather_code

        )}

        </p>


        <p>

        💧

        ${current?.relative_humidity_2m || 0}%

        </p>


    </div>

    `;



    appState.marker =

    L.marker(position)

    .addTo(

        appState.map

    )

    .bindPopup(

        popup

    )

    .openPopup();



}





/*=========================================================
    MAP RESIZE FIX
=========================================================*/


function refreshMap(){


    if(appState.map){


        setTimeout(()=>{


            appState.map.invalidateSize();


        },300);


    }


}





/*=========================================================
    WEATHER LAYER CONTROL
=========================================================*/


function addWeatherOverlay(){


    if(!appState.map)

    return;



    toast(

        "Weather overlay available with Open-Meteo compatible layers."

    );


}





/*=========================================================
    MAP BUTTONS
=========================================================*/


const mapRefresh =

get("mapRefreshBtn");



mapRefresh

?.addEventListener(

    "click",

    refreshMap

);



/*=========================================================
    CONNECT MAP WITH WEATHER UPDATE
=========================================================*/


const oldUpdateMap =

updateMap;



updateMap=function(){


    oldUpdateMap();


    refreshMap();


};
/*=========================================================
    FAVORITES UI SYSTEM
=========================================================*/


function renderFavorites(){


    const container =

    get("favoriteCities")

    ||

    get("favoritesContainer");



    if(!container)

    return;



    container.innerHTML="";



    if(appState.favorites.length===0){


        container.innerHTML=

        `

        <p>

        No favorite cities yet ❤️

        </p>

        `;


        return;

    }



    appState.favorites.forEach(city=>{


        const card=

        document.createElement("div");



        card.className=

        "favorite-card";



        card.innerHTML=

        `

        <span>

        📍 ${city}

        </span>


        <button class="open-fav">

        View

        </button>


        <button class="remove-fav">

        ✖

        </button>

        `;



        card

        .querySelector(".open-fav")

        .onclick=()=>{


            searchCity(city);


        };



        card

        .querySelector(".remove-fav")

        .onclick=()=>{


            removeFavorite(city);


            renderFavorites();


            toast(

                "Removed from favorites"

            );


        };



        container.appendChild(card);



    });


}





/*=========================================================
    HISTORY UI SYSTEM
=========================================================*/


function renderHistory(){


    const container =

    get("searchHistory")

    ||

    get("historyContainer");



    if(!container)

    return;



    container.innerHTML="";



    appState.history.forEach(city=>{


        const button=

        document.createElement("button");



        button.className=

        "history-item";



        button.textContent=

        "🔍 "+city;



        button.onclick=()=>{


            searchCity(city);


        };



        container.appendChild(button);


    });



}





/*=========================================================
    FAVORITE CURRENT CITY BUTTON
=========================================================*/


function favoriteCurrentCity(){


    if(!appState.city){


        toast(

            "No city selected"

        );


        return;

    }



    addFavorite(

        appState.city

    );



    renderFavorites();


}





const favoriteBtn=

get("favoriteBtn")

||

get("addFavoriteBtn");



favoriteBtn

?.addEventListener(

    "click",

    favoriteCurrentCity

);





/*=========================================================
    CLEAR HISTORY
=========================================================*/


function clearHistory(){


    appState.history=[];


    saveStorage();


    renderHistory();



    toast(

        "History cleared"

    );


}





get("clearHistoryBtn")

?.addEventListener(

    "click",

    clearHistory

);





/*=========================================================
    CLEAR FAVORITES
=========================================================*/


function clearFavorites(){


    appState.favorites=[];


    saveStorage();


    renderFavorites();



    toast(

        "Favorites cleared"

    );


}





get("clearFavoritesBtn")

?.addEventListener(

    "click",

    clearFavorites

);





/*=========================================================
    EXPORT WEATHER REPORT
=========================================================*/


function exportWeatherReport(){


    if(!appState.weather){


        toast(

            "No weather data"

        );


        return;

    }



    const report={


        city:

        appState.city,


        generated:

        new Date().toLocaleString(),



        temperature:

        appState.weather.current.temperature_2m,



        humidity:

        appState.weather.current.relative_humidity_2m,



        wind:

        appState.weather.current.wind_speed_10m,



        pressure:

        appState.weather.current.surface_pressure,



        condition:

        weatherDescription(

            appState.weather.current.weather_code

        )


    };



    const blob=

    new Blob(

        [

            JSON.stringify(

                report,

                null,

                2

            )

        ],

        {

            type:"application/json"

        }

    );



    const url=

    URL.createObjectURL(blob);



    const link=

    document.createElement("a");



    link.href=url;


    link.download=

    "WeatherSphere_Report.json";



    link.click();



    URL.revokeObjectURL(url);



    toast(

        "Report exported 📄"

    );


}





get("exportBtn")

?.addEventListener(

    "click",

    exportWeatherReport

);





/*=========================================================
    UPDATE STORAGE UI AFTER LOAD
=========================================================*/


document.addEventListener(

"DOMContentLoaded",

()=>{


    renderFavorites();


    renderHistory();


}

);
/*=========================================================
    VOICE SEARCH SYSTEM
=========================================================*/


function startVoiceSearch(){


    const SpeechRecognition =

    window.SpeechRecognition ||

    window.webkitSpeechRecognition;



    if(!SpeechRecognition){


        toast(

            "Voice search not supported"

        );


        return;

    }



    const recognition=

    new SpeechRecognition();



    recognition.lang=

    "en-US";



    recognition.start();



    toast(

        "Listening 🎤"

    );



    recognition.onresult=(event)=>{


        const text=

        event.results[0][0].transcript;



        if(DOM.searchInput){


            DOM.searchInput.value=text;


        }



        searchCity(text);


    };



    recognition.onerror=()=>{


        toast(

            "Voice search failed"

        );


    };


}





DOM.voiceBtn

?.addEventListener(

    "click",

    startVoiceSearch

);





/*=========================================================
    DARK / LIGHT THEME
=========================================================*/


function applyTheme(){


    document.body

    .classList

    .toggle(

        "light",

        appState.theme==="light"

    );


}





function toggleTheme(){


    appState.theme =

    appState.theme==="dark"

    ?

    "light"

    :

    "dark";



    saveStorage();



    applyTheme();



    toast(

        appState.theme==="dark"

        ?

        "Dark Mode 🌙"

        :

        "Light Mode ☀️"

    );


}





DOM.themeBtn

?.addEventListener(

    "click",

    toggleTheme

);





/*=========================================================
    NETWORK STATUS
=========================================================*/


window.addEventListener(

"offline",

()=>{


    toast(

        "You are offline ⚠️"

    );


});





window.addEventListener(

"online",

()=>{


    toast(

        "Connection restored ✅"

    );



    refreshWeather();


});





/*=========================================================
    REFRESH WEATHER FUNCTION
=========================================================*/


async function refreshWeather(){


    if(

        !appState.latitude ||

        !appState.longitude

    )

    return;



    try{


        const data=

        await fetchWeather(

            appState.latitude,

            appState.longitude

        );



        appState.weather=data;



        renderCurrentWeather();


        renderHourlyForecast();


        renderDailyForecast();


        updateMap();



    }

    catch(error){


        toast(

            "Refresh failed"

        );


    }


}





/*=========================================================
    KEYBOARD SHORTCUTS
=========================================================*/


document.addEventListener(

"keydown",

(event)=>{


    // Ctrl + K search

    if(

        event.ctrlKey &&

        event.key==="k"

    ){


        event.preventDefault();



        DOM.searchInput?.focus();


    }



    // R refresh

    if(

        event.key==="r"

    ){


        refreshWeather();


    }



    // Escape close

    if(

        event.key==="Escape"

    ){


        document.activeElement.blur();


    }


});





/*=========================================================
    AUTO REFRESH
=========================================================*/


setInterval(

()=>{


    if(

        navigator.onLine

    ){


        refreshWeather();


    }



},

15*60*1000

);





/*=========================================================
    INITIAL APPLICATION LOAD
=========================================================*/


async function initWeatherSphere(){


    loadStorage();


    applyTheme();



    renderFavorites();


    renderHistory();



    try{


        await searchCity(

            CONFIG.DEFAULT_CITY

        );


    }


    catch(error){


        console.error(error);


    }



    setTimeout(()=>{


        initializeMap();


    },500);



}





window.addEventListener(

"load",

initWeatherSphere

);





/*=========================================================
    FINAL STATUS
=========================================================*/


console.log(

`

🌦️ WeatherSphere Pro 4.0

Open-Meteo Edition

====================

✅ No API Key Required
✅ Live Weather
✅ Forecast
✅ AQI
✅ Charts
✅ Maps
✅ Favorites
✅ History
✅ Voice Search
✅ Themes
✅ Offline Support

Application Loaded Successfully 🚀

`

);
