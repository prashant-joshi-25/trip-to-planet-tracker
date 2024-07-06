export interface TripTiming {
    landing_at: number;
    takeoff_at: number;
}

export enum Planet {
    JUPITER = "Jupiter",
    SATURN = "Saturn",
    NEPTUNE = "Neptune",
    MARS = "Mars",
    URANUS = "Uranus",
    VENUS = "Venus",
    MERCURY = "Mercury",
}

export interface DailyTrips extends Partial<Record<Planet, TripTiming[]>> {
    on: string;
    chart_url?: string;
}

export type DailyTripsFor<P extends string & Planet> =
    & DailyTrips
    & {
        [key in string as `${P}`]: TripTiming[];
    };
