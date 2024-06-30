import {DefineFunction, Schema, SlackFunction} from "deno-slack-sdk/mod.ts";
import {SlackAPIClient} from "deno-slack-api/types.ts";
import {DailyTrips, Planet, TripTiming,} from "../types/trips.ts";
import {getDateString, todayHHmmToTimestamp} from "../utils.ts";
import {getTrips, storeTrips} from "../datastores/trips.ts";
import {withHandledError} from "./error_handler.ts";
import {isValidPlanet} from "../types/utils.ts";

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
        if (!isValidPlanet(planet)) {
            throw new Error(`planet (${planet}) not supported`);
        }
        await processBooking(client, planet, landingAt, takeoffAt);
        return {
            outputs: inputs,
        };
    });
});

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

function newDailyTrips<P extends Planet>(
    on: string,
    planet: P,
    trips?: DailyTrips | undefined,
): DailyTrips { //TODO: use DailyTripsFor<P>
    return {
        on,
        [planet]: [],
        ...trips,
    };
}

async function processBooking<P extends Planet>(
    client: SlackAPIClient,
    planet: P,
    landingAt: number,
    takeoffAt: number,
) {
    const today = getDateString();
    let trips: DailyTrips | undefined = await getTrips(
        client,
        today,
    );
    trips = newDailyTrips(today, planet, trips);
    const bookedTrips = trips[planet] as TripTiming[]; //TODO: avoid as
    const slot = getAvailableSlot(bookedTrips, landingAt, takeoffAt);
    recordTrip(trips, planet, slot, landingAt, takeoffAt);
    await storeTrips(client, trips);
}

function recordTrip(
    trips: DailyTrips,
    planet: Planet,
    slot: number,
    landingAt: number,
    takeoffAt: number,
) {
    const planetTrips = trips[planet] as TripTiming[]; //TODO: avoid as
    const newTrip: TripTiming = {
        landing_at: landingAt,
        takeoff_at: takeoffAt,
    };
    trips[planet] = [
        ...planetTrips.slice(0, slot),
        newTrip,
        ...planetTrips.slice(slot),
    ];
}
