import { CommonModule } from '@angular/common';
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
import { Tile } from '@app/classes/tile';
import { UNDEFINED_TILE } from '@app/constants/game-constants';
import { AppMaterialModule } from '@app/modules/material.module';
import { TileComponent } from './tile.component';

describe('TileComponent', () => {
    let component: TileComponent;
    let fixture: ComponentFixture<TileComponent>;

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
            declarations: [TileComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Should return undefined tile if tile is undefined', () => {
        expect(component.tile).toEqual(UNDEFINED_TILE);
    });

    it('Should return tile when tile is defined', () => {
        const expectedTile: Tile = { letter: 'A', value: 5 };
        // eslint-disable-next-line dot-notation
        component['tile'] = expectedTile;
        expect(component.tile).toEqual(expectedTile);
    });

    it('Should have hideValue true if blank tile', () => {
        component.tile = {
            letter: '*',
            value: 0,
        };
        component.ngOnInit();
        expect(component.hideValue).toBeTrue();
    });

    it('Should NOT have hideValue true if normal tile', () => {
        component.tile = {
            letter: 'A',
            value: 1,
        };
        component.ngOnInit();
        expect(component.hideValue).toBeFalse();
    });
});
