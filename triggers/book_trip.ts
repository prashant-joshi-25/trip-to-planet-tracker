import {Trigger} from "deno-slack-api/types.ts";
import {TripToPlanetWorkflow} from "../workflows/trip_to_planet.ts";
import {TriggerContextData, TriggerTypes} from "deno-slack-api/mod.ts";

// import "std/dotenv/load.ts";

const bookTripTrigger: Trigger<typeof TripToPlanetWorkflow.definition> = {
    type: TriggerTypes.Shortcut,
    callback_id: "book_trip_trigger",
    name: "Trip to Planet",
    description:
        "lets user book a trip to planet considering the availability of the planet for given timings.",
    workflow: `#/workflows/${TripToPlanetWorkflow.definition.callback_id}`,
    inputs: {
        interactivity: {
            value: TriggerContextData.Shortcut.interactivity,
        },
        user: {
            value: TriggerContextData.Shortcut.user_id,
        },
        // channel: {
        //     value: Deno.env.get("CHANNEL_ID")!,
        // },
    },
};

export default bookTripTrigger;
