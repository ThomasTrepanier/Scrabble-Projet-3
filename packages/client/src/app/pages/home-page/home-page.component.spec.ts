import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TileComponent } from '@app/components/tile/tile.component';
import { SrcDirective } from '@app/directives/src-directive/src.directive';
import { HomePageComponent } from './home-page.component';

describe('HomePageComponent', () => {
    let component: HomePageComponent;
    let fixture: ComponentFixture<HomePageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [HomePageComponent, TileComponent, SrcDirective],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HomePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
