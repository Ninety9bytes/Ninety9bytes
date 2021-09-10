import { Injectable } from '@angular/core';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ConfigService } from '@ngx-config/core';

@Injectable()
export class LoggingService {

  private appInsights: ApplicationInsights;
  constructor(
    private configService: ConfigService
  ) {
    this.appInsights = new ApplicationInsights({
      config: {
        instrumentationKey: this.configService.getSettings('aiInstrumentationKey')
      },
    });
   }

  logError(error: any ): void {
    this.logToConsole(error);
    this.appInsights.trackException(error);
  }

  private logToConsole(error) {
    console.group(error.message);
    console.error(error.stack);
    console.groupEnd();
  }

}
