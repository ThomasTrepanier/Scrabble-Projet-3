import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ColorThemeService, ThemeColor } from '@app/services/color-theme-service/color-theme.service';

export interface ThemeColorOption {
    themeColor: ThemeColor;
    backgroundColor: string;
}

@Component({
    selector: 'app-color-theme-dialog',
    templateUrl: 'color-theme-dialog.html',
    styleUrls: ['color-theme-dialog.scss'],
})
export class ColorThemeDialogComponent {
    themeColors: typeof ThemeColor = ThemeColor;
    currentColor: ThemeColor;
    initialColor: ThemeColor;
    constructor(private colorThemeService: ColorThemeService, private dialogRef: MatDialogRef<ColorThemeDialogComponent>) {
        dialogRef.backdropClick().subscribe(() => {
            this.closeDialog();
        });
        this.currentColor = this.colorThemeService.getColorThemeValue();
        this.initialColor = this.currentColor;
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    changeTheme(selectedColor: ThemeColor) {
        this.colorThemeService.setColorTheme(selectedColor);
        this.currentColor = selectedColor;
    }

    undoTheme() {
        this.colorThemeService.setColorTheme(this.initialColor);
        this.closeDialog();
    }
}
