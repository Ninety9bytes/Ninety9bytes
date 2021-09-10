import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ModalFormEvent } from '../../_enums/modal-form-event';

@Component({
  selector: 'modal-form',
  templateUrl: './modal-form.component.html'
})
export class ModalFormComponent {

    @Input() hideSubmit = false;
    @Input() modalTitle: string = null;
    @Output() modalEvent = new EventEmitter<ModalFormEvent>();
    @Input() submitButtonName = 'Save';


    constructor() { }

    dismiss() {
        this.modalEvent.emit(ModalFormEvent.Dismiss);
    }

    save() {
        this.modalEvent.emit(ModalFormEvent.Save);
    }
}