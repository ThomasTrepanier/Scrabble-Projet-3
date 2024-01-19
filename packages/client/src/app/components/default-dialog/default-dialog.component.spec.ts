/* eslint-disable dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { BUTTON_MUST_HAVE_CONTENT, DIALOG_BUTTONS_MUST_BE_AN_ARRAY, DIALOG_MUST_HAVE_TITLE } from '@app/constants/component-errors';
import { IconComponent } from '@app/components/icon/icon.component';
import { DefaultDialogComponent } from './default-dialog.component';
import { DefaultDialogButtonParameters, DefaultDialogParameters } from './default-dialog.component.types';

const MODEL: DefaultDialogParameters = {
    title: 'Dialog title',
    content: 'Dialog content',
    buttons: [
        {
            content: 'Button 1',
            closeDialog: true,
        },
        {
            content: 'Button 2',
            redirect: '/test',
        },
        {
            content: 'Button 3',
            closeDialog: undefined,
        },
    ],
};

const createDialog = (model: DefaultDialogParameters): [component: DefaultDialogComponent, fixture: ComponentFixture<DefaultDialogComponent>] => {
    TestBed.configureTestingModule({
        declarations: [DefaultDialogComponent, IconComponent],
        imports: [MatButtonModule, MatDialogModule, RouterTestingModule.withRoutes([])],
        providers: [
            {
                provide: MAT_DIALOG_DATA,
                useValue: model,
            },
        ],
    }).compileComponents();

    const fixture: ComponentFixture<DefaultDialogComponent> = TestBed.createComponent(DefaultDialogComponent);
    const component: DefaultDialogComponent = fixture.componentInstance;

    fixture.detectChanges();

    return [component, fixture];
};
const createDialogWithUnknownModel = (model: unknown): [component: DefaultDialogComponent, fixture: ComponentFixture<DefaultDialogComponent>] => {
    return createDialog(model as DefaultDialogParameters);
};

describe('DefaultDialogComponent', () => {
    describe('Default', () => {
        let component: DefaultDialogComponent;
        let fixture: ComponentFixture<DefaultDialogComponent>;

        beforeEach(() => {
            [component, fixture] = createDialog(MODEL);
        });

        it('should be created', async () => {
            expect(component).toBeTruthy();
        });

        it('should have model title', () => {
            expect(component.title).toEqual(MODEL.title);
        });

        it('should have model content', () => {
            expect(component.content).toEqual(MODEL.content);
        });

        it('should have model buttons', () => {
            for (const button of MODEL.buttons) {
                expect(component.buttons.some((btn) => btn.content === button.content)).toBeTrue();
            }
        });

        it('should call handleButtonClick when a button is clicked', (done) => {
            const index = 2;
            const spy = spyOn(component, 'handleButtonClick');
            const button = fixture.debugElement.nativeElement.querySelector(`button:nth-child(${index + 1})`);
            button.click();

            fixture.whenStable().then(() => {
                expect(spy).toHaveBeenCalledWith(component.buttons[index]);
                done();
            });
        });

        it('should set button as closeDialog=true if redirect exists', () => {
            const index = 1;
            expect(MODEL.buttons[index].closeDialog).toBeFalsy();
            expect(MODEL.buttons[index].redirect).toBeTruthy();
            expect(component.buttons[index].closeDialog).toBeTrue();
        });

        it('******should set button as closeDialog=true if redirect exists', () => {
            const index = 2;
            expect(MODEL.buttons[index].closeDialog).toBeFalsy();
            expect(MODEL.buttons[index].redirect).toBeFalsy();
            expect(component.buttons[index].closeDialog).toBeFalse();
        });

        describe('handleButtonClick', () => {
            it('should call button action if it exists', () => {
                type DefaultDialogButtonWithActionParameters = DefaultDialogButtonParameters & { action: () => void };
                const button: DefaultDialogButtonWithActionParameters = {
                    content: 'button',
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    action: () => {},
                };
                const spy = spyOn(button, 'action');
                component.handleButtonClick(button);
                expect(spy).toHaveBeenCalled();
            });

            it('should call navigate if redirect exists', () => {
                const button: DefaultDialogButtonParameters = {
                    content: 'button',
                    redirect: '/redirect',
                };
                const spy = spyOn(component['router'], 'navigate');
                component.handleButtonClick(button);
                expect(spy).toHaveBeenCalled();
            });

            it('should not call navigate if redirect does not exists', () => {
                const button: DefaultDialogButtonParameters = {
                    content: 'button',
                };
                const spy = spyOn(component['router'], 'navigate');
                component.handleButtonClick(button);
                expect(spy).not.toHaveBeenCalled();
            });
        });
    });

    describe('No buttons', () => {
        it('should have  an empty button array', () => {
            const [component] = createDialog({ title: MODEL.title, content: MODEL.content } as unknown as DefaultDialogParameters);
            expect(component.buttons).toHaveSize(0);
        });
    });

    describe('Constructor error', () => {
        it('should throw error when no title is provided', () => {
            const model = {
                notATitle: 'This is not a title',
            };
            expect(() => createDialogWithUnknownModel(model)).toThrowError(DIALOG_MUST_HAVE_TITLE);
        });

        it('should throw error when buttons is not an array', () => {
            const model = {
                title: 'Title',
                buttons: {
                    content: 'Button but not in an array',
                },
            };
            expect(() => createDialogWithUnknownModel(model)).toThrowError(DIALOG_BUTTONS_MUST_BE_AN_ARRAY);
        });

        it('should throw error when any button has no content', () => {
            const model = {
                title: 'Title',
                buttons: [
                    {
                        notAContent: 'This it not a content',
                    },
                ],
            };
            expect(() => createDialogWithUnknownModel(model)).toThrowError(BUTTON_MUST_HAVE_CONTENT);
        });
    });
});
