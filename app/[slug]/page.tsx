import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
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
import { createClient } from '@/app/lib/supabase/server';

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

type Loja = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  logo_url: string | null;
  cor_primaria: string | null;
  ativa: boolean;
};

type LojaPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: LojaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const loja = await getLojaBySlug(slug);

  if (!loja) {
    return {
      title: 'Loja não encontrada',
    };
  }

  const description =
    loja.descricao || `Compre online na ${loja.nome} direto pelo app.`;

  return {
    title: loja.nome,
    description,
    openGraph: {
      title: loja.nome,
      description,
      images: loja.logo_url ? [loja.logo_url] : undefined,
    },
  };
}

export default async function LojaPage({ params }: LojaPageProps) {
  const { slug } = await params;
  const loja = await getLojaBySlug(slug);

  if (!loja) {
    notFound();
  }

  const primaryColor = getSafeStoreColor(loja.cor_primaria);
  const lojaDescricao =
    loja.descricao ||
    'Produtos selecionados para você comprar online com praticidade.';

  return (
    <main className="min-h-screen bg-[#f3f3f5] text-zinc-950">
      <div className="mx-auto min-h-screen max-w-md bg-[#f7f7f8] pb-28 shadow-2xl shadow-zinc-300/70">
        <header className="sticky top-0 z-30 bg-[#f7f7f8]/90 px-5 pb-3 pt-5 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-white shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                {loja.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={loja.logo_url}
                    alt={`Logo ${loja.nome}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ShoppingBagIcon className="h-6 w-6" />
                )}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                  Loja oficial
                </p>
                <h1 className="mt-1 truncate text-xl font-black tracking-[-0.04em]">
                  {loja.nome}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-700 shadow-sm">
                <BellIcon className="h-5 w-5" />
              </button>

              <Link
                href={`/${loja.slug}/carrinho`}
                className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-700 shadow-sm"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                <span
                  className="absolute right-2 top-2 h-2 w-2 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                />
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
          <div
            className="relative overflow-hidden rounded-[1.7rem] p-5 text-white shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, #111827)`,
              boxShadow: `0 20px 45px ${primaryColor}26`,
            }}
          >
            <div className="absolute right-[-28px] top-[-8px] h-40 w-40 rounded-full bg-white/15 blur-xl" />
            <div className="absolute bottom-[-45px] right-[-35px] h-36 w-36 rounded-full bg-black/10 blur-2xl" />

            <div className="relative z-10 max-w-[62%]">
              <p className="text-xs font-bold uppercase tracking-wide text-white/80">
                {loja.slug}
              </p>

              <h2 className="mt-2 text-3xl font-black leading-8 tracking-[-0.06em]">
                {loja.nome}
              </h2>

              <p className="mt-3 line-clamp-3 text-xs font-semibold leading-5 text-white/75">
                {lojaDescricao}
              </p>

              <a
                href="#produtos"
                className="mt-5 inline-flex rounded-xl bg-white px-4 py-2 text-xs font-bold text-zinc-950"
              >
                Comprar agora
              </a>
            </div>

            <div className="absolute bottom-0 right-2 h-36 w-36 rotate-[-12deg] rounded-[2rem] bg-white/20" />
            <div className="absolute bottom-5 right-6 flex h-28 w-28 rotate-[-12deg] items-center justify-center overflow-hidden rounded-[2rem] bg-white/30 text-white">
              {loja.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={loja.logo_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <ShoppingBagIcon className="h-14 w-14" />
              )}
            </div>
          </div>
        </section>

        <section className="mt-7 px-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black tracking-[-0.03em]">
              Categorias
            </h2>
            <button className="text-xs font-semibold text-zinc-400">
              Ver tudo
            </button>
          </div>

          <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categorias.map((categoria) => {
              const Icon = categoria.icon;

              return (
                <button
                  key={categoria.id}
                  className={[
                    'flex min-w-[76px] flex-col items-center gap-2 rounded-2xl px-3 py-3 transition',
                    categoria.ativo
                      ? 'text-white shadow-xl'
                      : 'bg-white text-zinc-500 shadow-sm',
                  ].join(' ')}
                  style={
                    categoria.ativo
                      ? {
                          backgroundColor: primaryColor,
                          boxShadow: `0 18px 34px ${primaryColor}1f`,
                        }
                      : undefined
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[11px] font-semibold">
                    {categoria.nome}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section id="produtos" className="mt-6 px-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black tracking-[-0.03em]">
              Produtos em destaque
            </h2>
            <button className="text-xs font-semibold text-zinc-400">
              Ver tudo
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            {produtos.map((produto) => (
              <Link
                key={produto.id}
                href={`/${loja.slug}/${produto.id}`}
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
                    <StarIcon
                      className="h-3 w-3 fill-current"
                      style={{ color: primaryColor }}
                    />
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
          <div
            className="flex h-16 items-center justify-around rounded-[1.5rem] px-4 text-white shadow-2xl"
            style={{
              backgroundColor: '#111827',
              boxShadow: '0 24px 60px rgb(0 0 0 / 0.3)',
            }}
          >
            <Link
              href={`/${loja.slug}`}
              className="flex flex-col items-center gap-1"
            >
              <HomeIcon className="h-5 w-5" />
              <span className="text-[10px] font-semibold">Home</span>
            </Link>

            <button className="flex flex-col items-center gap-1 text-zinc-500">
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span className="text-[10px] font-semibold">Buscar</span>
            </button>

            <Link
              href={`/${loja.slug}/carrinho`}
              className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white"
              style={{ color: primaryColor }}
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white"
                style={{ backgroundColor: primaryColor }}
              >
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

const getLojaBySlug = cache(async (slug: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lojas')
    .select(
      `
      id,
      nome,
      slug,
      descricao,
      logo_url,
      cor_primaria,
      ativa
    `,
    )
    .eq('slug', slug)
    .eq('ativa', true)
    .maybeSingle<Loja>();

  if (error) {
    throw error;
  }

  return data;
});

function getSafeStoreColor(color: string | null) {
  if (!color) {
    return '#111827';
  }

  if (/^#[0-9a-f]{6}$/i.test(color) || /^#[0-9a-f]{3}$/i.test(color)) {
    return color;
  }

  return '#111827';
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
