/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable max-classes-per-file */
import { ScrollingModule } from '@angular/cdk/scrolling';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BoardComponent } from '@app/components/board/board.component';
import { DefaultDialogComponent } from '@app/components/default-dialog/default-dialog.component';
import { IconComponent } from '@app/components/icon/icon.component';
import { TileRackComponent } from '@app/components/tile-rack/tile-rack.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { DEFAULT_PLAYER } from '@app/constants/game-constants';
import { DIALOG_QUIT_BUTTON_CONFIRM, DIALOG_QUIT_CONTENT, DIALOG_QUIT_STAY, DIALOG_QUIT_TITLE } from '@app/constants/pages-constants';
import { RACK_TILE_DEFAULT_FONT_SIZE, SQUARE_TILE_DEFAULT_FONT_SIZE } from '@app/constants/tile-font-size-constants';
import { GameService } from '@app/services';
import RoundManagerService from '@app/services/round-manager-service/round-manager.service';
import { of } from 'rxjs';
import { ObserverGamePageComponent } from './observer-game-page.component';

@Component({
    template: '',
    selector: 'app-board',
})
export class MockBoardComponent {
    tileFontSize = SQUARE_TILE_DEFAULT_FONT_SIZE;
}

@Component({
    template: '',
    selector: 'app-tile-rack',
})
export class MockTileRackComponent {
    tileFontSize = RACK_TILE_DEFAULT_FONT_SIZE;
}

@Component({
    template: '',
    selector: 'app-information-box',
})
export class MockInformationBoxComponent {}

@Component({
    template: '',
    selector: 'app-communication-box',
})
export class MockCommunicationBoxComponent {}

export class MatDialogMock {
    open() {
        return {
            afterClosed: () => of({}),
        };
    }
}

export class RoundManagerServiceMock {
    getActivePlayer() {
        return DEFAULT_PLAYER;
    }
}

describe('ObserverGamePageComponent', () => {
    let component: ObserverGamePageComponent;
    let fixture: ComponentFixture<ObserverGamePageComponent>;
    let gameServiceMock: GameService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [
                ObserverGamePageComponent,
                TileComponent,
                DefaultDialogComponent,
                IconComponent,
                MockBoardComponent,
                MockCommunicationBoxComponent,
                MockInformationBoxComponent,
                MockTileRackComponent,
            ],
            imports: [
                MatGridListModule,
                MatCardModule,
                MatExpansionModule,
                BrowserAnimationsModule,
                ReactiveFormsModule,
                FormsModule,
                ScrollingModule,
                HttpClientTestingModule,
                MatTooltipModule,
                RouterTestingModule.withRoutes([]),
                MatSnackBarModule,
            ],
            providers: [
                {
                    provide: MatDialog,
                    useClass: MatDialogMock,
                },
                {
                    provide: RoundManagerService,
                    useClass: RoundManagerServiceMock,
                },
                {
                    provide: BoardComponent,
                    useClass: MockBoardComponent,
                },
                {
                    provide: TileRackComponent,
                    useClass: MockTileRackComponent,
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ObserverGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        gameServiceMock = TestBed.inject(GameService);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call disconnectGame if player left with quit button or no active game dialog)', () => {
        component['mustDisconnectGameOnLeave'] = false;
        const spyDiconnect = spyOn(component['reconnectionService'], 'disconnectGame').and.callFake(() => {
            return;
        });
        component.ngOnDestroy();
        expect(spyDiconnect).not.toHaveBeenCalled();
    });

    it('should not call disconnectGame if player left abnormally during game', () => {
        component['mustDisconnectGameOnLeave'] = true;
        const spyDiconnect = spyOn(component['reconnectionService'], 'disconnectGame').and.callFake(() => {
            return;
        });
        component.ngOnDestroy();
        expect(spyDiconnect).toHaveBeenCalled();
        component['mustDisconnectGameOnLeave'] = false;
    });

    describe('endOfGame dialog', () => {
        it('should open the EndOfGame dialog on endOfGame event', () => {
            const spy = spyOn(component['dialog'], 'open');
            component['gameViewEventManagerService'].emitGameViewEvent('endOfGame', ['Mathilde']);
            expect(spy).toHaveBeenCalled();
        });
    });

    it('Clicking on quit button when the game is over should show quitting dialog', () => {
        gameServiceMock.isGameOver = true;
        const spy = spyOn<any>(component, 'openDialog').and.callFake(() => {
            return;
        });
        const buttonsContent = [DIALOG_QUIT_BUTTON_CONFIRM, DIALOG_QUIT_STAY];

        component.handleQuitButtonClick();
        expect(spy).toHaveBeenCalledOnceWith(DIALOG_QUIT_TITLE, DIALOG_QUIT_CONTENT, buttonsContent);
    });

    it('handlePlayerLeave should notify the playerLeavesService', () => {
        component['mustDisconnectGameOnLeave'] = true;
        component['handlePlayerLeaves']();
        expect(component['mustDisconnectGameOnLeave']).toBeFalse();
    });
});
