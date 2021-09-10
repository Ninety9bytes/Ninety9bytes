import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WindowManager } from '../../_core/services/window-manager.service';
import { Component, OnInit, Input } from '@angular/core';
import { ModalFormEvent } from '../../_enums/modal-form-event';

@Component({
  selector: 'carousel-modal',
  templateUrl: './carousel-modal.component.html'
})
export class CarouselModalComponent implements OnInit {

    @Input() imageUrlCollection: Array<string>;
    @Input() modalTitle: string;
    @Input() hideSubmit: boolean;

    constructor(
        public windowManager: WindowManager
    ) { }

    ngOnInit() {
    }

    handleModalEvent(modalEvent: ModalFormEvent) {
        if (modalEvent === ModalFormEvent.Dismiss) {
            this.windowManager.close();
        }
    }
}
