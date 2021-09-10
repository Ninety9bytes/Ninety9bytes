import { TranslatedComponent } from '../../../_core/i18n/translated-component';
import { TranslationBaseKeys } from '../../../_core/i18n/translation-base-keys';
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'file-upload-control',
    templateUrl: './file-upload-control.component.html'
})
export class FileUploadControlComponent implements OnInit, TranslatedComponent {
    i18n = TranslationBaseKeys;

     @Input() fileInputLabel: string;
     @Input() supportedFileTypes: Array<string>;
     @Output() onFileUploadRequested = new EventEmitter<File>();

    public isAddingFile: boolean;
    public isFileSelected: boolean;
    public isInvalidFileType: boolean;
    public file: File;
    constructor() {
      this.fileInputLabel = 'Add File';
    }

    ngOnInit() {
        this.isAddingFile = false;
    }

    AddFileClicked(event: Event) {
        event.preventDefault();

        this.isAddingFile = true;
    }

    CancelUpload(event: Event) {
        event.preventDefault();
        this.resetControl();
    }

    updateFile(event) {
        const fileList: FileList = event.target.files;
        this.isInvalidFileType = false;

        if (fileList.length > 0) {
            if (this.isValidType(fileList[0].name)) {
                this.file = fileList[0];
                this.isFileSelected = true;
            } else {
                this.isInvalidFileType = true;
            }
        } else {
            this.file = null;
            this.isFileSelected = false;
        }
    }

    RequestFileUpload() {
        this.onFileUploadRequested.emit(this.file);
        this.resetControl();
    }

    private isValidType(fileName: string): boolean {
        const fileType = fileName.substring(fileName.lastIndexOf('.'), fileName.length).toLocaleLowerCase();
        for (let i = 0; i < this.supportedFileTypes.length; i++) {
            if (this.supportedFileTypes[i].toLocaleLowerCase() === fileType) {
                return true;
            }
        }
        return false;
    }

    private resetControl() {
        this.isAddingFile = false;
        this.isFileSelected = false;
        this.isInvalidFileType = false;
    }
}
