const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// OpenWeatherMap API Key.
var API_KEY = "3f1e30e16cf4d774e0138971d751006f"; 

const longTimestampText = document.getElementById('long-timestamp');
const mainTemperatureText = document.getElementById('main-temperature-text');
const weatherDescriptionText = document.getElementById('weather-description');
const humidityText = document.getElementById('humidity');
const windsText = document.getElementById('winds');
const weatherIcon = document.getElementById('weather-icon');
const locationText = document.getElementById('location-text');
const apiResponseText = document.getElementById('api-response');
const lastUpdatedText = document.getElementById('last-updated');
const highTemperatureText = document.getElementById('high-temperature');
const lowTemperatureText = document.getElementById('low-temperature');
const feelsLikeText = document.getElementById('feels-like');
const searchInput = document.getElementById('search-input');
const modal = new bootstrap.Modal(document.getElementById('modal'), {})
const modalCloseBtn = document.getElementById('modal-close-btn')
const offlineAlert = document.getElementById('offline-alert');
const loader = document.getElementById('loader');
const searchResultsContainer = document.getElementById('search-results-container');
var cities = [];

function changeLoaderVisibility(visible){
    if (visible) {
        loader.classList.remove('hidden');
    }else{
        loader.classList.add('hidden');
    }
}

function showCityNotFoundModal(){
    modal.toggle();
}

function onNetworkChange(isOnline){
    if(isOnline){
        offlineAlert.classList.add('hidden');
        console.log('Online');
    } else {
        console.log('Offline');
        offlineAlert.classList.remove('hidden');
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
        })
    }
}
const checkOnlineStatus = async () => {
    try {
      const online = await fetch("https://8.8.8.8/", {
        mode: 'no-cors',
        signal: AbortSignal.timeout(5000)
      });
      return true;
    } catch (err) {
        return false;
    }
};

function renderWeatherInfo(response){
    apiResponseText.innerText = JSON.stringify(response, null, 2);

    if (response.cod == 404) {
        apiResponseText.classList.add('error');
        showCityNotFoundModal();
        return;
    }
    apiResponseText.classList.remove('error');

    const lastUpdated = new Date();
    const lat = response.coord.lat;
    const long = response.coord.lon;
    var weatherDescription = response.weather[0].description;
    weatherDescription = weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1);
    const weatherIconId = response.weather[0].icon;
    const main = response.main;
    const temperature = main.temp;
    const feelsLike = main.feels_like;
    const temperatureMin = main.temp_min;
    const temperatureMax = main.temp_max;
    const pressure = main.pressure;
    const humidity = main.humidity;
    const windSpeed = response.wind.speed;

    longTimestampText.innerText = lastUpdated.toDateString();
    locationText.innerText = `${response.name}, ${response.sys.country}`;
    mainTemperatureText.innerText = `${temperature}°C`;
    weatherDescriptionText.innerText = weatherDescription;
    weatherIcon.src = `http://openweathermap.org/img/wn/${weatherIconId}@4x.png`;
    highTemperatureText.innerText = `High ${temperatureMax}°C`;
    lowTemperatureText.innerText = `Low ${temperatureMin}°C`;
    feelsLikeText.innerText = `Feels like ${feelsLike}°C`;
    humidityText.innerText = `Humidity ${humidity}%`;
    windsText.innerText = `Winds ${windSpeed} km/hr`;
    lastUpdatedText.innerText = `Last updated: ${lastUpdated.toLocaleTimeString()}`;
    document.body.style.background = getWeatherGradientById(response.weather[0].id);
    document.querySelector('#primary-nav').style.background = getWeatherGradientById(response.weather[0].id);

    fetch(`https://restcountries.com/v3.1/alpha/${response.sys.country}?fields=name,flags,timezones`)
    .then(response=>response.json())
    .then(data=>{
        const countryName = data.name.common;
        const timezone = data.timezones[0];
        const flagImageUrl = data.flags.png;
        locationText.innerText = `${response.name}, ${countryName}`;
        document.getElementById('country-info-link').href = `https://adityabavadekar.github.io/country-card/country.html?country=${countryName}`;
        document.getElementById('country-flag').src = flagImageUrl;
    })
}

function getWeatherDataCurrent() {
    changeLoaderVisibility(true);
    getCurrentCity(city=>{
        getWeatherData(city);
    })
}

function getWeatherData(city_name, fallback=()=>{}) {
    changeLoaderVisibility(true);
    const url = `${BASE_URL}?q=${city_name}&appid=${API_KEY}&units=metric`;
    fetch(url)
    .then(response => response.json())
    .then(response=>{
        console.log("SUCCESS");
        console.log(response);
        renderWeatherInfo(response);
        changeLoaderVisibility(false);
    })
    .catch(e=>{
        console.log(e);
        changeLoaderVisibility(false);
        if(fallback){
            fallback();
        }
    })
}

function getCurrentCity(onSuccess){
    fetch("https://ip.guide")
    .then(response=>response.json())
    .then(response=>{
        const city = response.location.city;
        console.log(city);
        onSuccess(city);
    })
    .catch(e=>{
        console.log(e);
        changeLoaderVisibility(false);
    })
}

function addSearchResult(text){
    const element = document.createElement('div');
    element.innerHTML = `
    <div class="d-flex container my-auto" id="search-result-item">
        <i class="ri-search-line me-2 my-auto text-dark"></i>
        <p class="my-auto text-dark">${text}</p>
    </div>`
    element.addEventListener('click', ()=>{
        searchInput.value = null;
        searchResultsContainer.innerHTML = '';
        getWeatherData(text.trim());
    })

    searchResultsContainer.appendChild(element);
}

function getWeatherGradientById(weatherId) {
    if (weatherId >= 200 && weatherId < 300) {
        // Thunderstorm
        return 'linear-gradient(to right, #232526, #414345)';
    } else if (weatherId >= 300 && weatherId < 500) {
        // Drizzle
        return 'linear-gradient(to right, #4b79a1, #283e51)';
    } else if (weatherId >= 500 && weatherId < 600) {
        // Rain
        return 'linear-gradient(to right, #00c6ff, #0072ff)';
    } else if (weatherId >= 600 && weatherId < 700) {
        // Snow
        return 'linear-gradient(to right, #83a4d4, #b6fbff)';
    } else if (weatherId >= 700 && weatherId < 800) {
        // Atmosphere (mist, smoke, haze, etc.)
        return 'linear-gradient(to right, white, lightblue)';
    } else if (weatherId === 800) {
        // Clear sky
        return 'linear-gradient(to right, #00c6ff, #0072ff)';
    } else if (weatherId >= 801 && weatherId < 804) {
        // Few or scattered clouds
        return 'linear-gradient(to right, #fbd3e9, #bb377d)';
    } else if (weatherId === 804) {
        // Overcast clouds
        return 'linear-gradient(to right, #757f9a, #d7dde8)';
    } else {
        return 'linear-gradient(to right, #e0eafc, #cfdef3)';
    }
}

fetch('/assets/data/cities.json')
.then(response=>response.json())
.then(response=>{
    cities = response;
})


modalCloseBtn.addEventListener('click', ()=>{
    modal.toggle();
})

// getWeatherDataCurrent();
const collapseApiResponse = new bootstrap.Collapse(document.querySelector("#api-response-container"), {
    toggle: false
});

document.querySelector("#btn-api-response-show").addEventListener('click', ()=>{
    document.querySelector("#btn-api-response-show").classList.add("hidden");
    document.querySelector("#btn-api-response-hide").classList.remove("hidden");
    collapseApiResponse.show();
});

document.querySelector("#btn-api-response-hide").addEventListener('click', ()=>{
    document.querySelector("#btn-api-response-hide").classList.add("hidden");
    document.querySelector("#btn-api-response-show").classList.remove("hidden");
    collapseApiResponse.hide();
});

searchInput.addEventListener('input', (t)=>{
    const text = t.target.value.toLowerCase();
    if (text.length < 2) {
        searchResultsContainer.innerHTML = '';
        return;
    }
    const new_cities = cities.filter((value)=>{return value.name.toLowerCase().includes(text) || value.country.toLowerCase().includes(text)}).slice(0, 10)
    searchResultsContainer.innerHTML = '';
    new_cities.forEach((value)=>{addSearchResult(value.name)})
})

// Listen for enter key press
searchInput.addEventListener('keypress', (e)=>{
    if(e.key === 'Enter' && searchInput.value.length > 0){
        searchResultsContainer.innerHTML = '';
        getWeatherData(searchInput.value.trim());
    }
});

document.getElementById("get-my-weather").addEventListener('click', ()=>{
    getWeatherDataCurrent();
})

setInterval(async () => {
    const result = await checkOnlineStatus();
    onNetworkChange(result);
}, 4500);

const paramsString = window.location.search;
const urlParams = new URLSearchParams(paramsString);
if (urlParams.has('name')) {
    const placeName = urlParams.get('name');
    getWeatherData(placeName, ()=>{
        console.log("Error finding weather information for " + placeName);
        getWeatherDataCurrent();
    });
}else{
    getWeatherDataCurrent();
}

