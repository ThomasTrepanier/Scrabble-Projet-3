import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { SearchPageComponent } from './search-page.component';

describe('SearchPageComponent', () => {
    let component: SearchPageComponent;
    let fixture: ComponentFixture<SearchPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [SearchPageComponent],
            imports: [HttpClientTestingModule, MatSnackBarModule, MatDialogModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SearchPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
