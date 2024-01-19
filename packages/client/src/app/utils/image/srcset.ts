import { ImageSize } from './image-size';
import { ImageFormat, imageFormat, imageProgressive, imageResize, imageTransform, ImageTransformation } from './transformation';

export const generateSrcset = (src: string, size: ImageSize, ...transformations: ImageTransformation[]) => {
    return src.startsWith('https://ucarecdn.com/')
        ? `
            ${imageTransform(src, ...transformations, imageResize(size), imageProgressive(), imageFormat(ImageFormat.Auto))} 1x,
            ${imageTransform(src, ...transformations, imageResize(size, 2), imageProgressive(), imageFormat(ImageFormat.Auto))} 2x,
        `
        : src;
};
