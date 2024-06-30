export interface TripTiming {
    landing_at: number;
    takeoff_at: number;
}

export enum Planet {
    JUPITER = "JUPITER :jupiter:",
    SATURN = "SATURN :ringed_planet:",
    NEPTUNE = "NEPTUNE :neptune:",
    MARS = "MARS :mars:",
    URANUS = "URANUS :uranus:",
    VENUS = "VENUS :venus:",
    MERCURY = "MERCURY :mercury:",
}

export interface DailyTrips extends Partial<Record<Planet, TripTiming[]>> {
    on: string;
    chart_url?: string;
}

export const PLANETS = Object.values(Planet).sort((a, b) => a > b ? 1 : -1);

export function isValidPlanet(planet: string): planet is Planet {
    return PLANETS.includes(planet as Planet);
}

export type DailyTripsFor<P extends string & Planet> =
    & DailyTrips
    & {
        [key in string as `${P}`]: TripTiming[];
    };
