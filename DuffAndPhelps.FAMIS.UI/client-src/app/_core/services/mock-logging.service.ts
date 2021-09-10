import { Injectable } from '@angular/core';

@Injectable()
export class MockLoggingService {

  constructor(
  ) { }

  logError(error: any ) : void {
    this.logToConsole(error);
  }

  private logToConsole(error) {
    console.group(error.message);
    console.error(error.stack);
    console.groupEnd();
  }
  
}
