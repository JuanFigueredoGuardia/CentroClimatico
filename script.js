let titleLogo = document.querySelector(".title");
let bodyElem = document.querySelector("body");

window.addEventListener("load", () => {
	let randNum = Math.ceil(Math.random() * 5);
	bodyElem.style.backgroundImage = `url('imagenes/bg${randNum}.jpg')`;
	if (randNum == 3 || randNum == 4 || randNum == 5) {
		titleLogo.style.color = "white";
	}
});

let cityInput = document.querySelector("#get-city");
cityInput.addEventListener("keypress", (event) => {
	if (event.key == "Enter") {
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
	fetch(`${apiData.url}${insertedCity}&&appid=${apiData.key}&lang=es`)
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
let drivingDifficulty = document.createElement("h3");
let pollenLevel = document.createElement("h3");
let runningAdvice = document.createElement("h3");

document.querySelector(".info-container").append(drivingDifficulty, pollenLevel, runningAdvice);

function addDataToDom(data) {
	cityName.innerHTML = `${data.name}, ${data.sys.country}`;
	cityTemp.innerHTML = `${Math.round(data.main.temp - 273.15)}°C`;
	cityCond.innerHTML = data.weather[0].description;
	cityHumidity.innerHTML = `Humedad: ${data.main.humidity}%`;

	// Conversión de m/s a km/h
	let windSpeedKmH = (data.wind.speed * 3.6).toFixed(1); // Redondeo a 1 decimal
	cityWind.innerHTML = `Viento: ${windSpeedKmH} km/h, ${getWindDirection(data.wind.deg)}`;
	
	todayDate.innerHTML = getFullDate();

	// Simulación de niveles de polen
	let pollenIndex = simulatePollen(data.main.humidity, windSpeedKmH);
	pollenLevel.innerHTML = `Nivel de polen: ${pollenIndex}`;

	// Dificultad para conducir
	let drivingAdvice = getDrivingDifficulty(data.weather[0].main, windSpeedKmH);
	drivingDifficulty.innerHTML = `Dificultad para conducir: ${drivingAdvice}`;

	// Consejos para correr
	let runningCondition = getRunningAdvice(data.main.temp, windSpeedKmH);
	runningAdvice.innerHTML = `Consejo para correr: ${runningCondition}`;
}

// Arrays de días y meses en español
let days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
let months = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre"
,"Diciembre",
];

// Función para obtener la fecha completa en español
function getFullDate() {
	let newTime = new Date();
	let dayOfWeek = days[newTime.getDay()]; // Día de la semana
	let day = newTime.getDate().toString().padStart(2, "0");
	let month = months[newTime.getMonth()];
	let year = newTime.getFullYear();
	return `${dayOfWeek}, ${day} de ${month} de ${year}`;
}

// Función para obtener la hora en vivo en formato español
function updateLiveTime() {
	let now = new Date();
	let hours = now.getHours().toString().padStart(2, "0");
	let minutes = now.getMinutes().toString().padStart(2, "0");
	let seconds = now.getSeconds().toString().padStart(2, "0");
	currentTime.innerHTML = `Hora actual: ${hours}:${minutes}:${seconds}`;
}

// Función para convertir dirección del viento a puntos cardinales en español
function getWindDirection(deg) {
	const directions = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];
	const index = Math.round(deg / 45) % 8;
	return directions[index];
}

// Simulación de niveles de polen
function simulatePollen(humidity, windSpeed) {
	if (humidity > 70 || windSpeed < 10) {
		return "Bajo";
	} else if (humidity <= 70 && windSpeed >= 10 && windSpeed <= 20) {
		return "Moderado";
	} else {
		return "Alto";
	}
}

// Determinar dificultad para conducir
function getDrivingDifficulty(weatherCondition, windSpeed) {
	if (["Rain", "Snow", "Thunderstorm"].includes(weatherCondition) || windSpeed > 36) {
		return "Difícil";
	} else if (windSpeed > 18) {
		return "Moderado";
	} else {
		return "Fácil";
	}
}

// Determinar si es buen momento para correr
function getRunningAdvice(temp, windSpeed) {
	let tempCelsius = temp - 273.15; // Convertir de Kelvin a Celsius
	if (tempCelsius < 10 || tempCelsius > 30 || windSpeed > 36) {
		return "Malo";
	} else if ((tempCelsius >= 10 && tempCelsius <= 15) || windSpeed > 18) {
		return "Regular";
	} else {
		return "Bueno";
	}
}

// Actualizar la hora en vivo cada segundo
setInterval(updateLiveTime, 1000);
