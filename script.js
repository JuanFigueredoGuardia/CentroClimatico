document.addEventListener("DOMContentLoaded", () => {
    const cityNameElement = document.getElementById("city-name");
    const weatherConditionElement = document.querySelector(".weather-condition");
    const weatherDegElement = document.querySelector(".weather-deg");
    const humidityElement = document.querySelector(".humidity");
    const windElement = document.querySelector(".wind");
    const dayNightStatusElement = document.querySelector(".day-night-status");

    const forecastDaysContainer = document.querySelector(".forecast-days");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");

    // Configuración inicial
    const API_KEY = "77810747479a58a3c9a8d0311f06e489"; // Reemplaza con tu clave API de OpenWeatherMap
    const DEFAULT_CITY = "Concordia"; // Ciudad predeterminada

    // Obtener datos del clima actual
    const fetchWeatherData = (city = DEFAULT_CITY) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=es&appid=${API_KEY}
`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                cityNameElement.textContent = data.name;
                weatherConditionElement.textContent = data.weather[0].description;
                weatherDegElement.textContent = `${Math.round(data.main.temp)}°C`; // Redondear la temperatura
                humidityElement.textContent = `Humedad: ${data.main.humidity}%`;
                windElement.textContent = `Viento: ${data.wind.speed} m/s`;
                dayNightStatusElement.textContent =
                    data.weather[0].icon.includes("d") ? "Día" : "Noche";
            })
            .catch((error) => {
                console.error("Error al obtener los datos del clima:", error);
            });
    };

    // Obtener datos del pronóstico para los próximos días
    const fetchForecastData = (city = DEFAULT_CITY) => {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&lang=es&appid=${API_KEY}
`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                forecastDaysContainer.innerHTML = ""; // Limpiar el contenedor
                const forecastDays = data.list.filter((item) =>
                    item.dt_txt.includes("12:00:00")
                ); // Obtener datos a las 12:00 PM de cada día

                forecastDays.forEach((forecast) => {
                    const date = new Date(forecast.dt * 1000);
                    const options = { weekday: "long", day: "numeric", month: "long" };
                    const dayString = date.toLocaleDateString("es-ES", options);

                    const dayElement = document.createElement("div");
                    dayElement.classList.add("forecast-day");
                    dayElement.innerHTML = `
                        <div class="day-name">${dayString}</div>
                        <i class="fas fa-cloud"></i>
                        <div class="temp">${Math.round(forecast.main.temp)}°C</div> <!-- Redondear la temperatura -->
                        <div class="description">${forecast.weather[0].description}</div>
                    `;
                    forecastDaysContainer.appendChild(dayElement);
                });
            })
            .catch((error) => {
                console.error("Error al obtener el pronóstico del clima:", error);
            });
    };

    // Slider para los días del pronóstico
    let currentIndex = 0;

    const updateSliderPosition = () => {
        const slideWidth = document.querySelector(".forecast-day").offsetWidth + 10; // Ancho del slide más margen
        forecastDaysContainer.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
    };

    prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateSliderPosition();
        }
    });

    nextBtn.addEventListener("click", () => {
        if (
            currentIndex <
            forecastDaysContainer.children.length - 1
        ) {
            currentIndex++;
            updateSliderPosition();
        }
    });

    // Actualizar hora y fecha
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

    setInterval(updateTime, 1000); // Actualizar cada segundo
    updateTime();

    // Inicializar datos predeterminados
    fetchWeatherData();
    fetchForecastData();

    // Evento de búsqueda de ciudad
    document.getElementById("get-city").addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            const city = event.target.value.trim();
            if (city) {
                fetchWeatherData(city);
                fetchForecastData(city);
            }
        }
    });
});
