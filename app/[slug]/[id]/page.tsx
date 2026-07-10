import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import {
  ArrowLeftIcon,
  HeartIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { createClient } from '@/app/lib/supabase/server';

type Produto = {
  id: string;
  loja_id: string;
  nome: string;
  descricao: string | null;
  preco: number | string | null;
  preco_promocional: number | string | null;
  imagem_url: string | null;
  estoque: number | null;
  ativo: boolean | null;
};

type Loja = {
  id: string;
  nome: string;
  slug: string;
  cor_primaria: string | null;
  banner_url: string | null;
  ativa: boolean;
};

type ProdutoPageProps = {
  params: Promise<{
    slug: string;
    id: string;
  }>;
};

export default async function ProdutoPage({ params }: ProdutoPageProps) {
  const { slug, id } = await params;
  const loja = await getLojaBySlug(slug);

  if (!loja) {
    notFound();
  }

  const produto = await getProdutoById(loja.id, id);

  if (!produto) {
    notFound();
  }

  const primaryColor = getSafeStoreColor(loja.cor_primaria);
  const semEstoque = Number(produto.estoque ?? 0) <= 0;
  const imagens = produto.imagem_url ? [produto.imagem_url] : [];

  return (
    <main className="min-h-screen bg-[#f3f3f5] text-zinc-950">
      <div className="mx-auto min-h-screen max-w-md bg-[#f7f7f8] pb-32 shadow-2xl shadow-zinc-300/70">
        <header className="sticky top-0 z-30 bg-[#f7f7f8]/90 px-5 pb-3 pt-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <Link
              href={`/${loja.slug}`}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-800 shadow-sm"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>

            <p className="text-sm font-black">Detalhes do produto</p>

            <Link
              href={`/${loja.slug}/carrinho`}
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-800 shadow-sm"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span
                className="absolute right-2 top-2 h-2 w-2 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
            </Link>
          </div>
        </header>

        <section className="px-5 pt-3">
          {imagens.length > 0 && (
            <div className="flex gap-3">
              {imagens.map((imagem) => (
                <button
                  key={imagem}
                  className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-black bg-white shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagem}
                    alt={`${produto.nome} miniatura`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="mt-5 flex aspect-square items-center justify-center overflow-hidden rounded-[2.2rem] bg-zinc-100">
            {produto.imagem_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={produto.imagem_url}
                alt={produto.nome}
                className="h-full w-full object-cover"
              />
            ) : (
              <ShoppingBagIcon className="h-20 w-20 text-zinc-300" />
            )}
          </div>
        </section>

        <section className="relative z-10 -mt-8 rounded-t-[2.4rem] bg-white px-5 pb-8 pt-6 shadow-2xl shadow-zinc-300/60">
          <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-zinc-200" />

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
                {loja.nome}
              </p>

              <h1 className="mt-2 text-2xl font-black leading-7 text-zinc-950">
                {produto.nome}
              </h1>

              <div className="mt-3 inline-flex rounded-full bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-500">
                {semEstoque ? 'Sem estoque' : `${produto.estoque ?? 0} em estoque`}
              </div>
            </div>

            <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
              <HeartIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-2">
            <p className="text-3xl font-black text-zinc-950">
              {formatCurrency(produto.preco_promocional || produto.preco)}
            </p>

            {produto.preco_promocional && (
              <p className="pb-1 text-sm font-bold text-zinc-300 line-through">
                {formatCurrency(produto.preco)}
              </p>
            )}
          </div>

          <div className="mt-7">
            <h2 className="text-sm font-black">Descricao</h2>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              {produto.descricao ||
                'O lojista ainda nao adicionou uma descricao para este produto.'}
            </p>
          </div>

          <div className="mt-7 rounded-[1.4rem] bg-zinc-100 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-zinc-700 shadow-sm">
                <TruckIcon className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-black text-zinc-950">
                  Entrega e retirada
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Escolha a melhor opcao no checkout. O lojista confirma os
                  detalhes apos o pedido.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between rounded-[1.4rem] border border-zinc-100 bg-white p-2 shadow-sm">
            <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
              <MinusIcon className="h-5 w-5" />
            </button>

            <span className="text-sm font-black">1</span>

            <button
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </section>

        <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-zinc-200/80 bg-white/90 px-5 py-4 backdrop-blur-xl">
          <div className="flex gap-3">
            <button
              disabled={semEstoque}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-black text-white shadow-xl disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
              style={semEstoque ? undefined : { backgroundColor: primaryColor }}
            >
              Comprar agora
            </button>

            <button
              disabled={semEstoque}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white text-sm font-black text-zinc-950 disabled:cursor-not-allowed disabled:text-zinc-300"
            >
              Add carrinho
              <ShoppingCartIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

const getLojaBySlug = cache(async (slug: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lojas')
    .select('id, nome, slug, cor_primaria, banner_url, ativa')
    .eq('slug', slug)
    .eq('ativa', true)
    .maybeSingle<Loja>();

  if (error) {
    throw error;
  }

  return data;
});

const getProdutoById = cache(async (lojaId: string, id: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('produtos')
    .select(
      `
      id,
      loja_id,
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
    .eq('id', id)
    .eq('ativo', true)
    .maybeSingle<Produto>();

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

function formatCurrency(value: number | string | null) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0));
}
