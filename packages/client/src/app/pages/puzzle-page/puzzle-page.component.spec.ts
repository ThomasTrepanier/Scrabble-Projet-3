import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzlePageComponent } from './puzzle-page.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PuzzleService } from '@app/services/puzzle-service/puzzle.service';
import { Subject } from 'rxjs';
import { Puzzle } from '@common/models/puzzle';
import { Square } from '@common/models/game';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const DEFAULT_TIME = 300;

const DEFAULT_PUZZLE: Puzzle = {
    board: { grid: [[{} as Square]] },
    tiles: [],
};

describe('PuzzlePageComponent', () => {
    let component: PuzzlePageComponent;
    let fixture: ComponentFixture<PuzzlePageComponent>;
    let puzzleService: jasmine.SpyObj<PuzzleService>;

    beforeEach(async () => {
        puzzleService = jasmine.createSpyObj(PuzzleService, {
            start: new Subject(),
            complete: new Subject(),
            abandon: new Subject(),
            askToStart: undefined,
            askToAbandon: undefined,
        });

        await TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                MatDialogModule,
                AppRoutingModule,
                BrowserAnimationsModule,
                FormsModule,
                ReactiveFormsModule,
                MatSnackBarModule,
            ],
            declarations: [PuzzlePageComponent],
            providers: [{ provide: PuzzleService, useValue: puzzleService }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PuzzlePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('stopPlaying', () => {
        it('should emit when isPlaying emit false', (done) => {
            component.stopPlaying.subscribe(() => {
                expect(true).toBeTruthy();
                done();
            });

            component.isPlaying.next(false);
        });
    });

    describe('start', () => {
        it('should start timer', () => {
            component.start(DEFAULT_TIME);
            expect(component.timer).not.toBeUndefined();
        });

        it('should create grid on puzzleService.start', () => {
            const subject = new Subject<Puzzle>();

            puzzleService.start.and.returnValue(subject);

            component.start(DEFAULT_TIME);

            subject.next(DEFAULT_PUZZLE);

            expect(component.grid.value[0]).toHaveSize(1);
        });
    });
});
