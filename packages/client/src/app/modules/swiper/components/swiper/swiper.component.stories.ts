import { Meta, moduleMetadata, Story } from '@storybook/angular';
import { SwiperComponent } from '@app/modules/swiper/components/swiper/swiper.component';
import { SwiperSlideComponent } from '@app/modules/swiper/components/swiper-slide/swiper-slide.component';
import { IconComponent } from '@app/components/icon/icon.component';
import { SwiperNavigationComponent } from '@app/modules/swiper/components/swiper-navigation/swiper-navigation.component';

export default {
    title: 'Swiper/Swiper',
    component: SwiperComponent,
    decorators: [
        moduleMetadata({
            declarations: [SwiperComponent, SwiperSlideComponent, SwiperNavigationComponent, IconComponent],
        }),
    ],
} as Meta;

export const primary: Story<SwiperComponent> = (props: SwiperComponent) => ({
    props,
    template: `
        <app-swiper>
            <app-swiper-slide>1</app-swiper-slide>
            <app-swiper-slide>2</app-swiper-slide>
            <app-swiper-slide>3</app-swiper-slide>
            <app-swiper-slide>4</app-swiper-slide>
            <app-swiper-slide>5</app-swiper-slide>
        </app-swiper>
    `,
});
