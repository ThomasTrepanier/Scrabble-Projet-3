/* eslint-disable max-classes-per-file */
// /* eslint-disable dot-notation */
// /* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IconComponent } from '@app/components/icon/icon.component';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { GroupsPageComponent } from '@app/pages/groups-page/groups-page.component';
import { JoinWaitingPageComponent } from '@app/pages/join-waiting-page/join-waiting-page.component';
import { Subject } from 'rxjs';
import { ColorThemeDialogComponent } from './color-theme-dialog';

@Component({
    template: '',
})
export class TestComponent {}

export class MatDialogMock {
    confirmationObservable: Subject<void> = new Subject<void>();
    close() {
        return {
            close: () => ({}),
        };
    }
    backdropClick() {
        return this.confirmationObservable.asObservable();
    }
}

describe('ColorThemeDialogComponent', () => {
    let component: ColorThemeDialogComponent;
    let fixture: ComponentFixture<ColorThemeDialogComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ColorThemeDialogComponent, IconComponent, PageHeaderComponent],
            imports: [
                AppMaterialModule,
                MatFormFieldModule,
                ReactiveFormsModule,
                MatSelectModule,
                MatDividerModule,
                MatProgressSpinnerModule,
                MatDialogModule,
                MatSnackBarModule,
                BrowserAnimationsModule,
                MatCardModule,
                MatTabsModule,
                HttpClientTestingModule,
                FormsModule,
                CommonModule,
                MatButtonToggleModule,
                MatButtonModule,
                MatInputModule,
                RouterTestingModule.withRoutes([
                    { path: 'game-creation', component: TestComponent },
                    { path: 'groups', component: GroupsPageComponent },
                    { path: 'join-waiting-room', component: JoinWaitingPageComponent },
                ]),
            ],
            providers: [
                MatDialog,
                {
                    provide: MatDialogRef,
                    useClass: MatDialogMock,
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorThemeDialogComponent);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
