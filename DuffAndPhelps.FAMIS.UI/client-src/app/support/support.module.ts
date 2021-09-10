import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../_core/core.module';
import { SharedModule } from '../_shared/shared.module';
import { SupportComponent } from './components/support.component';
import { ClientFileApiService } from '../_api/_runtime/services/client-files-api.service';

@NgModule({
  imports: [
    CommonModule,
    // ng.GridModule,
    SharedModule,
    CoreModule,
  ],
  declarations: [
    SupportComponent
  ],
  providers: [
    ClientFileApiService
  ]
})
export class SupportModule { }
