// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
//   settingsEndpoint:'https://famis-dev.duffandphelps.com/api/settings',

export const environment = {
  useAzureAppSettings: false,

  // AAD Settings
  adalTennant: '781802be-916f-42df-a204-78a2b3144934',
  adalClientId: '3c581814-0bb2-4901-887a-fca4f4246ed5',
  adalExpireOffsetSeconds: 1800,
  adalEndpoints: 'https://duffandphelps.onmicrosoft.com/9bb8cde8-5f4e-4c68-a4ab-ee18bbb51703',
  adalExtraQueryParameter: 'domain_hint=duffandphelps.com',

  // B2C Settings
  msalResetPasswordPolicy: '',
  msalScope: '',
  msalClient: '',
  msalTenant: '',
  msalSigninSignupPolicy: '',

  authorizationApiEndpoint: 'https://costofcapital-dev-auth-api.duffandphelps.com',

  // runtimeApiEndpoint: 'https://famis-dev-runtime-api.duffandphelps.com/api',
  runtimeApiEndpoint: 'https://localhost:44331/api',
  configurationApiEndpoint: 'https://famis-dev-config-api.duffandphelps.com/api',
  // configurationApiEndpoint: 'https://localhost:44330/api',
  settingsEndpoint: '/api/settings',
  aiName: 'dev-us-famis-wa-01',
  aiInstrumentationKey: 'df7e9ff6-0fc1-4f5d-925f-0501e911f62f',
  googleMapAPIKey: 'AIzaSyB7qqtzyuD-W-khRwDYTJmVlnCxxnrR4ws',
  bingMapAPIKey: 'AhGM8PKVdNbv97kMHJqodqc540dHqQ26Y0LU0uczb3WFr_ZPknV9GzmeVrwcIhUA',
  acceptedFileTypes: ['.xlsx', '.docx', '.xls', '.doc', '.pdf', '.jpeg', '.jpg', '.tiff', '.gif', '.png', '.csv', '.zip', '.7z'],
  ssrsURL: 'http://ssrsinternet.southcentralus.cloudapp.azure.com/Reports',
  defaultLanguage: 'en-us',
  reportParameterLimit: 5,
  masterTemplateId: '42BC40FB-D8BF-4C3C-AFA2-D9FE17DD93A6',
  /*
    Adding an additional configurable offset time for the session timeout
    The number "n" we add here will get us "n" second closer to the ADAL token renewal(forced)
  */
  additionalExpireOffsetSeconds: 900,
  famisSupportEmailAddress: 'DP.FamisSupport@duffandphelps.com'
};
