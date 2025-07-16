document.addEventListener("DOMContentLoaded", () => {
    const cityNameElement = document.getElementById("city-name");
    const weatherConditionElement = document.querySelector(".weather-condition");
    const weatherDegElement = document.querySelector(".weather-deg");
    const humidityElement = document.querySelector(".humidity");
    const windElement = document.querySelector(".wind");
    const forecastDaysContainer = document.querySelector(".forecast-days");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");

    const API_KEY = "77810747479a58a3c9a8d0311f06e489";
    const DEFAULT_CITY = "Concordia";

    const showError = (message) => {
        const alert = document.createElement("div");
        alert.className = "custom-alert";
        alert.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 4000);
    };

    const fetchWeatherData = (city = DEFAULT_CITY) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=es&appid=${API_KEY}`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                if (data.cod !== 200) {
                    showError("❌ Ciudad no encontrada. Verifica el nombre.");
                    return;
                }
                cityNameElement.textContent = data.name;
                weatherConditionElement.textContent = data.weather[0].description;
                weatherDegElement.textContent = `${Math.round(data.main.temp)}°C`;
                humidityElement.textContent = `Humedad: ${data.main.humidity}%`;
                windElement.textContent = `Viento: ${(data.wind.speed * 3.6).toFixed(1)} km/h (${getWindDirection(data.wind.deg)})`;
            })
            .catch(() => showError("⚠️ Error al obtener el clima."));
    };

    const fetchForecastData = (city = DEFAULT_CITY) => {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=es&appid=${API_KEY}`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                if (data.cod !== "200") {
                    showError("⚠️ No se pudo obtener el pronóstico.");
                    return;
                }
                forecastDaysContainer.innerHTML = "";
                const forecastDays = data.list.filter((item) => item.dt_txt.includes("12:00:00"));
                forecastDays.forEach((forecast) => {
                    const date = new Date(forecast.dt * 1000);
                    const options = { weekday: "long", day: "numeric", month: "long" };
                    const dayString = date.toLocaleDateString("es-ES", options);
                    const dayElement = document.createElement("div");
                    dayElement.classList.add("forecast-day");
                    dayElement.innerHTML = `
                        <div class="day-name">${dayString}</div>
                        <div class="temp">${Math.round(forecast.main.temp)}°C</div>
                        <div class="description">${forecast.weather[0].description}</div>
                    `;
                    forecastDaysContainer.appendChild(dayElement);
                });
            })
            .catch(() => showError("⚠️ Error al obtener el pronóstico."));
    };

    const getWindDirection = (deg) => {
        const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        const index = Math.round(deg / 45) % 8;
        return directions[index];
    };

    let currentIndex = 0;

    const updateSliderPosition = () => {
        const slideWidth = document.querySelector(".forecast-day").offsetWidth + 10;
        forecastDaysContainer.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    };

    prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSliderPosition();
        }
    });

    nextBtn.addEventListener("click", () => {
        if (currentIndex < forecastDaysContainer.children.length - 1) {
            currentIndex++;
            updateSliderPosition();
        }
    });

    const updateTime = () => {
        const now = new Date();
        const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const day = dayNames[now.getDay()];
        const date = now.toLocaleDateString();
        const time = now.toLocaleTimeString();

        document.querySelector(".day").textContent = day;
        document.querySelector(".date").textContent = date;
        document.getElementById("current-time").textContent = time;
    };

    setInterval(updateTime, 1000);
    updateTime();

    fetchWeatherData();
    fetchForecastData();

    document.getElementById("get-city").addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            const city = event.target.value.trim();
            if (city) {
                fetchWeatherData(city);
                fetchForecastData(city);
            }
        }
    });

    const backgrounds = [
        "url('imagenes/bg1.jpg')",
        "url('imagenes/bg2.jpg')",
        "url('imagenes/bg3.jpg')",
        "url('imagenes/bg4.jpg')",
        "url('imagenes/bg5.jpg')"
    ];

    document.body.style.backgroundImage = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundPosition = "center";
});
