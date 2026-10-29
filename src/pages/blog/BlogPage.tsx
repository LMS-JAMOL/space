import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ArrowLeft, Clock, Newspaper } from 'lucide-react'
import { useDeferredValue, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, Card, Chips, EmptyState, ErrorState, PageHeader, Pagination, SearchInput, Skeleton, SkeletonGrid } from '../../components/ui'
import { blogService } from '../../services/blogService'
import { fmtDate } from '../../utils/format'

export function BlogPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const q = useDeferredValue(search)
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['blog', page, q, category],
    queryFn: () => blogService.list({ page, search: q, category }),
    placeholderData: keepPreviousData,
  })

  return (
    <>
      <PageHeader title="Blog" subtitle="Maqolalar, yangiliklar va maslahatlar" actions={<SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} />} />
      {data?.categories && data.categories.length > 0 && (
        <div className="mb-5"><Chips value={category} onChange={(v) => { setCategory(v); setPage(1) }} options={[{ value: '', label: 'Barchasi' }, ...data.categories.map((c) => ({ value: c, label: c }))]} /></div>
      )}
      {isLoading ? <SkeletonGrid count={6} className="h-72" /> : error ? <ErrorState error={error} onRetry={refetch} />
        : !data?.items.length ? <EmptyState title="Maqolalar topilmadi" icon={<Newspaper />} />
        : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {data.items.map((p) => (
                <Link key={p.id} to={`/blog/${p.id}`} className="group">
                  <Card className="h-full overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
                    <div className="aspect-[16/9] overflow-hidden bg-canvas">{p.coverUrl && <img src={p.coverUrl} alt="" loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />}</div>
                    <div className="p-5">
                      <div className="mb-2 flex items-center gap-2 text-xs text-muted">{p.category && <Badge tone="orange">{p.category}</Badge>}{fmtDate(p.publishedAt)}</div>
                      <h3 className="font-bold group-hover:text-mars-600">{p.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-muted">{p.excerpt}</p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
            <Pagination page={data.page} total={data.total} pageSize={data.pageSize} onChange={setPage} />
          </>
        )}
    </>
  )
}

export function BlogPostPage() {
  const { postId = '' } = useParams()
  const { data: p, isLoading, error, refetch } = useQuery({ queryKey: ['blog', 'post', postId], queryFn: () => blogService.get(postId) })
  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/blog" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft className="size-4" />Blog</Link>
      {isLoading ? <><Skeleton className="mb-4 aspect-[16/9]" /><Skeleton className="h-8 w-2/3" /></> : error || !p ? <ErrorState error={error} onRetry={refetch} /> : (
        <article className="animate-fade-up">
          {p.coverUrl && <img src={p.coverUrl} alt="" className="mb-6 aspect-[16/9] w-full rounded-3xl object-cover" />}
          <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-muted">
            {p.category && <Badge tone="orange">{p.category}</Badge>}<span>{fmtDate(p.publishedAt)}</span>
            {p.readMinutes && <span className="flex items-center gap-1"><Clock className="size-3.5" />{p.readMinutes} daqiqa</span>}{p.author && <span>· {p.author}</span>}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">{p.title}</h1>
          <div className="mt-6 space-y-4 leading-relaxed text-slate-700">{(p.content ?? p.excerpt).split('\n\n').map((para, i) => <p key={i}>{para}</p>)}</div>
        </article>
      )}
    </div>
  )
}
