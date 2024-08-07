import {DefineFunction, Schema, SlackFunction} from "deno-slack-sdk/mod.ts";
import {withHandledError} from "./error_handler.ts";
import {getTrips} from "../datastores/trips.ts";
import {DailyTrips} from "../types/trips.ts";
import {AnnotationLinesOption, ChartConfigOptions, Datasets, DataValue,} from "../types/chart.ts";
import {SlackAPIClient} from "deno-slack-api/types.ts";
import {createGanttChart} from "./utils/chart.ts";
import {getDateString} from "../utils.ts";
import {TIME_AXIS_END_HOUR, TIME_AXIS_START_HOUR,} from "../constants/chart.ts";
import {PLANETS} from "../constants/planet.ts";

export const GenerateGanttChartFunction = DefineFunction({
    callback_id: "generate_gantt_chart_function",
    title: "Generate Gantt Chart",
    source_file: "functions/generate_gantt_chart.ts",
    input_parameters: {
        properties: {
            interactivity: {
                type: Schema.slack.types.interactivity,
            },
        },
        required: [],
    },
    output_parameters: {
        properties: {
            interactivity: {
                type: Schema.slack.types.interactivity,
            },
            url: {
                type: Schema.types.string,
            },
        },
        required: [
            "url",
        ],
    },
});

export default SlackFunction(
    GenerateGanttChartFunction,
    async ({ inputs, client }) => {
        return await withHandledError(async () => {
            const chartUrl = await generateTripsGanttChartUrl(client);
            return {
                outputs: {
                    ...inputs,
                    url: chartUrl,
                },
            };
        });
    },
);

function prepareDatasets(trips: DailyTrips): Datasets {
    const datasets: Datasets = [];
    const maxTripsCount = getMaxTripsCount(trips);
    PLANETS.forEach((planet) => {
        for (let i = 0; i < maxTripsCount; i++) {
            const trip = trips[planet]?.[i];
            let dataValue: DataValue = [];
            if (trip) {
                dataValue = [
                    trip.landing_at,
                    trip.takeoff_at,
                ];
            }
            if (!datasets[i]) {
                datasets.push({
                    data: [],
                });
            }
            datasets[i].data.push(dataValue);
        }
    });
    return datasets;
}

function getMaxTripsCount(trips: DailyTrips): number {
    return PLANETS.reduce((max, current) => {
        const bookedTrips = trips[current];
        const tripsCount = bookedTrips?.length || 0;
        if (tripsCount > max) {
            return tripsCount;
        }
        return max;
    }, 0);
}

export async function generateTripsGanttChartUrl(
    client: SlackAPIClient,
    landingTime?: number,
    takeoffTime?: number,
): Promise<string> {
    console.log("Generating Gantt Chart");
    let trips = await getTrips(client);
    if (!trips) {
        const today = getDateString();
        trips = newDailyTrips(today);
    }
    const options = ganttChartConfigOptions(
        trips,
        landingTime,
        takeoffTime,
    );
    const url = await createGanttChart(options);
    //TODO: store url and re-use it as template
    console.log("Gantt Chart URL: ", url);
    return url;
}

function newDailyTrips(on: string, url?: string): DailyTrips {
    return {
        on,
        chart_url: url,
    };
}

function ganttChartConfigOptions(
    trips: DailyTrips,
    landingTime: number | undefined,
    takeoffTime: number | undefined,
): ChartConfigOptions {
    const labels = PLANETS;
    const datasets = prepareDatasets(trips);
    const axisStartDate = new Date(trips.on);
    axisStartDate.setUTCHours(TIME_AXIS_START_HOUR);
    const axisEndDate = new Date(trips.on);
    axisEndDate.setUTCHours(TIME_AXIS_END_HOUR);
    const annotationsOptions: AnnotationLinesOption = {
        // start: {
        //     value: new Date().setUTCHours(8, 0, 0, 0), //TODO: use current time in IST
        //     color: "green",
        // },
    };
    if (landingTime) {
        annotationsOptions.start = {
            value: landingTime,
            label: "Landing Time",
            color: "green",
        };
    }
    if (takeoffTime) {
        annotationsOptions.end = {
            value: takeoffTime,
            label: "Takeoff Time",
            color: "red",
        };
    }
    return {
        labels,
        datasets,
        timeAxisOptions: {
            start: axisStartDate.getTime(),
            end: axisEndDate.getTime(),
        },
        annotationsOptions,
    };
}
