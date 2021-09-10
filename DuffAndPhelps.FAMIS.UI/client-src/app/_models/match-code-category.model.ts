export class MatchCodeCategory {

  constructor(public id?: string, public name?: string) {}

  public static jsonArrayToObjects(array): MatchCodeCategory[] {
    return array.map(MatchCodeCategory.toObjectFromJson);
  }

  public static toObjectFromJson({id, name}): MatchCodeCategory {
    return new MatchCodeCategory(id, name);
  }
}