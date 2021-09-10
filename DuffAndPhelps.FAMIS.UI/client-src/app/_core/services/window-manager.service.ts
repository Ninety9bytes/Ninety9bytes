import { DefaultTitleBarComponent } from '../../_shared/components/window/default-title-bar.component';
import { ModalBackdropComponent } from '../../_shared/components/window/modal-backdrop.component';
import { Injectable, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { WindowOption } from '../../_models/window-option';
import { WindowRef, WindowService } from '@progress/kendo-angular-dialog';

@Injectable()
export class WindowManager {
  public window: WindowRef = new WindowRef();

  public viewContainerRef: ViewContainerRef;
  public scrollPosition = 0;

  private opened = false;

  constructor(private windowService: WindowService, private componentResolver: ComponentFactoryResolver) {  }

  public open(content: any, title = '', options?: WindowOption): WindowRef {
    let backdrop: any;

    const titleBarComponent = this.componentResolver.resolveComponentFactory(DefaultTitleBarComponent);
    const defaultTitleBar = this.viewContainerRef.createComponent(titleBarComponent);

    defaultTitleBar.instance.title = title;
    defaultTitleBar.instance.translationkey = options ? options.translationKey : null;

    if (!this.opened && defaultTitleBar) {
      if (options && options.isModal) {
        const backdropComponent = this.componentResolver.resolveComponentFactory(ModalBackdropComponent);
        backdrop = this.viewContainerRef.createComponent(backdropComponent);
      }

      this.window = this.windowService.open({
        title: title,
        content: content,
        width: options && options.width ? options.width : 600,
        top: this.scrollPosition > 0 ? this.scrollPosition + 50 : 50,
        resizable: true,
        titleBarContent: defaultTitleBar.instance.windowTitleBar,
        appendTo: this.viewContainerRef,
        draggable: true,
      });

      this.window.result.subscribe(windowCloseResult => {
        this.opened = false;

        if (options && options.isModal) {
          backdrop.destroy();
        }
      });

      this.opened = true;
    }

    return this.window;
  }

  public isOpened(): boolean {
    return this.opened;
  }

  public close() {
    this.window.close();
  }
}
