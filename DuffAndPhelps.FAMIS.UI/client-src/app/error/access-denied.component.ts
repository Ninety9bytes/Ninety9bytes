import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'access-denied',
  templateUrl: './access-denied.component.html'
})
export class AccessDeniedComponent implements OnInit {

  errorMessage: string;
    constructor(private route: ActivatedRoute, private router: Router) { }

    ngOnInit() {
      this.errorMessage = this.route.snapshot.paramMap.get('errorMessage')
    }
}