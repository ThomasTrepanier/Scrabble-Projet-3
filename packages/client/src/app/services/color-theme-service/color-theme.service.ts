import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum ThemeColor {
    Green = 'green-theme',
    Blue = 'blue-theme',
    Purple = 'purple-theme',
    Pink = 'pink-theme',
    Red = 'red-theme',
    Black = 'black-theme',
}

export enum HexThemeColor {
    Green = '27, 94, 32',
    Blue = '10, 59, 72',
    Purple = '168, 1, 255',
    Pink = '255, 1, 162',
    Red = '217, 47, 8',
    Black = '0, 0, 0',
}

export const LOGO_PATH_GREEN = 'https://ucarecdn.com/d53bcb33-e937-4e0b-bd89-192468b2bb9f/';
export const LOGO_PATH_BLUE = 'https://ucarecdn.com/cf0af053-7248-43d0-8c7e-436d26710266/';
export const LOGO_PATH_PINK = 'https://ucarecdn.com/b9a8f9e1-6fbd-44cd-99dd-f70ea4b30257/';
export const LOGO_PATH_PURPLE = 'https://ucarecdn.com/8177dbde-343a-48c0-a72c-affb1583e64d/';
export const LOGO_PATH_BLACK = 'https://ucarecdn.com/d4b11830-844e-42c3-9d6f-3cd29ed00024/';
export const LOGO_PATH_RED = 'https://ucarecdn.com/3f0e76f5-a689-4bb4-93a4-b37040430cf4/';

@Injectable({
    providedIn: 'root',
})
export class ColorThemeService {
    private colorTheme = new BehaviorSubject<ThemeColor>(ThemeColor.Green);
    private logoTheme = new BehaviorSubject<string>(LOGO_PATH_GREEN);

    constructor() {
        this.setColorTheme(this.colorTheme.value);
    }

    setColorTheme(themeColor: ThemeColor) {
        const body = document.getElementsByTagName('body')[0];
        body.classList.remove(this.colorTheme.value);
        body.classList.add(themeColor);
        this.colorTheme.next(themeColor);
        this.logoTheme.next(this.getLogoLink());
        document.documentElement.style.setProperty('--primary', this.getPrimaryColor());
    }

    getColorTheme() {
        return this.colorTheme.asObservable();
    }

    getColorThemeValue() {
        return this.colorTheme.value;
    }

    getLogoTheme() {
        return this.logoTheme.asObservable();
    }

    private getPrimaryColor(): string {
        switch (this.colorTheme.value) {
            case ThemeColor.Blue:
                return HexThemeColor.Blue;
            case ThemeColor.Pink:
                return HexThemeColor.Pink;
            case ThemeColor.Purple:
                return HexThemeColor.Purple;
            case ThemeColor.Black:
                return HexThemeColor.Black;
            case ThemeColor.Red:
                return HexThemeColor.Red;
            case ThemeColor.Green:
                return HexThemeColor.Green;
            default:
                return HexThemeColor.Green;
        }
    }
    private getLogoLink(): string {
        switch (this.colorTheme.value) {
            case ThemeColor.Blue:
                return LOGO_PATH_BLUE;
            case ThemeColor.Pink:
                return LOGO_PATH_PINK;
            case ThemeColor.Purple:
                return LOGO_PATH_PURPLE;
            case ThemeColor.Black:
                return LOGO_PATH_BLACK;
            case ThemeColor.Red:
                return LOGO_PATH_RED;
            case ThemeColor.Green:
                return LOGO_PATH_GREEN;
            default:
                return LOGO_PATH_GREEN;
        }
    }
}
