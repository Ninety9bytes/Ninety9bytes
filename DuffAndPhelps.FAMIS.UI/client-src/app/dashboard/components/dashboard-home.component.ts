import { inOutFromLeftSideAnimation } from '../../_core/animations/in-out-from-left-side.animation';
import { LeftNavService } from '../../_core/services/left-nav-service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'dashboard-home',
    templateUrl: './dashboard-home.component.html',
    animations: [inOutFromLeftSideAnimation]
})
export class DashboardHomeComponent implements OnInit {

    public isCollapsed = false;
    constructor(
        private router: Router,
        private leftNavService: LeftNavService
    ) {}

    ngOnInit() {
        this.router.navigate(['/dashboard']);
        this.leftNavService.navCollapsed$.subscribe(val => {
            this.isCollapsed = val;
        });
    }
}
