import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAchievementDialogComponent } from './user-achievement-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserAchievement } from '@common/models/achievement';

const achievement: UserAchievement = {
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

describe('UserAchievementDialogComponent', () => {
    let component: UserAchievementDialogComponent;
    let fixture: ComponentFixture<UserAchievementDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [UserAchievementDialogComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: achievement },
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                { provide: MatDialogRef, useValue: { close: () => {} } },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(UserAchievementDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
