import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpenCheck, CheckCircle2, ChevronRight, CircleDashed, RotateCcw, Send, Target, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Badge, Button, Card, CardHeader, EmptyState, ErrorState, InlineAlert, PageHeader, Progress, Select, Skeleton, cn, inputCls } from '../../components/ui'
import { useLanguage } from '../../context/LanguageContext'
import { errorMessage } from '../../services/apiClient'
import { quizAttemptId, quizService, type QuizAnswer, type QuizQuestion } from '../../services/quizService'
import { fill } from '../../utils/format'

type ActiveAttempt = Awaited<ReturnType<typeof quizService.start>>

export default function QuizPage() {
  const { tr } = useLanguage()
  const qc = useQueryClient()
  const [quizId, setQuizId] = useState<string | null>(null)
  const [active, setActive] = useState<ActiveAttempt | null>(null)
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({})
  const [resultId, setResultId] = useState<string | null>(null)
  const quizzes = useQuery({ queryKey: ['student-quizzes'], queryFn: quizService.list })
  const attempts = useQuery({ queryKey: ['quiz-attempts', quizId], queryFn: () => quizService.attempts(quizId!), enabled: Boolean(quizId) })
  const result = useQuery({ queryKey: ['quiz-result', resultId], queryFn: () => quizService.result(resultId!), enabled: Boolean(resultId) })
  const start = useMutation({ mutationFn: quizService.start, onSuccess: (data) => { setActive(data); setAnswers({}); setResultId(null); qc.invalidateQueries({ queryKey: ['quiz-attempts', quizId] }) } })
  const resume = useMutation({ mutationFn: quizService.resume, onSuccess: (data) => { setActive(data); setAnswers({}); setResultId(null) } })
  const submit = useMutation({ mutationFn: () => quizService.submit(quizAttemptId(active!.attempt), Object.values(answers)),
    onSuccess: (data) => { setResultId(quizAttemptId(data.attempt)); setActive(null); qc.invalidateQueries({ queryKey: ['quiz-attempts', quizId] }) } })
  const current = quizzes.data?.find((quiz) => quiz._id === quizId)
  const error = start.error || resume.error || submit.error
  const total = active?.version.questions.length ?? 0
  const answered = Object.keys(answers).length

  return <div className="space-y-6">
    <PageHeader title={tr('Quizlar')} subtitle={tr('Savollarga javob bering va backend tekshirgan natijani ko‘ring')} />
    <InlineAlert tone="info">{fill(tr('O‘tish chegarasi {n}%. Natijada umumiy foiz va har bir savol bo‘yicha javob ko‘rsatiladi.'), { n: 60 })}</InlineAlert>

    {quizzes.isLoading ? <div className="grid gap-3 sm:grid-cols-2" role="status" aria-label={tr('Yuklanmoqda')}><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" /></div>
      : quizzes.error ? <ErrorState error={quizzes.error} onRetry={quizzes.refetch} />
      : !quizzes.data?.length ? <EmptyState title={tr('Hozircha quiz yo‘q')} icon={<BookOpenCheck />}
          text={tr('Quizlarni mentoringiz guruhingizga biriktiradi. Biriktirilgach, ular shu yerda paydo bo‘ladi.')} /> :
        <ul className="grid gap-3 sm:grid-cols-2">{quizzes.data.map((quiz) => {
          const selected = quizId === quiz._id
          return <li key={quiz._id}><button type="button" aria-pressed={selected}
            onClick={() => { setQuizId(quiz._id); setActive(null); setResultId(null); setAnswers({}) }}
            className={cn('group flex h-full w-full items-center gap-3 rounded-2xl border bg-white p-4 text-left shadow-card transition duration-150 hover:border-mars-300 hover:shadow-lift',
              selected ? 'border-mars-500 ring-2 ring-mars-100' : 'border-line')}>
            <span className={cn('grid size-11 shrink-0 place-items-center rounded-xl transition-colors duration-150', selected ? 'bg-mars-600 text-white' : 'bg-mars-50 text-mars-600')} aria-hidden="true"><BookOpenCheck className="size-5" /></span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold leading-snug">{quiz.title}</span>
              {(quiz.course?.name || quiz.description) && <span className="mt-0.5 block truncate text-sm text-muted">{quiz.course?.name || quiz.description}</span>}
            </span>
            <ChevronRight className={cn('size-5 shrink-0 text-muted transition-transform duration-150 group-hover:translate-x-0.5', selected && 'text-mars-600')} aria-hidden="true" />
          </button></li>
        })}</ul>}

    {quizId && <Card className="p-5 sm:p-6">
      <CardHeader icon={<Target />} title={current?.title} description={`${tr('O‘tish chegarasi')}: 60%`}
        action={!active ? <Button onClick={() => start.mutate(quizId)} loading={start.isPending}>{tr('Yangi urinish')}</Button> : undefined} />
      {attempts.isLoading ? <Skeleton className="h-14" /> : attempts.error ? <ErrorState compact error={attempts.error} onRetry={attempts.refetch} /> :
        Boolean(attempts.data?.length) && <div><h3 className="mb-2 text-sm font-semibold text-muted">{tr('Urinishlar')}</h3>
          <ul className="space-y-2">{attempts.data?.map((attempt) => {
            const pct = attempt.percentage ?? attempt.scorePercent ?? 0
            const inProgress = attempt.status === 'in_progress'
            return <li key={quizAttemptId(attempt)} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line px-3 py-2 text-sm">
              <span className="flex items-center gap-2"><span className="font-semibold tabular-nums">#{attempt.attemptNumber}</span>
                {inProgress ? <Badge tone="blue">{tr('Davom etmoqda')}</Badge>
                  : <Badge tone={attempt.passed === true ? 'green' : attempt.passed === false ? 'red' : 'gray'} className="tabular-nums">{pct}%</Badge>}
              </span>
              <Button size="sm" variant="ghost" className="text-mars-700" onClick={() => inProgress ? resume.mutate(quizAttemptId(attempt)) : setResultId(quizAttemptId(attempt))}>
                {inProgress ? tr('Davom ettirish') : tr('Natijani ko‘rish')}<ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            </li>
          })}</ul></div>}
      {error && <InlineAlert tone="danger" role="alert" className="mt-4">{errorMessage(error)}</InlineAlert>}
    </Card>}

    {active && <Card className="overflow-hidden">
      <div className="sticky top-16 z-10 border-b border-line bg-white/95 px-5 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold">{tr('Urinish')} #{active.attempt.attemptNumber}</h2>
          <span className="text-sm font-semibold tabular-nums text-muted">{fill(tr('{done} / {total} javob berildi'), { done: answered, total })}</span>
        </div>
        <Progress value={total ? (answered / total) * 100 : 0} className="mt-2" label={tr('Javob berilgan savollar')} />
      </div>
      <div className="space-y-4 p-5 sm:p-6">
        {active.version.questions.map((question, index) => <Question key={question.id} question={question} index={index} total={total}
          answer={answers[question.id]} onChange={(value) => setAnswers((previous) => ({ ...previous, [question.id]: { questionId: question.id, ...value } }))} />)}
        {answered < total && <p className="text-sm text-muted">{fill(tr('{n} ta savolga javob berilmagan'), { n: total - answered })}</p>}
        <Button size="lg" className="w-full sm:w-auto" onClick={() => submit.mutate()} loading={submit.isPending}><Send className="size-4" aria-hidden="true" />{submit.isPending ? tr('Tekshirilmoqda…') : tr('Javoblarni yuborish')}</Button>
      </div>
    </Card>}

    {resultId && (result.isLoading ? <Skeleton className="h-52 rounded-2xl" /> : result.error ? <ErrorState error={result.error} onRetry={result.refetch} /> : result.data &&
      <Card className="overflow-hidden" >
        <div className={cn('flex flex-wrap items-center gap-4 p-5 sm:p-6', result.data.passed ? 'bg-emerald-50/70' : 'bg-red-50/60')} role="status">
          <div className={cn('grid size-20 shrink-0 place-items-center rounded-full bg-white text-2xl font-extrabold tabular-nums ring-4', result.data.passed ? 'text-emerald-700 ring-emerald-200' : 'text-red-700 ring-red-200')}>{result.data.percentage}%</div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {result.data.passed ? <CheckCircle2 className="size-5 text-emerald-700" aria-hidden="true" /> : <XCircle className="size-5 text-red-700" aria-hidden="true" />}
              <p className={cn('font-extrabold', result.data.passed ? 'text-emerald-800' : 'text-red-800')}>{result.data.passed ? tr('Quiz topshirildi') : tr('Chegaraga yetmadi')}</p>
            </div>
            <h2 className="mt-1 font-bold">{result.data.quiz.title}</h2>
            <p className="text-sm text-muted">{tr('Umumiy natija')}: <span className="tabular-nums">{result.data.percentage}%</span> · {tr('O‘tish chegarasi')}: <span className="tabular-nums">{result.data.passingScore}%</span></p>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <ol className="space-y-2">{result.data.questions.map((question, index) => {
            const tone = question.isCorrect === true ? 'border-emerald-200 bg-emerald-50/40' : question.isCorrect === false ? 'border-red-200 bg-red-50/40' : 'border-line'
            return <li key={question.id} className={cn('rounded-xl border p-3 sm:p-4', tone)}>
              <div className="flex items-start justify-between gap-3">
                <span className="font-semibold leading-snug">{index + 1}. {question.text}</span>
                {question.isCorrect === null
                  ? <Badge tone="gray" className="shrink-0"><CircleDashed className="size-3" aria-hidden="true" />{tr('Baholanmagan')}</Badge>
                  : <Badge tone={question.isCorrect ? 'green' : 'red'} className="shrink-0">{question.isCorrect ? <CheckCircle2 className="size-3" aria-hidden="true" /> : <XCircle className="size-3" aria-hidden="true" />}{question.isCorrect ? tr('To‘g‘ri') : tr('Xato')}</Badge>}
              </div>
              <p className="mt-1.5 text-sm text-muted">{tr('Sizning javobingiz')}: <span className="text-ink">{formatAnswer(question.studentAnswerDisplay ?? question.studentAnswer)}</span></p>
              <p className="mt-0.5 text-xs font-semibold text-muted tabular-nums">{fill(tr('{n} ball'), { n: `${question.earnedPoints ?? 0}/${question.maxPoints}` })}</p>
            </li>
          })}</ol>
          <Button variant="secondary" className="mt-5" onClick={() => { setResultId(null); setActive(null) }}><RotateCcw className="size-4" aria-hidden="true" />{tr('Yopish')}</Button>
        </div>
      </Card>)}
  </div>
}

const formatAnswer = (value: unknown) => value == null ? '—' : Array.isArray(value) ? value.join(', ') : String(value)

/** Large, selectable option row; the native input stays for keyboard and screen readers. */
const optionCls = 'flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm transition-colors duration-150 hover:border-mars-300 hover:bg-mars-50/30 has-[:checked]:border-mars-500 has-[:checked]:bg-mars-50 has-[:checked]:font-semibold has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-mars-400'
const controlCls = 'size-[18px] shrink-0 accent-[#c9360b] focus-visible:outline-none'

function Question({ question, index, total, answer, onChange }: { question: QuizQuestion; index: number; total: number; answer?: QuizAnswer;
  onChange: (answer: Partial<QuizAnswer>) => void }) {
  const { tr } = useLanguage()
  return <fieldset className="rounded-2xl border border-line bg-canvas/40 p-4 sm:p-5">
    <legend className="sr-only">{index + 1}. {question.text}</legend>
    <p className="text-xs font-bold uppercase tracking-wide text-mars-700 tabular-nums">{fill(tr('Savol {n} / {total}'), { n: index + 1, total })}{question.type === 'multiple' && ` · ${tr('Bir nechta javob')}`}</p>
    <p className="mt-1 font-bold leading-snug" aria-hidden="true">{question.text}</p>
    {question.codeSnippet?.code && <pre className="mt-3 overflow-x-auto rounded-xl bg-navy-900 p-4 text-sm leading-relaxed text-white"><code>{question.codeSnippet.code}</code></pre>}
    <div className="mt-3 space-y-2">
    {(question.type === 'single' || question.type === 'code_snippet') && (question.options || []).map((option) =>
      <label key={option.id} className={optionCls}><input type="radio" className={controlCls} name={question.id}
        checked={answer?.optionId === option.id} onChange={() => onChange({ optionId: option.id })} /><span>{option.text}</span></label>)}
    {question.type === 'multiple' && (question.options || []).map((option) => <label key={option.id} className={optionCls}>
      <input type="checkbox" className={controlCls} checked={(answer?.optionIds || []).includes(option.id)} onChange={(event) => onChange({ optionIds: event.target.checked
        ? [...(answer?.optionIds || []), option.id] : (answer?.optionIds || []).filter((id) => id !== option.id) })} /><span>{option.text}</span></label>)}
    {question.type === 'true_false' && <Select className="w-full" label={tr('Javob')} placeholder={tr('Tanlang')} value={answer?.value === undefined ? '' : String(answer.value)}
      onChange={(value) => onChange({ value: value === 'true' })} options={[{ value: 'true', label: tr('To‘g‘ri') }, { value: 'false', label: tr('Noto‘g‘ri') }]} />}
    {question.type === 'numeric' && <input type="number" className={inputCls} placeholder={tr('Javob')} aria-label={tr('Javob')}
      value={typeof answer?.value === 'number' ? answer.value : ''} onChange={(event) => onChange({ value: Number(event.target.value) })} />}
    {question.type === 'fill_blank' && (question.blanks || []).map((_, position) => <input key={position} className={inputCls}
      placeholder={`${tr('Javob')} ${position + 1}`} aria-label={`${tr('Javob')} ${position + 1}`} value={answer?.answers?.[position] || ''} onChange={(event) => {
        const values = [...(answer?.answers || [])]; values[position] = event.target.value; onChange({ answers: values })
      }} />)}
    {question.type === 'ordering' && (question.elements || []).map((_, position) => <div key={position} className="flex items-center gap-2 text-sm"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white font-semibold tabular-nums ring-1 ring-line">{position + 1}</span>
      <Select className="min-w-0 flex-1" label={`${position + 1}-${tr('o‘rin')}`} placeholder={tr('Tanlang')} value={answer?.order?.[position] || ''} onChange={(value) => {
        const order = [...(answer?.order || [])]; order[position] = value; onChange({ order })
      }} options={(question.elements || []).map((item) => ({ value: item.id, label: item.text }))} /></div>)}
    {question.type === 'matching' && (question.leftItems || []).map((left) => <div key={left.id} className="grid gap-2 rounded-xl bg-white p-3 text-sm ring-1 ring-line sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-center"><span className="font-medium">{left.text}</span>
      <Select className="w-full" label={left.text} placeholder={tr('Tanlang')} value={answer?.pairs?.find((pair) => pair.leftId === left.id)?.rightId || ''} onChange={(value) => onChange({ pairs: [
        ...(answer?.pairs || []).filter((pair) => pair.leftId !== left.id), { leftId: left.id, rightId: value }] })}
        options={(question.rightItems || []).map((right) => ({ value: right.id, label: right.text }))} /></div>)}
    </div>
  </fieldset>
}
