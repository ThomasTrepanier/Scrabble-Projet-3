/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonToggleGroupHarness, MatButtonToggleHarness } from '@angular/material/button-toggle/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderBtnComponent } from '@app/components/header-btn/header-btn.component';
import { IconComponent } from '@app/components/icon/icon.component';
import { PageHeaderComponent } from '@app/components/page-header/page-header.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { TimerSelectionComponent } from '@app/components/timer-selection/timer-selection.component';
import { SrcDirective } from '@app/directives/src-directive/src.directive';
import { AppMaterialModule } from '@app/modules/material.module';
import { LoadingPageComponent } from '@app/pages/loading-page/loading-page.component';
import { GameDispatcherService } from '@app/services/';
import { Subject } from 'rxjs';
import { GameCreationPageComponent } from './game-creation-page.component';
import SpyObj = jasmine.SpyObj;
import { HttpClientTestingModule } from '@angular/common/http/testing';

@Component({
    template: '',
})
class TestComponent {}

describe('GameCreationPageComponent', () => {
    let component: GameCreationPageComponent;
    let fixture: ComponentFixture<GameCreationPageComponent>;
    let gameParameters: FormGroup;
    let gameDispatcherServiceSpy: SpyObj<GameDispatcherService>;
    let gameDispatcherCreationSubject: Subject<HttpErrorResponse>;

    const EMPTY_VALUE = '';

    beforeEach(() => {
        gameDispatcherServiceSpy = jasmine.createSpyObj('GameDispatcherService', ['observeGameCreationFailed', 'handleCreateGame']);
        gameDispatcherCreationSubject = new Subject();
        gameDispatcherServiceSpy.observeGameCreationFailed.and.returnValue(gameDispatcherCreationSubject.asObservable());
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                GameCreationPageComponent,
                TestComponent,
                TimerSelectionComponent,
                IconComponent,
                PageHeaderComponent,
                LoadingPageComponent,
                TileComponent,
                HeaderBtnComponent,
                SrcDirective,
            ],
            imports: [
                AppMaterialModule,
                HttpClientTestingModule,
                BrowserAnimationsModule,
                FormsModule,
                ReactiveFormsModule,
                CommonModule,
                MatButtonToggleModule,
                MatButtonModule,
                MatFormFieldModule,
                MatSelectModule,
                MatCardModule,
                MatInputModule,
                MatProgressSpinnerModule,
                RouterTestingModule.withRoutes([
                    { path: 'create-waiting-room', component: TestComponent },
                    { path: 'home', component: TestComponent },
                    { path: 'game-creation', component: GameCreationPageComponent },
                    { path: 'game', component: TestComponent },
                ]),
            ],
            providers: [
                MatButtonToggleHarness,
                MatButtonHarness,
                MatButtonToggleGroupHarness,
                GameDispatcherService,
                { provide: GameDispatcherService, useValue: gameDispatcherServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameCreationPageComponent);
        component = fixture.componentInstance;
        gameParameters = component.gameParameters;
        fixture.detectChanges();
    });

    const setValidFormValues = () => {
        const gameParametersForm = component.gameParameters;
        const formValues = {
            level: component.virtualPlayerLevels.Beginner,
            visibility: component.gameVisibilities.Public,
            timer: '60',
            password: '0',
        };
        gameParametersForm.setValue(formValues);
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('ngOnDestroy', () => {
        it('should always call next and complete on ngUnsubscribe', () => {
            const ngUnsubscribeNextSpy = spyOn<any>(component['pageDestroyed$'], 'next');
            const ngUnsubscribeCompleteSpy = spyOn<any>(component['pageDestroyed$'], 'complete');

            component.ngOnDestroy();
            expect(ngUnsubscribeNextSpy).toHaveBeenCalled();
            expect(ngUnsubscribeCompleteSpy).toHaveBeenCalled();
        });
    });

    describe('isFormValid', () => {
        it('form should be valid if all required fields are filled', () => {
            setValidFormValues();
            expect(component.isFormValid()).toBeTrue();
        });

        it('form should not be valid if timer is empty', () => {
            setValidFormValues();
            gameParameters.get('timer')?.setValue(EMPTY_VALUE);

            expect(component.isFormValid()).toBeFalse();
        });
    });

    describe('onSubmit', () => {
        it('clicking createGame button should call onSubmit', async () => {
            spyOn(component, 'isFormValid').and.returnValue(true);
            fixture.detectChanges();
            const createButton = fixture.debugElement.nativeElement.querySelector('#create-game-button');
            const spy = spyOn(component, 'onSubmit').and.callFake(() => {
                return;
            });
            createButton.click();

            expect(spy).toHaveBeenCalled();
        });

        it('form should call createGame on submit if form is valid', async () => {
            const spy = spyOn<any>(component, 'createGame').and.callFake(() => {});
            spyOn(component, 'isFormValid').and.returnValue(true);
            setValidFormValues();

            component.onSubmit();
            expect(spy).toHaveBeenCalled();
        });

        it('should NOT call createGame on submit if form is invalid', async () => {
            const spy = spyOn<any>(component, 'createGame');
            spyOn(component, 'isFormValid').and.returnValue(false);

            component.onSubmit();
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('createGame', () => {
        it('createGame should set isCreatingGame to true', () => {
            component.isCreatingGame = false;
            component['createGame']();
            expect(component.isCreatingGame).toBeTrue();
        });

        it('createGame button should always call gameDispatcher.handleCreateGame', () => {
            component['createGame']();
            expect(gameDispatcherServiceSpy.handleCreateGame).toHaveBeenCalled();
        });
    });
});
