import { HasAudit } from './has-audit.dto';

export interface AuthAccount extends HasAudit {
  ProfileId: string;
  IdentityId: string;
  Email: string;
  FirstName?: string;
  LastName?: string;
  JobTitle?: string;
  PhoneNumber?: string;
  MarketingOptIn?: boolean;
  CompanyId?: string;
  CompanyName?: string;
  CountryCode?: string;
  AcceptTC: boolean;
  Roles: string[];
}
