/* eslint-disable @typescript-eslint/no-magic-numbers */
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IconComponent } from '@app/components/icon/icon.component';
import { SrcDirective } from '@app/directives/src-directive/src.directive';
import { AppMaterialModule } from '@app/modules/material.module';
import { GroupsPageComponent } from '@app/pages/groups-page/groups-page.component';
import { GameVisibility } from '@common/models/game-visibility';
import { Group } from '@common/models/group';
import { VirtualPlayerLevel } from '@common/models/virtual-player-level';
import { GroupInfoDetailedComponent } from './group-info-detailed.component';

@Component({
    template: '',
})
export class TestComponent {}

const USER1 = { username: 'user1', email: 'email1', avatar: 'avatar1' };
const TEST_GROUP: Group = {
    maxRoundTime: 1,
    groupId: 'idgroup',
    user1: USER1,
    virtualPlayerLevel: VirtualPlayerLevel.Beginner,
    gameVisibility: GameVisibility.Private,
    password: '',
    numberOfObservers: 0,
};

describe('GroupInfoComponent', () => {
    let component: GroupInfoDetailedComponent;
    let fixture: ComponentFixture<GroupInfoDetailedComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                MatIconModule,
                MatButtonModule,
                MatTooltipModule,
                ReactiveFormsModule,
                CommonModule,
                MatInputModule,
                BrowserAnimationsModule,
                AppMaterialModule,
                MatFormFieldModule,
                FormsModule,
                HttpClientTestingModule,
                RouterTestingModule.withRoutes([
                    { path: 'game-creation', component: TestComponent },
                    { path: 'groups', component: GroupsPageComponent },
                ]),
            ],
            declarations: [GroupInfoDetailedComponent, IconComponent, SrcDirective],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GroupInfoDetailedComponent);
        component = fixture.componentInstance;
        component.group = TEST_GROUP;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
