import {DefineDatastore, DefineType, Schema} from "deno-slack-sdk/mod.ts";
import {DailyTrips, Planet} from "../types/trips.ts";
import {SlackAPIClient} from "deno-slack-api/types.ts";
import {getDateString} from "../utils.ts";

export const TripTimingCustomType = DefineType({
    name: "trip_timing",
    type: Schema.types.object,
    properties: {
        landing_at: {
            type: Schema.types.number,
        },
        takeoff_at: {
            type: Schema.types.number,
        },
    },
    required: [
        "landing_at",
        "takeoff_at",
    ],
});

const TripsDatastore = DefineDatastore({
    name: "daily_trips",
    primary_key: "on",
    attributes: {
        on: {
            type: Schema.slack.types.date,
        },
        chart_url: {
            type: Schema.types.string,
        },
        [Planet.JUPITER]: {
            type: Schema.types.array,
            items: {
                type: TripTimingCustomType,
            },
        },
        [Planet.SATURN]: {
            type: Schema.types.array,
            items: {
                type: TripTimingCustomType,
            },
        },
        [Planet.NEPTUNE]: {
            type: Schema.types.array,
            items: {
                type: TripTimingCustomType,
            },
        },
        [Planet.MARS]: {
            type: Schema.types.array,
            items: {
                type: TripTimingCustomType,
            },
        },
        [Planet.URANUS]: {
            type: Schema.types.array,
            items: {
                type: TripTimingCustomType,
            },
        },
        [Planet.VENUS]: {
            type: Schema.types.array,
            items: {
                type: TripTimingCustomType,
            },
        },
        [Planet.MERCURY]: {
            type: Schema.types.array,
            items: {
                type: TripTimingCustomType,
            },
        },
    },
});

export default TripsDatastore;

export async function getTrips(
    client: SlackAPIClient,
    on: string = getDateString(),
): Promise<DailyTrips | undefined> {
    const response = await client.apps.datastore.get<
        typeof TripsDatastore.definition
    >({
        datastore: TripsDatastore.name,
        id: on,
    });
    if (!response.ok) {
        throw new Error(
            `Error fetching trips. Contact the app maintainers with the following information - (Error detail: ${response.error})`,
        );
    }
    console.log("response", response.item);
    if (response.item.on) {
        return response.item;
    }
    return undefined;
}

export async function storeTrips(
    client: SlackAPIClient,
    trips: DailyTrips,
) {
    console.log("storing:", trips);
    const response = await client.apps.datastore.put({
        datastore: TripsDatastore.name,
        item: trips,
    });
    if (!response.ok) {
        throw new Error(
            `Error storing trips. Contact the app maintainers with the following information - (Error detail: ${response.error})`,
        );
    }
    return trips;
}

export async function storeChartUrl(
    client: SlackAPIClient,
    on: string,
    url: string,
) {
    const response = await client.apps.datastore.update<
        typeof TripsDatastore.definition
    >({
        datastore: TripsDatastore.name,
        item: {
            on,
            chart_url: url,
        },
    });
    if (!response.ok) {
        throw new Error(
            `Error updating chart url. Contact the app maintainers with the following information - (Error detail: ${response.error})`,
        );
    }
}
