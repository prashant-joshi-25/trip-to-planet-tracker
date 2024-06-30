import {PLANETS} from "../types/trips.ts";

export const CHART_API_DOMAIN = "quickchart.io";
export const CHART_API_BASE_URL = `https://${CHART_API_DOMAIN}`;
const CHART_CREATE_ENDPOINT = "/create";
export const CHART_CREATE_URL = `${CHART_API_BASE_URL}${CHART_CREATE_ENDPOINT}`;

export const LABELS = PLANETS.map((planet) => planet.split(" :")[0]);
export const START_HOUR = 8;
export const END_HOUR = 20;