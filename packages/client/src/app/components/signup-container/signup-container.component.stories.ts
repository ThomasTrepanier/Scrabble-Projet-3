import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppMaterialModule } from '@app/modules/material.module';
import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { IconComponent } from '@app/components/icon/icon.component';
import { SignupContainerComponent } from './signup-container.component';
import { SrcDirective } from '@app/directives/src-directive/src.directive';
import { UcWidgetModule } from 'ngx-uploadcare-widget';

export default {
    title: 'Signup/Container',
    component: SignupContainerComponent,
    decorators: [
        moduleMetadata({
            declarations: [IconComponent, SrcDirective],
            imports: [ReactiveFormsModule, AppMaterialModule, FormsModule, BrowserAnimationsModule, UcWidgetModule],
            providers: [FormBuilder],
        }),
    ],
} as Meta;

const template: Story<SignupContainerComponent> = (args: SignupContainerComponent) => ({
    props: args,
});

export const primary = template.bind({});
