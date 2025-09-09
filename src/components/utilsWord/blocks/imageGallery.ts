import { AlignmentType, IImageOptions, ImageRun, Paragraph } from 'docx';

function asImageOptions(data: Uint8Array, width: number, height: number): IImageOptions {
    return {
        data: data as unknown as Uint8Array,
        transformation: { width, height },
    } as unknown as IImageOptions;
}

/* Render: imagen por párrafo, centrada, sin tablas. */
export function imageGallery(
    images: { data: Uint8Array; width: number; height: number }[]
): Paragraph[] {
    return images.map(({ data, width, height }) =>
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [new ImageRun(asImageOptions(data, width, height))],
        })
    );
}
