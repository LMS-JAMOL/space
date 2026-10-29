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

export type WorkStatus = 'not_submitted' | 'submitted' | 'in_review' | 'accepted' | 'rejected'

export interface Attachment {
  id: string
  name: string
  url: string
  sizeBytes?: number | null
}

export interface Work {
  id: string
  title: string
  kind: 'portfolio' | 'plan' | 'assignment'
  courseTitle?: string | null
  status: WorkStatus
  deadline?: string | null
  submittedAt?: string | null
  mentorFeedback?: string | null
  score?: number | null
  attachments: Attachment[]
}

export interface Submission {
  id: string
  createdAt: string
  status: WorkStatus
  comment?: string | null
  feedback?: string | null
  attachments: Attachment[]
}

export interface BattleProfile {
  playerId: string
  nickname: string
  avatarUrl?: string | null
  rating: number
  wins: number
  losses: number
  streak: number
  achievements: { id: string; title: string; icon?: string | null; earnedAt: string }[]
}

export interface BattleOpponent {
  id: string
  nickname: string
  rating: number
  online: boolean
}

export type MatchStatus = 'searching' | 'matched' | 'in_progress' | 'finished' | 'cancelled'

export interface BattleMatch {
  id: string
  status: MatchStatus
  language?: string | null
  difficulty?: string | null
  opponent?: BattleOpponent | null
  result?: 'win' | 'loss' | 'draw' | null
  ratingDelta?: number | null
  createdAt: string
}

export interface LeaderboardEntry {
  rank: number
  playerId: string
  nickname: string
  rating: number
}

export interface Hackathon {
  id: string
  title: string
  description: string
  status: 'upcoming' | 'registration' | 'running' | 'judging' | 'finished'
  startsAt: string
  endsAt: string
  submissionDeadline: string
  topics: string[]
  maxTeamSize: number
  myTeamId?: string | null
}

export interface HackathonTeam {
  id: string
  name: string
  topic?: string | null
  members: { id: string; fullName: string; role?: string | null }[]
  isOpen: boolean
}

export interface HackathonSubmission {
  id: string
  teamId: string
  teamName: string
  projectTitle: string
  repoUrl?: string | null
  demoUrl?: string | null
  status: 'draft' | 'submitted' | 'accepted' | 'rejected'
  submittedAt?: string | null
}

export interface HackathonResult {
  rank: number
  teamId: string
  teamName: string
  score: number
}

export interface Certificate {
  id: string
  title: string
  url: string
}

export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content?: string
  coverUrl?: string | null
  category?: string | null
  author?: string | null
  publishedAt: string
  readMinutes?: number | null
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

export interface PaymentInfo {
  amountDue: number | null
  currency: string
  suggestedAmounts: number[]
  providers: string[]
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

export interface AlgoTask {
  id: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  solved: boolean
  attempts: number
}

export interface EdverseItem {
  id: string
  title: string
  description: string
  url?: string | null
}
