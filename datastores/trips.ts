import {DefineDatastore, DefineType, Schema} from "deno-slack-sdk/mod.ts";

export const TripCustomType = DefineType({
    name: "trip",
    type: Schema.types.object,
    properties: {
        landing_at: {
            type: Schema.slack.types.timestamp,
        },
        takeoff_at: {
            type: Schema.slack.types.timestamp,
        },
    },
    required: [
        "landing_at",
        "takeoff_at",
    ],
});

export const PlanetTripsCustomType = DefineType({
    name: "planet_trips",
    type: Schema.types.object,
    properties: {
        planet: {
            type: Schema.types.string,
        },
        booked_trips: {
            type: Schema.types.array,
            items: {
                type: TripCustomType,
            },
        },
    },
    required: [
        "planet",
        "booked_trips",
    ],
});

export default DefineDatastore({
    name: "daily_trips",
    primary_key: "on",
    attributes: {
        on: {
            type: Schema.slack.types.date,
        },
        planets: {
            type: Schema.types.array,
            items: {
                type: PlanetTripsCustomType,
            },
        },
    },
});
