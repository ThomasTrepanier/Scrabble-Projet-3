import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-swiper-navigation',
    templateUrl: './swiper-navigation.component.html',
    styleUrls: ['./swiper-navigation.component.scss'],
})
export class SwiperNavigationComponent {
    @Output() previous: EventEmitter<void> = new EventEmitter();
    @Output() next: EventEmitter<void> = new EventEmitter();
    @Output() navigate: EventEmitter<number> = new EventEmitter();
    @Input() canPrevious: boolean;
    @Input() canNext: boolean;
    @Input() count: number;
    @Input() current: number;

    get indexes() {
        return new Array(this.count).fill(0).map((_, i) => i);
    }
}
