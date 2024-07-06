import {CHART_CREATE_URL} from "../../constants/chart.ts";
import {AnnotationLineOption, ChartConfigOptions, ChartCreateResponse,} from "../../types/chart.ts";

const annotationLine = <T>(
    options: AnnotationLineOption<T> & { position: "top" | "bottom" },
) => ({
    type: "line",
    mode: "vertical",
    scaleID: "x-axis-0",
    value: options.value,
    borderColor: options.color,
    borderWidth: 1,
    label: {
        enabled: options.label !== undefined,
        content: options.label,
        position: options.position,
    },
});

const ganttChartConfig = <T>(
    {
        labels,
        annotationsOptions,
        datasets,
        timeAxisOptions,
    }: ChartConfigOptions<T>,
) => {
    const annotations = [annotationLine({
        ...annotationsOptions.start,
        position: "top",
    })];
    if (annotationsOptions.end) {
        annotations.push(annotationLine({
            ...annotationsOptions.end,
            position: "bottom",
        }));
    }
    return {
        chart: {
            type: "horizontalBar",
            data: {
                labels,
                datasets,
            },
            options: {
                legend: {
                    display: false,
                },
                annotation: {
                    annotations,
                },
                scales: {
                    xAxes: [{
                        position: "top",
                        type: "time",
                        time: {
                            unit: "hour",
                            displayFormats: {
                                hour: "HH:mm a",
                            },
                        },
                        ticks: {
                            min: timeAxisOptions.start,
                            max: timeAxisOptions.end,
                        },
                    }],
                    yAxes: [
                        {
                            "stacked": true,
                        },
                    ],
                },
            },
        },
        backgroundColor: "#fff",
    };
};

export async function createGanttChart<T>(
    options: ChartConfigOptions<T>,
): Promise<string> {
    const chartConfig = ganttChartConfig(options);
    const request: Request = new Request(CHART_CREATE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(chartConfig),
    });
    const response = await fetch(request);
    if (response.status !== 200) {
        console.log("Error creating chart", response);
        throw new Error("Error creating chart");
    }
    const responseData = (await response.json()) as ChartCreateResponse;
    if (!responseData.success) {
        throw new Error(`Error creating chart ${responseData}`);
    }
    return responseData.url;
}

export function generateGanttChartUrl<T>(
    templateUrl: string,
    options: ChartConfigOptions<T>,
): string {
    const chartConfig = ganttChartConfig(options);
    return `${templateUrl}?c=${
        encodeURIComponent(JSON.stringify(chartConfig))
    }`;
}
