export class ReconciliationConstants {
  public static readonly SystemMatchCategoryId = '1e838f1d-6d49-42e3-b3d4-1094c52d2e2b';
  public static readonly ParentChildMatchCodeId = '0e48c183-9127-490d-8970-656482793b70';
  public static readonly hiddenColumnsLayoutMapping = [
    'historicalCost',
    'siteId',
    'buildingId',
    'accountId',
    'departmentId',
    'accumulatedDepreciation',
    'assetImages',
    'displayId',
    'buildingName',
    'buildingNumber',
    'memberName',
    'memberNumber',
    'memberId',
    'siteName',
    'siteNumber',
    'depreciationAsOfDate',
    'lifeMonths',
    'depreciationBasis',
    'periodDepreciation',
    'sourceRecordId',
    'accountNumber',
    'accountDescription'
  ];
  public static readonly hiddenColumns = [
    'assetId',
    'isMatched',
    'isParent',
    'isChild',
    'parentChildMatches',
    'matchTypes',
    'matches',
    'matchCodeId',
    'parentId',
    'matchId',
    'allocatedValue',
    'allocationId',
    'id',
    'updatedTimeStamp',
    'assetFileId',
    'groupId'
  ];
}
