import { Document, Paragraph } from 'docx';
import {
    buildFooter,
    buildHeader,
    makeareaBox,
    areaHeading,
    noveltyDetail,
    noveltyTitle,
    thinSeparator,
} from './blocks';
import { imageGallery } from './blocks/imageGallery';
import type { SeccionArea, BuildDocInput } from './types';

import {
    loadImageOriginal,
    insertarOrdenado,
} from './images';


async function buildSectionsAsync(
    sections: SeccionArea[],
    pageContentWidthPx: number, // ancho de contenido efectivo (px lógicos docx)
    minImageWidthPx = 0         // opcional: mínimo para evitar thumbnails
): Promise<Paragraph[]> {
    const out: Paragraph[] = [];

    for (const { areaNovedad, items } of sections) {
        out.push(areaHeading(areaNovedad));

        for (const { tituloNovedad, detalleNovedad, imagenesNovedad } of items) {
            out.push(noveltyTitle(tituloNovedad));
            out.push(noveltyDetail(detalleNovedad));

            if (imagenesNovedad && imagenesNovedad.length > 0) {
                type ImgScaled = { data: Uint8Array; width: number; height: number };
                const escaladas: ImgScaled[] = [];

                for (const url of imagenesNovedad) {
                    try {
                        const raw = await loadImageOriginal(url);
                        if (!raw) continue;

                        const relacion = raw.alto / raw.ancho;
                        const anchoMax = Math.max(1, pageContentWidthPx);
                        const anchoNaturalClamped = Math.min(anchoMax, raw.ancho);
                        const altoNaturalClamped = Math.round(anchoNaturalClamped * relacion);


                        const width = Math.max(anchoNaturalClamped, minImageWidthPx || 0);
                        const height = Math.round(width * relacion);


                        insertarOrdenado(
                            escaladas,
                            { data: raw.data, width, height },
                            (a, b) => {
                                const diffAlto = a.height - b.height;
                                return diffAlto !== 0 ? diffAlto : (a.width - b.width);
                            }
                        );
                    } catch {

                    }
                }

                if (escaladas.length > 0) {
                    out.push(...imageGallery(escaladas));
                }
            }

            out.push(thinSeparator());
        }

        // Espacio al final de cada área
        out.push(new Paragraph({ spacing: { after: 200 } }));
    }

    return out;
}

/* Builder principal (async) */
export async function createNovedadesDoc(
    input: BuildDocInput
): Promise<Document> {
    const {
        sectorGeneral,
        novedad,
        confidentialityLabel = 'YPF-Confidencial',
    } = input;


    const PAGE_CONTENT_WIDTH = 500;
    const MIN_IMAGE_WIDTH = 0;

    const sectionChildren = [
        makeareaBox(sectorGeneral),
        ...(await buildSectionsAsync(novedad, PAGE_CONTENT_WIDTH, MIN_IMAGE_WIDTH)),
    ];

    return new Document({
        styles: {
            default: {
                document: {
                    run: { font: 'Calibri' },
                    paragraph: { spacing: { line: 276 } },
                },

            },
        },
        sections: [
            {
                headers: { default: buildHeader(confidentialityLabel) },
                footers: { default: buildFooter(confidentialityLabel) },
                children: sectionChildren,
            },
        ],
    });
}

export default createNovedadesDoc;
