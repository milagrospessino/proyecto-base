/* Estado de layout para imitar tu cálculo dinámico de límites por imagen */
export type LayoutState = {
    altoHoja: number;          // alto total “utilizable” (px)
    anchoHoja: number;         // ancho total “utilizable” (px)
    margen: number;            // margen lateral (px)
    pieDePagina: number;       // alto reservado para pie (px)
    coordenadaYActual: number; // “cursor vertical” usado hasta ahora (px)
    espacioEntreImagenes: number; // separación luego de cada imagen (px)
};


export function createDefaultLayout(): LayoutState {
    return {
        altoHoja: 842,            // ~A4 alto en px aprox
        anchoHoja: 595,           // ~A4 ancho en px aprox
        margen: 72,
        pieDePagina: 72,
        coordenadaYActual: 0,
        espacioEntreImagenes: 16,
    };
}

/* Devuelve límites dinámicos  (alto disponible, ancho disponible) */
export function getMaximosParaImagen(layout: LayoutState): { altoMaximo: number; anchoMaximo: number } {
    const altoMaximo = Math.max(
        1,
        layout.altoHoja - layout.pieDePagina - layout.coordenadaYActual
    );
    const anchoMaximo = Math.max(1, layout.anchoHoja - 2 * layout.margen);
    return { altoMaximo, anchoMaximo };
}

/* Avanza el “cursor” vertical después de insertar una imagen */
export function advanceAfterImage(layout: LayoutState, altoImagen: number): void {
    layout.coordenadaYActual += altoImagen + layout.espacioEntreImagenes;
}
