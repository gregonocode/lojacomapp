import Link from 'next/link';
import {
  BellIcon,
  BoltIcon,
  FireIcon,
  HeartIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  StarIcon,
  TagIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const categorias = [
  {
    id: 'todos',
    nome: 'Todos',
    icon: FireIcon,
    ativo: true,
  },
  {
    id: 'tenis',
    nome: 'Tênis',
    icon: ShoppingBagIcon,
  },
  {
    id: 'ofertas',
    nome: 'Ofertas',
    icon: TagIcon,
  },
  {
    id: 'novidades',
    nome: 'Novidades',
    icon: BoltIcon,
  },
  {
    id: 'favoritos',
    nome: 'Favoritos',
    icon: HeartIcon,
  },
];

const produtos = [
  {
    id: '1',
    nome: 'Nike Air Max 270 React',
    marca: 'Nike',
    preco: 145,
    precoAntigo: 180,
    nota: 4.9,
    imagem:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '2',
    nome: 'Adidas Ultraboost 22',
    marca: 'Adidas',
    preco: 190,
    precoAntigo: null,
    nota: 4.8,
    imagem:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '3',
    nome: 'Puma Runner Street',
    marca: 'Puma',
    preco: 110,
    precoAntigo: 149,
    nota: 4.7,
    imagem:
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '4',
    nome: 'New Balance Classic',
    marca: 'New Balance',
    preco: 185,
    precoAntigo: null,
    nota: 4.8,
    imagem:
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=800&auto=format&fit=crop',
  },
];

type LojaPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function LojaPage({ params }: LojaPageProps) {
  const { slug } = await params;

  return (
    <main className="min-h-screen bg-[#f3f3f5] text-zinc-950">
      <div className="mx-auto min-h-screen max-w-md bg-[#f7f7f8] pb-28 shadow-2xl shadow-zinc-300/70">
        <header className="sticky top-0 z-30 bg-[#f7f7f8]/90 px-5 pb-3 pt-5 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                9:41
              </p>
              <h1 className="mt-3 text-xl font-black tracking-[-0.04em]">
                STRYDE
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-700 shadow-sm">
                <BellIcon className="h-5 w-5" />
              </button>

              <Link
                href={`/${slug}/carrinho`}
                className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-700 shadow-sm"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500" />
              </Link>
            </div>
          </div>

          <div className="mt-5 flex h-12 items-center gap-3 rounded-2xl bg-white px-4 shadow-sm">
            <MagnifyingGlassIcon className="h-5 w-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
            />
          </div>
        </header>

        <section className="px-5 pt-2">
          <div className="relative overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 p-5 text-white shadow-xl shadow-orange-500/20">
            <div className="absolute right-[-28px] top-[-8px] h-40 w-40 rounded-full bg-white/15 blur-xl" />
            <div className="absolute bottom-[-45px] right-[-35px] h-36 w-36 rounded-full bg-black/10 blur-2xl" />

            <div className="relative z-10 max-w-[55%]">
              <p className="text-xs font-bold uppercase tracking-wide text-white/80">
                Fresh drops
              </p>

              <div className="mt-2 flex items-end gap-1">
                <span className="text-4xl font-black tracking-[-0.08em]">
                  30
                </span>
                <div className="pb-1">
                  <p className="text-sm font-black leading-3">% OFF</p>
                  <p className="text-[10px] font-semibold text-white/70">
                    hoje
                  </p>
                </div>
              </div>

              <button className="mt-5 rounded-xl bg-black px-4 py-2 text-xs font-bold text-white">
                Comprar agora
              </button>
            </div>

            <div className="absolute bottom-0 right-2 h-36 w-36 rotate-[-12deg] rounded-[2rem] bg-white/20" />
            <div className="absolute bottom-5 right-6 flex h-28 w-28 rotate-[-12deg] items-center justify-center rounded-[2rem] bg-white/30 text-5xl">
              👟
            </div>
          </div>
        </section>

        <section className="mt-7 px-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black tracking-[-0.03em]">
              Comprar por estilo
            </h2>
            <button className="text-xs font-semibold text-zinc-400">
              Ver tudo
            </button>
          </div>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categorias.map((categoria) => (
              <button
                key={categoria.id}
                className={[
                  'flex min-w-[76px] flex-col items-center gap-2 rounded-2xl px-3 py-3 transition',
                  categoria.ativo
                    ? 'bg-black text-white shadow-xl shadow-black/10'
                    : 'bg-white text-zinc-500 shadow-sm',
                ].join(' ')}
              >
                <categoria.icon className="h-5 w-5" />
                <span className="text-[11px] font-semibold">
                  {categoria.nome}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-6 px-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black tracking-[-0.03em]">
              Em destaque
            </h2>
            <button className="text-xs font-semibold text-zinc-400">
              Ver tudo
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            {produtos.map((produto) => (
              <Link
                key={produto.id}
                href={`/${slug}/${produto.id}`}
                className="group overflow-hidden rounded-[1.4rem] bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-zinc-200"
              >
                <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[1.1rem] bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={produto.imagem}
                    alt={produto.nome}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  <button className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-400 shadow-sm backdrop-blur">
                    <HeartIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-zinc-900">
                      {produto.marca}
                    </p>
                    <StarIcon className="h-3 w-3 fill-orange-400 text-orange-400" />
                    <span className="text-[11px] font-semibold text-zinc-400">
                      {produto.nota}
                    </span>
                  </div>

                  <h3 className="mt-1 line-clamp-2 min-h-[32px] text-xs font-medium leading-4 text-zinc-500">
                    {produto.nome}
                  </h3>

                  <div className="mt-2 flex items-end gap-1.5">
                    <p className="text-sm font-black text-zinc-950">
                      {formatCurrency(produto.preco)}
                    </p>

                    {produto.precoAntigo && (
                      <p className="pb-0.5 text-[10px] font-semibold text-zinc-300 line-through">
                        {formatCurrency(produto.precoAntigo)}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2">
          <div className="flex h-16 items-center justify-around rounded-[1.5rem] bg-black px-4 text-white shadow-2xl shadow-black/30">
            <Link href={`/${slug}`} className="flex flex-col items-center gap-1">
              <HomeIcon className="h-5 w-5" />
              <span className="text-[10px] font-semibold">Home</span>
            </Link>

            <button className="flex flex-col items-center gap-1 text-zinc-500">
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span className="text-[10px] font-semibold">Buscar</span>
            </button>

            <Link
              href={`/${slug}/carrinho`}
              className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                2
              </span>
            </Link>

            <button className="flex flex-col items-center gap-1 text-zinc-500">
              <HeartIcon className="h-5 w-5" />
              <span className="text-[10px] font-semibold">Salvos</span>
            </button>

            <button className="flex flex-col items-center gap-1 text-zinc-500">
              <UserIcon className="h-5 w-5" />
              <span className="text-[10px] font-semibold">Perfil</span>
            </button>
          </div>
        </nav>
      </div>
    </main>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}