import { Component, Input, ViewChild } from '@angular/core';
import { AVATARS, UPLOADCARE_PUBLIC_KEY } from '@app/constants/avatar-constants';
import { FormControl } from '@angular/forms';
import { ImageDocumentProgressState, Update } from '@app/classes/avatar/uploadcare';
import { UcWidgetComponent } from 'ngx-uploadcare-widget';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

const DEBOUNCE = 300;

@Component({
    selector: 'app-avatar-selector',
    templateUrl: './avatar-selector.component.html',
    styleUrls: ['./avatar-selector.component.scss'],
})
export class AvatarSelectorComponent {
    @Input() control: FormControl = new FormControl();
    @ViewChild(UcWidgetComponent) widget: UcWidgetComponent;
    avatars = AVATARS;
    apiKey = UPLOADCARE_PUBLIC_KEY;
    state: BehaviorSubject<ImageDocumentProgressState> = new BehaviorSubject<ImageDocumentProgressState>(ImageDocumentProgressState.Ready);
    widgetState: Observable<ImageDocumentProgressState>;

    constructor() {
        this.widgetState = this.state.pipe(debounceTime(DEBOUNCE));
    }

    get nativeWidget() {
        // @ts-ignore
        return this.widget.widget;
    }

    openDialog() {
        this.nativeWidget.openDialog();
    }

    handleAvatarChange(event: Update) {
        this.state.next(ImageDocumentProgressState.Uploading);
        event.then((document) => {
            if (!document.cdnUrl.includes('crop/0x0')) {
                this.control.setValue(document.cdnUrl);
            }
            this.state.next(ImageDocumentProgressState.Ready);
        });
    }

    handleAvatarProgress() {
        this.state.next(ImageDocumentProgressState.Uploading);
    }
}
