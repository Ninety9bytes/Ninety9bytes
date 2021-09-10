import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  templateUrl: './unauthorized.component.html'
})
export class UnauthorizedComponent implements OnInit {
  errorMessage: string;
    constructor(private route: ActivatedRoute, private router: Router) { }

    ngOnInit() {
      this.errorMessage = this.route.snapshot.paramMap.get('errorMessage')
    }
}
