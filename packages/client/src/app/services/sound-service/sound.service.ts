/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Injectable } from '@angular/core';
import {
    ROUTE_CREATE_WAITING,
    ROUTE_GAME,
    ROUTE_GAME_OBSERVER,
    ROUTE_JOIN_WAITING,
    ROUTE_PUZZLE_GAME,
    ROUTE_PUZZLE_GAME_DAILY,
    ROUTE_PUZZLE_HOME,
} from '@app/constants/routes-constants';
import { Howl } from 'howler';
import { soundSettings } from '@app/utils/settings';

export enum SoundName {
    ClickSound = 'ClickSound',
    LowTimeSound = 'LowTimeSound',
    VictorySound = 'VictorySound',
    EndGameSound = 'EndGameSound',
    TilePlacementSound = 'TilePlacementSound',
}

export enum BackgroundMusicName {
    BackgroundMusic1 = 'BackgroundMusic1',
    BackgroundMusic2 = 'BackgroundMusic2',
    BackgroundMusic3 = 'BackgroundMusic3',
}

export enum LobbyMusicName {
    LobbyMusic1 = 'LobbyMusic1',
    LobbyMusic2 = 'LobbyMusic2',
    LobbyMusic3 = 'LobbyMusic3',
}

export interface Musics {
    backgroundMusics: Howl[];
    lobbyMusics: Howl[];
    currentMusicType: MusicType;
    currentMusic?: Howl;
    backgroundMusicIndex: number;
    lobbyMusicIndex: number;
}
export enum MusicType {
    NoMusic,
    BackgroundMusic,
    LobbyMusic,
    Init,
}

export interface SoundVolume {
    sound: Howl[];
    lobbyMusics: Howl[];
    currentMusicType: MusicType;
    currentMusic?: Howl;
    backgroundMusicIndex: number;
    lobbyMusicIndex: number;
}

export const SOUNDS_ADJUSTED_VOLUMES = new Map<SoundName | BackgroundMusicName | LobbyMusicName, number>([
    [SoundName.ClickSound, 0.8],
    [SoundName.LowTimeSound, 0.8],
    [SoundName.VictorySound, 0.3],
    [SoundName.EndGameSound, 0.5],
    [SoundName.TilePlacementSound, 0.8],
    [BackgroundMusicName.BackgroundMusic1, 0.25],
    [BackgroundMusicName.BackgroundMusic2, 0.25],
    [BackgroundMusicName.BackgroundMusic3, 0.25],
    [LobbyMusicName.LobbyMusic1, 0.1],
    [LobbyMusicName.LobbyMusic2, 0.15],
    [LobbyMusicName.LobbyMusic3, 0.15],
]);
export const PAGES_NO_MUSIC = [ROUTE_GAME, ROUTE_GAME_OBSERVER, ROUTE_PUZZLE_GAME, ROUTE_PUZZLE_GAME_DAILY, ROUTE_PUZZLE_HOME];
export const PAGES_LOBBY_MUSIC = [ROUTE_CREATE_WAITING, ROUTE_JOIN_WAITING];
export const SOUND_FOLDER_PATH = 'assets\\sound\\';
export const LOW_TIME = 20;
export const CRITICAL_LOW_TIME = 5;

@Injectable({
    providedIn: 'root',
})
export class SoundService {
    static isSoundEnabled = true;
    private isMusicEnabled: boolean;
    private musics: Musics;
    private soundsMap: Map<SoundName, Howl>;
    constructor() {
        this.soundsMap = new Map();

        this.isMusicEnabled = soundSettings.getIsMusicEnabled() ?? true;
        SoundService.isSoundEnabled = soundSettings.getIsSoundEffectsEnabled() ?? true;

        for (const sound of Object.values(SoundName)) {
            this.soundsMap.set(
                sound,
                new Howl({
                    src: [`${SOUND_FOLDER_PATH}${sound}.mp3`],
                    volume: SOUNDS_ADJUSTED_VOLUMES.get(sound) ?? 1,
                }),
            );
        }

        this.musics = {
            backgroundMusicIndex: 0,
            backgroundMusics: [],
            lobbyMusicIndex: 0,
            lobbyMusics: [],
            currentMusicType: MusicType.Init,
        };
        for (const sound of Object.values(BackgroundMusicName)) {
            this.musics.backgroundMusics.push(
                new Howl({
                    src: [`${SOUND_FOLDER_PATH}${sound}.mp3`],
                    volume: SOUNDS_ADJUSTED_VOLUMES.get(sound) ?? 1,
                    onend: () => this.startNextTrack(MusicType.BackgroundMusic),
                }),
            );
        }
        for (const sound of Object.values(LobbyMusicName)) {
            this.musics.lobbyMusics.push(
                new Howl({
                    src: [`${SOUND_FOLDER_PATH}${sound}.mp3`],
                    volume: SOUNDS_ADJUSTED_VOLUMES.get(sound) ?? 1,
                    onend: () => this.startNextTrack(MusicType.LobbyMusic),
                }),
            );
        }
    }

    get isMusicEnabledSetting(): boolean {
        return this.isMusicEnabled;
    }

    set isMusicEnabledSetting(newSetting: boolean) {
        if (this.isMusicEnabled === newSetting) return;
        this.isMusicEnabled = newSetting;

        soundSettings.set('isMusicEnabled', newSetting);

        if (!this.isMusicEnabled) {
            this.musics.currentMusic?.stop();
            this.musics.currentMusic = undefined;
        } else {
            this.startNextTrack(this.musics.currentMusicType);
        }
    }

    startNextTrack(musicType: MusicType) {
        if (!this.isMusicEnabled) return;
        if (musicType === MusicType.BackgroundMusic || musicType === MusicType.Init) {
            this.musics.backgroundMusicIndex = (this.musics.backgroundMusicIndex + 1) % this.musics.backgroundMusics.length;
            const music = this.musics.backgroundMusics[this.musics.backgroundMusicIndex];
            this.musics.currentMusic = music;
            music.play();
        } else if (musicType === MusicType.LobbyMusic) {
            this.musics.lobbyMusicIndex = (this.musics.lobbyMusicIndex + 1) % this.musics.lobbyMusics.length;
            const music = this.musics.lobbyMusics[this.musics.lobbyMusicIndex];
            this.musics.currentMusic = music;
            music.play();
        }
    }

    startMusic() {
        this.musics.currentMusic?.stop();
        if (!this.isMusicEnabled) return;
        const music = this.musics.backgroundMusics[0];
        music.play();
        this.musics.currentMusic = music;
    }

    changeMusic(newUrl: string) {
        if (!this.isMusicEnabled) return;

        const newUrlType = PAGES_NO_MUSIC.includes(newUrl)
            ? MusicType.NoMusic
            : PAGES_LOBBY_MUSIC.includes(newUrl)
            ? MusicType.LobbyMusic
            : MusicType.BackgroundMusic;

        if (this.musics.currentMusicType !== newUrlType) {
            this.musics.currentMusicType = newUrlType;
            if (this.musics.currentMusic) {
                this.musics.currentMusic.stop();
            }
            if (newUrlType !== MusicType.NoMusic && this.isMusicEnabled) {
                const newMusic =
                    this.musics.currentMusicType === MusicType.BackgroundMusic
                        ? this.musics.backgroundMusics[this.musics.backgroundMusicIndex]
                        : this.musics.lobbyMusics[this.musics.lobbyMusicIndex];
                newMusic.play();
                this.musics.currentMusic = newMusic;
            }
        }
    }

    playSound(soundName: SoundName) {
        if (!SoundService.isSoundEnabled) return;

        const sound = this.soundsMap.get(soundName);
        if (sound) {
            sound.play();
        }
    }
}
