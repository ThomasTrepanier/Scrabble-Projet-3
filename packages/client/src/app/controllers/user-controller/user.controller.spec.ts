import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { UserController } from './user.controller';

describe('UserController', () => {
    let service: UserController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(UserController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
