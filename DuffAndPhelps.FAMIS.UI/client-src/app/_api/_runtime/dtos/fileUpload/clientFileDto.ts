import { UploadFileType } from '../../enums/upload-type-enum';

export interface ClientFileDto {
  id: string;
  fileName: string;
  groupId: string;
  memberId: string;
  userId: string;
  fileSize: string;
  memberName: string;
  groupName: string;
  userName: string;
  uploadDate: Date;
  isPortalDocument: boolean;
  uploadType: UploadFileType;
  uploadTypeName: string;
}
