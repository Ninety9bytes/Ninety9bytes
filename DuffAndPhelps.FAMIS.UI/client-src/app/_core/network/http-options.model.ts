export interface HttpOptions<T> {
    resultMapper: MapperFunction<T>;
}

export type MapperFunction<T> = (data: any) => T;
