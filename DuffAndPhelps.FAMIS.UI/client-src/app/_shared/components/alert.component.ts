import { AlertService } from '../../_core/services/alert.service';
import { Component, OnInit } from '@angular/core';
import { Alert } from '../../_models/alert.model';
import { ToastrService } from 'ngx-toastr';
import { AlertType } from '../../_enums/alert-type';

@Component({
  selector: 'alert',
  templateUrl: './alert.component.html'
})
export class AlertComponent implements OnInit {
  alerts: Alert[] = [];

  constructor(private alertService: AlertService, private toastrService: ToastrService) {}

  ngOnInit() {
    this.alertService.getAlert().subscribe((alert: Alert) => {
      if (alert) {
        switch (alert.type) {
          case AlertType.Success:
            this.toastrService.success(alert.message);
            break;
          case AlertType.Error:
            this.toastrService.error(alert.message);
            break;
          case AlertType.Info:
            this.toastrService.info(alert.message);
            break;
          case AlertType.Warning:
            this.toastrService.warning(alert.message);
            break;
          default:
            this.toastrService.error(alert.message);
            break;
        }
      }
    });
  }
}
