export class DataTarget {

    constructor(
        public id: string,
        public name: string
    ) { }

    public static mapJson(json: any): DataTarget[] {
        return json.map(DataTarget.toArray)
    }

    private static toArray({ id, name }) {
        return new DataTarget(id, name);
    }

}