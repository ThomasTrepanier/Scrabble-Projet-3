import { ImageSize, scaleImageSize } from './image-size';

export type ImageTransformation = (src: string) => string;

export enum ImageFormat {
    Jpeg = 'jpeg',
    Png = 'png',
    Webp = 'webp',
    Auto = 'auto',
}

const isUploadcare = (src: string) => src.startsWith('https://ucarecdn.com/');

export const imageTransform = (src: string, ...transformations: ImageTransformation[]) => {
    return isUploadcare(src) ? transformations.reduce((result, transformation) => (result = transformation(result)), src) : src;
};

export const imageResize =
    (size: ImageSize, scale: number = 1): ImageTransformation =>
    (src: string) => {
        const { height: h, width: w } = scaleImageSize(size, scale);
        return h !== undefined || w !== undefined ? src + `-/resize/${w && w > 0 ? w : ''}x${h && h > 0 ? h : ''}/` : src;
    };

export const imageCompress =
    (isRetina: boolean = false): ImageTransformation =>
    (src: string) =>
        src + `-/quality/${isRetina ? 'lighter' : 'smart'}/`;

export const imageProgressive = (): ImageTransformation => (src: string) => src + '-/progressive/yes/';

export const imageFormat =
    (format: ImageFormat): ImageTransformation =>
    (src: string) =>
        src + `-/format/${format}/`;
