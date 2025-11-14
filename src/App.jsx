import { AppRoutes } from './AppRoutes';
import { Footer } from './components/footer/footer';
import { Header } from './components/header/header';
import { AuthProvider } from './components/auth/authProvider';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-center"
        richColors
        duration={3000}
        toastOptions={{
          style: {
            borderRadius: '8px',
          },
        }}
      />
      <Header />
      <main className="min-h-screen">
        <AppRoutes />
      </main>
      <Footer />
    </AuthProvider>
  );
};
