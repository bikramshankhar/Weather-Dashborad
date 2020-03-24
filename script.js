
let searchBar = $("#searchBar");
let searchButton = $("#searchBtn");
let searchHistory = $("#searchHistory");
let currentDay = $("#currentDay");

let apiKey = "4108a6c32359fff2574ba233a1ecfc25";
let currentWeatherUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + searchBar.val() + "&units=imperial&appid=" + apiKey;
let forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + searchBar.val() + "&units=imperial&appid=" + apiKey;
let storedHistory = "";

//Populates stored searches from local storage
let history = localStorage.getItem("storedHistory");
if (history != null)
    storedHistory = history.split(",");

//Creates current date
let today = new Date();
let date = today.getFullYear()+'-'+ (today.getMonth()+1)+'-'+today.getDate();

function currentWeather() {

    $.ajax({
        url: currentWeatherUrl,
        method: "GET"
    }).then(function (response) {

        //Object to store current weather data
        let currentWeatherObj = {
            location: response.name,
            date: date,
            weatherIcon: response.weather[0].icon,
            temperature: Math.round(response.main.temp),
            humidity: response.main.humidity,
            wind: response.wind.speed,
            uvIndex: 0,
            uvIntensity: ""
        };

        //Format the date for the object 
        currentWeatherObj.date = formatDates(currentWeatherObj.date);

        //Call to get UV index 
        let latitude = response.coord.lat;
        let longitude = response.coord.lon;
        let currentUvUrl = "https://api.openweathermap.org/data/2.5/uvi?lat=" + latitude + "&lon=" + longitude + "&appid=" + apiKey;

        $.ajax({
            url: currentUvUrl,
            method: "GET"
        }).then(function (response) {

            currentWeatherObj.uvIndex = response.value;

            //Assigns uvIntensity based on the uvIndex number (will be used for CSS styling
            if (currentWeatherObj.uvIndex >= 8)
             currentWeatherObj.uvIntensity = "high";
            else if (currentWeatherObj.uvIndex < 3)
                currentWeatherObj.uvIntensity = "low";
            else
                currentWeatherObj.uvIntensity = "medium";

            //Generates a card with all current weather info and appends it to the weatherCol element

            let currentWeatherCard = $('<div class="card"><div class="card-body"><h5 class="card-title">' + currentWeatherObj.location + ' (' + currentWeatherObj.date + ') ' +
                '<span><img id="weather-icon" src="http://openweathermap.org/img/w/' + currentWeatherObj.weatherIcon + '.png"></span></h5>' +
                '<p class="card-text">Temperature: ' + currentWeatherObj.temperature + ' °F</p>' +
                '<p class="card-text">Humidity: ' + currentWeatherObj.humidity + '%</p>' +
                '<p class="card-text">Wind Speed: ' + currentWeatherObj.wind + ' MPH</p>' +
                '<p class="card-text">UV Index: <span class="badge badge-secondary ' + currentWeatherObj.uvIntensity + '">' + currentWeatherObj.uvIndex + '</span>')
            $("#currentDay").append(currentWeatherCard);
        });

        renderstoredHistory();

    });
}

function weatherForcast() {

    let fiveDayForecastArray = [];

    //Five day forecast API call
    $.ajax({
        url: forecastUrl,
        method: "GET"
    }).then(function (response) {

        console.log(response);

        let temporaryForecastObj;

        //Gets the weather data for around 24 hours after the API call, and 24 hours after that for the five day forecast, then populates forecast array
        for (let i = 4; i < response.list.length; i += 8) {
            temporaryForecastObj = {
                date: response.list[i].dt_txt.split(" ")[0],
                weatherIcon: response.list[i].weather[0].icon,
                temperature: Math.round(response.list[i].main.temp),
                humidity: response.list[i].main.humidity
            };
            fiveDayForecastArray.push(temporaryForecastObj);
        }

        //Format dates for every object in the array
        for (let i = 0; i < fiveDayForecastArray.length; i++) {
            fiveDayForecastArray[i].date = formatDates(fiveDayForecastArray[i].date);
        }

        //Creates HTML elements to populate page with forecast data
        let forecastHeader = $('<h5>5-Day Forecast:</h5>');
        $("#forecastHeader").append(forecastHeader);

        for (let i = 0; i < fiveDayForecastArray.length; i++) {
            let forecastCard = $('<div class="card col-md-2 ml-4 bg-primary text-white"><span class="card-body p-3 "><h6>' + fiveDayForecastArray[i].date + '</h6>' +
                '<p><img src="http://openweathermap.org/img/w/' + fiveDayForecastArray[i].weatherIcon + '.png"></p>' +
                '<p>Temp: ' + fiveDayForecastArray[i].temperature + '°F</p>' +
                '<p>Humidity: ' + fiveDayForecastArray[i].humidity + '%</p>' +
                '<span></div>');
            $("#forecastRow").append(forecastCard);
        }


    });
}

function renderstoredHistory() {

    $("#searchHistory").empty();

    if ($("#searchBar").val() != "") {
        if (storedHistory.indexOf($("#searchBar").val()) != -1) {
            storedHistory.splice(storedHistory.indexOf($("#searchBar").val()))
        }
        storedHistory.unshift($("#searchBar").val());
    }

    //Saves History to local storage
    localStorage.setItem("storedHistory", storedHistory);

    //Creates search history list items to show under the search bar
    for (let i = 0; i < storedHistory.length; i++) {
        let newListItem = $('<li class="list-group-item">' + storedHistory[i] + '</li>');
        $("#searchHistory").append(newListItem);
      

    }

    //Allows user to search for list items they click on
    $("li").on("click", function () {
        $("#searchBar").val($(event.target).text());
        searchButton.click();



    });
}

//Changes the date to month/day/year format
function formatDates(data) {
    let dateArray = data.split("-");
    let formattedDate = dateArray[1] + "/" + dateArray[2] + "/" + dateArray[0];
    return formattedDate
}

searchButton.on("click", function () {

    currentWeatherUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + searchBar.val() + "&units=imperial&appid=" + apiKey;

    forecastUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + searchBar.val() + "&units=imperial&appid=" + apiKey;

    $("#currentDay").empty();
    $("#forecastHeader").empty();
    $("#forecastRow").empty();


    currentWeather();
    weatherForcast();
});

//Alows user to press enter in the search bar rather than have to press the search button
$("#searchBar").keypress(function () {
    if (event.keyCode == 13)
        searchButton.click();
});

renderstoredHistory();