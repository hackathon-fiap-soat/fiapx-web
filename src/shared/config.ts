/** Base das chamadas à API (mesma origem do site, ADR-019). */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/+$/, '');

/** Modo mock (MSW) ligado. */
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';
