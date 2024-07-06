import {Planet} from "../types/trips.ts";

export const CHART_API_DOMAIN = "quickchart.io";
export const CHART_API_BASE_URL = `https://${CHART_API_DOMAIN}/chart`;
const CHART_CREATE_ENDPOINT = "/create";
export const CHART_CREATE_URL = `${CHART_API_BASE_URL}${CHART_CREATE_ENDPOINT}`;

export const PLANETS = Object.values(Planet).sort((a, b) => a > b ? 1 : -1);
export const TIME_AXIS_START_HOUR = 8;
export const TIME_AXIS_END_HOUR = 20;