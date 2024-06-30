import {DefineFunction, Schema, SlackFunction} from "deno-slack-sdk/mod.ts";
import {withHandledError} from "./error_handler.ts";
import {getTrips} from "../datastores/trips.ts";
import {DailyTrips} from "../types/trips.ts";
import {AnnotationLinesOption, ChartConfigOptions, Datasets, DataValue,} from "../types/chart.ts";
import {SlackAPIClient} from "deno-slack-api/types.ts";
import {createGanttChart} from "./utils/chart.ts";
import {getDateString} from "../utils.ts";
import {LABELS, PLANETS, TIME_AXIS_END_HOUR, TIME_AXIS_START_HOUR,} from "../constants/chart.ts";

export const GenerateGanttChartFunction = DefineFunction({
    callback_id: "generate_gantt_chart_function",
    title: "Generate Gantt Chart",
    source_file: "functions/generate_gantt_chart.ts",
    output_parameters: {
        properties: {
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

function prepareDatasets(trips: DailyTrips): Datasets<Date> {
    const datasets: Datasets<Date> = [];
    const maxTripsCount = getMaxTripsCount(trips);
    PLANETS.forEach((planet, j) => {
        for (let i = 0; i < maxTripsCount; i++) {
            const trip = trips[planet]?.[j];
            let dataValue: DataValue<Date> = [];
            if (trip) {
                dataValue = [
                    new Date(trip.landing_at),
                    new Date(trip.takeoff_at),
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

async function generateTripsGanttChartUrl(
    client: SlackAPIClient,
    landingTime?: number,
    takeoffTime?: number,
): Promise<string> {
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
): ChartConfigOptions<Date> {
    const labels = LABELS;
    const datasets = prepareDatasets(trips);
    const axisStartTime = new Date(trips.on);
    axisStartTime.setHours(TIME_AXIS_START_HOUR);
    const axisEndTime = new Date(trips.on);
    axisEndTime.setHours(TIME_AXIS_END_HOUR);
    const annotationsOptions: AnnotationLinesOption<Date> = {
        start: {
            value: new Date(),
            color: "green",
        },
    };
    if (landingTime) {
        annotationsOptions.start.value = new Date(landingTime);
        annotationsOptions.start.label = "Landing Time";
    }
    if (takeoffTime) {
        annotationsOptions.end = {
            value: new Date(takeoffTime),
            label: "Takeoff Time",
            color: "red",
        };
    }
    return {
        labels,
        datasets,
        timeAxisOptions: {
            start: axisStartTime,
            end: axisEndTime,
        },
        annotationsOptions,
    };
}
