import { AppRoutes } from './AppRoutes';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';

export default function App() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <AppRoutes />
      </main>
      <Footer />
    </>
  );
};
