import { useQuery } from '@tanstack/react-query'
import { CheckCircle2, Code2, ExternalLink, Globe2 } from 'lucide-react'
import { useState } from 'react'
import { Badge, Card, Chips, EmptyState, ErrorState, Notice, PageHeader, Progress, SkeletonGrid } from '../../components/ui'
import { ALGO_CONTRACT_CONFIRMED, algoService } from '../../services/algoService'
import { EDVERSE_CONTRACT_CONFIRMED, edverseService } from '../../services/edverseService'

const diffTone = { easy: 'green', medium: 'yellow', hard: 'red' } as const
const diffLabel = { easy: 'Oson', medium: "O'rta", hard: 'Qiyin' }

export function AlgoPage() {
  const [diff, setDiff] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['algo'], queryFn: algoService.tasks })
  const list = data?.filter((t) => diff === 'all' || t.difficulty === diff) ?? []
  const solved = data?.filter((t) => t.solved).length ?? 0

  return (
    <>
      <PageHeader title="Algo" subtitle="Algoritmik masalalar va progress" />
      {!ALGO_CONTRACT_CONFIRMED && <Notice>Algo API kontrakti hali tasdiqlanmagan. Bo'lim tuzilmasi tayyor, backend endpointlari aniqlangach ulanadi.</Notice>}
      {isLoading ? <SkeletonGrid count={3} className="h-32" /> : error ? <ErrorState error={error} onRetry={refetch} />
        : !data?.length ? <EmptyState title="Masalalar mavjud emas" icon={<Code2 />} /> : (
          <>
            <Card className="mb-5 flex flex-wrap items-center gap-6 p-5">
              <div><p className="text-3xl font-extrabold">{solved}<span className="text-lg text-muted">/{data.length}</span></p><p className="text-sm text-muted">Yechilgan</p></div>
              <Progress value={(solved / data.length) * 100} className="min-w-40 flex-1 h-3" />
            </Card>
            <div className="mb-4"><Chips value={diff} onChange={setDiff} options={[{ value: 'all', label: 'Barchasi' }, { value: 'easy', label: 'Oson' }, { value: 'medium', label: "O'rta" }, { value: 'hard', label: 'Qiyin' }]} /></div>
            <Card className="divide-y divide-line">
              {list.map((t) => (
                <div key={t.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  {t.solved ? <CheckCircle2 className="size-5 text-emerald-500" /> : <div className="size-5 rounded-full border-2 border-line" />}
                  <span className="flex-1 font-semibold">{t.title}</span>
                  <div className="flex gap-1">{t.tags.map((g) => <span key={g} className="rounded-md bg-canvas px-2 py-0.5 font-mono text-xs text-muted">{g}</span>)}</div>
                  <Badge tone={diffTone[t.difficulty]}>{diffLabel[t.difficulty]}</Badge>
                  <span className="w-20 text-right text-xs text-muted">{t.attempts} urinish</span>
                </div>
              ))}
            </Card>
          </>
        )}
    </>
  )
}

export function EdversePage() {
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['edverse'], queryFn: edverseService.list })
  return (
    <>
      <PageHeader title="Edverse" subtitle="Ta'lim olami" />
      {!EDVERSE_CONTRACT_CONFIRMED && <Notice>Edverse funksiyalari va API kontrakti hali aniqlanmagan. Murakkab funksiyalar backend tasdiqlagandan keyin qo'shiladi.</Notice>}
      {isLoading ? <SkeletonGrid count={3} className="h-32" /> : error ? <ErrorState error={error} onRetry={refetch} />
        : !data?.length ? <EmptyState title="Edverse kontenti hali mavjud emas" text="Backend ma'lumot qaytargach shu yerda ko'rinadi." icon={<Globe2 />} /> : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.map((i) => (
              <Card key={i.id} className="p-5">
                <p className="font-bold">{i.title}</p><p className="mt-1 text-sm text-muted">{i.description}</p>
                {i.url && <a href={i.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-mars-600">Ochish<ExternalLink className="size-3" /></a>}
              </Card>
            ))}
          </div>
        )}
    </>
  )
}
