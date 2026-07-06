import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  Cog6ToothIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { createClient } from '@/app/lib/supabase/server';
import {
  DashboardMobileNavigation,
  DashboardNavigation,
} from './DashboardNavigation';

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

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-zinc-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-[272px] shrink-0 border-r border-zinc-200/80 bg-[#ebebe7] px-3 py-4 lg:block">
          <div className="flex h-full flex-col">
            <Link href="/dashboard" className="flex items-center gap-3 px-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-purple-100 text-purple-800 shadow-sm ring-1 ring-purple-200/70">
                <ShoppingBagIcon className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <p className="text-base font-bold tracking-tight">
                  lojacomapp
                </p>
                <p className="text-xs font-medium text-zinc-500">
                  Painel do lojista
                </p>
              </div>
            </Link>

            <div className="mt-5 px-1">
              <div className="flex h-10 items-center gap-3 rounded-lg border border-zinc-200 bg-white px-3 shadow-sm">
                <MagnifyingGlassIcon className="h-5 w-5 text-zinc-400" />
                <input
                  placeholder="Buscar..."
                  className="h-full w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div className="mt-6 px-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                Principal
              </p>
            </div>

            <DashboardNavigation />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/85 px-5 py-4 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-800">
                  <ShoppingBagIcon className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-bold tracking-tight">
                    lojacomapp
                  </p>
                  <p className="text-xs font-medium text-zinc-400">
                    Dashboard
                  </p>
                </div>
              </Link>

              <Link
                href="/dashboard/configuracoes"
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-500"
              >
                <Cog6ToothIcon className="h-5 w-5" />
              </Link>
            </div>

            <DashboardMobileNavigation />
          </header>

          <main className="flex-1 p-5 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
