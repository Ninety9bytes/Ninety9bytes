export enum ReconciliationStatus {
        Success = 0,
        IdNotFound = 1,
        AssetIdNotFound = 2,
        InventoryAssetIdNotFound = 3,
        ParentAssetIdNotFound = 4,
        MatchCodeIdNotFound = 5,
        UnknownError = 6,
        InvalidData = 7,
        DuplicateMatch = 8
}