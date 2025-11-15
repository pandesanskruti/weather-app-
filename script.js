// document.addEventListener("DOMContentLoaded", () => {
//     const OWM_API_KEY = "2b5ba9945e2f177fb47d6b956eb84b6d";
//     let clockInterval = null;

//     // DOM Elements
//     const searchForm = document.getElementById('search-form');
//     const cityInput = document.getElementById('city-input');
//     const geolocationBtn = document.getElementById('geolocation-btn');
//     const loadingOverlay = document.getElementById('loading-overlay');
//     const weatherContent = document.getElementById('weather-content');
//     const errorModal = document.getElementById('error-modal');
//     const errorMessageEl = document.getElementById('error-message');
//     const closeModalBtn = document.getElementById('close-modal-btn');
//     const animationContainer = document.getElementById('animation-container');
//     const suggestionsBox = document.getElementById('suggestions-box');

//     const cityNameEl = document.getElementById('city-name');
//     const currentDateEl = document.getElementById('current-date');
//     const currentTimeEl = document.getElementById('current-time');
//     const currentTempEl = document.getElementById('current-temp');
//     const currentWeatherDescEl = document.getElementById('current-weather-desc');
//     const currentWeatherIconEl = document.getElementById('current-weather-icon');
//     const forecastContainer = document.getElementById('forecast-container');

//     // Extra elements
//     const sunriseTimeEl = document.getElementById("sunrise-time");
//     const sunsetTimeEl = document.getElementById("sunset-time");
//     const humidityEl = document.getElementById("humidity");
//     const windSpeedEl = document.getElementById("wind-speed");
//     const feelsLikeEl = document.getElementById("feels-like");
//     const pressureEl = document.getElementById("pressure");
//     const visibilityEl = document.getElementById("visibility");
//     const airQualityEl = document.getElementById("air-quality");
//     const healthRecommendationsEl = document.getElementById("health-recommendations");

//     // Backgrounds
//     const backgroundImageDay = { Clear:"...", Clouds:"...", Rain:"...", Default:"..." };
//     const backgroundImageNight = { Clear:"...", Clouds:"...", Rain:"...", Default:"..." };

//     // Fetch Weather
//     const fetchWeather = async ({ lat, lon, city }) => {
//         showLoading();
//         if (clockInterval) clearInterval(clockInterval);

//         try {
//             let latitude = lat, longitude = lon;

//             if (city) {
//                 const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${OWM_API_KEY}`;
//                 const getResponse = await fetch(geoUrl);
//                 if (!getResponse.ok) throw new Error(`Could not find location data for "${city}".`);
//                 const geoData = await getResponse.json();
//                 if (geoData.length === 0) throw new Error(`Could not find location data for "${city}".`);
//                 latitude = geoData[0].lat;
//                 longitude = geoData[0].lon;
//             }

//             const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OWM_API_KEY}&units=metric`;
//             const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OWM_API_KEY}&units=metric`;
//             const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${OWM_API_KEY}`;

//             const [weatherResponse, forecastResponse, aqiResponse] = await Promise.all([
//                 fetch(weatherUrl), fetch(forecastUrl), fetch(aqiUrl)
//             ]);

//             if ([weatherResponse, forecastResponse, aqiResponse].some(res => !res.ok)) {
//                 throw new Error("Failed to fetch weather data.");
//             }

//             const weatherData = await weatherResponse.json();
//             const forecastData = await forecastResponse.json();
//             const aqiData = await aqiResponse.json();

//             updateUI(weatherData, forecastData, aqiData);
//         } catch (error) {
//             showError(error.message);
//         } finally {
//             hideLoading();
//         }
//     };

//     const updateUI = (weather, forecast, aqi) => {
//         cityNameEl.textContent = `${weather.name}, ${weather.sys.country}`;
//         currentTempEl.textContent = `${Math.round(weather.main.temp)}°`;
//         currentWeatherDescEl.textContent = weather.weather[0].description;
//         currentWeatherIconEl.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`;

//         sunriseTimeEl.textContent = formatTime(weather.sys.sunrise + weather.timezone);
//         sunsetTimeEl.textContent = formatTime(weather.sys.sunset + weather.timezone);
//         humidityEl.textContent = `${weather.main.humidity}%`;
//         windSpeedEl.textContent = `${(weather.wind.speed * 3.6).toFixed(1)} km/h`;
//         feelsLikeEl.textContent = `${Math.round(weather.main.feels_like)}°`;
//         pressureEl.textContent = `${weather.main.pressure} hPa`;
//         visibilityEl.textContent = `${(weather.visibility / 1000).toFixed(1)} km`;

//         // Air Quality
//         const aqiValue = aqi.list[0].main.aqi;
//         airQualityEl.textContent = ["Good","Fair","Moderate","Poor","Very Poor"][aqiValue-1] || "Unknown";

//         // Forecast (5 days)
//         forecastContainer.innerHTML = "";
//         processForecast(forecast.list).forEach(day => {
//             const card = document.createElement("div");
//             card.className = "p-4 rounded-2xl text-center card backdrop-blur-xl";
//             card.innerHTML = `
//                 <p class="font-bold">${new Date(day.dt_txt).toLocaleDateString("en-US",{weekday:"short"})}</p>
//                 <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">
//                 <p>${Math.round(day.main.temp_max)}/${Math.round(day.main.temp_min)}°</p>
//               `;
//             forecastContainer.appendChild(card);
//         });
//     };

//     const formatTime = (ts) =>
//         new Date(ts * 1000).toLocaleTimeString("en-US", {hour:"2-digit",minute:"2-digit",hour12:true, timeZone:"UTC"});

//     const processForecast = (list) => {
//         const daily = {};
//         list.forEach(e=>{
//             const date = e.dt_txt.split(" ")[0];
//             if(!daily[date]) daily[date]=e;
//         });
//         return Object.values(daily).slice(0,5);
//     };

//     // Helpers
//     const showLoading = ()=> loadingOverlay?.classList.remove("hidden");
//     const hideLoading = ()=> loadingOverlay?.classList.add("hidden");
//     const showError = (msg)=>{ errorMessageEl.textContent=msg; errorModal.classList.remove("hidden"); };

//     // Events
//     searchForm.addEventListener("submit", e=>{
//         e.preventDefault();
//         if(cityInput.value.trim()) fetchWeather({city:cityInput.value.trim()});
//     });
//     geolocationBtn.addEventListener("click", ()=>{
//         navigator.geolocation?.getCurrentPosition(
//             pos=>fetchWeather({lat:pos.coords.latitude,lon:pos.coords.longitude}),
//             ()=>fetchWeather({city:"New Delhi"})
//         );
//     });
//     closeModalBtn.addEventListener("click", ()=>errorModal.classList.add("hidden"));

//     // Load default
//     fetchWeather({city:"New Delhi"});
// });
// // 

document.addEventListener("DOMContentLoaded", () => {
    const OWM_API_KEY = "2b5ba9945e2f177fb47d6b956eb84b6d"; // Move to server-side in production
    let clockInterval = null;

    // DOM Elements
    const elements = {
        searchForm: document.getElementById('search-form'),
        cityInput: document.getElementById('city-input'),
        geolocationBtn: document.getElementById('geolocation-btn'),
        loadingOverlay: document.getElementById('loading-overlay'),
        weatherContent: document.getElementById('weather-content'),
        errorModal: document.getElementById('error-modal'),
        errorMessageEl: document.getElementById('error-message'),
        closeModalBtn: document.getElementById('close-modal-btn'),
        animationContainer: document.getElementById('animation-container'),
        suggestionsBox: document.getElementById('suggestions-box'),
        cityNameEl: document.getElementById('city-name'),
        currentDateEl: document.getElementById('current-date'),
        currentTimeEl: document.getElementById('current-time'),
        currentTempEl: document.getElementById('current-temp'),
        currentWeatherDescEl: document.getElementById('current-weather-desc'),
        currentWeatherIconEl: document.getElementById('current-weather-icon'),
        forecastContainer: document.getElementById('forecast-container'),
        sunriseTimeEl: document.getElementById("sunrise-time"),
        sunsetTimeEl: document.getElementById("sunset-time"),
        humidityEl: document.getElementById("humidity"),
        windSpeedEl: document.getElementById("wind-speed"),
        feelsLikeEl: document.getElementById("feels-like"),
        pressureEl: document.getElementById("pressure"),
        visibilityEl: document.getElementById("visibility"),
        airQualityEl: document.getElementById("air-quality"),
        healthRecommendationsEl: document.getElementById("health-recommendations")
    };

    // Backgrounds (replace with actual image URLs)
    const backgroundImageDay = {
        Clear: "url('/images/day-clear.jpg')",
        Clouds: "url('/images/day-clouds.jpg')",
        Rain: "url('/images/day-rain.jpg')",
        Default: "url('/images/day-default.jpg')"
    };
    const backgroundImageNight = {
        Clear: "url('/images/night-clear.jpg')",
        Clouds: "url('/images/night-clouds.jpg')",
        Rain: "url('/images/night-rain.jpg')",
        Default: "url('/images/night-default.jpg')"
    };

    // Health Recommendations based on AQI
    const healthRecommendations = {
        1: "Air quality is good. Enjoy outdoor activities!",
        2: "Air quality is fair. Sensitive groups should limit prolonged outdoor exertion.",
        3: "Air quality is moderate. Reduce outdoor activities if you experience symptoms.",
        4: "Air quality is poor. Avoid prolonged outdoor activities.",
        5: "Air quality is very poor. Stay indoors and use air purifiers if possible."
    };

    // Fetch Weather
    const fetchWeather = async ({ lat, lon, city }) => {
        showLoading();
        if (clockInterval) clearInterval(clockInterval);

        try {
            let latitude = lat, longitude = lon, timezoneOffset = 0;

            if (city) {
                if (!/^[a-zA-Z\s,]+$/.test(city)) throw new Error("Invalid city name. Use letters and spaces only.");
                const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${OWM_API_KEY}`;
                const geoResponse = await fetch(geoUrl);
                if (!geoResponse.ok) throw new Error(`Could not find location data for "${city}".`);
                const geoData = await geoResponse.json();
                if (geoData.length === 0) throw new Error(`No location found for "${city}".`);
                latitude = geoData[0].lat;
                longitude = geoData[0].lon;
            }

            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OWM_API_KEY}&units=metric`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${OWM_API_KEY}&units=metric`;
            const aqiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${OWM_API_KEY}`;

            const [weatherResponse, forecastResponse, aqiResponse] = await Promise.all([
                fetch(weatherUrl).then(res => res.json()),
                fetch(forecastUrl).then(res => res.json()),
                fetch(aqiUrl).then(res => res.json())
            ]);

            if (weatherResponse.cod !== 200) throw new Error(weatherResponse.message || "Failed to fetch weather data.");
            if (forecastResponse.cod !== "200") throw new Error("Failed to fetch forecast data.");
            if (!aqiResponse.list) throw new Error("Failed to fetch air quality data.");

            timezoneOffset = weatherResponse.timezone;
            updateUI(weatherResponse, forecastResponse, aqiResponse, timezoneOffset);
            updateClock(timezoneOffset);
        } catch (error) {
            showError(error.message || "An unexpected error occurred.");
        } finally {
            hideLoading();
        }
    };

    // Update UI
    const updateUI = (weather, forecast, aqi, timezoneOffset) => {
        elements.cityNameEl.textContent = `${weather.name}, ${weather.sys.country}`;
        elements.currentDateEl.textContent = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
        elements.currentTempEl.textContent = `${Math.round(weather.main.temp)}°C`;
        elements.currentWeatherDescEl.textContent = weather.weather[0].description;
        elements.currentWeatherIconEl.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`;
        elements.currentWeatherIconEl.alt = weather.weather[0].description;

        elements.sunriseTimeEl.textContent = formatTime(weather.sys.sunrise, timezoneOffset);
        elements.sunsetTimeEl.textContent = formatTime(weather.sys.sunset, timezoneOffset);
        elements.humidityEl.textContent = `${weather.main.humidity}%`;
        elements.windSpeedEl.textContent = `${(weather.wind.speed * 3.6).toFixed(1)} km/h`;
        elements.feelsLikeEl.textContent = `${Math.round(weather.main.feels_like)}°C`;
        elements.pressureEl.textContent = `${weather.main.pressure} hPa`;
        elements.visibilityEl.textContent = `${(weather.visibility / 1000).toFixed(1)} km`;

        // Air Quality
        const aqiValue = aqi.list[0].main.aqi;
        elements.airQualityEl.textContent = ["Good", "Fair", "Moderate", "Poor", "Very Poor"][aqiValue - 1] || "Unknown";
        elements.healthRecommendationsEl.textContent = healthRecommendations[aqiValue] || "No recommendations available.";

        // Update Background
        // const isDay = weather.weather[0].icon.includes("d");
        // const weatherMain = weather.weather[0].main;
        // const background = (isDay ? backgroundImageDay : backgroundImageNight)[weatherMain] || (isDay ? backgroundImageDay.Default : backgroundImageNight.Default);
        // document.body.style.backgroundImage = background;

const updateUI = (weather,forecast,aqi)=>{
    let weatherconditionForBg = weather.weather[0].main;
    if(weatherconditionForBg === "Clouds" && weather.clouds.all< 20){
        weatherconditionForBg = "Clear";
    }
}

        // Forecast
        elements.forecastContainer.innerHTML = "";
        processForecast(forecast.list).forEach(day => {
            const card = document.createElement("div");
            card.className = "p-4 rounded-2xl text-center card backdrop-blur-xl";
            card.innerHTML = `
                <p class="font-bold">${new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: "short" })}</p>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}">
                <p>${Math.round(day.main.temp_max)}°/${Math.round(day.main.temp_min)}°</p>
            `;
            elements.forecastContainer.appendChild(card);
        });
    };

    // Format Time with Timezone
    const formatTime = (timestamp, timezoneOffset) => {
        const date = new Date((timestamp + timezoneOffset) * 1000);
        return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: "UTC" });
    };

    // Update Clock
    const updateClock = (timezoneOffset) => {
        const update = () => {
            const now = new Date(Date.now() + timezoneOffset * 1000);
            elements.currentTimeEl.textContent = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true, timeZone: "UTC" });
        };
        update();
        clockInterval = setInterval(update, 1000);
    };

    // Process Forecast
    const processForecast = (list) => {
        const daily = {};
        list.forEach(entry => {
            const date = entry.dt_txt.split(" ")[0];
            if (!daily[date]) daily[date] = entry;
        });
        return Object.values(daily).slice(0, 5);
    };

    // Helpers
    const showLoading = () => elements.loadingOverlay?.classList.remove("hidden");
    const hideLoading = () => elements.loadingOverlay?.classList.add("hidden");
    const showError = (msg) => {
        elements.errorMessageEl.textContent = msg;
        elements.errorModal.classList.remove("hidden");
    };

    // City Suggestions (Basic Autocomplete)
    const fetchSuggestions = async (query) => {
        if (!query) {
            elements.suggestionsBox.innerHTML = "";
            elements.suggestionsBox.classList.add("hidden");
            return;
        }
        try {
            const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${OWM_API_KEY}`;
            const response = await fetch(geoUrl);
            if (!response.ok) return;
            const data = await response.json();
            elements.suggestionsBox.innerHTML = "";
            data.forEach(city => {
                const div = document.createElement("div");
                div.className = "p-2 hover:bg-gray-200 cursor-pointer";
                div.textContent = `${city.name}, ${city.country}`;
                div.addEventListener("click", () => {
                    elements.cityInput.value = city.name;
                    elements.suggestionsBox.classList.add("hidden");
                    fetchWeather({ city: city.name });
                });
                elements.suggestionsBox.appendChild(div);
            });
            elements.suggestionsBox.classList.remove("hidden");
        } catch (error) {
            console.error("Error fetching suggestions:", error);
        }
    };

    // Events
    elements.searchForm?.addEventListener("submit", e => {
        e.preventDefault();
        if (elements.cityInput.value.trim()) {
            fetchWeather({ city: elements.cityInput.value.trim() });
            elements.suggestionsBox.classList.add("hidden");
        }
    });

    elements.geolocationBtn?.addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => fetchWeather({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                err => {
                    showError("Geolocation failed. Please enter a city manually.");
                    fetchWeather({ city: "New Delhi" });
                }
            );
        } else {
            showError("Geolocation not supported by your browser.");
            fetchWeather({ city: "New Delhi" });
        }
    });

    elements.closeModalBtn?.addEventListener("click", () => elements.errorModal.classList.add("hidden"));

    elements.cityInput?.addEventListener("input", e => fetchSuggestions(e.target.value.trim()));

    // Load default
    fetchWeather({ city: "New Delhi" });
});