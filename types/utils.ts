import {PLANETS} from "../constants/chart.ts";
import {Planet} from "./trips.ts";

export function isValidPlanet(planet: string): planet is Planet {
    return PLANETS.includes(planet as Planet);
}
