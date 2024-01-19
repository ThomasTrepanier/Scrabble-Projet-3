import { Component, ContentChildren, HostListener, Input, QueryList } from '@angular/core';
import { SwiperSlideComponent } from '@app/modules/swiper/components/swiper-slide/swiper-slide.component';
import { ARROW_LEFT, ARROW_RIGHT } from '@app/constants/components-constants';

const DEFAULT_ANIMATION_TIME = 300;

@Component({
    selector: 'app-swiper',
    templateUrl: './swiper.component.html',
    styleUrls: ['./swiper.component.scss'],
})
export class SwiperComponent {
    @Input() animationTime: number = DEFAULT_ANIMATION_TIME;
    @Input() showNavigation: boolean = true;
    @Input() navigationPosition: 'top' | 'bottom' = 'bottom';

    @ContentChildren(SwiperSlideComponent) slides: QueryList<SwiperSlideComponent>;
    currentSlide = 0;

    @HostListener('document:keydown', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent): void {
        switch (event.key) {
            case ARROW_LEFT:
                this.previous();
                break;
            case ARROW_RIGHT:
                this.next();
                break;
        }
    }

    get slidesCount() {
        return this.slides.length;
    }

    next() {
        this.currentSlide = Math.min(this.currentSlide + 1, this.slidesCount - 1);
    }

    canNext() {
        return this.currentSlide < this.slidesCount - 1;
    }

    previous() {
        this.currentSlide = Math.max(this.currentSlide - 1, 0);
    }

    canPrevious() {
        return this.currentSlide > 0;
    }

    goToSlide(slide: number) {
        this.currentSlide = Math.max(Math.min(slide, this.slidesCount - 1), 0);
    }
}
