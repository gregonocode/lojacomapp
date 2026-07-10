'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  BellIcon,
  CheckIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  ChevronDownIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  EyeIcon,
  HeartIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  PaintBrushIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { createClient } from '@/app/lib/supabase/client';

type Store = { id: string; nome: string; slug: string; descricao: string; logoUrl: string | null; primaryColor: string; bannerUrl: string | null };

const sections = [
  { name: 'Cores', description: 'Paleta principal', icon: PaintBrushIcon },
  { name: 'Cabeçalho', description: 'Logo e navegação', icon: Squares2X2Icon },
  { name: 'Banner principal', description: 'Chamada de destaque', icon: EyeIcon },
  { name: 'Produtos', description: 'Cards e catálogo', icon: ShoppingBagIcon },
];

export default function ThemeEditor({ themeId, userId, store }: { themeId: string; userId: string; store: Store }) {
  const router = useRouter();
  const supabase = createClient();
  const [color, setColor] = useState(/^#[0-9a-f]{6}$/i.test(store.primaryColor) ? store.primaryColor : '#7367d9');
  const [rounded, setRounded] = useState(true);
  const [activeSection, setActiveSection] = useState('Cores');
  const [bannerUrl, setBannerUrl] = useState(store.bannerUrl || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function uploadBanner(file: File) {
    setError(null);
    setMessage(null);
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Envie um banner PNG, JPG ou WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('O banner deve ter no máximo 5 MB.');
      return;
    }
    setUploading(true);
    try {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'webp';
      const path = `${userId}/banners/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('loja-assets').upload(path, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('loja-assets').getPublicUrl(path);
      setBannerUrl(data.publicUrl);
      setMessage('Banner enviado. Clique em Salvar para publicá-lo.');
    } catch (uploadError) {
      setError(getErrorMessage(uploadError, 'Não foi possível enviar o banner.'));
    } finally {
      setUploading(false);
    }
  }

  async function saveTheme() {
    if (!store.id) {
      setError('Configure sua loja antes de personalizar o tema.');
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const { error: updateError } = await supabase.from('lojas').update({ cor_primaria: color, banner_url: bannerUrl || null, updated_at: new Date().toISOString() }).eq('id', store.id);
      if (updateError) throw updateError;
      setMessage('Tema publicado com sucesso.');
      router.refresh();
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Não foi possível salvar o tema.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="-mx-4 -my-5 flex min-h-[calc(100vh-8.6rem)] flex-col bg-white sm:-mx-5 lg:-mx-6 lg:-my-6 lg:min-h-[calc(100vh-5.75rem)]">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/personalizacao" className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50">
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400">Editando tema</p>
            <h1 className="text-base font-black text-zinc-950">{themeId === 'moode-mobile' ? 'Moode Mobile' : themeId}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/${store.slug}`} target="_blank" className="hidden h-10 items-center gap-2 rounded-xl border border-zinc-200 px-4 text-xs font-bold text-zinc-700 sm:flex">
            <EyeIcon className="h-4 w-4" /> Ver loja
          </Link>
          <button onClick={saveTheme} disabled={saving || uploading} className="flex h-10 items-center gap-2 rounded-xl bg-zinc-950 px-4 text-xs font-black text-white disabled:opacity-50">
            <CheckIcon className="h-4 w-4" /> {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[290px_1fr]">
        <aside className="border-b border-zinc-200 bg-[#fafaf8] p-4 lg:border-b-0 lg:border-r">
          <p className="px-2 text-xs font-black uppercase tracking-[0.15em] text-zinc-400">Configurações</p>
          <div className="mt-3 space-y-2">
            {sections.map((section) => (
              <button onClick={() => setActiveSection(section.name)} key={section.name} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left ${activeSection === section.name ? 'border-zinc-200 bg-white shadow-sm' : 'border-transparent hover:bg-white'}`}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0edff] text-zinc-800"><section.icon className="h-5 w-5" /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-black">{section.name}</span><span className="block text-[11px] font-medium text-zinc-400">{section.description}</span></span>
                <ChevronDownIcon className="h-4 w-4 -rotate-90 text-zinc-400" />
              </button>
            ))}
          </div>

          {activeSection === 'Cores' && <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4">
            <label className="text-xs font-black text-zinc-800">Cor principal</label>
            <div className="mt-3 flex items-center gap-3">
              <input type="color" value={color} onChange={(event) => setColor(event.target.value)} className="h-10 w-12 cursor-pointer rounded-lg border-0 bg-transparent" />
              <input value={color.toUpperCase()} onChange={(event) => /^#[0-9a-f]{0,6}$/i.test(event.target.value) && setColor(event.target.value)} className="h-10 min-w-0 flex-1 rounded-xl border border-zinc-200 px-3 text-xs font-bold uppercase outline-none focus:border-zinc-400" />
            </div>
            <label className="mt-4 flex items-center justify-between gap-3 text-xs font-bold text-zinc-700">
              Cantos arredondados
              <button onClick={() => setRounded(!rounded)} className={`relative h-6 w-11 rounded-full transition ${rounded ? 'bg-zinc-950' : 'bg-zinc-200'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${rounded ? 'left-6' : 'left-1'}`} /></button>
            </label>
          </div>}

          {activeSection === 'Banner principal' && <div className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-black text-zinc-800">Imagem do banner</p>
            <p className="mt-1 text-[11px] leading-4 text-zinc-400">Recomendado: 1200 × 600 px, JPG, PNG ou WEBP.</p>
            {bannerUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={bannerUrl} alt="Prévia do banner" className="mt-3 aspect-[2/1] w-full rounded-xl object-cover" />
            )}
            <label className="mt-3 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-3 py-4 text-xs font-black text-zinc-700 hover:bg-zinc-100">
              <CloudArrowUpIcon className="h-5 w-5" />
              {uploading ? 'Enviando...' : bannerUrl ? 'Trocar imagem' : 'Enviar imagem'}
              <input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading} className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadBanner(file); }} />
            </label>
            {bannerUrl && <button onClick={() => setBannerUrl('')} className="mt-2 w-full text-center text-[11px] font-bold text-red-500">Remover banner</button>}
          </div>}

          {(message || error) && <div className={`mt-4 flex gap-2 rounded-xl border px-3 py-3 text-xs font-bold ${error ? 'border-red-200 bg-red-50 text-red-600' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            {!error && <CheckCircleIcon className="h-4 w-4 shrink-0" />}{error || message}
          </div>}
        </aside>

        <main className="relative flex min-h-[700px] items-start justify-center overflow-hidden bg-[#ececea] p-5 sm:p-8">
          <div className="absolute left-5 top-5 hidden items-center rounded-xl border border-zinc-200 bg-white p-1 shadow-sm sm:flex">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white"><DevicePhoneMobileIcon className="h-4 w-4" /></button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400"><ComputerDesktopIcon className="h-4 w-4" /></button>
          </div>
          <div className="w-full max-w-[390px] overflow-hidden rounded-[2.5rem] border-[8px] border-zinc-950 bg-[#f7f7f8] shadow-2xl shadow-zinc-500/30">
            <div className="mx-auto mt-2 h-5 w-24 rounded-full bg-zinc-950" />
            <div className="max-h-[720px] overflow-hidden px-4 pb-5 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl text-white" style={{ backgroundColor: color }}>
                    {store.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={store.logoUrl} alt="" className="h-full w-full object-cover" />
                    ) : <ShoppingBagIcon className="h-5 w-5" />}
                  </div>
                  <div><p className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Loja oficial</p><p className="max-w-36 truncate text-sm font-black">{store.nome}</p></div>
                </div>
                <div className="flex gap-2"><BellIcon className="h-8 w-8 rounded-xl bg-white p-2" /><ShoppingCartIcon className="h-8 w-8 rounded-xl bg-white p-2" /></div>
              </div>
              <div className="mt-4 flex h-10 items-center gap-2 rounded-xl bg-white px-3 text-zinc-400"><MagnifyingGlassIcon className="h-4 w-4" /><span className="text-[10px]">Buscar produtos...</span></div>
              <div className={`${rounded ? 'rounded-[1.5rem]' : 'rounded-md'} relative mt-4 min-h-[164px] overflow-hidden bg-cover bg-center p-5 text-white transition-all`} style={{ backgroundColor: color, backgroundImage: bannerUrl ? `url("${bannerUrl}")` : `linear-gradient(135deg, ${color}, #111827)` }}>
                {!bannerUrl && <><p className="text-[9px] font-bold text-white/70">/{store.slug}</p><h2 className="mt-1 text-2xl font-black">{store.nome}</h2><p className="mt-2 max-w-[65%] text-[9px] leading-4 text-white/70">{store.descricao}</p><button className="mt-4 rounded-lg bg-white px-3 py-2 text-[9px] font-black text-zinc-950">Comprar agora</button><ShoppingBagIcon className="absolute bottom-5 right-5 h-20 w-20 rotate-[-8deg] rounded-3xl bg-white/20 p-5" /></>}
              </div>
              <div className="mt-5 flex items-center justify-between"><h3 className="text-sm font-black">Categorias</h3><span className="text-[9px] font-bold text-zinc-400">8 itens</span></div>
              <div className="mt-3 flex gap-2">{['Todos', 'Novidades', 'Ofertas'].map((item, index) => <div key={item} className={`${rounded ? 'rounded-xl' : 'rounded-md'} flex-1 px-2 py-3 text-center text-[8px] font-bold ${index === 0 ? 'text-white' : 'bg-white text-zinc-500'}`} style={index === 0 ? { backgroundColor: color } : undefined}>{item}</div>)}</div>
              <h3 className="mt-5 text-sm font-black">Produtos</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">{[0, 1].map((item) => <div key={item} className={`${rounded ? 'rounded-2xl' : 'rounded-md'} bg-white p-2`}><div className={`${rounded ? 'rounded-xl' : 'rounded-sm'} h-24 bg-zinc-100`} /><p className="mt-2 text-[9px] font-bold">Produto selecionado</p><p className="mt-1 text-xs font-black">R$ 49,90</p></div>)}</div>
            </div>
            <div className="mx-3 mb-3 flex h-14 items-center justify-around rounded-2xl bg-zinc-950 text-white"><HomeIcon className="h-4 w-4" /><MagnifyingGlassIcon className="h-4 w-4 text-zinc-500" /><ShoppingCartIcon className="h-9 w-9 rounded-xl bg-white p-2" style={{ color }} /><HeartIcon className="h-4 w-4 text-zinc-500" /></div>
          </div>
        </main>
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') return error.message;
  return fallback;
}
