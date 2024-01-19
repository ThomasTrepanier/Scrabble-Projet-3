import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderBtnComponent } from '@app/components/header-btn/header-btn.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { LoginWrapperComponent } from '@app/wrappers/login-wrapper/login-wrapper.component';
import { SignUpPageComponent } from './signup-page.component';

describe('SignInPageComponent', () => {
    let component: SignUpPageComponent;
    let fixture: ComponentFixture<SignUpPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SignUpPageComponent, TileComponent, HeaderBtnComponent, LoginWrapperComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SignUpPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
