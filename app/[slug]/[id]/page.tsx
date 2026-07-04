import Link from 'next/link';
import {
  ArrowLeftIcon,
  HeartIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  StarIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';

const produtos = [
  {
    id: '1',
    nome: 'Nike Air Max 270 React',
    marca: 'Nike',
    preco: 145,
    precoAntigo: 180,
    nota: 4.9,
    avaliacoes: 256,
    descricao:
      'Tênis clássico com visual moderno, confortável para o dia a dia e perfeito para compor looks casuais. Possui acabamento premium, solado macio e ótimo encaixe nos pés.',
    imagem:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
    imagens: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1000&auto=format&fit=crop',
    ],
  },
  {
    id: '2',
    nome: 'Adidas Ultraboost 22',
    marca: 'Adidas',
    preco: 190,
    precoAntigo: null,
    nota: 4.8,
    avaliacoes: 180,
    descricao:
      'Modelo confortável, leve e ideal para quem busca estilo e praticidade. Perfeito para usar no trabalho, passeio ou no dia a dia.',
    imagem:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop',
    imagens: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1000&auto=format&fit=crop',
    ],
  },
];

const tamanhos = ['38', '39', '40', '41', '42', '43', '44'];

type ProdutoPageProps = {
  params: Promise<{
    slug: string;
    id: string;
  }>;
};

export default async function ProdutoPage({ params }: ProdutoPageProps) {
  const { slug, id } = await params;

  const produto = produtos.find((item) => item.id === id) || produtos[0];

  return (
    <main className="min-h-screen bg-[#f3f3f5] text-zinc-950">
      <div className="mx-auto min-h-screen max-w-md bg-[#f7f7f8] pb-32 shadow-2xl shadow-zinc-300/70">
        <header className="sticky top-0 z-30 bg-[#f7f7f8]/90 px-5 pb-3 pt-5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <Link
              href={`/${slug}`}
              className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-800 shadow-sm"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>

            <p className="text-sm font-black tracking-[-0.03em]">
              Detalhes do produto
            </p>

            <Link
              href={`/${slug}/carrinho`}
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-800 shadow-sm"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500" />
            </Link>
          </div>
        </header>

        <section className="px-5 pt-3">
          <div className="flex gap-3">
            {produto.imagens.map((imagem, index) => (
              <button
                key={imagem}
                className={[
                  'flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border bg-white shadow-sm',
                  index === 0 ? 'border-black' : 'border-transparent',
                ].join(' ')}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagem}
                  alt={`${produto.nome} miniatura ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>

          <div className="mt-5 flex aspect-square items-center justify-center overflow-hidden rounded-[2.2rem] bg-zinc-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={produto.imagem}
              alt={produto.nome}
              className="h-full w-full object-cover"
            />
          </div>
        </section>

        <section className="relative z-10 -mt-8 rounded-t-[2.4rem] bg-white px-5 pb-8 pt-6 shadow-2xl shadow-zinc-300/60">
          <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-zinc-200" />

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
                {produto.marca}
              </p>

              <h1 className="mt-2 text-2xl font-black leading-7 tracking-[-0.05em] text-zinc-950">
                {produto.nome}
              </h1>

              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <StarIcon className="h-4 w-4 fill-orange-400 text-orange-400" />
                  <span className="text-sm font-bold text-zinc-900">
                    {produto.nota}
                  </span>
                </div>

                <span className="text-xs font-medium text-zinc-400">
                  ({produto.avaliacoes} avaliações)
                </span>
              </div>
            </div>

            <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
              <HeartIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 flex items-end gap-2">
            <p className="text-3xl font-black tracking-[-0.06em] text-zinc-950">
              {formatCurrency(produto.preco)}
            </p>

            {produto.precoAntigo && (
              <p className="pb-1 text-sm font-bold text-zinc-300 line-through">
                {formatCurrency(produto.precoAntigo)}
              </p>
            )}
          </div>

          <div className="mt-7">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black tracking-[-0.03em]">
                Escolha o tamanho
              </h2>

              <button className="text-xs font-semibold text-zinc-400">
                Guia de tamanho
              </button>
            </div>

            <div className="mt-4 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {tamanhos.map((tamanho) => {
                const ativo = tamanho === '42';

                return (
                  <button
                    key={tamanho}
                    className={[
                      'flex h-12 min-w-12 items-center justify-center rounded-2xl text-sm font-black transition',
                      ativo
                        ? 'bg-black text-white shadow-xl shadow-black/15'
                        : 'bg-zinc-100 text-zinc-500',
                    ].join(' ')}
                  >
                    {tamanho}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-7">
            <h2 className="text-sm font-black tracking-[-0.03em]">
              Descrição
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-500">
              {produto.descricao}
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
                  Escolha a melhor opção no checkout. O lojista confirma os
                  detalhes após o pedido.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-7 flex items-center justify-between rounded-[1.4rem] border border-zinc-100 bg-white p-2 shadow-sm">
            <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
              <MinusIcon className="h-5 w-5" />
            </button>

            <span className="text-sm font-black">1</span>

            <button className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white">
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        </section>

        <div className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-zinc-200/80 bg-white/90 px-5 py-4 backdrop-blur-xl">
          <div className="flex gap-3">
            <button className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-black text-sm font-black text-white shadow-xl shadow-black/20">
              Comprar agora
            </button>

            <button className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white text-sm font-black text-zinc-950">
              Add carrinho
              <ShoppingCartIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
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