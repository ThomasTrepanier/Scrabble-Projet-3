/* eslint-disable dot-notation */
/* eslint-disable max-classes-per-file */
import { CommonModule } from '@angular/common';
import { Component, Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Orientation } from '@app/classes/actions/orientation';
import { SquareView } from '@app/classes/square';
import { IconComponent } from '@app/components/icon/icon.component';
import { SQUARE_SIZE, UNDEFINED_SQUARE, UNDEFINED_SQUARE_SIZE } from '@app/constants/game-constants';
import { AppMaterialModule } from '@app/modules/material.module';
import { DragAndDropService } from '@app/services/drag-and-drop-service/drag-and-drop.service';
import { TilePlacementService } from '@app/services/tile-placement-service/tile-placement.service';
import { Subject } from 'rxjs';
import { SquareComponent } from './square.component';

describe('SquareComponent', () => {
    let component: SquareComponent;
    let fixture: ComponentFixture<CenterSquareWrapperComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatGridListModule,
                MatCardModule,
                MatProgressSpinnerModule,
                MatIconModule,
                MatButtonModule,
                ReactiveFormsModule,
                CommonModule,
                MatInputModule,
                BrowserAnimationsModule,
                AppMaterialModule,
                MatFormFieldModule,
                FormsModule,
                MatDialogModule,
            ],
            declarations: [SquareComponent, CenterSquareWrapperComponent, IconComponent],
            providers: [
                Renderer2,
                {
                    provide: DragAndDropService,
                    useValue: jasmine.createSpyObj(['onRackTileMove', 'onBoardTileMove', 'onRackTileDrop', 'onBoardTileDrop', 'reset']),
                },
                { provide: TilePlacementService, useValue: jasmine.createSpyObj(['placeTile']) },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CenterSquareWrapperComponent);
        component = fixture.debugElement.children[0].componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnOnInit should leave attributes undefined if no SquareView is attached', () => {
        const squareWrapper = new SquareTestWrapper();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOnProperty<any>(squareWrapper, 'squareView', 'get').and.returnValue(undefined);
        squareWrapper.createComponent();

        expect(squareWrapper.squareComponent.multiplierType).toBeUndefined();
        expect(squareWrapper.squareComponent.multiplierValue).toBeUndefined();
    });

    it('ngOnInit should call setText', () => {
        const squareWrapper = new SquareTestWrapper();
        squareWrapper.createComponent();
        const getTextSpy = spyOn(squareWrapper.squareView, 'getText').and.returnValue([undefined, undefined]);

        squareWrapper.squareComponent.ngOnInit();

        expect(getTextSpy).toHaveBeenCalled();
    });

    describe('getOrientationClass', () => {
        it('should return right message for horizontal cursor orientation', () => {
            component['cursorOrientation'] = Orientation.Horizontal;
            expect(component.getOrientationClass()).toEqual('cursor-horizontal');
        });

        it('should return right message for vertical cursor orientation', () => {
            component['cursorOrientation'] = Orientation.Vertical;
            expect(component.getOrientationClass()).toEqual('cursor-vertical');
        });

        it('should return right message for undefined cursor orientation', () => {
            component['cursorOrientation'] = undefined;
            expect(component.getOrientationClass()).toEqual('');
        });
    });
});

export class SquareTestWrapper {
    pSquareView: SquareView;
    squareComponent: SquareComponent;

    createComponent(): void {
        this.squareView = new SquareView(UNDEFINED_SQUARE, UNDEFINED_SQUARE_SIZE);
        this.squareComponent = new SquareComponent(
            jasmine.createSpyObj(DragAndDropService, ['onBoardTileMove', 'onBoardTileDrop']),
            jasmine.createSpyObj('TilePlacementService', ['placeTile'], { tilePlacements$: new Subject() }),
        );
        this.squareComponent.squareView = this.squareView;
    }

    get squareView(): SquareView {
        return this.pSquareView;
    }

    set squareView(squareView: SquareView) {
        this.pSquareView = squareView;
    }
}

@Component({
    selector: 'app-square-component-wrapper',
    template: '<app-square [squareView]="squareView"></app-square>',
})
class CenterSquareWrapperComponent {
    squareView = new SquareView(
        {
            tile: null,
            position: { row: 0, column: 0 },
            scoreMultiplier: null,
            wasMultiplierUsed: false,
            isCenter: true,
        },
        SQUARE_SIZE,
    );
}
