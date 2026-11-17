import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './AppRoutes';
import { Providers } from './Providers';

export function App() {
  return (
    <BrowserRouter>
      <Providers>
        <AppRoutes />
      </Providers>
    </BrowserRouter>
  );
}
