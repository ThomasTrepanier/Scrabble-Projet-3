import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { SoundService } from '@app/services/sound-service/sound.service';

@Injectable({
    providedIn: 'root',
})
export class LocatorService {
    private previousUrl: string;
    private currentUrl: string;

    constructor(private router: Router, private soundService: SoundService) {
        this.currentUrl = this.router.url;
        router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.previousUrl = this.currentUrl;
                this.currentUrl = event.url;
                this.soundService.changeMusic(this.currentUrl);
            }
        });
    }

    getPreviousUrl() {
        return this.previousUrl;
    }
}
