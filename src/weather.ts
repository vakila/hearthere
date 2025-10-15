

export const lngLatEndpoint =  (lng: number, lat: number) => `https://api.weather.gov/points/${lat},${lng}`;

async function fetchJson(endpoint: string) {
    const result = await fetch(endpoint);
    const jsonResult = await result.json();
    console.log(jsonResult);
    return jsonResult;
}

export async function getGridpointAt(lng: number, lat:number) {
    const endpoint = lngLatEndpoint(lng, lat);
    console.log(endpoint);
    return await fetchJson(endpoint);
    
}

export async function getWeatherAt(lng: number, lat: number) {
    const gridpoint = await getGridpointAt(lng, lat);
    if (!gridpoint.properties?.forecastHourly) {
        console.error('Could not load forecast for these coordinates');
        console.error('Response: ', gridpoint);
    }
    const hourlyEndpoint = gridpoint.properties.forecastHourly;
    console.log(hourlyEndpoint);
    const hourly = await fetchJson(hourlyEndpoint);
    console.log(hourly.properties);
    const elevationMeters = hourly.properties.elevation.value;
    console.log('elevation', elevationMeters);
    const nextHour = hourly.properties.periods[0];
    console.log('temp (F)', nextHour.temperature);
    console.log('daytime?', nextHour.isDaytime);
    console.log('');

}