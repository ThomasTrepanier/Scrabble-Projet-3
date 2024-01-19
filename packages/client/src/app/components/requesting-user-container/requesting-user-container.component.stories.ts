import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from '@app/modules/material.module';
import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { IconComponent } from '@app/components/icon/icon.component';
import { RequestingUserContainerComponent } from './requesting-user-container.component';

export default {
    title: 'requestingUser/Container',
    component: RequestingUserContainerComponent,
    decorators: [
        moduleMetadata({
            declarations: [IconComponent],
            imports: [ReactiveFormsModule, AppMaterialModule, FormsModule, BrowserAnimationsModule],
            providers: [FormBuilder],
        }),
    ],
} as Meta;

const template: Story<RequestingUserContainerComponent> = (args: RequestingUserContainerComponent) => ({
    props: args,
});

export const primary = template.bind({});
