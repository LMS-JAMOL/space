// Proposed response shapes. They are NOT confirmed by the backend yet —
// adjust once Swagger/OpenAPI is available.

export interface Paginated<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
}

export interface Student {
  id: string
  fullName: string
  avatarUrl?: string | null
  group?: string | null
  level: number
  levelProgress: number // 0..100
  coins: number
  points: number
  energy: number
  maxEnergy: number
  streak: number
  isPremium: boolean
}

export interface JourneyStep {
  id: string
  title: string
  status: 'done' | 'current' | 'locked'
}

export interface ScheduleItem {
  id: string
  title: string
  startsAt: string
  type: 'lesson' | 'extra'
  room?: string | null
}

export interface Dashboard {
  student: Student
  journey: JourneyStep[]
  activeCourse: CourseSummary | null
  assignments: { total: number; pending: number; reviewed: number; overdue: number }
  schedule: ScheduleItem[]
  unfinishedLessons: { id: string; courseId: string; title: string; courseTitle: string }[]
  typing: { bestWpm: number | null; lastWpm: number | null; accuracy: number | null }
}

export type CourseStatus = 'active' | 'completed' | 'free'

export interface CourseSummary {
  id: string
  title: string
  code: string
  status: CourseStatus
  progress: number | null
  lessonsTotal: number
  lessonsDone: number
  coverUrl?: string | null
  mentor?: string | null
}

export interface Lesson {
  id: string
  order: number
  title: string
  status: 'done' | 'available' | 'locked'
  durationMin?: number | null
}

export interface CourseDetail extends CourseSummary {
  description?: string | null
  lessons?: Lesson[]
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export interface Payment {
  id: string
  amount: number
  currency: string
  status: PaymentStatus
  provider?: string | null
  createdAt: string
  description?: string | null
}

/** The student's wallet: the paid money that is left (falls with every held lesson), a debt, and a warning. */
export interface Wallet {
  paid: number
  charged: number
  remaining: number
  debt: number
  monthlyTariff: number
  lessonPrice: number
  warning: 'debt' | 'ending' | null
  warningDay: number
}

export interface PaymentInfo {
  amountDue: number | null
  pendingAmount?: number
  wallet?: Wallet | null
  currency: string
  suggestedAmounts: number[]
  providers: string[]
    upcomingPeriods?: { enrollment: string; period: string; groupName: string | null; dueAt: string; expected: number; paid: number; remaining: number }[]
  enrollments?: { enrollment: string; group: string; groupName: string | null; status: 'ACTIVE' | 'INACTIVE' | 'FROZEN' | 'UNKNOWN' }[]
  incompleteEnrollments?: string[]
}

export interface CheckoutResponse {
  paymentId: string
  checkoutUrl: string
}

export interface ShopCategory {
  id: string
  name: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  stock: number
  categoryId: string
  images: string[]
}

export type OrderStatus = 'pending' | 'processing' | 'ready' | 'delivered' | 'cancelled'

export interface Purchase {
  id: string
  productId: string
  productName: string
  productImage?: string | null
  quantity: number
  totalPrice: number
  status: OrderStatus
  createdAt: string
}

export interface Notification {
  id: string
  title: string
  body: string
  createdAt: string
  read: boolean
}
