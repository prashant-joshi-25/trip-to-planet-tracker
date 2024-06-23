import {DefineFunction, Schema, SlackFunction} from "deno-slack-sdk/mod.ts";
import {SlackAPIClient} from "deno-slack-api/types.ts";
import TripsDatastore from "../datastores/trips.ts";
import {DailyTrips, PlanetTrips, TripTiming} from "../types/trips.ts";
import {getDateString, todayHHmmToTimestamp} from "../utils.ts";

export const BookTripFunction = DefineFunction({
    callback_id: "book_trip_function",
    title: "Book Trip",
    source_file: "functions/book_trip.ts",
    input_parameters: {
        properties: {
            planet: {
                type: Schema.types.string,
            },
            landing_time: {
                type: Schema.types.string, //TODO: use timepicker
            },
            takeoff_time: {
                type: Schema.types.string, //TODO: use timepicker
            },
        },
        required: [
            "planet",
            "landing_time",
            "takeoff_time",
        ],
    },
    output_parameters: {
        properties: {
            planet: {
                type: Schema.types.string,
            },
            landing_time: {
                type: Schema.types.string,
            },
            takeoff_time: {
                type: Schema.types.string,
            },
        },
        required: [
            "planet",
            "landing_time",
            "takeoff_time",
        ],
    },
});

export default SlackFunction(BookTripFunction, async ({ inputs, client }) => {
    return await withHandledError(async () => {
        const { planet, landing_time, takeoff_time } = inputs;
        const landingAt = todayHHmmToTimestamp(landing_time);
        const takeoffAt = todayHHmmToTimestamp(takeoff_time);
        if (takeoffAt <= landingAt) {
            throw new Error("takeoff time should be greater than landing time");
        }
        await processBooking(client, planet, landingAt, takeoffAt);
        return {
            outputs: inputs,
        };
    });
});

async function withHandledError<F extends (...args: any) => Promise<any>>(
    execute: F,
): Promise<ReturnType<F> | { error: string }> {
    try {
        return await execute();
    } catch (err) {
        return {
            error: err.toString(),
        };
    }
}

function getAvailableSlot(
    bookedTrips: TripTiming[],
    landingAt: number,
    takeoffAt: number,
): number {
    if (bookedTrips.length === 0) {
        return 0;
    }
    let slotStartTime = 0;
    for (let slot = 0; slot < bookedTrips.length; slot++) {
        if (
            slotStartTime <= landingAt &&
            takeoffAt <= bookedTrips[slot].landing_at
        ) {
            return slot;
        }
        slotStartTime = bookedTrips[slot].landing_at;
    }
    throw new Error(
        "slot not available, please change timings or check for other planets",
    );
}

async function getTrips(
    client: SlackAPIClient,
    on: string,
    planet: string,
): Promise<DailyTrips> {
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
    if (response.item.on) {
        return response.item as DailyTrips;
    }
    return newDailyTrips(on, planet);
}

function newDailyTrips(on: string, planet: string): DailyTrips {
    return {
        on,
        planets: [
            {
                planet,
                booked_trips: [],
            },
        ],
    };
}

async function processBooking(
    client: SlackAPIClient,
    planet: string,
    landingAt: number,
    takeoffAt: number,
) {
    const today = getDateString();
    const trips = await getTrips(client, today, planet);
    const planetIndex = getPlanetIndex(trips, planet);
    const bookedTrips = trips.planets[planetIndex].booked_trips;
    const slot = getAvailableSlot(bookedTrips, landingAt, takeoffAt);
    recordTrip(trips, planetIndex, slot, landingAt, takeoffAt);
    await storeTrips(client, trips);
}

async function storeTrips(
    client: SlackAPIClient,
    trips: DailyTrips,
) {
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

function recordTrip(
    trips: DailyTrips,
    planetIndex: number,
    slot: number,
    landingAt: number,
    takeoffAt: number,
) {
    const planetTrips = trips.planets[planetIndex].booked_trips;
    const newTrip: TripTiming = {
        landing_at: landingAt,
        takeoff_at: takeoffAt,
    };
    trips.planets[planetIndex].booked_trips = [
        ...planetTrips.slice(0, slot),
        newTrip,
        ...planetTrips.slice(slot),
    ];
}

function getPlanetIndex(trips: DailyTrips, planet: string): number {
    return trips.planets.findIndex((planetTrips: PlanetTrips) => {
        return planetTrips.planet === planet;
    });
}
