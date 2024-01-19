import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileStatsItemComponent } from './user-profile-stats-item.component';

describe('UserProfileStatsItemComponent', () => {
    let component: UserProfileStatsItemComponent;
    let fixture: ComponentFixture<UserProfileStatsItemComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UserProfileStatsItemComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UserProfileStatsItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
