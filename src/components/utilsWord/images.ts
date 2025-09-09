export type DimensionHW = { alto: number; ancho: number };

export type ImagenOrdenada = {
    data: Uint8Array;                // bytes binarios
    dimension: DimensionHW;          // dimensiones REAJUSTADAS
    original: { alto: number; ancho: number };
};

/* Reajusta manteniendo aspecto dentro de (altoMaximo x anchoMaximo). */
export function reajustarDimensiones(
    altoMaximo: number,
    anchoMaximo: number,
    altoImagen: number,
    anchoImagen: number
): DimensionHW {
    const relacionAspecto = altoImagen / anchoImagen;
    let nuevoAlto = altoMaximo;
    let nuevoAncho = anchoMaximo;

    if (altoImagen > altoMaximo || anchoImagen > anchoMaximo) {
        if (altoImagen / anchoImagen > altoMaximo / anchoMaximo) {
            nuevoAlto = altoMaximo;
            nuevoAncho = altoMaximo / relacionAspecto;
        } else {
            nuevoAncho = anchoMaximo;
            nuevoAlto = anchoMaximo * relacionAspecto;
        }
    } else {
        if (altoImagen < altoMaximo && anchoImagen < anchoMaximo) {
            nuevoAlto = altoImagen;
            nuevoAncho = anchoImagen;
        }
    }

    return {
        alto: Math.max(1, Math.round(nuevoAlto)),
        ancho: Math.max(1, Math.round(nuevoAncho)),
    };
}

/* Comparador por alto ASC → ancho ASC. */
export function comparaImagenesPorAltoAncho(a: ImagenOrdenada, b: ImagenOrdenada): number {
    const da = a.dimension.alto - b.dimension.alto;
    if (da !== 0) return da;
    return a.dimension.ancho - b.dimension.ancho;
}

/* Inserta manteniendo el orden dado por 'comparar'. */
export function insertarOrdenado<T>(
    coleccion: T[],
    aInsertar: T,
    comparar: (a: T, b: T) => number
): T[] {
    let i = 0;
    while (i < coleccion.length && comparar(aInsertar, coleccion[i]) > 0) i++;
    coleccion.splice(i, 0, aInsertar);
    return coleccion;
}

/* Carga bytes y dimensiones reales desde URL. */
export async function loadImageOriginal(url: string): Promise<{ data: Uint8Array; alto: number; ancho: number } | null> {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type?.startsWith('image/')) return null;

    const objectUrl = URL.createObjectURL(blob);
    const { w, h } = await new Promise<{ w: number; h: number }>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const w = img.naturalWidth || 0;
            const h = img.naturalHeight || 0;
            URL.revokeObjectURL(objectUrl);
            resolve({ w, h });
        };
        img.onerror = (e) => {
            URL.revokeObjectURL(objectUrl);
            reject(e);
        };
        img.src = objectUrl;
    }).catch(() => ({ w: 0, h: 0 }));

    if (!w || !h) return null;

    const buf = await blob.arrayBuffer();
    const data = new Uint8Array(buf);
    if (data.byteLength === 0) return null;

    return { data, alto: h, ancho: w };
}
