import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ROUTE_LOGIN, ROUTE_PROFILE } from '@app/constants/routes-constants';
import { AuthenticationService } from '@app/services/authentication-service/authentication.service';
import { ColorThemeService } from '@app/services/color-theme-service/color-theme.service';
import { UserService } from '@app/services/user-service/user.service';
import { PublicUser } from '@common/models/user';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SoundSettingsDialogComponent } from '@app/components/sound-settings-dialog/sound-settings-dialog';

@Component({
    selector: 'app-page-header',
    templateUrl: './page-header.component.html',
    styleUrls: ['./page-header.component.scss'],
})
export class PageHeaderComponent {
    @Input() hideBackButton: boolean = false;
    @Input() title: string;
    @Input() button: string = '';
    @Input() buttonRoute: string = '/';
    user: Observable<PublicUser | undefined>;
    logo: Observable<string | undefined>;

    constructor(
        private readonly userService: UserService,
        private readonly authenticationService: AuthenticationService,
        private readonly colorThemeService: ColorThemeService,
        private readonly router: Router,
        public dialog: MatDialog,
    ) {
        this.user = this.userService.user;
        this.logo = this.colorThemeService.getLogoTheme();
    }

    signOut(): void {
        this.authenticationService.signOut();
        this.router.navigate([ROUTE_LOGIN]);
    }

    navigateToProfile(): void {
        this.router.navigate([ROUTE_PROFILE]);
    }

    openSoundSettings(): void {
        this.dialog.open<SoundSettingsDialogComponent>(SoundSettingsDialogComponent, {});
    }

    getUsername(): Observable<string | undefined> {
        return this.userService.user.pipe(map((u) => u?.username));
    }

    getAvatar(): Observable<string | undefined> {
        return this.userService.user.pipe(map((u) => u?.avatar));
    }
}
