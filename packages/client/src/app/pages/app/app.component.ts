import { Component, OnDestroy } from '@angular/core';
import { InitializeState } from '@app/classes/connection-state-service/connection-state';
import { InitializerService } from '@app/services/initializer-service/initializer.service';
import { SoundService } from '@app/services/sound-service/sound.service';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    providers: [SoundService],
})
export class AppComponent implements OnDestroy {
    states: typeof InitializeState = InitializeState;
    state: Observable<InitializeState>;
    message: Observable<string | undefined>;
    private componentDestroyed$: Subject<boolean> = new Subject();

    constructor(private readonly initializer: InitializerService) {
        this.state = this.initializer.state.pipe(map(({ state }) => state));
        this.message = this.initializer.state.pipe(map(({ message }) => message));
    }

    ngOnDestroy(): void {
        this.componentDestroyed$.next(true);
        this.componentDestroyed$.complete();
    }
}
