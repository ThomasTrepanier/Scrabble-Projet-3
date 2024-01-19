import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ROUTE_HOME } from '@app/constants/routes-constants';
import { UserService } from '@app/services/user-service/user.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class PublicRouteGuard implements CanActivate {
    constructor(private readonly userService: UserService, private readonly router: Router) {}

    canActivate(): Observable<boolean> {
        return this.userService.isConnected().pipe(
            map((isConnected) => {
                if (!isConnected) return true;
                this.router.navigate([ROUTE_HOME]);
                return false;
            }),
        );
    }
}
