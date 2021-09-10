import { Permissions } from './permissions';
import { AuthAccount } from '../../_api/_authorization/dtos/account.dto';

export enum UserType {
  Consumer,
  Employee
}

export class User {
  private hiddenUserNames = ['NULL'];

  constructor(
    public userType: UserType,
    public profile?: AuthAccount,
    public permissions: Permissions = new Permissions(),
    public countryCode?: string,
    public locale?: string,
    public isActive?: boolean
  ) {}

  public getName(): string {
    let userName = '';
    // console.log(this.profile.FirstName);
    if (
      this.profile &&
      this.hiddenUserNames.findIndex(c => c === this.profile.FirstName.toUpperCase()) === -1 &&
      this.hiddenUserNames.findIndex(c => c === this.profile.LastName.toUpperCase()) === -1
    ) {
      userName = `${this.profile.FirstName} ${this.profile.LastName}`;
    }

    return userName;

  }
}
