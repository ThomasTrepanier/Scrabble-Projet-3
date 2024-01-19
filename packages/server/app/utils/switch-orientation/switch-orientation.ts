import { Orientation } from '@app/classes/board';

export const switchOrientation = (orientation: Orientation) =>
    orientation === Orientation.Horizontal ? Orientation.Vertical : Orientation.Horizontal;
