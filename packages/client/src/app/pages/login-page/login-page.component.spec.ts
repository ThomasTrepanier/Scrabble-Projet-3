import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { HeaderBtnComponent } from '@app/components/header-btn/header-btn.component';
import { TileComponent } from '@app/components/tile/tile.component';
import { LoginWrapperComponent } from '@app/wrappers/login-wrapper/login-wrapper.component';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
    let component: LoginPageComponent;
    let fixture: ComponentFixture<LoginPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MatSnackBarModule, RouterTestingModule, MatDialogModule],
            declarations: [LoginPageComponent, TileComponent, HeaderBtnComponent, LoginWrapperComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LoginPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
