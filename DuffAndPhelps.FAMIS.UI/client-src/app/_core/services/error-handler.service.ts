import { LoggingService } from './logging.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, ErrorHandler, Injector } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class ErrorHandlerService implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: any): void {
    const loggingService = this.injector.get(LoggingService);

    const router = this.injector.get(Router);

    if (!(error instanceof HttpErrorResponse)) {
      loggingService.logError(error);

      router.navigate(['error/500'], { skipLocationChange: true, replaceUrl: true });
    }
  }
}
