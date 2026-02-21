import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './features/auth/AuthContext'
import { router } from './routes/router'
import './index.css'

const queryClient = new QueryClient();

// This inner component connects Auth to the Router
function AppRouter() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3bb273]"></div>
      </div>
    );
  }

  return <RouterProvider router={router} context={{ auth }} />;
}

async function enableMocking() {
 

  const { worker } = await import('./mocks/browser')

  return worker.start({onUnhandledRequest: 'bypass'})
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  )
})
