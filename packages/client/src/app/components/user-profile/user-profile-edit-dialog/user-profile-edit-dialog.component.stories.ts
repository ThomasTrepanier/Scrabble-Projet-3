import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { UserProfileEditDialogComponent } from '@app/components/user-profile/user-profile-edit-dialog/user-profile-edit-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SrcDirective } from '@app/directives/src-directive/src.directive';
import { IconComponent } from '@app/components/icon/icon.component';
import { MatInputModule } from '@angular/material/input';
import { AvatarSelectorComponent } from '@app/components/user-profile/avatar-selector/avatar-selector.component';
import { UcWidgetModule } from 'ngx-uploadcare-widget';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export default {
    title: 'User/Profile/Edit',
    component: UserProfileEditDialogComponent,
    decorators: [
        moduleMetadata({
            declarations: [SrcDirective, IconComponent, AvatarSelectorComponent],
            imports: [
                HttpClientTestingModule,
                MatSnackBarModule,
                MatCardModule,
                MatButtonModule,
                ReactiveFormsModule,
                FormsModule,
                MatFormFieldModule,
                MatInputModule,
                UcWidgetModule,
                BrowserAnimationsModule,
            ],
            providers: [
                { provide: MatDialogRef, useValue: {} },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        username: 'username',
                        avatar: 'https://ucarecdn.com/7fa9d73f-ffd8-4496-8644-97cb288c3fd8/',
                    },
                },
                Document,
            ],
        }),
    ],
} as Meta;

export const primary: Story<UserProfileEditDialogComponent> = (props: UserProfileEditDialogComponent) => ({ props });
