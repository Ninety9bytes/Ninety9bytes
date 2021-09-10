export interface AccountDto {
    id: string;
    accountNumber: string;
    accountDescription: string;
}

export interface AccountResponseDto {
    numberInThisPayload: number;
    totalInRecordSet: number;
    accounts: AccountDto[];
  }