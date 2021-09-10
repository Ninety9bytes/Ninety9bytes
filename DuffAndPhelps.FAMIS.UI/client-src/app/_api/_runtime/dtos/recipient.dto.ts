import { DeliverableDto } from './recipient-deliverable.dto';

export interface RecipientDto {
  id: string;
  recipientName: string;
  address: string;
  address2: string;
  city?: string;
  state: string;
  zip: number;
  email: string;
  phoneNumber: string;
  deliverables: DeliverableDto[];
}
