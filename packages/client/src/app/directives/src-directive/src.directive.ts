import { Directive, ElementRef, Input, OnChanges, OnInit } from '@angular/core';
import { generateSrcset } from '@app/utils/image/srcset';

@Directive({
    selector: '[appSrc]',
})
export class SrcDirective implements OnInit, OnChanges {
    @Input() appSrc?: string;
    @Input() height?: number;
    @Input() width?: number;
    @Input() square?: number;

    constructor(private el: ElementRef) {}

    ngOnInit(): void {
        this.setSrcset();
    }

    ngOnChanges(): void {
        this.setSrcset();
    }

    private setSrcset() {
        this.el.nativeElement.srcset = generateSrcset(
            this.getSrc(),
            this.square !== undefined ? { height: this.square, width: this.square } : { height: this.height, width: this.width },
        );
    }

    private getSrc(): string {
        return this.appSrc && this.appSrc.length > 0 ? this.appSrc : this.el.nativeElement.src;
    }
}
