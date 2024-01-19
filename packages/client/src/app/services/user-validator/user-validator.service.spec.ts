// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { TestBed } from '@angular/core/testing';
// import { AuthenticationController } from '@app/controllers/authentication-controller/authentication.controller';
// import { of } from 'rxjs';

// import { UserValidatorService } from './user-validator.service';

// describe('UserValidatorService', () => {
//     let service: UserValidatorService;
//     let authenticationController: jasmine.SpyObj<AuthenticationController>;

//     beforeEach(() => {
//         authenticationController = jasmine.createSpyObj(AuthenticationController, ['validateUsername', 'validateEmail']);
//         TestBed.configureTestingModule({
//             imports: [HttpClientTestingModule],
//             providers: [{ provide: AuthenticationController, useValue: authenticationController }],
//         });
//         service = TestBed.inject(UserValidatorService);
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });

//     describe('validateUsername', () => {
//         for (const isAvailable of [true, false]) {
//             it(`should return ${isAvailable} if is ${isAvailable ? 'valid' : 'not valid'}`, async () => {
//                 authenticationController.validateUsername.and.returnValue(of({ isAvailable }));
//                 const res = await service.validateUsername('').toPromise();
//                 expect(res).toEqual(isAvailable);
//             });
//         }
//     });

//     describe('validateEmail', () => {
//         for (const isAvailable of [true, false]) {
//             it(`should return ${isAvailable} if is ${isAvailable ? 'valid' : 'not valid'}`, async () => {
//                 authenticationController.validateEmail.and.returnValue(of({ isAvailable }));
//                 const res = await service.validateEmail('').toPromise();
//                 expect(res).toEqual(isAvailable);
//             });
//         }
//     });
// });
