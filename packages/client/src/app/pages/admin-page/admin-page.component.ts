// import { Component, OnInit } from '@angular/core';
// import { MatTabChangeEvent } from '@angular/material/tabs';
// import { ActivatedRoute, Router } from '@angular/router';

// enum AdminTabs {
//     GameHistory = 0,
//     Dictionary = 1,
//     VirtualPlayer = 2,
//     HighScores = 3,
// }

// export const DEFAULT_ADMIN_TAB = AdminTabs.GameHistory;

// @Component({
//     selector: 'app-admin-page',
//     templateUrl: './admin-page.component.html',
//     styleUrls: ['./admin-page.component.scss'],
// })
// export class AdminPageComponent implements OnInit {
//     selectedTab: AdminTabs = DEFAULT_ADMIN_TAB;

//     constructor(private route: ActivatedRoute, private router: Router) {}

//     ngOnInit(): void {
//         this.route.queryParams.subscribe((params) => {
//             const tab: string | undefined = params.tab;

//             if (!tab) return;

//             const tabIndex = Number.parseInt(tab, 10);
//             if (Number.isSafeInteger(tabIndex)) this.selectedTab = tabIndex as AdminTabs;
//         });
//     }

//     selectedTabChange(event: MatTabChangeEvent): void {
//         this.router.navigate([], {
//             relativeTo: this.route,
//             queryParams: {
//                 tab: event.index,
//             },
//             queryParamsHandling: 'merge',
//             skipLocationChange: false,
//         });
//     }
// }
