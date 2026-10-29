import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, Coins, Package, PackageX, ShoppingBag, ShoppingCart } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Badge, Button, Card, Chips, EmptyState, ErrorState, Modal, PageHeader, SearchInput, Select, Skeleton, SkeletonGrid, cn } from '../../components/ui'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { ApiError, errorMessage } from '../../services/apiClient'
import { shopService } from '../../services/shopService'
import type { Product, Purchase } from '../../types'
import { fmtDateTime, fmtNum, newIdempotencyKey } from '../../utils/format'

function useBalance() {
  return useQuery({ queryKey: ['shop', 'balance'], queryFn: shopService.balance })
}

function BalanceCard() {
  const { data, isLoading } = useBalance()
  return (
    <div className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-mars-500 px-4 text-sm font-extrabold text-white shadow-md shadow-mars-500/30">
      <Coins className="size-4" />{isLoading ? '…' : data ? fmtNum(data.coins) : '—'} MARS Coin
    </div>
  )
}

function ProductImage({ p, className }: { p: Product; className?: string }) {
  return p.images[0]
    ? <img src={p.images[0]} alt={p.name} className={cn('w-full object-cover', className)} loading="lazy" />
    : <div className={cn('grid w-full place-items-center bg-canvas text-slate-300', className)}><Package className="size-12" /></div>
}

export function ShopPage() {
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
      <PageHeader title="Space Shop" subtitle="MARS Coin evaziga sovg'alar"
        actions={<><BalanceCard /><Link to="/space-shop/orders"><Button variant="secondary"><ShoppingBag className="size-4" />Buyurtmalarim</Button></Link></>} />
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Chips value={cat} onChange={setCat} options={[{ value: 'all', label: 'Barchasi' }, ...(categories.data ?? []).map((c) => ({ value: c.id, label: c.name }))]} />
        <div className="flex gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="Mahsulot qidirish..." />
          <Select value={sort} onChange={setSort} options={[{ value: 'popular', label: 'Standart' }, { value: 'price_asc', label: 'Arzon → qimmat' }, { value: 'price_desc', label: 'Qimmat → arzon' }, { value: 'stock', label: 'Mavjudlari' }]} />
        </div>
      </div>
      {products.isLoading ? <SkeletonGrid count={8} className="h-72" /> : products.error ? <ErrorState error={products.error} onRetry={products.refetch} />
        : list.length === 0 ? <EmptyState title="Mahsulot topilmadi" text="Qidiruv yoki filtrni o'zgartiring." icon={<ShoppingBag />} />
        : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {list.map((p) => {
              const out = p.stock <= 0
              const cantAfford = balance.data ? balance.data.coins < p.price : false
              return (
                <Card key={p.id} className="group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lift animate-fade-up">
                  <button onClick={() => setSelected(p)} className="relative overflow-hidden text-left">
                    <ProductImage p={p} className={cn('aspect-[4/3] transition duration-500 group-hover:scale-105', out && 'grayscale opacity-60')} />
                    {out ? <Badge tone="gray" className="absolute left-3 top-3">Tugagan</Badge> : p.stock <= 3 && <Badge tone="red" className="absolute left-3 top-3">{p.stock} ta qoldi</Badge>}
                  </button>
                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    <button onClick={() => setSelected(p)} className="text-left text-sm sm:text-base font-bold hover:text-mars-600">{p.name}</button>
                    <p className="mt-0.5 text-xs text-muted">{out ? 'Mavjud emas' : `Omborda: ${p.stock}`}</p>
                    <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                      <span className="flex items-center gap-1 font-extrabold text-amber-600"><Coins className="size-4" />{fmtNum(p.price)}</span>
                      <Button size="sm" disabled={out} onClick={() => setSelected(p)} title={cantAfford ? 'Balans yetarli emas' : undefined}><ShoppingCart className="size-4" /><span className="hidden sm:inline">Olish</span></Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      {selected && <ProductModal productId={selected.id} initial={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

function ProductModal({ productId, initial, onClose }: { productId: string; initial: Product; onClose: () => void }) {
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
    <Modal open onClose={onClose} title="Buyurtma qabul qilindi">
      <div className="py-4 text-center">
        <CheckCircle2 className="mx-auto mb-3 size-14 text-emerald-500" />
        <p className="font-bold">{purchase.data.productName}</p>
        <p className="text-sm text-muted">Buyurtma #{purchase.data.id} · {fmtNum(purchase.data.totalPrice)} coin</p>
        <div className="mt-2"><StatusBadge status={purchase.data.status} /></div>
        <div className="mt-6 flex justify-center gap-2"><Button variant="secondary" onClick={onClose}>Yopish</Button><Link to="/space-shop/orders"><Button>Buyurtmalarim</Button></Link></div>
      </div>
    </Modal>
  )

  return (
    <Modal open onClose={onClose} title={confirming ? 'Xaridni tasdiqlash' : p.name} size="lg"
      footer={confirming ? (
        <><Button variant="ghost" disabled={purchase.isPending} onClick={() => { setConfirming(false); purchase.reset() }}>Orqaga</Button>
          <Button loading={purchase.isPending} disabled={out || insufficient} onClick={() => purchase.mutate()}>Tasdiqlash</Button></>
      ) : (
        <Button disabled={out || insufficient} onClick={() => setConfirming(true)}><ShoppingCart className="size-4" />{out ? 'Tugagan' : insufficient ? 'Balans yetarli emas' : 'Sotib olish'}</Button>
      )}>
      {confirming ? (
        <div className="space-y-3">
          <div className="flex items-center gap-4 rounded-2xl bg-canvas p-3"><ProductImage p={p} className="size-16 rounded-xl" /><div><p className="font-bold">{p.name}</p><p className="text-sm text-muted">1 dona</p></div></div>
          <div className="space-y-1 rounded-2xl border border-line p-4 text-sm">
            <div className="flex justify-between"><span className="text-muted">Narx</span><b>{fmtNum(p.price)} coin</b></div>
            <div className="flex justify-between"><span className="text-muted">Joriy balans</span><b>{balance.data ? fmtNum(balance.data.coins) : '—'} coin</b></div>
          </div>
          <p className="text-xs text-muted">Yakuniy narx va balans server tomonidan tekshiriladi. Coin faqat server tasdiqlagandan keyin yechiladi.</p>
          {purchase.error && (
            <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600">
              {errStatus === 402 ? "Balansda yetarli MARS Coin yo'q." : errStatus === 409 ? 'Mahsulot qolmagan yoki holati o\'zgardi.' : errorMessage(purchase.error)}
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <ProductImage p={p} className="aspect-square rounded-2xl" />
            {p.images.length > 1 && <div className="flex gap-2">{p.images.slice(1).map((src) => <img key={src} src={src} alt="" className="size-14 rounded-lg object-cover" />)}</div>}
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-2xl font-extrabold text-amber-600"><Coins className="size-6" />{fmtNum(p.price)}</p>
            <div className="mt-2">{out ? <Badge tone="gray"><PackageX className="size-3" />Tugagan</Badge> : <Badge tone="green">Omborda: {p.stock}</Badge>}</div>
            <p className="mt-4 text-sm leading-relaxed text-muted">{p.description}</p>
            {insufficient && !out && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">Yana {fmtNum(p.price - (balance.data?.coins ?? 0))} coin kerak.</p>}
            {product.error && <p className="mt-3 text-xs text-red-600">Yangilab bo'lmadi: {errorMessage(product.error)}</p>}
          </div>
        </div>
      )}
    </Modal>
  )
}

export function OrdersPage() {
  const orders = useQuery({ queryKey: ['shop', 'purchases'], queryFn: shopService.purchases })
  const [selected, setSelected] = useState<Purchase | null>(null)
  return (
    <>
      <Link to="/space-shop" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink"><ArrowLeft className="size-4" />Space Shop</Link>
      <PageHeader title="Buyurtmalarim" subtitle="Xaridlar tarixi va holati" actions={<BalanceCard />} />
      {orders.isLoading ? <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>
        : orders.error ? <ErrorState error={orders.error} onRetry={orders.refetch} />
        : !orders.data?.length ? <EmptyState title="Buyurtmalar yo'q" text="Birinchi sovg'angizni tanlang!" icon={<ShoppingBag />} action={<Link to="/space-shop"><Button>Do'konga o'tish</Button></Link>} />
        : (
          <Card className="divide-y divide-line">
            {orders.data.map((o) => (
              <button key={o.id} onClick={() => setSelected(o)} className="flex w-full items-center gap-4 px-4 py-3 text-left hover:bg-canvas sm:px-5">
                {o.productImage ? <img src={o.productImage} alt="" className="size-12 rounded-xl object-cover" /> : <div className="grid size-12 place-items-center rounded-xl bg-canvas"><Package className="size-5 text-slate-400" /></div>}
                <div className="min-w-0 flex-1"><p className="truncate font-semibold">{o.productName}</p><p className="text-xs text-muted">{fmtDateTime(o.createdAt)} · #{o.id}</p></div>
                <span className="hidden font-bold text-amber-600 sm:block">{fmtNum(o.totalPrice)}</span>
                <StatusBadge status={o.status} />
              </button>
            ))}
          </Card>
        )}
      {selected && <OrderModal id={selected.id} initial={selected} onClose={() => setSelected(null)} />}
    </>
  )
}

function OrderModal({ id, initial, onClose }: { id: string; initial: Purchase; onClose: () => void }) {
  const { data: o } = useQuery({ queryKey: ['shop', 'purchase', id], queryFn: () => shopService.purchaseById(id), initialData: initial })
  return (
    <Modal open onClose={onClose} title={`Buyurtma #${o.id}`}>
      <div className="space-y-2 text-sm">
        {[['Mahsulot', o.productName], ['Soni', o.quantity], ['Jami', `${fmtNum(o.totalPrice)} coin`], ['Sana', fmtDateTime(o.createdAt)]].map(([l, v]) => (
          <div key={l as string} className="flex justify-between border-b border-line pb-2"><span className="text-muted">{l}</span><b>{v}</b></div>
        ))}
        <div className="flex justify-between"><span className="text-muted">Holat</span><StatusBadge status={o.status} /></div>
      </div>
    </Modal>
  )
}

export function ProductRedirect() {
  const { productId } = useParams()
  return <ShopPageWithProduct id={productId!} />
}
function ShopPageWithProduct({ id }: { id: string }) {
  const q = useQuery({ queryKey: ['shop', 'product', id], queryFn: () => shopService.product(id) })
  if (q.isLoading) return <Skeleton className="h-96" />
  if (q.error || !q.data) return <ErrorState error={q.error} onRetry={q.refetch} />
  return <><ShopPage /><ProductModal productId={id} initial={q.data} onClose={() => history.back()} /></>
}
