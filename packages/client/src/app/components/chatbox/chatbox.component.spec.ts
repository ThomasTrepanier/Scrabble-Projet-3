import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IconButtonComponent } from '@app/components/icon-button/icon-button.component';
import { IconComponent } from '@app/components/icon/icon.component';
import { SrcDirective } from '@app/directives/src-directive/src.directive';

import { ChatBoxComponent } from './chatbox.component';

describe('ChatboxComponent', () => {
    let component: ChatBoxComponent;
    let fixture: ComponentFixture<ChatBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChatBoxComponent, IconButtonComponent, IconComponent, SrcDirective],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
