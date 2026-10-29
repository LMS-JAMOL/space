import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Compass } from 'lucide-react'
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { Button, EmptyState } from '../components/ui'
import { ApiError } from '../services/apiClient'
import { AlgoPage, EdversePage } from '../pages/algo/AlgoEdversePages'
import BattlePage from '../pages/battle/BattlePage'
import { BlogPage, BlogPostPage } from '../pages/blog/BlogPage'
import { CourseDetailPage, CoursesPage } from '../pages/courses/CoursesPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import HackathonPage from '../pages/hackathon/HackathonPage'
import PaymentPage from '../pages/payments/PaymentPage'
import { OrdersPage, ProductRedirect, ShopPage } from '../pages/shop/ShopPage'
import WorksPage from '../pages/works/WorksPage'

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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/main-page" replace />} />
            <Route path="main-page" element={<DashboardPage />} />
            <Route path="my-courses" element={<CoursesPage />} />
            <Route path="my-courses/:courseId" element={<CourseDetailPage />} />
            <Route path="my-works" element={<WorksPage />} />
            <Route path="battle" element={<BattlePage />} />
            <Route path="hackathon" element={<HackathonPage />} />
            <Route path="edverse" element={<EdversePage />} />
            <Route path="algo" element={<AlgoPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="blog/:postId" element={<BlogPostPage />} />
            <Route path="online-payment" element={<PaymentPage />} />
            <Route path="space-shop" element={<ShopPage />} />
            <Route path="space-shop/orders" element={<OrdersPage />} />
            <Route path="space-shop/products/:productId" element={<ProductRedirect />} />
            <Route path="*" element={<EmptyState title="Sahifa topilmadi" icon={<Compass />} action={<Link to="/main-page"><Button>Asosiyga</Button></Link>} />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
