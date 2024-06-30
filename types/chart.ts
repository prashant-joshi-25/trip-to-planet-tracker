export type Timestamp = number;

export type DataValue<T = Timestamp> = [T, T] | [];

export interface Dataset<T = Timestamp> {
    data: (DataValue<T>)[];
}
export type Datasets<T = Timestamp> = (Dataset<T>)[];

export interface AnnotationLineOption<Value> {
    label?: string;
    value: Value;
    color: "green" | "red";
}

export type AnnotationLinesOption<Value = Timestamp> = {
    start: AnnotationLineOption<Value>;
    end?: AnnotationLineOption<Value>;
};

export interface TimeAxisOptions<T = Timestamp> {
    start: T;
    end: T;
}

export interface ChartConfigOptions<Value = Timestamp> {
    labels: string[];
    datasets: Datasets<Value>;
    timeAxisOptions: TimeAxisOptions<Value>;
    annotationsOptions: AnnotationLinesOption<Value>;
}

export interface ChartCreateResponse {
    success: boolean;
    url: string;
}
