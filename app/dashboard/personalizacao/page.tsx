import Link from 'next/link';
import {
  ArrowRightIcon,
  DevicePhoneMobileIcon,
  PaintBrushIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

export default function PersonalizacaoPage() {
  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-400">
            <PaintBrushIcon className="h-4 w-4" />
            Aparência da loja
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
            Personalização
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-500">
            Escolha um tema para sua loja e deixe cada detalhe com a cara da sua marca.
          </p>
        </div>

        <span className="w-fit rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-500">
          1 tema disponível
        </span>
      </div>

      <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <article className="group overflow-hidden rounded-[2rem] border border-zinc-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-200/70">
          <div className="relative h-[330px] overflow-hidden rounded-[1.45rem] bg-[#ebe9ff] p-6">
            <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#cfc7ff] blur-2xl" />
            <div className="absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-white/80 blur-2xl" />

            <div className="relative mx-auto h-[292px] w-[150px] rounded-[2rem] border-[6px] border-zinc-950 bg-[#f7f7f8] p-2 shadow-2xl shadow-violet-950/20">
              <div className="mx-auto h-2 w-12 rounded-full bg-zinc-950" />
              <div className="mt-3 flex items-center justify-between">
                <div className="h-5 w-5 rounded-lg bg-zinc-950" />
                <div className="h-2 w-12 rounded-full bg-zinc-200" />
              </div>
              <div className="mt-3 h-20 rounded-xl bg-gradient-to-br from-[#8375e8] to-zinc-900 p-3">
                <div className="h-2 w-14 rounded bg-white/90" />
                <div className="mt-2 h-1.5 w-20 rounded bg-white/40" />
                <div className="mt-4 h-4 w-10 rounded-md bg-white" />
              </div>
              <div className="mt-3 flex gap-2">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-8 flex-1 rounded-lg bg-white shadow-sm" />
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[0, 1].map((item) => (
                  <div key={item} className="rounded-lg bg-white p-1.5 shadow-sm">
                    <div className="h-14 rounded-md bg-zinc-100" />
                    <div className="mt-2 h-1.5 w-10 rounded bg-zinc-300" />
                    <div className="mt-1 h-1.5 w-7 rounded bg-zinc-900" />
                  </div>
                ))}
              </div>
            </div>

            <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-black text-zinc-950 shadow-sm backdrop-blur">
              <SparklesIcon className="h-3.5 w-3.5" /> Tema atual
            </span>
          </div>

          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-zinc-950">Moode Mobile</h2>
                <p className="mt-1 text-sm font-medium text-zinc-500">
                  Moderno, leve e pensado primeiro para celulares.
                </p>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f4f2ff] text-zinc-950">
                <DevicePhoneMobileIcon className="h-5 w-5" />
              </div>
            </div>

            <Link
              href="/dashboard/personalizacao/moode-mobile"
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 text-sm font-black text-white transition hover:bg-zinc-800"
            >
              Personalizar
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
