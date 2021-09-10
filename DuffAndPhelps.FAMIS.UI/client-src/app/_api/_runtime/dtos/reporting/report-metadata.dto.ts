// export interface MetadataDto {
//   id: string;
//   tagName: string;

// }
export class MetadataDto {

  constructor(public id: string,
    public tagName: string
  ) {  }

  public isSelected: boolean

  public static jsonArrayToObjects(array): MetadataDto[] {
    return array.map(MetadataDto.toObjectFromJson);
  }

  public static toObjectFromJson({id, tagName}): MetadataDto {
    return new MetadataDto(id, tagName);
  }

}


