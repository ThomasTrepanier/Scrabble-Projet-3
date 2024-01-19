export interface ImageSize {
    height?: number;
    width?: number;
}

export const scaleImageSize = ({ height, width }: ImageSize, scale: number) => {
    const size: ImageSize = {};

    if (height !== undefined) size.height = height * scale;
    if (width !== undefined) size.width = width * scale;

    return size;
};
