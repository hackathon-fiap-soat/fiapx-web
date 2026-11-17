import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/** MSW no Node, para os testes do Vitest. */
export const server = setupServer(...handlers);
