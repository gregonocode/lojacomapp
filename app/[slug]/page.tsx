import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import {
  BellIcon,
  HeartIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  TagIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { Astroid, Flame } from 'lucide-react';
import StorePwaInstallPrompt from '@/app/components/pwa/StorePwaInstallPrompt';
import { SystemPwaRegistrar } from '@/app/components/system-pwa-registrar';
import { systemPwa } from '@/app/lib/pwa/manifests';
import { createClient } from '@/app/lib/supabase/server';

type Loja = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  logo_url: string | null;
  cor_primaria: string | null;
  banner_url: string | null;
  ativa: boolean;
};

type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number | string | null;
  preco_promocional: number | string | null;
  imagem_url: string | null;
  estoque: number | null;
  ativo: boolean | null;
};

type LojaPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const categorias = [
  {
    id: 'todos',
    nome: 'Todos',
    icon: Flame,
    ativo: true,
  },
  {
    id: 'novidades',
    nome: 'Novidades',
    icon: Astroid,
  },
  {
    id: 'ofertas',
    nome: 'Ofertas',
    icon: TagIcon,
  },
  {
    id: 'favoritos',
    nome: 'Favoritos',
    icon: HeartIcon,
  },
];

export async function generateMetadata({
  params,
}: LojaPageProps): Promise<Metadata> {
  const { slug } = await params;
  const loja = await getLojaBySlug(slug);

  if (!loja) {
    return {
      title: 'Loja nao encontrada',
    };
  }

  const description =
    loja.descricao || `Compre online na ${loja.nome} direto pelo app.`;

  return {
    title: loja.nome,
    description,
    manifest: `/manifest/${encodeURIComponent(loja.slug)}`,
    appleWebApp: {
      capable: true,
      title: loja.nome,
      statusBarStyle: 'black-translucent',
    },
    icons: {
      apple: loja.logo_url || systemPwa.icons.icon192,
    },
    openGraph: {
      title: loja.nome,
      description,
      images: loja.logo_url ? [loja.logo_url] : undefined,
    },
  };
}

export async function generateViewport({
  params,
}: LojaPageProps): Promise<Viewport> {
  const { slug } = await params;
  const loja = await getLojaBySlug(slug);

  return {
    themeColor: getSafeStoreColor(loja?.cor_primaria || null),
  };
}

export default async function LojaPage({ params }: LojaPageProps) {
  const { slug } = await params;
  const loja = await getLojaBySlug(slug);

  if (!loja) {
    notFound();
  }

  const produtos = await getProdutosByLojaId(loja.id);
  const produtosComEstoque = produtos.filter(
    (produto) => Number(produto.estoque ?? 0) > 0,
  ).length;
  const produtosEmOferta = produtos.filter((produto) =>
    Boolean(produto.preco_promocional),
  ).length;

  const primaryColor = getSafeStoreColor(loja.cor_primaria);
  const lojaDescricao =
    loja.descricao ||
    'Produtos selecionados para voce comprar online com praticidade.';

  return (
    <>
      <SystemPwaRegistrar />
      <StorePwaInstallPrompt
        appName={loja.nome}
        iconUrl={loja.logo_url}
        themeColor={primaryColor}
        slug={loja.slug}
      />

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
                  <h1 className="mt-1 truncate text-xl font-black">
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
              className="relative min-h-[220px] overflow-hidden rounded-[1.7rem] bg-cover bg-center p-5 text-white shadow-xl"
              style={{
                backgroundColor: primaryColor,
                backgroundImage: loja.banner_url
                  ? `url("${loja.banner_url}")`
                  : `linear-gradient(135deg, ${primaryColor}, #111827)`,
                boxShadow: `0 20px 45px ${primaryColor}26`,
              }}
            >
              {!loja.banner_url && <>
              <div className="absolute bottom-0 right-2 h-36 w-36 rotate-[-12deg] rounded-[2rem] bg-white/20" />

              <div className="relative z-10 max-w-[64%]">
                <p className="text-xs font-bold uppercase tracking-wide text-white/80">
                  /{loja.slug}
                </p>

                <h2 className="mt-2 text-3xl font-black leading-8">
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

              {!loja.banner_url && <div className="absolute bottom-5 right-6 flex h-28 w-28 rotate-[-12deg] items-center justify-center overflow-hidden rounded-[2rem] bg-white/30 text-white">
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
              </div>}
              </>}
            </div>
          </section>

          

          <section className="mt-7 px-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black">Categorias</h2>
              <span className="text-xs font-semibold text-zinc-400">
                {produtos.length} itens
              </span>
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
              <h2 className="text-base font-black">Produtos</h2>
              <span className="text-xs font-semibold text-zinc-400">
                Catalogo
              </span>
            </div>

            {produtos.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {produtos.map((produto) => (
                  <ProdutoCard
                    key={produto.id}
                    lojaSlug={loja.slug}
                    produto={produto}
                    primaryColor={primaryColor}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-[1.4rem] bg-white px-5 py-10 text-center shadow-sm">
                <div
                  className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <ShoppingBagIcon className="h-7 w-7" />
                </div>
                <h3 className="mt-4 text-sm font-black text-zinc-950">
                  Catalogo em montagem
                </h3>
                <p className="mt-2 text-xs font-medium leading-5 text-zinc-400">
                  Essa loja ainda nao publicou produtos. Volte em breve para
                  conferir as novidades.
                </p>
              </div>
            )}
          </section>

          <nav className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2">
            <div className="flex h-16 items-center justify-around rounded-[1.5rem] bg-[#111827] px-4 text-white shadow-2xl shadow-black/30">
              <Link
                href={`/${loja.slug}`}
                className="flex flex-col items-center gap-1"
              >
                <HomeIcon className="h-5 w-5" />
                <span className="text-[10px] font-semibold">Home</span>
              </Link>

              <a
                href="#produtos"
                className="flex flex-col items-center gap-1 text-zinc-500"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                <span className="text-[10px] font-semibold">Buscar</span>
              </a>

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
                  0
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
    </>
  );
}

function ProdutoCard({
  lojaSlug,
  produto,
  primaryColor,
}: {
  lojaSlug: string;
  produto: Produto;
  primaryColor: string;
}) {
  const semEstoque = Number(produto.estoque ?? 0) <= 0;

  return (
    <Link
      href={`/${lojaSlug}/${produto.id}`}
      className="group overflow-hidden rounded-[1.4rem] bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-zinc-200"
    >
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[1.1rem] bg-zinc-100">
        {produto.imagem_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={produto.imagem_url}
            alt={produto.nome}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <ShoppingBagIcon className="h-12 w-12 text-zinc-300" />
        )}

        <button className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-400 shadow-sm backdrop-blur">
          <HeartIcon className="h-4 w-4" />
        </button>

        {semEstoque && (
          <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-bold text-zinc-500 shadow-sm backdrop-blur">
            Sem estoque
          </span>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-center gap-1">
          <p className="truncate text-xs font-bold text-zinc-900">
            Produto
          </p>
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
          <span className="text-[11px] font-semibold text-zinc-400">
            {semEstoque ? 'Indisponivel' : 'Disponivel'}
          </span>
        </div>

        <h3 className="mt-1 line-clamp-2 min-h-[32px] text-xs font-medium leading-4 text-zinc-500">
          {produto.nome}
        </h3>

        <div className="mt-2 flex flex-wrap items-end gap-1.5">
          <p className="text-sm font-black text-zinc-950">
            {formatCurrency(produto.preco_promocional || produto.preco)}
          </p>

          {produto.preco_promocional && (
            <p className="pb-0.5 text-[10px] font-semibold text-zinc-300 line-through">
              {formatCurrency(produto.preco)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3 text-center shadow-sm">
      <p className="text-lg font-black text-zinc-950">{value}</p>
      <p className="mt-0.5 text-[10px] font-bold uppercase text-zinc-400">
        {label}
      </p>
    </div>
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
      banner_url,
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

const getProdutosByLojaId = cache(async (lojaId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('produtos')
    .select(
      `
      id,
      nome,
      descricao,
      preco,
      preco_promocional,
      imagem_url,
      estoque,
      ativo
    `,
    )
    .eq('loja_id', lojaId)
    .eq('ativo', true);

  if (error) {
    throw error;
  }

  return data || [];
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

function formatCurrency(value: number | string | null) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0));
}
