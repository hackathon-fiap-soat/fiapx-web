import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { AppRoutes } from '../app/AppRoutes';
import { Providers } from '../app/Providers';
import { DEMO_USER } from '../mocks/db';
import { issueToken } from '../mocks/handlers';
import { setToken } from '../shared/tokenStore';

export function testQueryClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 0 } } });
}

/** Mostra a rota atual, para os testes conferirem a navegação. */
function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

/** Renderiza o app inteiro (rotas reais) começando em `path`. */
export function renderApp(path: string, { loggedIn = false }: { loggedIn?: boolean } = {}) {
  if (loggedIn) setToken(issueToken(DEMO_USER).access_token);
  const user = userEvent.setup();
  const utils = render(
    <MemoryRouter initialEntries={[path]}>
      <Providers client={testQueryClient()}>
        <AppRoutes />
        <Routes>
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </Providers>
    </MemoryRouter>,
  );
  return { user, ...utils };
}

export function renderWithRouter(ui: ReactElement, path = '/') {
  return render(<MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>);
}
