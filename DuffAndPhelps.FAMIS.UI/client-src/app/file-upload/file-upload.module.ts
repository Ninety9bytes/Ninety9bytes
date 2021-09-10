import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { CoreModule } from '../_core/core.module';
import { SharedModule } from '../_shared/shared.module';
import { GridModule } from '@progress/kendo-angular-grid';
import { ClientFileApiService } from '../_api/_runtime/services/client-files-api.service';


@NgModule({
  imports: [
    CommonModule,
    GridModule,
    SharedModule,
    CoreModule,
  ],
  declarations: [
    FileUploadComponent
  ],
  providers: [
    ClientFileApiService
  ]
})
export class FileUploadModule { }
