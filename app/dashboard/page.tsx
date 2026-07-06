import Link from 'next/link';
import {
  ArrowRightIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ClockIcon,
  CubeIcon,
  CursorArrowRaysIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { createClient } from '@/app/lib/supabase/server';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: loja } = await supabase
    .from('lojas')
    .select('id, nome, slug, ativa')
    .eq('proprietario_id', user?.id)
    .maybeSingle();

  const lojaId = loja?.id;

  const [
    produtosResponse,
    pedidosResponse,
    pedidosNovosResponse,
    pedidosEntreguesResponse,
    pedidosRecentesResponse,
  ] = await Promise.all([
    lojaId
      ? supabase
          .from('produtos')
          .select('id', { count: 'exact', head: true })
          .eq('loja_id', lojaId)
      : Promise.resolve({ count: 0 }),

    lojaId
      ? supabase
          .from('pedidos')
          .select('id,total', { count: 'exact' })
          .eq('loja_id', lojaId)
      : Promise.resolve({ count: 0, data: [] }),

    lojaId
      ? supabase
          .from('pedidos')
          .select('id', { count: 'exact', head: true })
          .eq('loja_id', lojaId)
          .eq('status', 'novo')
      : Promise.resolve({ count: 0 }),

    lojaId
      ? supabase
          .from('pedidos')
          .select('id', { count: 'exact', head: true })
          .eq('loja_id', lojaId)
          .eq('status', 'entregue')
      : Promise.resolve({ count: 0 }),

    lojaId
      ? supabase
          .from('pedidos')
          .select(
            'id, codigo, cliente_nome, cliente_telefone, total, status, created_at',
          )
          .eq('loja_id', lojaId)
          .order('created_at', { ascending: false })
          .limit(5)
      : Promise.resolve({ data: [] }),
  ]);

  const totalProdutos = produtosResponse.count || 0;
  const totalPedidos = pedidosResponse.count || 0;
  const pedidosNovos = pedidosNovosResponse.count || 0;
  const pedidosEntregues = pedidosEntreguesResponse.count || 0;
  const pedidos = pedidosResponse.data || [];
  const pedidosRecentes = pedidosRecentesResponse.data || [];

  const faturamento = pedidos.reduce((acc, pedido) => {
    return acc + Number(pedido.total || 0);
  }, 0);

  if (!loja) {
    return <EmptyStoreState />;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-xs font-bold text-purple-800 shadow-sm">
            <SparklesIcon className="h-4 w-4 text-purple-700" />
            Dashboard da loja
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-zinc-950 lg:text-5xl">
            Boa tarde, {loja.nome}
          </h1>

          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-zinc-500">
            Acompanhe seus pedidos, produtos e as principais informações da sua
            loja virtual.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard/produtos/novo"
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-purple-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-purple-800"
          >
            Novo produto
            <ArrowRightIcon className="h-4 w-4" />
          </Link>

          <Link
            href={`/${loja.slug}`}
            target="_blank"
            className="flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-5 text-sm font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            Ver loja
            <CursorArrowRaysIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Faturamento"
          value={formatCurrency(faturamento)}
          description="Total registrado em pedidos"
          icon={BanknotesIcon}
        />

        <MetricCard
          title="Pedidos"
          value={String(totalPedidos)}
          description={`${pedidosNovos} novos pedidos`}
          icon={ShoppingCartIcon}
        />

        <MetricCard
          title="Produtos"
          value={String(totalProdutos)}
          description="Produtos cadastrados"
          icon={CubeIcon}
        />

        <MetricCard
          title="Entregues"
          value={String(pedidosEntregues)}
          description="Pedidos finalizados"
          icon={CheckCircleIcon}
        />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_0.85fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-zinc-950">
                Pedidos recentes
              </h2>
              <p className="mt-1 text-sm font-medium text-zinc-400">
                Últimos pedidos recebidos na sua loja.
              </p>
            </div>

            <Link
              href="/dashboard/pedidos"
              className="hidden h-10 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-600 transition hover:bg-zinc-50 sm:flex"
            >
              Ver todos
            </Link>
          </div>

          <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200">
            {pedidosRecentes.length > 0 ? (
              <div className="divide-y divide-zinc-100">
                {pedidosRecentes.map((pedido) => (
                  <Link
                    key={pedido.id}
                    href={`/dashboard/pedidos/${pedido.id}`}
                    className="flex items-center justify-between gap-4 bg-white p-4 transition hover:bg-zinc-50"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-bold text-zinc-950">
                          {pedido.cliente_nome}
                        </p>

                        <StatusBadge status={pedido.status} />
                      </div>

                      <p className="mt-1 text-xs font-medium text-zinc-400">
                        {pedido.codigo || pedido.id.slice(0, 8)} •{' '}
                        {pedido.cliente_telefone || 'Sem telefone'}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-zinc-950">
                        {formatCurrency(Number(pedido.total || 0))}
                      </p>
                      <p className="mt-1 text-xs font-medium text-zinc-400">
                        {new Date(pedido.created_at).toLocaleDateString(
                          'pt-BR',
                        )}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                  <ShoppingCartIcon className="h-7 w-7" />
                </div>

                <h3 className="mt-4 text-sm font-bold text-zinc-950">
                  Nenhum pedido ainda
                </h3>

                <p className="mt-2 max-w-sm text-sm font-medium leading-6 text-zinc-400">
                  Quando seus clientes fizerem pedidos, eles vão aparecer aqui.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-800">
              <ShoppingBagIcon className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-lg font-bold tracking-tight text-zinc-950">
              Loja online
            </h2>

            <p className="mt-2 text-sm font-medium leading-6 text-zinc-400">
              Sua loja pública já está disponível para os clientes acessarem.
            </p>

            <div className="mt-5 rounded-xl border border-zinc-200 bg-[#f7f7f5] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-400">
                Link da loja
              </p>
              <p className="mt-1 truncate text-sm font-bold text-zinc-950">
                /{loja.slug}
              </p>
            </div>

            <Link
              href={`/${loja.slug}`}
              target="_blank"
              className="mt-5 flex h-11 items-center justify-center gap-2 rounded-lg bg-purple-700 text-sm font-bold text-white transition hover:bg-purple-800"
            >
              Abrir loja
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
                <ClockIcon className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-zinc-950">
                  Próximos passos
                </h2>
                <p className="text-xs font-medium text-zinc-400">
                  Configure o essencial da loja
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <ChecklistItem checked={totalProdutos > 0}>
                Cadastrar primeiro produto
              </ChecklistItem>

              <ChecklistItem checked={Boolean(loja.slug)}>
                Definir link da loja
              </ChecklistItem>

              <ChecklistItem checked={loja.ativa}>
                Loja ativa para vendas
              </ChecklistItem>

              <ChecklistItem checked={false}>
                Configurar entrega e retirada
              </ChecklistItem>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyStoreState() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-purple-100 to-transparent" />

        <div className="relative z-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-800">
            <ShoppingBagIcon className="h-8 w-8" />
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-zinc-950">
            Crie sua primeira loja
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-zinc-500">
            Antes de começar a cadastrar produtos, configure o nome, link e
            visual da sua loja online.
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
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-zinc-400">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-950">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-4 text-xs font-medium text-zinc-400">{description}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const label: Record<string, string> = {
    novo: 'Novo',
    aguardando_pagamento: 'Aguardando',
    pago: 'Pago',
    em_separacao: 'Separação',
    enviado: 'Enviado',
    entregue: 'Entregue',
    cancelado: 'Cancelado',
  };

  return (
    <span className="rounded-full border border-purple-100 bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-700">
      {label[status] || status}
    </span>
  );
}

function ChecklistItem({
  children,
  checked,
}: {
  children: React.ReactNode;
  checked: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-[#f7f7f5] px-3 py-3">
      <div
        className={[
          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
          checked
            ? 'border-purple-700 bg-purple-700 text-white'
            : 'border-zinc-200 bg-white text-transparent',
        ].join(' ')}
      >
        <CheckCircleIcon className="h-3.5 w-3.5" />
      </div>

      <p
        className={[
          'text-sm font-semibold',
          checked ? 'text-zinc-700' : 'text-zinc-400',
        ].join(' ')}
      >
        {children}
      </p>
    </div>
  );
}
