import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAchievementComponent } from './user-achievement.component';
import { MatDialogModule } from '@angular/material/dialog';
import { Component } from '@angular/core';
import { UserAchievement } from '@common/models/achievement';

@Component({
    template: '<app-user-achievement [achievement]="achievement"></app-user-achievement>',
})
class TestUserAchievementComponent {
    achievement: UserAchievement = {
        achievement: {
            name: 'a',
            description: 'a',
            defaultImage: '',
            zeroValue: 0,
            levels: [
                {
                    value: 1,
                    image: '',
                },
            ],
        },
        value: 0,
        level: undefined,
        levelIndex: undefined,
    };
}

describe('UserAchievementComponent', () => {
    let component: TestUserAchievementComponent;
    let fixture: ComponentFixture<TestUserAchievementComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UserAchievementComponent, TestUserAchievementComponent],
            imports: [MatDialogModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestUserAchievementComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
