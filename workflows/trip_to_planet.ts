import {DefineWorkflow, Schema} from "deno-slack-sdk/mod.ts";

const TripToPlanetWorkflow = DefineWorkflow({
    callback_id: "trip_to_planet_workflow",
    title: "Trip to Planet",
    description: "Book a trip to a planet",
    input_parameters: {
        properties: {
            interactivity: {
                type: Schema.slack.types.interactivity,
            },
        },
        required: [
            "interactivity",
        ],
    },
});

const generateGanttChart = TripToPlanetWorkflow.addStep();
