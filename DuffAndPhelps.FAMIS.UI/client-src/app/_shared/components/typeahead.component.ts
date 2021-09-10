import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'type-ahead',
  templateUrl: './typeahead.component.html'
})
export class TypeaheadComponent {
    @Input() searching: boolean = false;
    @Input() model: any;
    @Input() search: any;
    @Input() resultFormatter: any;
    @Input() inputFormatter: any;
    @Output() selectItem = new EventEmitter<any>();

    onSelectItem(event: any) {
        this.selectItem.emit(event);
    }
}