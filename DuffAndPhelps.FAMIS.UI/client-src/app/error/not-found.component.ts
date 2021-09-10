import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'not-found',
  templateUrl: './not-found.component.html'
})
export class NotFoundComponent implements OnInit {

  errorMessage: string;
    constructor(private route: ActivatedRoute, private router: Router) { }

    ngOnInit() {
      this.errorMessage = this.route.snapshot.paramMap.get('errorMessage')
    }

}
