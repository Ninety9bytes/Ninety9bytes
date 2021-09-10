import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class WizardService {
  public activeTabs: Array<string>;
  public previousTab: string;


  // Observable string sources
  private activeTabSource = new BehaviorSubject<string>('');


  // Observable string streams
  activeTab$ = this.activeTabSource.asObservable();

  constructor() {
    this.activeTabs = new Array<string>();
  }

  public clearActiveTab() {
    let current = this.activeTabSource.getValue();
    current = '';

    this.activeTabSource.next(current);
  }

  setActiveTab(activeTab: string) {
    const current = this.activeTabSource.getValue();
    this.previousTab = current;
    this.activeTabSource.next(activeTab);
    this.activeTabs.push(activeTab);
  }
}
