import {Planet} from "../types/trips.ts";

export const PLANETS = Object.values(Planet).sort((a, b) => a > b ? 1 : -1);

export const PLANET_LABELS: Readonly<Record<Planet, string>> = {
    [Planet.JUPITER]: "Jupiter :jupiter:",
    [Planet.SATURN]: "Saturn :ringed_planet:",
    [Planet.NEPTUNE]: "Neptune :neptune:",
    [Planet.MARS]: "Mars :mars:",
    [Planet.URANUS]: "Uranus :uranus:",
    [Planet.VENUS]: "Venus :venus:",
    [Planet.MERCURY]: "Mercury :mercury:",
}