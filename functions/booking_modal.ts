import {DefineFunction, Schema, SlackFunction} from "deno-slack-sdk/mod.ts";
import {generateTripsGanttChartUrl} from "./generate_gantt_chart.ts";
import {Planet} from "../types/trips.ts";
import {bookTrip} from "./book_trip.ts";
import {SlackAPIClient} from "deno-slack-api/types.ts";
import {PLANET_LABELS} from "../constants/planet.ts";

export const BookingModalFunction = DefineFunction({
    callback_id: "booking_modal_function",
    title: "Booking Modal",
    source_file: "functions/booking_modal.ts",
    input_parameters: {
        properties: {
            interactivity: {
                type: Schema.slack.types.interactivity,
            },
            user: {
                type: Schema.slack.types.user_id,
            },
            // chart_url: {
            //     type: Schema.types.string,
            // },
        },
        required: [
            // "chart_url",
            "user",
            "interactivity",
        ],
    },
    output_parameters: {
        properties: {
            // chart_url: {
            //     type: Schema.types.string,
            // },
            planet: {
                type: Schema.types.string,
            },
            landing_time: {
                type: Schema.types.string,
            },
            takeoff_time: {
                type: Schema.types.string,
            },
            user: {
                type: Schema.slack.types.user_id,
            },
        },
        required: [
            // "chart_url",
            "planet",
            "landing_time",
            "takeoff_time",
            "user",
        ],
    },
});

export default SlackFunction(
    BookingModalFunction,
    async ({ inputs, client }) => {
        const chartUrl = await generateTripsGanttChartUrl(client);
        console.log("Opening booking modal...");
        const response = await client.views.open({
            interactivity_pointer: inputs.interactivity.interactivity_pointer,
            view: modalView(chartUrl),
        });
        if (response.error) {
            const error =
                `Failed to open booking modal. Contact the app maintainers with the following information - (error: ${response.error})`;
            return { error };
        }
        console.log("Continuing interaction...");
        return {
            completed: false,
        };
    },
).addViewSubmissionHandler(
    "booking_modal_function",
    async ({ inputs, view, client, env }) => {
        console.log("Booking modal was submitted", view.state.values);
        const {
            planet_select_section,
            landing_time_section,
            takeoff_time_section,
        } = view.state.values; //TODO: use proper types
        const planet = planet_select_section.planet_select_action
            .selected_option.value as Planet;
        const landingTime =
            landing_time_section.landing_time_picker.selected_time;
        const takeoffTime =
            takeoff_time_section.takeoff_time_picker.selected_time;
        await bookTrip(client, planet, landingTime, takeoffTime);
        //TODO: show errors
        await sendBookingMessage(
            client,
            inputs.user,
            env.CHANNEL_ID,
            PLANET_LABELS[planet],
            landingTime,
            takeoffTime,
        );
        console.log("Closing booking modal...");
        return {
            response_action: "clear",
        };
    },
).addViewClosedHandler(
    ["booking_modal_function"],
    () => {
        console.log("Booking modal was closed");
        return { outputs: {}, completed: true };
    },
);
// TODO: add block actions handler to show annotation lines on the chart

const modalView = (chartUrl: string) => {
    return {
        type: "modal",
        callback_id: "booking_modal_function",
        notify_on_close: true,
        title: {
            type: "plain_text",
            text: "Trip to Planet",
        },
        submit: {
            type: "plain_text",
            text: "Submit",
        },
        close: {
            type: "plain_text",
            text: "Cancel",
        },
        blocks: [
            {
                type: "image",
                image_url: chartUrl,
                alt_text: "gantt-chart",
            },
            {
                type: "divider",
            },
            {
                type: "input",
                block_id: "planet_select_section",
                element: {
                    type: "static_select",
                    placeholder: {
                        type: "plain_text",
                        text: "Select a planet",
                    },
                    options: [
                        {
                            text: {
                                type: "plain_text",
                                text: "JUPITER :jupiter:",
                                emoji: true,
                            },
                            value: Planet.JUPITER,
                        },
                        {
                            text: {
                                type: "plain_text",
                                text: "SATURN :ringed_planet:",
                                emoji: true,
                            },
                            value: Planet.SATURN,
                        },
                        {
                            text: {
                                type: "plain_text",
                                text: "NEPTUNE :neptune:",
                                emoji: true,
                            },
                            value: Planet.NEPTUNE,
                        },
                        {
                            text: {
                                type: "plain_text",
                                text: "MARS :mars:",
                                emoji: true,
                            },
                            value: Planet.MARS,
                        },
                        {
                            text: {
                                type: "plain_text",
                                text: "URANUS :uranus:",
                                emoji: true,
                            },
                            value: Planet.URANUS,
                        },
                        {
                            text: {
                                type: "plain_text",
                                text: "VENUS :venus:",
                                emoji: true,
                            },
                            value: Planet.VENUS,
                        },
                        {
                            text: {
                                type: "plain_text",
                                text: "MERCURY :mercury:",
                                emoji: true,
                            },
                            value: Planet.MERCURY,
                        },
                    ],
                    action_id: "planet_select_action",
                },
                label: {
                    type: "plain_text",
                    text: "Planet",
                },
            },
            {
                type: "section",
                block_id: "landing_time_section",
                text: {
                    type: "mrkdwn",
                    text: "Landing Time",
                },
                accessory: {
                    type: "timepicker",
                    action_id: "landing_time_picker",
                    initial_time: "08:00",
                    placeholder: {
                        type: "plain_text",
                        text: "Select a time",
                    },
                },
            },
            {
                type: "section",
                block_id: "takeoff_time_section",
                text: {
                    type: "mrkdwn",
                    text: "Takeoff Time",
                },
                accessory: {
                    type: "timepicker",
                    action_id: "takeoff_time_picker",
                    initial_time: "08:30",
                    placeholder: {
                        type: "plain_text",
                        text: "Select a time",
                    },
                },
            },
        ],
    };
};

async function sendBookingMessage(
    client: SlackAPIClient,
    user: string,
    channel: string,
    planetLabel: typeof PLANET_LABELS[keyof typeof PLANET_LABELS],
    landingTime: string,
    takeoffTime: string,
) {
    console.log(
        "sending booking message...",
        user,
        channel,
        planetLabel,
        landingTime,
        takeoffTime,
    );
    const response = await client.chat.postMessage({
        channel,
        text:
            `<@${user}> will be on *${planetLabel}* from *${landingTime}* to *${takeoffTime}*.`,
    });
    if (!response.ok) {
        console.log(`Failed to send booking message: ${response.error}`);
    } else {
        console.log("Booking message sent", response);
    }
    return response.ts;
}
