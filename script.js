document.addEventListener("DOMContentLoaded", () => {
    const cityNameElement = document.getElementById("city-name");
    const weatherConditionElement = document.querySelector(".weather-condition");
    const weatherDegElement = document.querySelector(".weather-deg");
    const humidityElement = document.querySelector(".humidity");
    const windElement = document.querySelector(".wind");
    const forecastDaysContainer = document.querySelector(".forecast-days");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    const locationBtn = document.getElementById("current-location-btn");
    const cityInput = document.getElementById("get-city");
    const weatherDynamicIcon = document.getElementById("weather-dynamic-icon");
    const weatherFallbackIcon = document.getElementById("weather-fallback-icon");
    const unitCBtn = document.getElementById("unit-c-btn");
    const unitFBtn = document.getElementById("unit-f-btn");
    const time24Btn = document.getElementById("time-24-btn");
    const time12Btn = document.getElementById("time-12-btn");
    const timeBadgeBtn = document.getElementById("time-badge-btn");
    const weatherAlertBanner = document.getElementById("weather-alert-banner");
    const alertBannerIcon = document.getElementById("alert-banner-icon");
    const alertBannerTag = document.getElementById("alert-banner-tag");
    const alertBannerSource = document.getElementById("alert-banner-source");
    const alertBannerTitle = document.getElementById("alert-banner-title");
    const alertBannerDesc = document.getElementById("alert-banner-desc");
    const alertBannerInstructions = document.getElementById("alert-banner-instructions");
    const alertBannerClose = document.getElementById("alert-banner-close");
    const testAlertBtn = document.getElementById("test-alert-btn");

    const API_KEY = "77810747479a58a3c9a8d0311f06e489";
    const DEFAULT_CITY = "Concordia";

    let currentUnit = localStorage.getItem("weather_temp_unit") || "C";
    let currentTimeFormat = localStorage.getItem("weather_time_format") || "24";
    let lastWeatherData = null;
    let lastForecastData = null;

    const formatTemp = (celsius) => {
        if (celsius === null || celsius === undefined || isNaN(celsius)) return "";
        if (currentUnit === "F") {
            const fahrenheit = Math.round((celsius * 9 / 5) + 32);
            return `${fahrenheit}°F`;
        }
        return `${Math.round(celsius)}°C`;
    };

    const updateUnitButtons = () => {
        if (unitCBtn) unitCBtn.classList.toggle("active", currentUnit === "C");
        if (unitFBtn) unitFBtn.classList.toggle("active", currentUnit === "F");
    };

    const updateTimeButtons = () => {
        if (time24Btn) time24Btn.classList.toggle("active", currentTimeFormat === "24");
        if (time12Btn) time12Btn.classList.toggle("active", currentTimeFormat === "12");
        if (timeBadgeBtn) timeBadgeBtn.textContent = currentTimeFormat === "24" ? "24H" : "12H";
    };

    const setTimeFormat = (format) => {
        if (currentTimeFormat === format) return;
        currentTimeFormat = format;
        try {
            localStorage.setItem("weather_time_format", format);
        } catch {
            // ignore if local storage is restricted
        }
        updateTimeButtons();
        updateTime();
    };

    const setUnit = (unit) => {
        if (currentUnit === unit) return;
        currentUnit = unit;
        try {
            localStorage.setItem("weather_temp_unit", unit);
        } catch {
            // ignore if local storage is restricted
        }
        updateUnitButtons();

        if (lastWeatherData && lastWeatherData.main) {
            weatherDegElement.textContent = formatTemp(lastWeatherData.main.temp);
        }

        const forecastDayElements = forecastDaysContainer.querySelectorAll(".forecast-day");
        forecastDayElements.forEach((el) => {
            const rawTemp = parseFloat(el.dataset.celsius);
            const tempDiv = el.querySelector(".temp");
            if (tempDiv && !isNaN(rawTemp)) {
                tempDiv.textContent = formatTemp(rawTemp);
            }
        });

        if (lastForecastData) {
            updateForecastChart(lastForecastData);
        }
    };

    const showError = (message) => {
        const alert = document.createElement("div");
        alert.className = "custom-alert";
        alert.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 4000);
    };

    const updateWeatherUI = (data) => {
        lastWeatherData = data;
        cityNameElement.textContent = data.name;
        
        const weatherObj = data.weather && data.weather[0];
        if (weatherObj) {
            weatherConditionElement.textContent = weatherObj.description;
            if (weatherObj.icon) {
                const iconUrl = `https://openweathermap.org/img/wn/${weatherObj.icon}@2x.png`;
                if (weatherDynamicIcon) {
                    weatherDynamicIcon.src = iconUrl;
                    weatherDynamicIcon.alt = weatherObj.description;
                    weatherDynamicIcon.style.display = "inline-block";
                }
                if (weatherFallbackIcon) {
                    weatherFallbackIcon.style.display = "none";
                }
            }
        }

        weatherDegElement.textContent = formatTemp(data.main.temp);
        humidityElement.textContent = `Humedad: ${data.main.humidity}%`;
        windElement.textContent = `Viento: ${(data.wind.speed * 3.6).toFixed(1)} km/h (${getWindDirection(data.wind.deg)})`;
    };

    let rechartsRoot = null;

    const ForecastLineChartComponent = ({ data, unit }) => {
        if (!window.Recharts || !window.React) return null;
        const {
            ResponsiveContainer,
            AreaChart,
            Area,
            XAxis,
            YAxis,
            CartesianGrid,
            Tooltip
        } = window.Recharts;

        const CustomTooltip = ({ active, payload, label }) => {
            if (active && payload && payload.length) {
                const item = payload[0].payload;
                return window.React.createElement(
                    "div",
                    { className: "recharts-custom-tooltip" },
                    window.React.createElement("p", { className: "tooltip-day" }, label),
                    window.React.createElement(
                        "div",
                        { className: "tooltip-temp-row" },
                        item.icon
                            ? window.React.createElement("img", {
                                  src: `https://openweathermap.org/img/wn/${item.icon}.png`,
                                  className: "tooltip-icon",
                                  alt: item.description
                              })
                            : null,
                        window.React.createElement("span", { className: "tooltip-temp" }, `${item.temp}°${unit}`)
                    ),
                    window.React.createElement("p", { className: "tooltip-desc" }, item.description),
                    window.React.createElement(
                        "p",
                        { className: "tooltip-extra" },
                        `💧 Humedad: ${item.humidity}% | 💨 Viento: ${item.wind} km/h`
                    )
                );
            }
            return null;
        };

        return window.React.createElement(
            ResponsiveContainer,
            { width: "100%", height: 260 },
            window.React.createElement(
                AreaChart,
                {
                    data: data,
                    margin: { top: 25, right: 25, left: -10, bottom: 5 }
                },
                window.React.createElement(
                    "defs",
                    null,
                    window.React.createElement(
                        "linearGradient",
                        { id: "tempAreaGradient", x1: "0", y1: "0", x2: "0", y2: "1" },
                        window.React.createElement("stop", { offset: "5%", stopColor: "#38bdf8", stopOpacity: 0.55 }),
                        window.React.createElement("stop", { offset: "95%", stopColor: "#38bdf8", stopOpacity: 0.05 })
                    )
                ),
                window.React.createElement(CartesianGrid, {
                    strokeDasharray: "4 4",
                    stroke: "rgba(255, 255, 255, 0.15)",
                    vertical: false
                }),
                window.React.createElement(XAxis, {
                    dataKey: "day",
                    stroke: "rgba(255, 255, 255, 0.7)",
                    tick: { fill: "#ffffff", fontSize: 12, fontWeight: 600 },
                    axisLine: { stroke: "rgba(255, 255, 255, 0.3)" },
                    tickLine: { stroke: "rgba(255, 255, 255, 0.3)" }
                }),
                window.React.createElement(YAxis, {
                    stroke: "rgba(255, 255, 255, 0.7)",
                    tick: { fill: "#ffffff", fontSize: 11 },
                    unit: `°`,
                    domain: ["dataMin - 3", "dataMax + 4"],
                    axisLine: { stroke: "rgba(255, 255, 255, 0.3)" },
                    tickLine: { stroke: "rgba(255, 255, 255, 0.3)" }
                }),
                window.React.createElement(Tooltip, {
                    content: window.React.createElement(CustomTooltip)
                }),
                window.React.createElement(Area, {
                    type: "monotone",
                    dataKey: "temp",
                    name: `Temperatura (°${unit})`,
                    stroke: "#38bdf8",
                    strokeWidth: 3,
                    fill: "url(#tempAreaGradient)",
                    dot: {
                        stroke: "#ffffff",
                        strokeWidth: 2,
                        r: 5,
                        fill: "#0284c7"
                    },
                    activeDot: {
                        r: 7,
                        stroke: "#ffffff",
                        strokeWidth: 2,
                        fill: "#38bdf8"
                    },
                    label: {
                        fill: "#ffffff",
                        fontSize: 13,
                        fontWeight: 700,
                        position: "top",
                        offset: 10,
                        formatter: function (val) {
                            return val + "°" + unit;
                        }
                    }
                })
            )
        );
    };

    const updateForecastChart = (forecastData) => {
        const rootContainer = document.getElementById("forecast-chart-root");
        if (!rootContainer) return;

        if (!window.React || !window.Recharts) {
            setTimeout(() => updateForecastChart(forecastData), 250);
            return;
        }

        if (!forecastData || !forecastData.list) return;

        const dailyMap = new Map();
        forecastData.list.forEach((item) => {
            const dayKey = item.dt_txt.split(" ")[0];
            if (!dailyMap.has(dayKey) || item.dt_txt.includes("12:00:00")) {
                dailyMap.set(dayKey, item);
            }
        });

        const forecastDays = Array.from(dailyMap.values()).slice(0, 5);
        const chartData = forecastDays.map((item) => {
            const date = new Date(item.dt * 1000);
            const dayStr = date.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" });
            const capitalizedDay = dayStr.charAt(0).toUpperCase() + dayStr.slice(1);
            const tempC = item.main.temp;
            const tempVal = currentUnit === "F" ? Math.round((tempC * 9 / 5) + 32) : Math.round(tempC);

            return {
                day: capitalizedDay,
                temp: tempVal,
                celsius: tempC,
                humidity: item.main.humidity,
                wind: (item.wind.speed * 3.6).toFixed(1),
                description: item.weather?.[0]?.description || "",
                icon: item.weather?.[0]?.icon || ""
            };
        });

        const subtitleEl = document.getElementById("chart-subtitle");
        if (subtitleEl && forecastData.city?.name) {
            subtitleEl.textContent = `${forecastData.city.name} (${chartData.length} días)`;
        }

        try {
            if (!rechartsRoot && window.ReactDOM?.createRoot) {
                rechartsRoot = window.ReactDOM.createRoot(rootContainer);
            }

            const element = window.React.createElement(ForecastLineChartComponent, {
                data: chartData,
                unit: currentUnit
            });

            if (rechartsRoot) {
                rechartsRoot.render(element);
            } else if (window.ReactDOM?.render) {
                window.ReactDOM.render(element, rootContainer);
            }
        } catch (err) {
            console.error("Error rendering Recharts component:", err);
        }
    };

    const updateForecastUI = (data) => {
        lastForecastData = data;
        forecastDaysContainer.innerHTML = "";
        currentIndex = 0;
        forecastDaysContainer.style.transform = "translateX(0px)";
        const forecastDays = data.list.filter((item) => item.dt_txt.includes("12:00:00"));
        forecastDays.forEach((forecast) => {
            const date = new Date(forecast.dt * 1000);
            const options = { weekday: "long", day: "numeric", month: "long" };
            const dayString = date.toLocaleDateString("es-ES", options);
            const weatherObj = forecast.weather && forecast.weather[0];
            const iconHtml = weatherObj?.icon
                ? `<img class="forecast-weather-icon" src="https://openweathermap.org/img/wn/${weatherObj.icon}@2x.png" alt="${weatherObj.description}" />`
                : '';
            const dayElement = document.createElement("div");
            dayElement.classList.add("forecast-day");
            dayElement.dataset.celsius = forecast.main.temp;
            dayElement.innerHTML = `
                <div class="day-name">${dayString}</div>
                ${iconHtml}
                <div class="temp">${formatTemp(forecast.main.temp)}</div>
                <div class="description">${weatherObj ? weatherObj.description : ''}</div>
            `;
            forecastDaysContainer.appendChild(dayElement);
        });

        updateForecastChart(data);
    };

    const updateUVUI = (uvValue) => {
        const val = typeof uvValue === "number" ? uvValue : parseFloat(uvValue) || 0;
        const rounded = val.toFixed(1);

        const uvValueEl = document.getElementById("uv-value");
        const uvBadgeEl = document.getElementById("uv-badge");
        const uvFillEl = document.getElementById("uv-bar-fill");
        const uvSafetyEl = document.getElementById("uv-safety-text");

        if (uvValueEl) uvValueEl.textContent = rounded;

        let levelName = "Bajo";
        let levelClass = "uv-low";
        let safetyAdvice = "Riesgo bajo. No se requiere protección especial. Puedes disfrutar del aire libre de forma segura (usa gafas de sol en días muy brillantes).";

        if (val >= 11) {
            levelName = "Extremo";
            levelClass = "uv-extreme";
            safetyAdvice = "¡Alerta Extrema! Evita el sol en horas del mediodía. Quédate bajo techo o en la sombra. Si sales, utiliza ropa protectora, sombrero de ala ancha, gafas y crema solar FPS 50+.";
        } else if (val >= 8) {
            levelName = "Muy Alto";
            levelClass = "uv-very-high";
            safetyAdvice = "Riesgo muy alto. Minimiza la exposición solar directa entre las 10:00 y las 16:00. Usa camisa, sombrero, gafas UV y reaplica protector FPS 30+ cada 2 horas.";
        } else if (val >= 6) {
            levelName = "Alto";
            levelClass = "uv-high";
            safetyAdvice = "Riesgo alto. Protección recomendada: busca sombra en horas pico, usa sombrero, gafas de sol y aplica protector solar FPS 30+ generosamente.";
        } else if (val >= 3) {
            levelName = "Moderado";
            levelClass = "uv-moderate";
            safetyAdvice = "Riesgo moderado. Se recomienda protección solar. Usa crema solar FPS 30+, gafas y sombrero si vas a estar expuesto por tiempo prolongado.";
        }

        if (uvBadgeEl) {
            uvBadgeEl.className = `uv-badge ${levelClass}`;
            uvBadgeEl.textContent = `${levelName} (${rounded})`;
        }

        if (uvFillEl) {
            const percentage = Math.min(Math.max((val / 11) * 100, 8), 100);
            uvFillEl.style.width = `${percentage}%`;
            uvFillEl.className = `uv-bar-fill ${levelClass}`;
        }

        if (uvSafetyEl) {
            uvSafetyEl.textContent = safetyAdvice;
        }
    };

    const fetchUVIndex = (lat, lon) => {
        const url = `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                if (data && typeof data.value === "number") {
                    updateUVUI(data.value);
                } else {
                    fallbackUVFetch(lat, lon);
                }
            })
            .catch(() => {
                fallbackUVFetch(lat, lon);
            });
    };

    const fallbackUVFetch = (lat, lon) => {
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=uv_index`)
            .then((res) => res.json())
            .then((data) => {
                const uv = data?.current?.uv_index ?? 0;
                updateUVUI(uv);
            })
            .catch(() => {
                updateUVUI(0);
            });
    };

    const showAlertBanner = ({ title, description, instructions, severity = "danger", source = "", tag = "ALERTA ACTIVA" }) => {
        if (!weatherAlertBanner) return;

        weatherAlertBanner.className = `weather-alert-banner ${severity}`;
        if (alertBannerTag) alertBannerTag.textContent = tag;
        if (alertBannerSource) alertBannerSource.textContent = source ? `• ${source}` : "";
        if (alertBannerTitle) alertBannerTitle.textContent = title;
        if (alertBannerDesc) alertBannerDesc.textContent = description;

        if (alertBannerIcon) {
            if (severity === "danger") {
                alertBannerIcon.className = "fas fa-exclamation-triangle alert-banner-icon";
            } else if (severity === "warning") {
                alertBannerIcon.className = "fas fa-exclamation-circle alert-banner-icon";
            } else {
                alertBannerIcon.className = "fas fa-info-circle alert-banner-icon";
            }
        }

        if (alertBannerInstructions) {
            if (instructions) {
                alertBannerInstructions.innerHTML = `<strong><i class="fas fa-shield-alt"></i> Medidas preventivas recomendadas:</strong> ${instructions}`;
                alertBannerInstructions.style.display = "block";
            } else {
                alertBannerInstructions.style.display = "none";
            }
        }

        weatherAlertBanner.style.display = "block";
    };

    const hideAlertBanner = () => {
        if (weatherAlertBanner) {
            weatherAlertBanner.style.display = "none";
        }
    };

    const fetchNWSAlerts = async (lat, lon) => {
        try {
            const res = await fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`);
            if (!res.ok) return null;
            const data = await res.json();
            const alerts = data.features;
            if (alerts && alerts.length > 0) {
                const first = alerts[0].properties;
                return {
                    title: first.event || first.headline || "Alerta Meteorológica Oficial",
                    description: first.headline || first.description?.slice(0, 240) || "Condiciones meteorológicas severas activas en la región.",
                    instructions: first.instruction || "Siga las instrucciones de las autoridades locales y tome precauciones inmediatas.",
                    severity: (first.severity === "Severe" || first.severity === "Extreme") ? "danger" : "warning",
                    source: "Servicio Meteorológico Oficial (NWS)",
                    tag: first.severity ? first.severity.toUpperCase() : "ALERTA OFICIAL"
                };
            }
        } catch {
            return null;
        }
        return null;
    };

    const detectConditionAlerts = (weatherData, forecastData) => {
        if (!weatherData) return;
        const weather = weatherData.weather?.[0];
        const conditionId = weather?.id;
        const windSpeedKmH = weatherData.wind ? (weatherData.wind.speed * 3.6) : 0;
        const tempC = weatherData.main?.temp;
        const feelsLikeC = weatherData.main?.feels_like;

        // 1. Tornado
        if (conditionId === 781) {
            showAlertBanner({
                title: "Alerta de Tornado Activo",
                description: "¡Peligro inminente! Se ha registrado actividad de tornado en esta zona.",
                instructions: "Busque refugio subterráneo o en una habitación interior en el piso más bajo. Aléjese de las ventanas.",
                severity: "danger",
                source: "Detección Meteorológica",
                tag: "EMERGENCIA EXTREMA"
            });
            return;
        }

        // 2. Turbonada / Squalls
        if (conditionId === 771) {
            showAlertBanner({
                title: "Alerta por Turbonada y Vientos Violentos",
                description: "Ráfagas de viento repentinas y destructivas registradas en la localidad.",
                instructions: "Permanezca en interiores. Asegure objetos que puedan ser arrastrados por el viento.",
                severity: "danger",
                source: "Detección Meteorológica",
                tag: "ALERTA SEVERA"
            });
            return;
        }

        // 3. Tormenta Eléctrica Severa (200 - 232)
        if (conditionId >= 200 && conditionId < 300) {
            const isSevere = [202, 212, 221, 232].includes(conditionId);
            showAlertBanner({
                title: isSevere ? "Alerta de Tormenta Eléctrica Severa" : "Aviso de Tormenta Eléctrica",
                description: isSevere
                    ? "Tormenta eléctrica de gran intensidad con lluvias torrenciales y actividad eléctrica frecuente."
                    : "Actividad de tormenta eléctrica registrada en el área.",
                instructions: "Evite zonas descampadas, desconecte aparatos electrónicos y no permanezca cerca de estructuras metálicas o árboles solitarios.",
                severity: isSevere ? "danger" : "warning",
                source: "Estación Meteorológica",
                tag: isSevere ? "ALERTA ROJA" : "AVISO METEOROLÓGICO"
            });
            return;
        }

        // 4. Lluvias Torrenciales / Lluvia helada (502 - 504, 511)
        if ([502, 503, 504, 511].includes(conditionId)) {
            showAlertBanner({
                title: conditionId === 511 ? "Alerta de Lluvia Helada" : "Aviso de Lluvias Torrenciales",
                description: conditionId === 511
                    ? "Lluvia engelante provocando capas de hielo peligrosas en calzadas y superficies."
                    : "Precipitaciones de gran volumen con riesgo elevado de anegamientos e inundaciones repentinas.",
                instructions: "Evite circular por calles o pasos bajo nivel inundados. Maneje a baja velocidad con luces encendidas.",
                severity: "danger",
                source: "Estación Meteorológica",
                tag: "ALERTA POR PRECIPITACIÓN"
            });
            return;
        }

        // 5. Vendaval o Vientos Fuertes
        if (windSpeedKmH >= 65) {
            showAlertBanner({
                title: "Alerta de Vendaval / Vientos Muy Fuertes",
                description: `Se registran vientos de ${windSpeedKmH.toFixed(1)} km/h con potencial de caída de ramas, cables y cartelería.`,
                instructions: "Evite transitar cerca de andamios, árboles añosos o cornisas. Guarde o fije objetos en balcones.",
                severity: "danger",
                source: "Detección Anemométrica",
                tag: "ALERTA POR VIENTO"
            });
            return;
        } else if (windSpeedKmH >= 48) {
            showAlertBanner({
                title: "Aviso de Vientos Fuertes",
                description: `Ráfagas de viento sostenidas alcanzando ${windSpeedKmH.toFixed(1)} km/h en la zona.`,
                instructions: "Extreme precauciones en la vía pública y al conducir vehículos de gran porte o motocicletas.",
                severity: "warning",
                source: "Detección Anemométrica",
                tag: "AVISO METEOROLÓGICO"
            });
            return;
        }

        // 6. Ola de Calor Extremo
        if (tempC >= 38 || feelsLikeC >= 41) {
            showAlertBanner({
                title: "Alerta por Ola de Calor Extremo",
                description: `Temperaturas muy altas (${formatTemp(tempC)}). Riesgo elevado de deshidratación y descompensación térmica.`,
                instructions: "Beba abundante agua fresca, vista ropa clara y liviana, y no se exponga al sol en horas pico.",
                severity: "danger",
                source: "Alerta Biometeorológica",
                tag: "ALERTA POR CALOR"
            });
            return;
        }

        // 7. Frío Polar
        if (tempC <= -8) {
            showAlertBanner({
                title: "Alerta por Frío Polar Extremo",
                description: `Temperaturas extremadamente bajas (${formatTemp(tempC)}). Riesgo de hipotermia rápida.`,
                instructions: "Abríguese con varias capas térmicas, proteja vías respiratorias y no deje mascotas al aire libre.",
                severity: "warning",
                source: "Alerta Biometeorológica",
                tag: "ALERTA POR FRÍO"
            });
            return;
        }

        // 8. Chequear pronóstico de próximas horas si viene tormenta severa
        if (forecastData && forecastData.list) {
            const nextSlots = forecastData.list.slice(0, 5);
            const upcomingSevere = nextSlots.find(item => {
                const id = item.weather?.[0]?.id;
                return id >= 200 && id < 300;
            });

            if (upcomingSevere) {
                const timeStr = new Date(upcomingSevere.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                showAlertBanner({
                    title: "Aviso Preventivo: Tormenta Inminente",
                    description: `Los modelos pronostican desarrollo de tormentas eléctricas hacia las ${timeStr} para esta localidad.`,
                    instructions: "Planifique sus actividades con precaución y manténgase informado ante posibles actualizaciones.",
                    severity: "advisory",
                    source: "Pronóstico Meteorológico 24h",
                    tag: "AVISO PREVENTIVO"
                });
                return;
            }
        }

        // Si no se detectan alertas activas:
        hideAlertBanner();
    };

    const checkWeatherAlerts = (weatherData, forecastData) => {
        if (!weatherData) return;
        const lat = weatherData.coord?.lat;
        const lon = weatherData.coord?.lon;
        const country = weatherData.sys?.country;

        if (country === "US" && lat && lon) {
            fetchNWSAlerts(lat, lon)
                .then((nwsAlert) => {
                    if (nwsAlert) {
                        showAlertBanner(nwsAlert);
                    } else {
                        detectConditionAlerts(weatherData, forecastData);
                    }
                })
                .catch(() => {
                    detectConditionAlerts(weatherData, forecastData);
                });
        } else {
            detectConditionAlerts(weatherData, forecastData);
        }
    };

    const fetchWeatherData = (city = DEFAULT_CITY) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=es&appid=${API_KEY}`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                if (data.cod !== 200) {
                    showError("❌ Ciudad no encontrada. Verifica el nombre.");
                    return;
                }
                updateWeatherUI(data);
                if (data.coord) {
                    fetchUVIndex(data.coord.lat, data.coord.lon);
                }
                checkWeatherAlerts(data, lastForecastData);
            })
            .catch(() => showError("⚠️ Error al obtener el clima."));
    };

    const fetchForecastData = (city = DEFAULT_CITY) => {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&lang=es&appid=${API_KEY}`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                if (data.cod !== "200") {
                    showError("⚠️ No se pudo obtener el pronóstico.");
                    return;
                }
                updateForecastUI(data);
                checkWeatherAlerts(lastWeatherData, data);
            })
            .catch(() => showError("⚠️ Error al obtener el pronóstico."));
    };

    const fetchWeatherByCoords = (lat, lon) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${API_KEY}`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                if (data.cod !== 200) {
                    showError("❌ Error al obtener clima para tu ubicación.");
                    return;
                }
                updateWeatherUI(data);
                if (cityInput) {
                    cityInput.value = data.name;
                }
                fetchUVIndex(lat, lon);
                checkWeatherAlerts(data, lastForecastData);
            })
            .catch(() => showError("⚠️ Error al obtener el clima de tu ubicación."));
    };

    const fetchForecastByCoords = (lat, lon) => {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${API_KEY}`;
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                if (data.cod !== "200") {
                    showError("⚠️ No se pudo obtener el pronóstico de tu ubicación.");
                    return;
                }
                updateForecastUI(data);
                checkWeatherAlerts(lastWeatherData, data);
            })
            .catch(() => showError("⚠️ Error al obtener el pronóstico de tu ubicación."));
    };

    const getWindDirection = (deg) => {
        const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
        const index = Math.round(deg / 45) % 8;
        return directions[index];
    };

    let currentIndex = 0;

    const updateSliderPosition = () => {
        const firstDay = document.querySelector(".forecast-day");
        if (!firstDay) return;
        const slideWidth = firstDay.offsetWidth + 10;
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

    // Soporte táctil (swipe) para dispositivos móviles
    let touchStartX = 0;
    let touchEndX = 0;

    if (forecastDaysContainer) {
        forecastDaysContainer.addEventListener(
            "touchstart",
            (e) => {
                touchStartX = e.changedTouches[0].screenX;
            },
            { passive: true }
        );

        forecastDaysContainer.addEventListener(
            "touchend",
            (e) => {
                touchEndX = e.changedTouches[0].screenX;
                const threshold = 40;
                if (touchEndX < touchStartX - threshold) {
                    if (currentIndex < forecastDaysContainer.children.length - 1) {
                        currentIndex++;
                        updateSliderPosition();
                    }
                } else if (touchEndX > touchStartX + threshold) {
                    if (currentIndex > 0) {
                        currentIndex--;
                        updateSliderPosition();
                    }
                }
            },
            { passive: true }
        );
    }

    // Adaptabilidad en cambio de orientación o redimensionamiento
    window.addEventListener("resize", () => {
        updateSliderPosition();
        if (lastForecastData) {
            updateForecastChart(lastForecastData);
        }
    });

    const updateTime = () => {
        const now = new Date();
        const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const day = dayNames[now.getDay()];
        const date = now.toLocaleDateString();

        let timeStr = "";
        if (currentTimeFormat === "12") {
            timeStr = now.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
                hour12: true
            });
        } else {
            timeStr = now.toLocaleTimeString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            });
        }

        const dayEl = document.querySelector(".day");
        const dateEl = document.querySelector(".date");
        const timeEl = document.getElementById("current-time");

        if (dayEl) dayEl.textContent = day;
        if (dateEl) dateEl.textContent = date;
        if (timeEl) timeEl.textContent = timeStr;
    };

    setInterval(updateTime, 1000);
    updateTime();

    fetchWeatherData();
    fetchForecastData();

    if (cityInput) {
        cityInput.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                const city = event.target.value.trim();
                if (city) {
                    fetchWeatherData(city);
                    fetchForecastData(city);
                }
            }
        });
    }

    if (locationBtn) {
        locationBtn.addEventListener("click", () => {
            if (!navigator.geolocation) {
                showError("⚠️ Tu navegador no soporta geolocalización.");
                return;
            }

            locationBtn.classList.add("loading");
            locationBtn.disabled = true;

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    locationBtn.classList.remove("loading");
                    locationBtn.disabled = false;
                    const { latitude, longitude } = position.coords;
                    fetchWeatherByCoords(latitude, longitude);
                    fetchForecastByCoords(latitude, longitude);
                },
                (error) => {
                    locationBtn.classList.remove("loading");
                    locationBtn.disabled = false;
                    let message = "No se pudo obtener tu ubicación.";
                    if (error.code === error.PERMISSION_DENIED) {
                        message = "Permiso denegado. Permite el acceso a la ubicación en tu navegador.";
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        message = "Ubicación actual no disponible.";
                    } else if (error.code === error.TIMEOUT) {
                        message = "Tiempo de espera agotado al consultar ubicación.";
                    }
                    showError(`⚠️ ${message}`);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000
                }
            );
        });
    }

    if (unitCBtn) {
        unitCBtn.addEventListener("click", () => setUnit("C"));
    }

    if (unitFBtn) {
        unitFBtn.addEventListener("click", () => setUnit("F"));
    }

    if (alertBannerClose) {
        alertBannerClose.addEventListener("click", () => {
            hideAlertBanner();
        });
    }

    if (testAlertBtn) {
        testAlertBtn.addEventListener("click", () => {
            if (weatherAlertBanner && weatherAlertBanner.style.display !== "none") {
                hideAlertBanner();
            } else {
                const currentCity = cityNameElement.textContent || "la región";
                showAlertBanner({
                    title: "Alerta Meteorológica: Tormentas Severas y Granizo",
                    description: `Aviso oficial para ${currentCity} y zonas aledañas: Se esperan tormentas eléctricas severas, ráfagas de viento superiores a 70 km/h y posible caída de granizo.`,
                    instructions: "Permanezca en construcciones firmes y cerradas. No saque la basura ni objetos que puedan obstruir desagües. Evite circular por calles anegadas.",
                    severity: "danger",
                    source: "Sistema de Alerta Temprana",
                    tag: "ALERTA NARANJA"
                });
            }
        });
    }

    if (time24Btn) {
        time24Btn.addEventListener("click", () => setTimeFormat("24"));
    }

    if (time12Btn) {
        time12Btn.addEventListener("click", () => setTimeFormat("12"));
    }

    if (timeBadgeBtn) {
        timeBadgeBtn.addEventListener("click", () => {
            setTimeFormat(currentTimeFormat === "24" ? "12" : "24");
        });
    }

    updateUnitButtons();
    updateTimeButtons();

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
