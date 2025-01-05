let titleLogo = document.querySelector(".title");
let bodyElem = document.querySelector("body");

window.addEventListener("load", () => {
	let randNum = Math.ceil(Math.random() * 5);
	bodyElem.style.backgroundImage = `url('imagenes/bg${randNum}.jpg')`;
	if (randNum === 3 || randNum === 4 || randNum === 5) {
		titleLogo.style.color = "white";
	}
});

let cityInput = document.querySelector("#get-city");
cityInput.addEventListener("keypress", (event) => {
	if (event.key === "Enter") {
		fetchDataFromApi();
	}
});

let apiData = {
	url: "https://api.openweathermap.org/data/2.5/weather?q=",
	key: "124b92a8dd9ec01ffb0dbf64bc44af3c",
};

cityInput.value = "Concordia";
fetchDataFromApi();
cityInput.value = "";

function fetchDataFromApi() {
	let insertedCity = cityInput.value;
	fetch(`${apiData.url}${insertedCity}&appid=${apiData.key}`)
		.then((res) => res.json())
		.then((data) => addDataToDom(data));
}

let cityName = document.querySelector(".city-name");
let cityTemp = document.querySelector(".weather-deg");
let cityCond = document.querySelector(".weather-condition");
let cityHumidity = document.querySelector(".humidity");
let cityWind = document.querySelector(".wind");
let todayDate = document.querySelector(".date");
let currentTime = document.querySelector(".time");
let moonPhaseElem = document.querySelector(".moon-phase");
let dayNightStatus = document.querySelector(".day-night-status");
let dayIcon = document.querySelector("#day-icon");

function addDataToDom(data) {
	cityName.innerHTML = `${data.name}, ${data.sys.country}`;
	cityTemp.innerHTML = `${Math.round(data.main.temp - 273.15)}°C`;
	cityCond.innerHTML = translateWeatherCondition(data.weather[0].description);
	cityHumidity.innerHTML = `Humedad: ${data.main.humidity}%`;
	cityWind.innerHTML = `Viento: ${(data.wind.speed * 3.6).toFixed(1)} km/h, ${getWindDirection(data.wind.deg)}`;
	todayDate.innerHTML = getDate();
	updateDayNightStatus(data.sys.sunrise, data.sys.sunset);
	updateMoonPhase();
}

function translateWeatherCondition(description) {
	const translations = {
		"clear sky": "Cielo despejado",
		"few clouds": "Pocas nubes",
		"scattered clouds": "Nubes dispersas",
		"broken clouds": "Nubes rotas",
		"overcast clouds": "Nublado",
		"shower rain": "Lluvia ligera",
		"rain": "Lluvia",
		"thunderstorm": "Tormenta eléctrica",
		"snow": "Nieve",
		"mist": "Neblina",
	};

	return translations[description] || description; // Retorna la traducción o el original si no está en el 
diccionario
}

let months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", 
"Noviembre", "Diciembre"];
let days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function getDate() {
	let newTime = new Date();
	let day = days[newTime.getDay()];
	let month = months[newTime.getMonth()];
	return `${day}, ${newTime.getDate()} ${month} ${newTime.getFullYear()}`;
}

function updateLiveTime() {
	let now = new Date();
	let hours = now.getHours().toString().padStart(2, "0");
	let minutes = now.getMinutes().toString().padStart(2, "0");
	let seconds = now.getSeconds().toString().padStart(2, "0");
	currentTime.innerHTML = `${hours}:${minutes}:${seconds}`;
}

function getWindDirection(deg) {
	const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
	const index = Math.round(deg / 45) % 8;
	return directions[index];
}

function updateDayNightStatus(sunrise, sunset) {
	let now = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
	if (now >= sunrise && now < sunset) {
		dayNightStatus.innerHTML = "Día";
		dayIcon.style.display = "inline-block";
	} else {
		dayNightStatus.innerHTML = "Noche";
		dayIcon.style.display = "none";
	}
}

function updateMoonPhase() {
	let now = new Date();
	let lunarCycle = 29.53; // Duración promedio de un ciclo lunar en días
	let newMoon = new Date("2024-01-11"); // Fecha conocida de luna nueva
	let daysSinceNewMoon = (now - newMoon) / (1000 * 60 * 60 * 24); // Diferencia en días
	let phaseIndex = Math.round((daysSinceNewMoon % lunarCycle) / (lunarCycle / 8));
	let phases = ["Luna nueva", "Creciente inicial", "Cuarto creciente", "Creciente gibosa", "Luna llena", 
"Menguante gibosa", "Cuarto menguante", "Menguante inicial"];
	moonPhaseElem.innerHTML = `Fase lunar: ${phases[phaseIndex]}`;
}

setInterval(updateLiveTime, 1000);
