import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { authenticationSettings } from '@app/utils/settings';
import { Observable } from 'rxjs';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const token = authenticationSettings.getToken();

        return next.handle(
            token
                ? req.clone({
                      headers: new HttpHeaders({
                          authorization: `Bearer ${token}`,
                      }),
                  })
                : req,
        );
    }
}
