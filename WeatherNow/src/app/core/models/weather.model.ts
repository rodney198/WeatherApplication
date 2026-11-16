/**
 * WeatherNow - Type definitions for weather data
 * Centralized interfaces ensuring type safety across the application.
 */

export interface WeatherCondition {
  id: number;
  main: string;
  description: string;
  icon: string;
}

export interface CurrentWeather {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: number;
  feels_like: number;
  temp_min?: number;
  temp_max?: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: WeatherCondition[];
  clouds?: number;
  rain?: number;
  snow?: number;
}

export interface HourlyForecast {
  dt: number;
  temp: number;
  feels_like?: number;
  pressure?: number;
  humidity?: number;
  dew_point?: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: WeatherCondition[];
  clouds?: number;
  pop?: number;
  rain?: number;
  snow?: number;
  uvi?: number;
}

export interface DailyForecast {
  dt: number;
  sunrise: number;
  sunset: number;
  moonrise: number;
  moonset: number;
  moon_phase: string;
  temp: {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  };
  feels_like: {
    day: number;
    night: number;
    eve: number;
    morn: number;
  };
  pressure: number;
  humidity: number;
  dew_point: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: WeatherCondition[];
  clouds: number;
  pop: number;
  rain?: number;
  snow?: number;
  uvi: number;
}

export interface WeatherResponse {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

export interface WeatherState {
  current: CurrentWeather | null;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  lastUpdated: number | null;
  loading: boolean;
  error: string | null;
}

export const EMPTY_WEATHER_STATE: WeatherState = {
  current: null,
  hourly: [],
  daily: [],
  lastUpdated: null,
  loading: false,
  error: null,
};