import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { TileComponent } from '@app/components/tile/tile.component';

import { LoadingPageComponent } from './loading-page.component';

describe('LoadingPageComponent', () => {
    let component: LoadingPageComponent;
    let fixture: ComponentFixture<LoadingPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatCardModule],
            declarations: [LoadingPageComponent, TileComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LoadingPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
