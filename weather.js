let array = localStorage.getItem("myArray");
console.log(`[array] ${array}`);
//if there is no array set up already...
if (!array) {
    localStorage.setItem("myArray", "[]"); //set up an empty array
    console.log(`[empty array] ${array}`);
};
let arraySaved = JSON.parse(localStorage.getItem("myArray"));
// If browser reloads, load the saved places
if (location.reload) {
    keepSaved();
}


function searchWeather(event) {
    event.preventDefault();
    let city = document.querySelector('#cityInput').value;
    let country = document.querySelector('#countryInput').value;
    if (city, country) {
        console.log(`searching for City [${city}], in Country [${country}]`);
        getCoordinates(city, country);
    }
    // clear the inputs after searching
    document.querySelector('#cityInput').value = '';
    document.querySelector('#countryInput').value = '';
    // clear the old loaded weatherInfos
    document.querySelector('#weatherInfo').innerHTML = '';
    document.querySelector('#weatherInfo2').innerHTML = '';
}

function saveWeather(city, country) {
    console.log(`[arraySaved] ${arraySaved}`);
    console.log(`saving...`);
    let arrayCheck = arraySaved.includes(`${city}, ${country}`);
    console.log(`checking if already saved...[${arrayCheck}]`);
    if (!arrayCheck) {
        arraySaved.push(`${city}, ${country}`);
        let myArray = JSON.stringify(arraySaved);
        localStorage.setItem("myArray", myArray); //save the new array
        console.log('[now saved to localStorage]');
    };
    keepSaved();
}
// load the saved places below search
function keepSaved() {
    document.querySelector('#savedWeather').innerHTML = "";
    if (arraySaved) {
        for (i = 0; i < arraySaved.length; i++) {
            document.querySelector('#savedWeather').innerHTML +=
                `<button onClick="readButton('${arraySaved[i]}')" class='btn btn-warning btn-sm'>${arraySaved[i]}</button>&nbsp;`
        };
    }
}


// convert the savedWeather buttons into readable parameters
function readButton(string) {
    let cityCountry = string.split(","); // separate words, city and country
    console.log(`clicking [Button], ${cityCountry[0]}, ${cityCountry[1]}`);
    let word1 = cityCountry[0];
    let word2 = cityCountry[1];
    // clear the old loaded weatherInfos
    document.querySelector('#weatherInfo').innerHTML = '';
    document.querySelector('#weatherInfo2').innerHTML = '';
    getCoordinates(word1, word2);
}

async function getCoordinates(city, country) {

    let cityUpper = city.trim().toUpperCase();
    let countryUpper = country.trim().toUpperCase();
    console.log(`coordinating, ${cityUpper}, ${countryUpper}`);

    // 5 day forecast api
    let forecast = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(cityUpper)},${encodeURIComponent(countryUpper)}&exclude=minutely,hourly&units=metric&appid=ba5464c03770ebbbeac1eefe8ce98a96`).then(r => r.json());
    console.log(`fetched forecast,`, forecast);

    //display forecasts
    let forecastedDays = forecast.list.length;
    for (let i = 7; i < forecastedDays; i += 8) {
        //unix time converted with a method for forecasts
        let forecastTime = new Date(forecast.list[i].dt * 1000).toLocaleDateString('en-US');

        document.querySelector('#weatherInfo2').innerHTML +=
            `<div class="card col-md col-6" style="background-color:#006666; color:white;">
                <div class="card-body">
                <p class="card-text">
                ${forecastTime}
                <br />
                <img src="http://openweathermap.org/img/w/${forecast.list[i].weather[0].icon}.png" alt="Weather icon" />
                <br />
                temp: ${forecast.list[i].main.temp} &#8451;
                <br />
                Humidity: ${forecast.list[i].main.humidity} %
                <br />
                pressure: ${forecast.list[i].main.pressure} hPa
                </p>
                </div>
            </div>`
    }

    // plugging coordinates to second fetch from first fetch
    let lat = forecast.city.coord.lat;
    let lon = forecast.city.coord.lon;
    // current weather api
    let current = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&units=metric&appid=ba5464c03770ebbbeac1eefe8ce98a96`).then(r => r.json());
    console.log(`fetched current,`, current);

    // get current time
    let currentTime = new Date(current.current.dt * 1000);
    // display current weather
    document.querySelector('#weatherInfo').innerHTML =
        `<div class="card" style="background-color:#004080; color:white;">
            <div class="card-header"><h1>${cityUpper}, ${countryUpper}</h1><br/><h4>${currentTime}</h4><img src="http://openweathermap.org/img/w/${current.current.weather[0].icon}.png" alt="Weather icon" /></div>
            <div class="card-body">
                <h5>Temperature: ${current.current.temp} &#8451;
                <br />
                Humidity: ${current.current.humidity} %
                <br />
                Windspeed: ${current.current.wind_speed} km/h, from ${current.current.wind_deg} degrees
                <br />
                Pressure: ${current.current.pressure} hPa
                <br />
                UV Index: ${current.current.uvi} out of 10
                </h5>
            </div>
        </div>`

    if (current) {
        saveWeather(cityUpper, countryUpper); // save place
    }
}