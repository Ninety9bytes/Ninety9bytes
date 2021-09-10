import { Injectable } from '@angular/core';

import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, switchMap, mergeMap } from 'rxjs/operators';

const APP_TITLE = 'FAMIS -';

@Injectable()
export class TitleService {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
  ) {}

  init() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .pipe(map(() => {
        let route = this.activatedRoute;
        while (route.firstChild) { route = route.firstChild; }
        return route;
      }))
      .pipe(filter((route) => route.outlet === 'primary'))
      .pipe(mergeMap((route) => route.data))
      .pipe(map((data) => {
        if ( data.title ) {
          // If a route has a title set (e.g. data: {title: "Foo"}) then we use it
          return data.title;
        } else {
          return this.router.url.split('/').reduce((acc, frag) => {
            return this.fixTitle(frag);
          });
        }
      }))
      .subscribe((pathString) => this.titleService.setTitle(`${APP_TITLE} ${pathString}`));
  }

  fixTitle(title: string) {
    if ( !title ) { return title; }
    if (/(-)/.test(title)) {
      const splitTitle = title.split('-')
      let newTitle = '';
      splitTitle.forEach(word => {
        newTitle += word.charAt(0).toUpperCase() + word.slice(1) + ' ';
      })
      return newTitle;
    } else if (title.match(/[A-Z][a-z]+/g)) {
      const splitTitle = title.split(/(?=[A-Z])/)
      let newTitle = '';
      splitTitle.forEach(word => {
        newTitle += word.charAt(0).toUpperCase() + word.slice(1) + ' ';
      })
      return newTitle;
    }
    return title.charAt(0).toUpperCase() + title.slice(1);
  }
}