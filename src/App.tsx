import { useMemo } from 'react';
import { PublicBooking } from './pages/PublicBooking';
import { Staff } from './pages/Staff';

function useRoute() {
  return useMemo(() => new URLSearchParams(window.location.search).get('view') ?? 'public', []);
}

export default function App() {
  const route = useRoute();

  return (
    <main className="container">
      <nav className="tabs">
        <a className={route === 'public' ? 'active' : ''} href="?view=public">Reservas</a>
        <a className={route === 'staff' ? 'active' : ''} href="?view=staff">Staff</a>
      </nav>
      {route === 'staff' ? <Staff /> : <PublicBooking />}
    </main>
  );
}
