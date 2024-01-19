import { Component, OnDestroy, OnInit } from '@angular/core';
import RoundManagerService from '@app/services/round-manager-service/round-manager.service';
import { MAX_TILES_PER_PLAYER } from '@app/constants/game-constants';
import { GameService } from '@app/services';
import { GameViewEventManagerService } from '@app/services/game-view-event-manager-service/game-view-event-manager.service';
import { Subject } from 'rxjs';
import { Player } from '@app/classes/player';
import { takeUntil } from 'rxjs/operators';
import { LetterValue, Tile } from '@app/classes/tile';

interface GamePlayer {
    isActive: boolean;
    player: Player;
    tilesLeft: number;
    tilesLeftTile: Tile;
}

interface LocalGamePlayer extends GamePlayer {
    isPlaying: boolean;
}

@Component({
    selector: 'app-game-players',
    templateUrl: './game-players.component.html',
    styleUrls: ['./game-players.component.scss'],
})
export class GamePlayersComponent implements OnInit, OnDestroy {
    readonly maxTilesPerPlayer = MAX_TILES_PER_PLAYER;
    localPlayer: LocalGamePlayer = {
        isActive: false,
        isPlaying: false,
        player: new Player('', { username: 'Player1', email: '', avatar: '' }, []),
        tilesLeft: 0,
        tilesLeftTile: {} as Tile,
    };
    adversaryPlayers: GamePlayer[] = [];
    private componentDestroyed$: Subject<boolean>;

    constructor(
        private readonly roundManager: RoundManagerService,
        private readonly gameService: GameService,
        private readonly gameViewEventManagerService: GameViewEventManagerService,
    ) {}

    ngOnInit(): void {
        this.componentDestroyed$ = new Subject();
        this.gameViewEventManagerService.subscribeToGameViewEvent('reRender', this.componentDestroyed$, () => {
            this.ngOnDestroy();
            this.ngOnInit();
            this.updatePlayers(this.roundManager.getActivePlayer());
        });

        if (!this.gameService.isGameSetUp) return;
        this.setupGame();
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }

    get adversaries(): GamePlayer[] {
        return [this.adversary1, this.adversary2, this.adversary3];
    }

    isActive(): boolean {
        return this.gameService.isLocalPlayerPlaying();
    }

    getLocalPlayer(): Player {
        return this.gameService.getLocalPlayer() ?? new Player('', { username: 'Player1', email: '', avatar: '' }, []);
    }

    get adversary1(): GamePlayer {
        return (
            this.adversaryPlayers[0] ?? {
                isActive: false,
                player: new Player('', { username: 'Player2', email: '', avatar: '' }, []),
                tilesLeft: 0,
                tilesLeftTile: {} as Tile,
            }
        );
    }

    get adversary2(): GamePlayer {
        return (
            this.adversaryPlayers[1] ?? {
                isActive: false,
                player: new Player('', { username: 'Player3', email: '', avatar: '' }, []),
                tilesLeft: 0,
                tilesLeftTile: {} as Tile,
            }
        );
    }

    get adversary3(): GamePlayer {
        return (
            this.adversaryPlayers[2] ?? {
                isActive: false,
                player: new Player('', { username: 'Player4', email: '', avatar: '' }, []),
                tilesLeft: 0,
                tilesLeftTile: {} as Tile,
            }
        );
    }

    private setupGame(): void {
        if (this.roundManager.timer) {
            this.roundManager.timer.pipe(takeUntil(this.componentDestroyed$)).subscribe(([, activePlayer]) => {
                this.updatePlayers(activePlayer);
            });
        }

        this.gameViewEventManagerService.subscribeToGameViewEvent('endOfGame', this.componentDestroyed$, () => {
            this.localPlayer = { ...this.localPlayer, isPlaying: false };
        });
    }

    private updatePlayers(activePlayer: Player | undefined): void {
        const localPlayer = this.gameService.getLocalPlayer();

        const localIsActive = !!localPlayer && !!activePlayer && activePlayer.id === localPlayer.id;

        this.localPlayer = {
            isActive: localIsActive,
            isPlaying: localIsActive && !this.gameService.isGameOver,
            player: localPlayer ?? new Player('', { username: 'Player', email: '', avatar: '' }, []),
            tilesLeft: localPlayer?.getTiles().length ?? 0,
            tilesLeftTile: { letter: `${localPlayer?.getTiles().length ?? 0}` as LetterValue, value: 0 },
        };

        this.adversaryPlayers = [];
        for (const adversary of this.gameService.getAdversaries()) {
            this.adversaryPlayers.push({
                isActive: !!adversary && !!activePlayer && activePlayer.id === adversary.id,
                player: adversary ?? new Player('', { username: 'Player', email: '', avatar: '' }, []),
                tilesLeft: adversary.getTiles().length,
                tilesLeftTile: { letter: `${adversary.getTiles().length}` as LetterValue, value: 0 },
            });
        }
    }
}
