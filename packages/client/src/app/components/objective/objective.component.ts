// import { Component, Input } from '@angular/core';
// import { ObjectiveData } from '@app/classes/communication/objective-data';
// import { ObjectiveState } from '@app/classes/objectives/objective-state';
// import { OPPONENT_COMPLETED_THIS_OBJECTIVE, PERCENT, YOU_COMPLETED_THIS_OBJECTIVE } from '@app/constants/components-constants';

// @Component({
//     selector: 'app-objective',
//     templateUrl: './objective.component.html',
//     styleUrls: ['./objective.component.scss'],
// })
// export class ObjectiveComponent {
//     @Input() objective: ObjectiveData;

//     getProgress(): number {
//         return (this.objective.progress / this.objective.maxProgress) * PERCENT;
//     }

//     getStateMessage(): string {
//         switch (this.objective.state) {
//             case ObjectiveState.Completed:
//                 return YOU_COMPLETED_THIS_OBJECTIVE;
//             case ObjectiveState.CompletedByOpponent:
//                 return OPPONENT_COMPLETED_THIS_OBJECTIVE(this.objective.isPublic);
//             default:
//                 return '';
//         }
//     }
// }
