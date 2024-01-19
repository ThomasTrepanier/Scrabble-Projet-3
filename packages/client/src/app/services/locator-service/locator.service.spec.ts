/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { LocatorService } from './locator.service';

describe('LocatorService', () => {
    let service: LocatorService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, MatSnackBarModule, MatDialogModule],
        });
        service = TestBed.inject(LocatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
