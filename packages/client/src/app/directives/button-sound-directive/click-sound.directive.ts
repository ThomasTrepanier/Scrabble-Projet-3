import { Directive, HostListener, Inject } from '@angular/core';
import { SoundName, SoundService } from '@app/services/sound-service/sound.service';

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'button',
})
export class ClickSoundDirective {
    constructor(@Inject(SoundService) private soundService: SoundService) {}

    @HostListener('click') onClick(): void {
        this.soundService.playSound(SoundName.ClickSound);
    }
}
