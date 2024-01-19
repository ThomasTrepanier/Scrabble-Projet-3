import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UserService } from '@app/services/user-service/user.service';
import { UserSearchQueryResult } from '@common/models/user-search';
import { merge, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-search-page',
    templateUrl: './search-page.component.html',
    styleUrls: ['./search-page.component.scss'],
})
export class SearchPageComponent {
    searchField: FormControl;
    results: Observable<UserSearchQueryResult>;
    hasResults: Observable<boolean>;
    searchValue: Observable<string>;

    constructor(private readonly userService: UserService) {
        this.searchField = new FormControl('');
        this.results = this.userService.searchUsers(this.searchField.valueChanges.pipe(map((value) => `${value}`)));
        this.hasResults = merge(of(false), this.results.pipe(map(({ results }) => results && results.length > 0)));
        this.searchValue = merge(of(''), this.results.pipe(map(({ query }) => query)));
    }
}
