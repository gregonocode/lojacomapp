import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowRightIcon,
  CubeIcon,
  EyeIcon,
  PlusIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { createClient } from '@/app/lib/supabase/server';

type Produto = {
  id: string;
  nome?: string | null;
  marca?: string | null;
  descricao?: string | null;
  preco?: number | string | null;
  preco_antigo?: number | string | null;
  imagem_url?: string | null;
  ativo?: boolean | null;
  estoque?: number | null;
  created_at?: string | null;
};

function formatCurrency(value: number | string | null | undefined) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0));
}

export default async function ProdutosPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: loja } = await supabase
    .from('lojas')
    .select('id, nome, slug')
    .eq('proprietario_id', user.id)
    .maybeSingle();

  if (!loja) {
    return <EmptyStoreState />;
  }

  const { data: produtos } = await supabase
    .from('produtos')
    .select('*')
    .eq('loja_id', loja.id)
    .order('created_at', { ascending: false });

  const produtosDaLoja = (produtos || []) as Produto[];
  const produtosAtivos = produtosDaLoja.filter(
    (produto) => produto.ativo !== false,
  ).length;

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-xs font-bold text-purple-800 shadow-sm">
            <SparklesIcon className="h-4 w-4 text-purple-700" />
            Catalogo da loja
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-zinc-950 lg:text-5xl">
            Produtos
          </h1>

          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-zinc-500">
            Cadastre, revise e acompanhe os itens que aparecem na sua loja
            virtual.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard/produtos/novo"
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-purple-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-purple-800"
          >
            Novo produto
            <PlusIcon className="h-4 w-4" />
          </Link>

          <Link
            href={`/${loja.slug}`}
            target="_blank"
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 text-sm font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            Ver loja
            <EyeIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mt-7 grid gap-4 md:grid-cols-3">
        <SummaryCard title="Total" value={String(produtosDaLoja.length)} />
        <SummaryCard title="Ativos" value={String(produtosAtivos)} />
        <SummaryCard
          title="Inativos"
          value={String(produtosDaLoja.length - produtosAtivos)}
        />
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-5 lg:px-6">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-zinc-950">
              Lista de produtos
            </h2>
            <p className="mt-1 text-sm font-medium text-zinc-400">
              Itens cadastrados para {loja.nome}.
            </p>
          </div>
        </div>

        {produtosDaLoja.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {produtosDaLoja.map((produto) => (
              <article
                key={produto.id}
                className="grid gap-4 px-5 py-4 transition hover:bg-zinc-50 md:grid-cols-[1fr_auto] md:items-center lg:px-6"
              >
                <div className="flex min-w-0 gap-4">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-zinc-100 text-zinc-400">
                    {produto.imagem_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={produto.imagem_url}
                        alt={produto.nome || 'Produto'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ShoppingBagIcon className="h-8 w-8" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-bold text-zinc-950">
                        {produto.nome || 'Produto sem nome'}
                      </h3>

                      <span
                        className={[
                          'rounded-full border px-2 py-1 text-[10px] font-bold',
                          produto.ativo === false
                            ? 'border-zinc-200 bg-zinc-50 text-zinc-500'
                            : 'border-emerald-200 bg-emerald-50 text-emerald-700',
                        ].join(' ')}
                      >
                        {produto.ativo === false ? 'Inativo' : 'Ativo'}
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-medium text-zinc-400">
                      {produto.marca || 'Sem marca'} • Estoque:{' '}
                      {produto.estoque ?? 0}
                    </p>

                    {produto.descricao && (
                      <p className="mt-2 line-clamp-2 max-w-3xl text-sm font-medium leading-6 text-zinc-500">
                        {produto.descricao}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 md:justify-end">
                  <div className="text-left md:text-right">
                    <p className="text-base font-black text-zinc-950">
                      {formatCurrency(produto.preco)}
                    </p>
                    {produto.preco_antigo && (
                      <p className="text-xs font-bold text-zinc-300 line-through">
                        {formatCurrency(produto.preco_antigo)}
                      </p>
                    )}
                  </div>

                  <Link
                    href={`/${loja.slug}/${produto.id}`}
                    target="_blank"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-950"
                    aria-label={`Abrir produto ${produto.nome || produto.id}`}
                  >
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-50 text-purple-700">
              <CubeIcon className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-zinc-950">
              Nenhum produto cadastrado
            </h2>

            <p className="mt-2 max-w-md text-sm font-medium leading-6 text-zinc-400">
              Crie seu primeiro produto para comecar a montar o catalogo da
              loja.
            </p>

            <Link
              href="/dashboard/produtos/novo"
              className="mt-6 flex h-11 items-center justify-center gap-2 rounded-lg bg-purple-700 px-5 text-sm font-bold text-white transition hover:bg-purple-800"
            >
              Cadastrar produto
              <PlusIcon className="h-4 w-4" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-zinc-400">{title}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-950">
        {value}
      </p>
    </div>
  );
}

function EmptyStoreState() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center">
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-800">
          <ShoppingBagIcon className="h-8 w-8" />
        </div>

        <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-950">
          Configure sua loja primeiro
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-zinc-500">
          Antes de cadastrar produtos, crie a loja que vai receber esse
          catalogo.
        </p>

        <Link
          href="/dashboard/configuracoes"
          className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-purple-700 px-6 text-sm font-bold text-white transition hover:bg-purple-800"
        >
          Configurar loja
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
