import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwiperNavigationComponent } from './swiper-navigation.component';

describe('SwiperNavigationComponent', () => {
    let component: SwiperNavigationComponent;
    let fixture: ComponentFixture<SwiperNavigationComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SwiperNavigationComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SwiperNavigationComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
