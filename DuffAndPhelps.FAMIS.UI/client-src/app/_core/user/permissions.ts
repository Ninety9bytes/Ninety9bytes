import { Authorization } from '../../_api/_authorization/dtos/authorization.dto';

export enum SystemPermissionsEnum {
  canReadData,
  canWriteData,
  canAdminProjects,
  canImportData,
  canReconcileData,
  canManageHeaders,
  canManageTemplates,
  canManagePortal,
}

export class Permissions {
  public permissionsGranted = new Array<SystemPermissionsEnum>();

  constructor(authorization?: Authorization) {
    if (authorization === undefined) {
      return;
    }

    // All users can read data
    this.permissionsGranted.push(SystemPermissionsEnum.canReadData);

    if (authorization.Roles.indexOf('Famis.GlobalAdmin') !== -1) {
      this.permissionsGranted.push(
        SystemPermissionsEnum.canWriteData,
        SystemPermissionsEnum.canAdminProjects,
        SystemPermissionsEnum.canImportData,
        SystemPermissionsEnum.canReconcileData,
        SystemPermissionsEnum.canManageHeaders,
        SystemPermissionsEnum.canManageTemplates,
        SystemPermissionsEnum.canManagePortal,
      );
    }

    if (authorization.Roles.indexOf('Famis.ProjectWriteAccess') !== -1 || authorization.Roles.indexOf('Famis.GlobalWrite') !== -1) {
      this.permissionsGranted.push(
        SystemPermissionsEnum.canWriteData,
        SystemPermissionsEnum.canAdminProjects,
        SystemPermissionsEnum.canImportData,
        SystemPermissionsEnum.canReconcileData,
        SystemPermissionsEnum.canManageHeaders
      );
    }
  }
}

