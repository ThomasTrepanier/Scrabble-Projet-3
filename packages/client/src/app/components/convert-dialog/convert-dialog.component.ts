// import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
// import { FormControl, FormGroup, Validators } from '@angular/forms';
// import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
// import { GameMode } from '@app/constants/game-mode';
// import { GameDispatcherService } from '@app/services';
// import { VirtualPlayerProfilesService } from '@app/services/virtual-player-profile-service/virtual-player-profile.service';
// import { VirtualPlayer } from '@common/models/virtual-player';
// import { Subject } from 'rxjs';
// import { takeUntil } from 'rxjs/operators';

// export interface ConvertResult {
//     isConverting: boolean;
// }

// @Component({
//     selector: 'app-convert-dialog',
//     templateUrl: './convert-dialog.component.html',
//     styleUrls: ['./convert-dialog.component.scss'],
// })
// export class ConvertDialogComponent implements OnInit, OnDestroy {
//     virtualPlayerLevels: typeof VirtualPlayerLevel;
//     gameParameters: FormGroup;

//     private playerName: string;
//     private virtualPlayerNameMap: Map<VirtualPlayerLevel, string[]>;
//     private pageDestroyed$: Subject<boolean>;

//     constructor(
//         private dialogRef: MatDialogRef<ConvertDialogComponent>,
//         @Inject(MAT_DIALOG_DATA) public data: string,
//         private gameDispatcherService: GameDispatcherService,
//         private readonly virtualPlayerProfilesService: VirtualPlayerProfilesService,
//     ) {
//         this.playerName = data;
//         this.virtualPlayerLevels = VirtualPlayerLevel;
//         this.virtualPlayerNameMap = new Map();
//         this.pageDestroyed$ = new Subject();
//         this.gameParameters = new FormGroup({
//             gameMode: new FormControl(GameMode.Solo, Validators.required),
//             level: new FormControl(VirtualPlayerLevel.Beginner, Validators.required),
//             virtualPlayerName: new FormControl('', Validators.required),
//         });

//         this.setupDialog();
//     }

//     ngOnInit(): void {
//         this.gameParameters
//             .get('level')
//             ?.valueChanges.pipe(takeUntil(this.pageDestroyed$))
//             .subscribe(() => this.gameParameters?.get('virtualPlayerName')?.reset());

//         this.virtualPlayerProfilesService.subscribeToVirtualPlayerProfilesUpdateEvent(this.pageDestroyed$, (profiles) => {
//             this.generateVirtualPlayerProfileMap(profiles);
//         });
//         this.virtualPlayerProfilesService.getAllVirtualPlayersProfile();
//     }

//     ngOnDestroy(): void {
//         this.pageDestroyed$.next(true);
//         this.pageDestroyed$.complete();
//     }

//     onSubmit(): void {
//         this.handleConvertToSolo();
//     }

//     getVirtualPlayerNames(): string[] {
//         if (!this.virtualPlayerNameMap) return [];
//         const namesForLevel: string[] | undefined = this.virtualPlayerNameMap.get(this.gameParameters.get('level')?.value);
//         return namesForLevel ?? [];
//     }

//     returnToWaiting(): void {
//         this.gameDispatcherService.handleRecreateGame();
//         this.dialogRef.close({ isConverting: false });
//     }

//     private generateVirtualPlayerProfileMap(virtualPlayerProfiles: VirtualPlayer[]): void {
//         virtualPlayerProfiles.forEach((profile: VirtualPlayer) => {
//             if (profile.name === this.playerName) return;

//             const namesForLevel: string[] | undefined = this.virtualPlayerNameMap.get(profile.level as VirtualPlayerLevel);
//             if (!namesForLevel) this.virtualPlayerNameMap.set(profile.level as VirtualPlayerLevel, [profile.name]);
//             else namesForLevel.push(profile.name);
//         });
//     }

//     private handleConvertToSolo(): void {
//         this.gameDispatcherService.handleRecreateGame(this.gameParameters);
//         this.dialogRef.close({ isConverting: true });
//     }

//     private setupDialog(): void {
//         this.dialogRef.disableClose = true;
//         this.dialogRef.backdropClick().subscribe(() => this.returnToWaiting());
//     }
// }
