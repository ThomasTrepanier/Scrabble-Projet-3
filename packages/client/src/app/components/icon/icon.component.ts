import { Component, Input, OnInit } from '@angular/core';
import { IconAnimation, IconName, IconPrefix, IconRotation, IconSize, IconStyle } from './icon.component.type';

@Component({
    selector: 'app-icon',
    templateUrl: './icon.component.html',
})
export class IconComponent implements OnInit {
    @Input() icon: IconName;
    @Input() styling?: IconStyle;
    @Input() animation?: IconAnimation;
    @Input() size?: IconSize;
    @Input() rotation?: IconRotation;

    className: string;

    ngOnInit(): void {
        this.setClassName();
    }

    getPrefix(style?: IconStyle): IconPrefix {
        switch (style) {
            case 'light':
                return 'fal';
            case 'solid':
                return 'fas';
            case 'duotone':
                return 'fad';
            default:
                return 'far';
        }
    }

    private setClassName(): void {
        const prefix: IconPrefix = this.getPrefix(this.styling);

        this.className = `${prefix} fa-${this.icon}`;

        if (this.animation) this.className += ` fa-${this.animation}`;
        if (this.size) this.className += ` fa-${this.size}`;
        if (this.rotation) this.className += ` fa-${this.rotation}`;
    }
}
