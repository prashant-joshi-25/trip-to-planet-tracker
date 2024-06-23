export interface TripTiming {
    landing_at: number;
    takeoff_at: number;
}

export interface PlanetTrips {
    planet: string;
    booked_trips: TripTiming[];
}

export interface DailyTrips {
    on: string;
    planets: PlanetTrips[];
}
