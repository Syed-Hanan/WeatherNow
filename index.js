const show = document.getElementById("show");
const search = document.getElementById("search");
const cityVal = document.getElementById("city");

// Your OpenWeatherMap API Key
const weatherApiKey = "2f745fa85d563da5adb87b6cd4b81caf";

// Your Cohere API Key
const cohereApiKey = "zlo3r2pUchbx5Lt30NhRlXUqlNraTZl3oqoovGyf";  // Replace with your Cohere API Key

// Fetch the weather data for a given city
const getWeather = async (cityValue) => {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityValue}&appid=${weatherApiKey}&units=metric`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.cod === 200) {
            show.innerHTML = `
                <h2>${data.name}, ${data.sys.country}</h2>
                <h4 class="weather">${data.weather[0].main}</h4>
                <h4 class="desc">${data.weather[0].description}</h4>
                <img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png" alt="Weather Icon">
                <h1>${data.main.temp} &#176;C</h1>
                <div class="temp_container">
                    <div>
                        <h4 class="title">Min</h4>
                        <h4 class="temp">${data.main.temp_min} &#176;C</h4>
                    </div>
                    <div>
                        <h4 class="title">Max</h4>
                        <h4 class="temp">${data.main.temp_max} &#176;C</h4>
                    </div>
                </div>
            `;
        } else {
            show.innerHTML = `<h3 class="error">City not found</h3>`;
        }
    } catch (error) {
        show.innerHTML = `<h3 class="error">Error fetching weather data</h3>`;
    }
};

// Process the weather query to extract the city name using Cohere
const processQuery = async (query) => {
    const apiUrl = "https://api.cohere.ai/v1/generate";  // Cohere's API endpoint

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${cohereApiKey}`,  // Use your Cohere API Key here
            },
            body: JSON.stringify({
                prompt: `Extract the name of the city from the following weather-related query: "${query}". Only return the city name.`,
                max_tokens: 50,
                temperature: 0.7,
            }),
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`Cohere API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Check if data contains the city name
        if (data.generations && data.generations[0] && data.generations[0].text) {
            const city = data.generations[0].text.trim();  // Extract the city name
            return city;
        } else {
            throw new Error("City name not found in the response");
        }
    } catch (error) {
        console.error("Error processing the query with Cohere:", error);
        return "";  // Return an empty string if there's an error
    }
};

// Handle the search input and process the query
const handleSearch = async () => {
    const query = cityVal.value.trim();
    if (query.length === 0) {
        show.innerHTML = `<h3 class="error">Please enter a query</h3>`;
        return;
    }

    cityVal.value = "";

    if (query.toLowerCase().includes("weather")) {
        // Process the query with Cohere to extract city
        const city = await processQuery(query);
        if (city) {
            getWeather(city);
        } else {
            show.innerHTML = `<h3 class="error">City not found in query</h3>`;
        }
    } else {
        // If the query doesn't include "weather", treat it as a direct city input
        getWeather(query);
    }
};

search.addEventListener("click", handleSearch);
window.addEventListener("load", () => getWeather("VARANASI"));


//What is the weather like in New York?
//Tell me the weather in Los Angeles
//What's the weather?
//capital letters use for city name