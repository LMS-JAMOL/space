import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, ChevronRight, Package, PackageX, ShoppingBag, ShoppingCart } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, Button, Card, Chips, EmptyState, ErrorState, InlineAlert, Modal, PageHeader, SearchInput, Select, Skeleton, SkeletonGrid, cn } from '../../components/ui'
import { MarsCoin } from '../../components/ui/MarsCoin'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { ApiError, errorMessage } from '../../services/apiClient'
import { shopService } from '../../services/shopService'
import type { Product, Purchase } from '../../types'
import { useLanguage } from '../../context/LanguageContext'
import { assetUrl, fill, fmtDateTime, fmtNum, newIdempotencyKey } from '../../utils/format'

function useBalance() {
  return useQuery({ queryKey: ['shop', 'balance'], queryFn: shopService.balance })
}

function BalanceCard() {
  const { tr } = useLanguage()
  const { data, isLoading } = useBalance()
  return (
    <div className="flex h-14 items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 py-2 pl-2 pr-4" role="status" aria-live="polite">
      <MarsCoin size={40} className="shrink-0" />
      <div className="leading-tight">
        <div className="text-xs font-semibold text-amber-900/80">{tr('Balans')}</div>
        <div className="text-lg font-extrabold tabular-nums text-ink">{isLoading ? '…' : data ? fmtNum(data.coins) : '—'} <span className="text-sm font-bold text-amber-900">{tr('MARS Coin')}</span></div>
      </div>
    </div>
  )
}

const ImageFallback = ({ className }: { className?: string }) => (
  <div className={cn('grid w-full place-items-center bg-canvas text-slate-400', className)} aria-hidden="true"><Package className="size-10" /></div>
)

function ProductImage({ p, className }: { p: Product; className?: string }) {
  const [broken, setBroken] = useState(false)
  if (!p.images[0] || broken) return <ImageFallback className={className} />
  return <img src={assetUrl(p.images[0])} alt={p.name} className={cn('w-full object-cover', className)} loading="lazy" onError={() => setBroken(true)} />
}

function OrderThumb({ src }: { src?: string | null }) {
  const [broken, setBroken] = useState(false)
  return !src || broken
    ? <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-canvas"><Package className="size-5 text-slate-400" /></div>
    : <img src={assetUrl(src)} alt="" className="size-12 shrink-0 rounded-xl object-cover" onError={() => setBroken(true)} />
}

export function ShopPage() {
  const { tr } = useLanguage()
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('all')
  const [sort, setSort] = useState('popular')
  const [selected, setSelected] = useState<Product | null>(null)
  const products = useQuery({ queryKey: ['shop', 'products'], queryFn: shopService.products })
  const categories = useQuery({ queryKey: ['shop', 'categories'], queryFn: shopService.categories })
  const balance = useBalance()

  const list = useMemo(() => {
    const s = search.trim().toLowerCase()
    const r = (products.data ?? []).filter((p) => (cat === 'all' || p.categoryId === cat) && (!s || p.name.toLowerCase().includes(s)))
    if (sort === 'price_asc') r.sort((a, b) => a.price - b.price)
    if (sort === 'price_desc') r.sort((a, b) => b.price - a.price)
    if (sort === 'stock') r.sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0))
    return r
  }, [products.data, search, cat, sort])

  return (
    <>
      <PageHeader title={tr('Space Shop')} subtitle={tr("MARS Coin evaziga sovg'alar")}
        actions={<><BalanceCard /><Link to="/space-shop/orders"><Button variant="secondary"><ShoppingBag className="size-4" />{tr('Buyurtmalarim')}</Button></Link></>} />
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 lg:pt-0.5"><Chips value={cat} onChange={setCat} options={[{ value: 'all', label: tr('Barchasi') }, ...(categories.data ?? []).map((c) => ({ value: c.id, label: c.name }))]} /></div>
        <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
          <SearchInput value={search} onChange={setSearch} placeholder={tr('Mahsulot qidirish...')} />
          <Select className="h-11 w-full sm:h-10 sm:w-auto" label={tr('Saralash')} value={sort} onChange={setSort} options={[{ value: 'popular', label: tr('Standart') }, { value: 'price_asc', label: tr('Arzon → qimmat') }, { value: 'price_desc', label: tr('Qimmat → arzon') }, { value: 'stock', label: tr('Mavjudlari') }]} />
        </div>
      </div>
      {products.isLoading ? <SkeletonGrid count={8} className="aspect-[3/4] rounded-2xl" grid="grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4" /> : products.error ? <ErrorState error={products.error} onRetry={products.refetch} />
        : list.length === 0 ? <EmptyState title={tr('Mahsulot topilmadi')} text={tr("Qidiruv yoki filtrni o'zgartiring.")} icon={<ShoppingBag />}
            action={search || cat !== 'all' ? <Button variant="secondary" onClick={() => { setSearch(''); setCat('all') }}>{tr('Filtrni tozalash')}</Button> : undefined} />
        : (
          <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {list.map((p) => {
              const out = p.stock <= 0
              const cantAfford = balance.data ? balance.data.coins < p.price : false
              return (
                <li key={p.id}>
                <Card className={cn('group flex h-full flex-col overflow-hidden transition duration-200', !out && 'hover:-translate-y-0.5 hover:border-mars-200 hover:shadow-lift')}>
                  <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => setSelected(p)} className="relative block overflow-hidden bg-canvas text-left">
                    <ProductImage p={p} className={cn('aspect-square transition duration-300 group-hover:scale-[1.03]', out && 'opacity-60 grayscale')} />
                    {out ? <Badge tone="gray" className="absolute left-2 top-2 shadow-sm sm:left-3 sm:top-3">{tr('Tugagan')}</Badge> : p.stock <= 3 && <Badge tone="red" className="absolute left-2 top-2 shadow-sm sm:left-3 sm:top-3">{fill(tr('{n} ta qoldi'), { n: p.stock })}</Badge>}
                  </button>
                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    <button type="button" onClick={() => setSelected(p)} className="line-clamp-2 min-h-10 text-left text-sm font-bold leading-snug transition-colors duration-150 hover:text-mars-700 sm:text-base sm:leading-snug">{p.name}</button>
                    <p className="mt-1 text-xs text-muted tabular-nums">{out ? tr('Mavjud emas') : fill(tr('Omborda: {n}'), { n: p.stock })}</p>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                      <span className="flex items-center gap-1.5 text-base font-extrabold tabular-nums text-ink"><MarsCoin size={18} title={tr('MARS Coin')} />{fmtNum(p.price)}</span>
                      <Button size="sm" variant={cantAfford ? 'secondary' : 'primary'} disabled={out || cantAfford} onClick={() => setSelected(p)}
                        aria-label={`${tr('Olish')}: ${p.name}${cantAfford ? ` — ${tr('Balans yetarli emas')}` : ''}`}><ShoppingCart aria-hidden="true" className="size-4" /><span className="hidden sm:inline">{tr('Olish')}</span></Button>
                    </div>
                    {cantAfford && !out && <p className="mt-2 text-xs font-semibold text-amber-800 tabular-nums">{fill(tr('Yana {n} coin kerak.'), { n: fmtNum(p.price - (balance.data?.coins ?? 0)) })}</p>}
                  </div>
                </Card>
                </li>
              )
            })}
          </ul>
        )}
      {selected && <ProductModal productId={selected.id} initial={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

function ProductModal({ productId, initial, onClose }: { productId: string; initial: Product; onClose: () => void }) {
  const { tr } = useLanguage()
  const qc = useQueryClient()
  const [confirming, setConfirming] = useState(false)
  const idemKey = useRef(newIdempotencyKey())
  const product = useQuery({ queryKey: ['shop', 'product', productId], queryFn: () => shopService.product(productId), initialData: initial, staleTime: 0 })
  const balance = useBalance()
  const p = product.data

  const purchase = useMutation({
    mutationFn: () => shopService.purchase({ productId, quantity: 1 }, idemKey.current),
    onSettled: () => {
      idemKey.current = newIdempotencyKey()
      qc.invalidateQueries({ queryKey: ['shop'] })
      qc.invalidateQueries({ queryKey: ['me'] })
    },
  })

  const out = p.stock <= 0
  const insufficient = balance.data ? balance.data.coins < p.price : false
  const errStatus = purchase.error instanceof ApiError ? purchase.error.status : null

  if (purchase.isSuccess) return (
    <Modal open onClose={onClose} title={tr('Buyurtma qabul qilindi')}
      footer={<><Button variant="secondary" onClick={onClose}>{tr('Yopish')}</Button><Link to="/space-shop/orders" className="max-sm:flex-1"><Button className="w-full">{tr('Buyurtmalarim')}</Button></Link></>}>
      <div className="py-2 text-center" role="status">
        <div className="mx-auto mb-3 grid size-16 place-items-center rounded-full bg-emerald-50"><CheckCircle2 className="size-9 text-emerald-600" aria-hidden="true" /></div>
        <p className="font-bold">{purchase.data.productName}</p>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted tabular-nums">{tr('Buyurtma')} #{purchase.data.id} · <MarsCoin size={16} />{fmtNum(purchase.data.totalPrice)} {tr('coin')}</p>
        <div className="mt-3"><StatusBadge status={purchase.data.status} /></div>
      </div>
    </Modal>
  )

  return (
    <Modal open onClose={onClose} title={confirming ? tr('Xaridni tasdiqlash') : p.name} size={confirming ? 'md' : 'lg'} busy={purchase.isPending}
      description={confirming ? tr('Coin faqat server tasdiqlagandan keyin yechiladi.') : undefined}
      footer={confirming ? (
        <><Button variant="ghost" disabled={purchase.isPending} onClick={() => { setConfirming(false); purchase.reset() }}>{tr('Orqaga')}</Button>
          <Button loading={purchase.isPending} disabled={out || insufficient} onClick={() => purchase.mutate()}>{tr('Tasdiqlash')}</Button></>
      ) : (
        <Button disabled={out || insufficient} onClick={() => setConfirming(true)}><ShoppingCart className="size-4" />{out ? tr('Tugagan') : insufficient ? tr('Balans yetarli emas') : tr('Sotib olish')}</Button>
      )}>
      {confirming ? (
        <div className="space-y-3">
          <div className="flex items-center gap-4 rounded-2xl bg-canvas p-3"><ProductImage p={p} className="size-16 shrink-0 overflow-hidden rounded-xl" /><div className="min-w-0"><p className="font-bold leading-snug">{p.name}</p><p className="text-sm text-muted">{tr('1 dona')}</p></div></div>
          <dl className="divide-y divide-line rounded-2xl border border-line px-4 text-sm">
            <div className="flex items-center justify-between py-3"><dt className="text-muted">{tr('Narx')}</dt><dd className="flex items-center gap-1.5 font-bold tabular-nums"><MarsCoin size={16} />{fmtNum(p.price)} {tr('coin')}</dd></div>
            <div className="flex items-center justify-between py-3"><dt className="text-muted">{tr('Joriy balans')}</dt><dd className="flex items-center gap-1.5 font-bold tabular-nums"><MarsCoin size={16} />{balance.data ? fmtNum(balance.data.coins) : '—'} {tr('coin')}</dd></div>
          </dl>
          <p className="text-xs leading-relaxed text-muted">{tr('Yakuniy narx va balans server tomonidan tekshiriladi. Coin faqat server tasdiqlagandan keyin yechiladi.')}</p>
          {purchase.error && (
            <InlineAlert tone="danger" role="alert">
              {errStatus === 402 ? tr("Balansda yetarli MARS Coin yo'q.") : errStatus === 409 ? tr("Mahsulot qolmagan yoki holati o'zgardi.") : errorMessage(purchase.error)}
            </InlineAlert>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <ProductImage p={p} className="aspect-square overflow-hidden rounded-2xl" />
            {p.images.length > 1 && <div className="flex gap-2 overflow-x-auto">{p.images.slice(1).map((src) => <img key={src} src={assetUrl(src)} alt="" className="size-14 shrink-0 rounded-lg object-cover ring-1 ring-line" />)}</div>}
          </div>
          <div>
            <p className="flex items-center gap-2 text-2xl font-extrabold tabular-nums"><MarsCoin size={28} title={tr('MARS Coin')} />{fmtNum(p.price)}</p>
            <div className="mt-2">{out ? <Badge tone="gray"><PackageX className="size-3" aria-hidden="true" />{tr('Tugagan')}</Badge> : <Badge tone="green">{fill(tr('Omborda: {n}'), { n: p.stock })}</Badge>}</div>
            {p.description && <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted">{p.description}</p>}
            {insufficient && !out && <InlineAlert tone="warning" className="mt-4">{fill(tr('Yana {n} coin kerak.'), { n: fmtNum(p.price - (balance.data?.coins ?? 0)) })}</InlineAlert>}
            {product.error && <p className="mt-3 text-xs text-red-700">{tr("Yangilab bo'lmadi")}: {errorMessage(product.error)}</p>}
          </div>
        </div>
      )}
    </Modal>
  )
}

export function OrdersPage() {
  const { tr } = useLanguage()
  const orders = useQuery({ queryKey: ['shop', 'purchases'], queryFn: shopService.purchases })
  const [selected, setSelected] = useState<Purchase | null>(null)
  return (
    <>
      <PageHeader back={{ to: '/space-shop', label: tr('Space Shop') }} title={tr('Buyurtmalarim')} subtitle={tr('Xaridlar tarixi va holati')} actions={<BalanceCard />} />
      {orders.isLoading ? <div className="space-y-2" role="status" aria-label={tr('Yuklanmoqda')}>{[1, 2, 3].map((i) => <Skeleton key={i} className="h-[72px]" />)}</div>
        : orders.error ? <ErrorState error={orders.error} onRetry={orders.refetch} />
        : !orders.data?.length ? <EmptyState title={tr("Buyurtmalar yo'q")} text={tr("Birinchi sovg'angizni tanlang!")} icon={<ShoppingBag />} action={<Link to="/space-shop"><Button>{tr("Do'konga o'tish")}</Button></Link>} />
        : (
          <Card className="overflow-hidden">
            <ul className="divide-y divide-line">
            {orders.data.map((o) => (
              <li key={o.id}>
              <button type="button" onClick={() => setSelected(o)} className="group flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-canvas sm:gap-4 sm:px-5">
                <OrderThumb src={o.productImage} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{o.productName}</p>
                  <p className="text-xs text-muted tabular-nums">{fmtDateTime(o.createdAt)} · #{o.id}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-sm font-bold tabular-nums sm:hidden"><MarsCoin size={16} />{fmtNum(o.totalPrice)}</p>
                </div>
                <span className="hidden items-center gap-1.5 font-bold tabular-nums sm:flex"><MarsCoin size={18} title={tr('MARS Coin')} />{fmtNum(o.totalPrice)}</span>
                <StatusBadge status={o.status} />
                <ChevronRight className="hidden size-4 shrink-0 text-muted transition-transform duration-150 group-hover:translate-x-0.5 sm:block" aria-hidden="true" />
              </button>
              </li>
            ))}
            </ul>
          </Card>
        )}
      {selected && <OrderModal id={selected.id} initial={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

function OrderModal({ id, initial, onClose }: { id: string; initial: Purchase; onClose: () => void }) {
  const { tr } = useLanguage()
  const { data: o } = useQuery({ queryKey: ['shop', 'purchase', id], queryFn: () => shopService.purchaseById(id), initialData: initial })
  return (
    <Modal open onClose={onClose} title={`${tr('Buyurtma')} #${o.id}`}>
      <div className="mb-4 flex items-center gap-3"><OrderThumb src={o.productImage} /><p className="min-w-0 font-bold leading-snug">{o.productName}</p></div>
      <dl className="divide-y divide-line rounded-2xl border border-line px-4 text-sm">
        {[['Mahsulot', o.productName], ['Soni', o.quantity], ['Sana', fmtDateTime(o.createdAt)]].map(([l, v]) => (
          <div key={l as string} className="flex items-center justify-between gap-3 py-3"><dt className="text-muted">{tr(l as string)}</dt><dd className="min-w-0 truncate text-right font-bold tabular-nums">{v}</dd></div>
        ))}
        <div className="flex items-center justify-between gap-3 py-3"><dt className="text-muted">{tr('Jami')}</dt><dd className="flex items-center gap-1.5 font-bold tabular-nums"><MarsCoin size={16} />{fmtNum(o.totalPrice)} {tr('coin')}</dd></div>
        <div className="flex items-center justify-between gap-3 py-3"><dt className="text-muted">{tr('Holat')}</dt><dd><StatusBadge status={o.status} /></dd></div>
      </dl>
    </Modal>
  )
}

export function ProductRedirect() {
  const { productId } = useParams()
  return <ShopPageWithProduct id={productId!} />
}
function ShopPageWithProduct({ id }: { id: string }) {
  const q = useQuery({ queryKey: ['shop', 'product', id], queryFn: () => shopService.product(id) })
  if (q.isLoading) return <SkeletonGrid count={8} className="aspect-[3/4] rounded-2xl" grid="grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4" />
  if (q.error || !q.data) return <ErrorState error={q.error} onRetry={q.refetch} />
  return <><ShopPage /><ProductModal productId={id} initial={q.data} onClose={() => history.back()} /></>
}
