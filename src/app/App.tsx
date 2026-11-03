import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Compass } from 'lucide-react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { LoginPage } from '../pages/auth/LoginPage'
import { Button, EmptyState } from '../components/ui'
import { useLanguage } from '../context/LanguageContext'
import { ApiError } from '../services/apiClient'
import { CourseDetailPage, CoursesPage } from '../pages/courses/CoursesPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import PaymentPage from '../pages/payments/PaymentPage'
import { OrdersPage, ProductRedirect, ShopPage } from '../pages/shop/ShopPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (count, e) => !(e instanceof ApiError && e.status >= 400 && e.status < 500) && count < 2,
    },
    mutations: { retry: false },
  },
})

function NotFound() {
  const { tr } = useLanguage()
  return <EmptyState title={tr('Sahifa topilmadi')} icon={<Compass />} action={<Link to="/main-page"><Button>{tr('Asosiyga')}</Button></Link>} />
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Auth screen sits outside the shell: the shell renders the profile. */}
          <Route path="/login" element={<LoginPage />} />

          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/main-page" replace />} />
            <Route path="main-page" element={<DashboardPage />} />
            <Route path="my-courses" element={<CoursesPage />} />
            <Route path="my-courses/:courseId" element={<CourseDetailPage />} />
            <Route path="online-payment" element={<PaymentPage />} />
            <Route path="space-shop" element={<ShopPage />} />
            <Route path="space-shop/orders" element={<OrdersPage />} />
            <Route path="space-shop/products/:productId" element={<ProductRedirect />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
