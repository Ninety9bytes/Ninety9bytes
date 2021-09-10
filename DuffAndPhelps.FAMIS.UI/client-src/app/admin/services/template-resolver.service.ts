
import { TemplateService } from './template.service';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Resolve, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Template } from '../../_models/template.model';
import { Observable } from 'rxjs';

@Injectable()
export class TemplateResolver implements Resolve<Template> {
  constructor(
    private templateService: TemplateService,
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<any> {
    return this.templateService
      .get(route.params['id'])
      .pipe(catchError(err => this.router.navigateByUrl('/')));
  }
}
