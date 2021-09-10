
export class MatchCode {

  constructor(public id?: string,
    public name?: string,
    public description?: string,
    public categoryName?: string,
    public categoryId?: string,
    public isEnabled?: boolean
  ) {
  }

  public isSelected: boolean;

  public static jsonArrayToObjects(array): MatchCode[] {
    return array.map(MatchCode.toObjectFromJson);
  }

  public static toObjectFromJson({id, name, description, categoryName, categoryId, isEnabled}): MatchCode {
    return new MatchCode(id, name, description, categoryName, categoryId, isEnabled);
  }

}