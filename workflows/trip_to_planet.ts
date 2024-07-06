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
        },
        required: [
            "interactivity",
        ],
    },
});

TripToPlanetWorkflow.addStep(
    BookingModalFunction,
    {
        interactivity: TripToPlanetWorkflow.inputs.interactivity,
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
//     Schema.slack.functions.SendDm,
//     {
//         user_id: TripToPlanetWorkflow.inputs.interactivity.user.id,
//         message:
//             `Your trip to ${bookTripFunction.outputs.planet} is booked from ${bookTripFunction.outputs.landing_time} to ${bookTripFunction.outputs.takeoff_time}!`,
//     },
// );
