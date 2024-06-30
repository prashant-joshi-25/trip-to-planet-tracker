export type DataValue<T> = [T, T] | [];

export interface Dataset<T> {
    data: (DataValue<T>)[];
}
export type Datasets<T> = (Dataset<T>)[];

export interface AnnotationLineOption<Value> {
    label?: string;
    value: Value;
    color: "green" | "red";
}

export type AnnotationLinesOption<Value> = {
    start: AnnotationLineOption<Value>;
    end?: AnnotationLineOption<Value>;
};

export interface TimeAxisOptions<T> {
    start: T;
    end: T;
}

export interface ChartConfigOptions<Value> {
    labels: string[];
    datasets: Datasets<Value>;
    timeAxisOptions: TimeAxisOptions<Value>;
    annotationsOptions: AnnotationLinesOption<Value>;
}

export interface ChartCreateResponse {
    success: boolean;
    url: string;
}
