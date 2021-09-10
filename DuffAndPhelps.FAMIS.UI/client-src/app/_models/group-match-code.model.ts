export class GroupMatchCode {

  constructor(
      public groupId: number,
      public matchCodeId: string,
      public matchCodeName: string,
      public matchCodeDescription: string,
      public matchCodeCategoryId: string,
      public matchCodeIsEnabled: Boolean,
      public groupMatchCodeIsEnabled: Boolean,
      public matchCodeIsUsed: boolean
    ) {}
}