export class TranslationBaseKeys {
  static home = TranslationBaseKeys.generatei18n('home');
  static common = TranslationBaseKeys.generatei18n('common');
  static reconciliation = TranslationBaseKeys.generatei18n('reconciliation');
  static dataImport = TranslationBaseKeys.generatei18n('data-import');
  static building = TranslationBaseKeys.generatei18n('building');
  static asset = TranslationBaseKeys.generatei18n('asset');
  static dashboard = TranslationBaseKeys.generatei18n('dashboard');
  static kendo = TranslationBaseKeys.generatei18n('kendo');
  static projectProfile = TranslationBaseKeys.generatei18n('project-profile');
  static matchCodes = TranslationBaseKeys.generatei18n('match-codes');
  static templateManagement = TranslationBaseKeys.generatei18n('template-management');
  static trending = TranslationBaseKeys.generatei18n('trending');
  static depreciation = TranslationBaseKeys.generatei18n('depreciation');
  static qualityControl = TranslationBaseKeys.generatei18n('quality-control');
  static cascading = TranslationBaseKeys.generatei18n('cascading');
  static reports = TranslationBaseKeys.generatei18n('reports');
  static alert = TranslationBaseKeys.generatei18n('alert');
  static groupManagement = TranslationBaseKeys.generatei18n('group-management');
  static groupSave = TranslationBaseKeys.generatei18n('group-save');
  static admin = TranslationBaseKeys.generatei18n('admin');
  static headerManagement = TranslationBaseKeys.generatei18n('header-management');
  static recipients = TranslationBaseKeys.generatei18n('recipients');
  static fileUpload = TranslationBaseKeys.generatei18n('file-upload');
  static processing = TranslationBaseKeys.generatei18n('processing');
  static transactions = TranslationBaseKeys.generatei18n('transactions');
  static userFactors = TranslationBaseKeys.generatei18n('user-factors');
  static customAdditions = TranslationBaseKeys.generatei18n('custom-additions');
  static customField = 'customField';
  static noTranslate = TranslationBaseKeys.generatei18n('no-translate');
  static auth = TranslationBaseKeys.generatei18n('auth');
  static support = TranslationBaseKeys.generatei18n('support');
  private static generatei18n(baseKey: string): string {
    return baseKey + '_';
  }
}
