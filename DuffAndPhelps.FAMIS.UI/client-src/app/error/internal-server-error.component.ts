import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'internal-server-error',
  templateUrl: './internal-server-error.component.html'
})
export class InternalServerErrorComponent implements  OnInit {
  errorMessage: string | undefined = undefined;
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.errorMessage = this.route.snapshot.paramMap.get('errorMessage');
  }

  reload(event: any): void {
    event.preventDefault();
    window.location.href = '/';
  }
}
