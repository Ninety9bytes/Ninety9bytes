# DuffAndPhelps.FAMIS.UI

This is the Duff and Phelps FAMIS UI

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.2.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).


## for serving locally with language translations
For language translated pages, use the following commands:
# Local Server in English
ng serve -op="wwwroot/en" --aot -prod --sourcemaps --verbose --i18n-file=client-src/locale/messages.en.xtb --i18n-format=xtb --locale=en-US --port 3000 --ssl 1 --ssl-key ".\ssl\server.key" --ssl-cert ".\ssl\server.crt"

# Local Server in French
ng serve -op=wwwroot/fr --aot -prod --sourcemaps --verbose --i18n-file=client-src/locale/messages.fr.xtb --i18n-format=xtb --locale=fr-FR --port 3000 --ssl 1 --ssl-key ".\ssl\server.key" --ssl-cert ".\ssl\my-server.crt"

# Local Server in Spanish
ng serve -op="wwwroot/es" --aot -prod --sourcemaps --verbose --i18n-file=client-src/locale/messages.es.xtb --i18n-format=xtb --locale=es-ES --port 3000 --ssl 1 --ssl-key ".\ssl\server.key" --ssl-cert ".\ssl\server.crt"

## Build with language translations
ng build -op=wwwroot/es --aot -prod -bh /es/ --i18n-file=client-src/locale/messages.es.xtb --i18n-format=xtb --locale=es-ES
ng build -op=wwwroot/en --aot -prod -bh /en/ --i18n-file=client-src/locale/messages.en.xtb --i18n-format=xtb --locale=en-US
ng build -op=wwwroot/fr --aot -prod -bh /fr/ --i18n-file=client-src/locale/messages.fr.xtb --i18n-format=xtb --locale=fr-FR

## Generate language file
"./node_modules/.bin/ng-xi18n"  --i18nFormat=xmb  --outFile=client-src/locale/messages.xmb

