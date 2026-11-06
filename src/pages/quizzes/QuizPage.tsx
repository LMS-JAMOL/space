import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpenCheck, CheckCircle2, RotateCcw, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Button, Card, EmptyState, ErrorState, PageHeader, Skeleton } from '../../components/ui'
import { useLanguage } from '../../context/LanguageContext'
import { errorMessage } from '../../services/apiClient'
import { quizAttemptId, quizService, type QuizAnswer, type QuizQuestion } from '../../services/quizService'

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

  return <div className="space-y-5">
    <PageHeader title={tr('Quizlar')} subtitle={tr('Savollarga javob bering va backend tekshirgan natijani ko‘ring')} />
    {quizzes.isLoading ? <Skeleton className="h-36" /> : quizzes.error ? <ErrorState error={quizzes.error} onRetry={quizzes.refetch} />
      : !quizzes.data?.length ? <EmptyState title={tr('Hozircha quiz yo‘q')} icon={<BookOpenCheck />} /> :
        <div className="grid gap-3 sm:grid-cols-2">{quizzes.data.map((quiz) => <button type="button" key={quiz._id}
          onClick={() => { setQuizId(quiz._id); setActive(null); setResultId(null); setAnswers({}) }}
          className={`rounded-2xl border bg-white p-4 text-left transition hover:shadow-md ${quizId === quiz._id ? 'border-mars-500 ring-2 ring-mars-100' : 'border-line'}`}>
          <span className="font-bold">{quiz.title}</span>
          <span className="mt-1 block text-sm text-muted">{quiz.course?.name || quiz.description || ''}</span>
        </button>)}</div>}

    {quizId && <Card className="space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-lg font-bold">{current?.title}</h2><p className="text-sm text-muted">{tr('O‘tish chegarasi')}: 60%</p></div>
        {!active && <Button onClick={() => start.mutate(quizId)} disabled={start.isPending}>{tr('Yangi urinish')}</Button>}
      </div>
      {attempts.isLoading ? <Skeleton className="h-16" /> : attempts.error ? <ErrorState error={attempts.error} onRetry={attempts.refetch} /> :
        Boolean(attempts.data?.length) && <div className="space-y-2"><p className="text-sm font-semibold">{tr('Urinishlar')}</p>
          {attempts.data?.map((attempt) => <div key={quizAttemptId(attempt)} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line px-3 py-2 text-sm">
            <span>#{attempt.attemptNumber} · {attempt.status === 'in_progress' ? tr('Davom etmoqda') : `${attempt.percentage ?? attempt.scorePercent ?? 0}%`}</span>
            <button type="button" className="font-semibold text-mars-600 hover:underline" onClick={() => attempt.status === 'in_progress' ? resume.mutate(quizAttemptId(attempt)) : setResultId(quizAttemptId(attempt))}>
              {attempt.status === 'in_progress' ? tr('Davom ettirish') : tr('Natijani ko‘rish')}
            </button>
          </div>)}</div>}
      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{errorMessage(error)}</p>}
    </Card>}

    {active && <Card className="space-y-5 p-5"><div className="flex items-center justify-between gap-2"><h2 className="font-bold">{tr('Urinish')} #{active.attempt.attemptNumber}</h2>
      <span className="text-sm text-muted">{active.version.questions.length} {tr('savol')}</span></div>
      {active.version.questions.map((question, index) => <Question key={question.id} question={question} index={index}
        answer={answers[question.id]} onChange={(value) => setAnswers((previous) => ({ ...previous, [question.id]: { questionId: question.id, ...value } }))} />)}
      <Button onClick={() => submit.mutate()} disabled={submit.isPending}>{submit.isPending ? tr('Tekshirilmoqda…') : tr('Javoblarni yuborish')}</Button>
    </Card>}

    {resultId && (result.isLoading ? <Skeleton className="h-52" /> : result.error ? <ErrorState error={result.error} onRetry={result.refetch} /> : result.data &&
      <Card className="space-y-4 p-5"><div className="flex flex-wrap items-center gap-3">
        {result.data.passed ? <CheckCircle2 className="size-8 text-emerald-600" /> : <XCircle className="size-8 text-red-600" />}
        <div><h2 className="font-bold">{result.data.quiz.title}</h2><p className="text-sm text-muted">{tr('Umumiy natija')}: {result.data.percentage}% · {tr('O‘tish chegarasi')}: {result.data.passingScore}%</p></div>
      </div><ol className="space-y-2">{result.data.questions.map((question, index) => <li key={question.id} className="rounded-xl border border-line p-3">
        <div className="flex justify-between gap-3"><span className="font-medium">{index + 1}. {question.text}</span><span className={question.isCorrect ? 'text-emerald-700' : 'text-red-700'}>{question.isCorrect ? tr('To‘g‘ri') : tr('Xato')}</span></div>
        <p className="mt-1 text-sm text-muted">{tr('Sizning javobingiz')}: {formatAnswer(question.studentAnswerDisplay ?? question.studentAnswer)}</p>
        <p className="text-xs text-muted">{question.earnedPoints ?? 0}/{question.maxPoints}</p>
      </li>)}</ol><Button variant="secondary" onClick={() => { setResultId(null); setActive(null) }}><RotateCcw className="size-4" />{tr('Yopish')}</Button></Card>)}
  </div>
}

const formatAnswer = (value: unknown) => value == null ? '—' : Array.isArray(value) ? value.join(', ') : String(value)

function Question({ question, index, answer, onChange }: { question: QuizQuestion; index: number; answer?: QuizAnswer;
  onChange: (answer: Partial<QuizAnswer>) => void }) {
  const { tr } = useLanguage()
  return <fieldset className="space-y-3 rounded-xl border border-line p-4">
    <legend className="px-1 font-bold">{index + 1}. {question.text}</legend>
    {question.codeSnippet?.code && <pre className="overflow-x-auto rounded-lg bg-ink p-3 text-sm text-white"><code>{question.codeSnippet.code}</code></pre>}
    {(question.type === 'single' || question.type === 'code_snippet') && (question.options || []).map((option) =>
      <label key={option.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line p-2"><input type="radio" name={question.id}
        checked={answer?.optionId === option.id} onChange={() => onChange({ optionId: option.id })} />{option.text}</label>)}
    {question.type === 'multiple' && (question.options || []).map((option) => <label key={option.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-line p-2">
      <input type="checkbox" checked={(answer?.optionIds || []).includes(option.id)} onChange={(event) => onChange({ optionIds: event.target.checked
        ? [...(answer?.optionIds || []), option.id] : (answer?.optionIds || []).filter((id) => id !== option.id) })} />{option.text}</label>)}
    {question.type === 'true_false' && <select className="w-full rounded-lg border border-line p-2" value={answer?.value === undefined ? '' : String(answer.value)}
      onChange={(event) => onChange({ value: event.target.value === 'true' })}><option value="">{tr('Tanlang')}</option><option value="true">{tr('To‘g‘ri')}</option><option value="false">{tr('Noto‘g‘ri')}</option></select>}
    {question.type === 'numeric' && <input type="number" className="w-full rounded-lg border border-line p-2" placeholder={tr('Javob')}
      value={typeof answer?.value === 'number' ? answer.value : ''} onChange={(event) => onChange({ value: Number(event.target.value) })} />}
    {question.type === 'fill_blank' && (question.blanks || []).map((_, position) => <input key={position} className="w-full rounded-lg border border-line p-2"
      placeholder={`${tr('Javob')} ${position + 1}`} value={answer?.answers?.[position] || ''} onChange={(event) => {
        const values = [...(answer?.answers || [])]; values[position] = event.target.value; onChange({ answers: values })
      }} />)}
    {question.type === 'ordering' && (question.elements || []).map((_, position) => <label key={position} className="block text-sm">{position + 1}.
      <select className="ml-2 rounded-lg border border-line p-2" value={answer?.order?.[position] || ''} onChange={(event) => {
        const order = [...(answer?.order || [])]; order[position] = event.target.value; onChange({ order })
      }}><option value="">{tr('Tanlang')}</option>{question.elements?.map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}</select></label>)}
    {question.type === 'matching' && (question.leftItems || []).map((left) => <label key={left.id} className="block text-sm">{left.text}
      <select className="ml-2 rounded-lg border border-line p-2" value={answer?.pairs?.find((pair) => pair.leftId === left.id)?.rightId || ''} onChange={(event) => onChange({ pairs: [
        ...(answer?.pairs || []).filter((pair) => pair.leftId !== left.id), { leftId: left.id, rightId: event.target.value }] })}>
        <option value="">{tr('Tanlang')}</option>{question.rightItems?.map((right) => <option key={right.id} value={right.id}>{right.text}</option>)}
      </select></label>)}
  </fieldset>
}
