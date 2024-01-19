import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class DatabaseService {
    constructor(private readonly http: HttpClient) {}

    ping(): Observable<void> {
        return this.http.get(`${environment.serverUrl}/database/is-connected`).pipe(
            map(() => {
                /* map to void because we don't want a return type. Its either a response or an error. */
            }),
        );
    }
}
