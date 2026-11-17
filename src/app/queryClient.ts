import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '../shared/httpClient';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2000,
        refetchOnWindowFocus: true,
        // Erros de cliente (401, 403, 404, 422) não melhoram com nova tentativa.
        retry: (count, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 2,
      },
    },
  });
}
