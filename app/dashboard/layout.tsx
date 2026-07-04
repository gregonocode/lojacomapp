import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowLeftOnRectangleIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  HomeIcon,
  PaintBrushIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  TagIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { createClient } from '@/app/lib/supabase/server';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
  },
  {
    name: 'Produtos',
    href: '/dashboard/produtos',
    icon: ShoppingBagIcon,
  },
  {
    name: 'Pedidos',
    href: '/dashboard/pedidos',
    icon: Squares2X2Icon,
  },
  {
    name: 'Categorias',
    href: '/dashboard/categorias',
    icon: TagIcon,
  },
  {
    name: 'Entrega',
    href: '/dashboard/entrega',
    icon: TruckIcon,
  },
  {
    name: 'Tema',
    href: '/dashboard/tema',
    icon: PaintBrushIcon,
  },
  {
    name: 'Relatórios',
    href: '/dashboard/relatorios',
    icon: ChartBarIcon,
  },
  {
    name: 'Configurações',
    href: '/dashboard/configuracoes',
    icon: Cog6ToothIcon,
  },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: perfil } = await supabase
    .from('perfis')
    .select('nome, email')
    .eq('id', user.id)
    .maybeSingle();

  const { data: loja } = await supabase
    .from('lojas')
    .select('id, nome, slug, logo_url, ativa')
    .eq('proprietario_id', user.id)
    .maybeSingle();

  const nomeUsuario =
    perfil?.nome || user.user_metadata?.nome || user.email?.split('@')[0] || 'Lojista';

  async function signOut() {
    'use server';

    const supabase = await createClient();
    await supabase.auth.signOut();

    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-zinc-950/80 p-4 lg:block">
          <div className="flex h-full flex-col">
            <div className="rounded-[1.5rem] border border-white/10 bg-black p-5">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black">
                  <ShoppingBagIcon className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-lg font-semibold tracking-[-0.03em]">
                    lojacomapp
                  </p>
                  <p className="text-xs text-zinc-500">Painel do lojista</p>
                </div>
              </Link>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-black p-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-600">
                Sua loja
              </p>

              <div className="mt-4 flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-zinc-900 text-sm font-semibold text-zinc-300">
                  {loja?.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={loja.logo_url}
                      alt={loja.nome}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    loja?.nome?.charAt(0)?.toUpperCase() || 'L'
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {loja?.nome || 'Loja não criada'}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {loja?.slug ? `/${loja.slug}` : 'Configure sua loja'}
                  </p>
                </div>
              </div>

              {loja?.slug ? (
                <Link
                  href={`/${loja.slug}`}
                  target="_blank"
                  className="mt-4 flex h-10 items-center justify-center rounded-xl bg-white text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  Ver loja
                </Link>
              ) : (
                <Link
                  href="/dashboard/configuracoes"
                  className="mt-4 flex h-10 items-center justify-center rounded-xl bg-white text-sm font-semibold text-black transition hover:bg-zinc-200"
                >
                  Criar loja
                </Link>
              )}
            </div>

            <nav className="mt-4 flex-1 space-y-1 rounded-[1.5rem] border border-white/10 bg-black p-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="group flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-zinc-400 transition hover:bg-white hover:text-black"
                >
                  <item.icon className="h-5 w-5 shrink-0 transition group-hover:text-black" />
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-black p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                  {nomeUsuario.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {nomeUsuario}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {perfil?.email || user.email}
                  </p>
                </div>
              </div>

              <form action={signOut}>
                <button
                  type="submit"
                  className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 text-sm font-medium text-zinc-400 transition hover:bg-red-500/10 hover:text-red-300"
                >
                  <ArrowLeftOnRectangleIcon className="h-4 w-4" />
                  Sair
                </button>
              </form>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 px-5 py-4 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-black">
                  <ShoppingBagIcon className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-semibold">lojacomapp</p>
                  <p className="text-xs text-zinc-500">Dashboard</p>
                </div>
              </Link>

              <Link
                href="/dashboard/configuracoes"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-400"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </Link>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {navigation.slice(0, 6).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-medium text-zinc-400"
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </div>
          </header>

          <main className="flex-1 p-5 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}