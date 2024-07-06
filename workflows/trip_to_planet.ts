import {DefineWorkflow, Schema} from "deno-slack-sdk/mod.ts";
import {BookingModalFunction} from "../functions/booking_modal.ts";

export const TripToPlanetWorkflow = DefineWorkflow({
    callback_id: "trip_to_planet_workflow",
    title: "Trip to Planet",
    description: "Book a trip to a planet",
    input_parameters: {
        properties: {
            interactivity: {
                type: Schema.slack.types.interactivity,
            },
            user: {
                type: Schema.slack.types.user_id,
            },
            // channel: {
            //     type: Schema.slack.types.channel_id,
            // },
        },
        required: [
            "interactivity",
            "user",
            // "channel",
        ],
    },
});

const bookingTripModal = TripToPlanetWorkflow.addStep(
    BookingModalFunction,
    {
        interactivity: TripToPlanetWorkflow.inputs.interactivity,
        user: TripToPlanetWorkflow.inputs.user,
    },
);

//TODO: use following steps to modularize the workflow

// const generateGanttChart = TripToPlanetWorkflow.addStep(
//     GenerateGanttChartFunction,
//     {
//         interactivity: TripToPlanetWorkflow.inputs.interactivity,
//     },
// );
//
// const bookingModalFunction = TripToPlanetWorkflow.addStep(
//     BookingModalFunction,
//     {
//         interactivity: generateGanttChart.outputs.interactivity,
//         chart_url: generateGanttChart.outputs.url,
//     },
// );
//
// const bookTripFunction = TripToPlanetWorkflow.addStep(
//     BookTripFunction,
//     {
//         planet: bookingModalFunction.outputs.planet,
//         landing_time: bookingModalFunction.outputs.landing_time,
//         takeoff_time: bookingModalFunction.outputs.takeoff_time,
//     },
// );
//
// TripToPlanetWorkflow.addStep(
//     Schema.slack.functions.SendMessage,
//     {
//         channel_id: TripToPlanetWorkflow.inputs.channel,
//         message:
//             `${TripToPlanetWorkflow.inputs.user} will be on ${bookingTripModal.outputs.planet} from **${bookingTripModal.outputs.landing_time}** to **${bookingTripModal.outputs.takeoff_time}**`,
//     },
// );
