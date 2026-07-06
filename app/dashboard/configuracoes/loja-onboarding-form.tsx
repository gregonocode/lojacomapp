'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  DevicePhoneMobileIcon,
  EyeIcon,
  PaintBrushIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { createClient } from '@/app/lib/supabase/client';

type Loja = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  logo_url: string | null;
  banner_url: string | null;
  cor_primaria: string | null;
  whatsapp: string | null;
  email_contato: string | null;
  endereco_loja: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
  pix_chave: string | null;
  pix_nome: string | null;
  ativa: boolean;
} | null;

type LojaOnboardingFormProps = {
  userId: string;
  userEmail: string;
  loja: Loja;
};

export default function LojaOnboardingForm({
  userId,
  userEmail,
  loja,
}: LojaOnboardingFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [nome, setNome] = useState(loja?.nome || '');
  const [slug, setSlug] = useState(loja?.slug || '');
  const [descricao, setDescricao] = useState(loja?.descricao || '');
  const [whatsapp, setWhatsapp] = useState(loja?.whatsapp || '');
  const [emailContato, setEmailContato] = useState(
    loja?.email_contato || userEmail,
  );
  const [corPrimaria, setCorPrimaria] = useState(
    loja?.cor_primaria || '#111827',
  );

  const [enderecoLoja, setEnderecoLoja] = useState(loja?.endereco_loja || '');
  const [cidade, setCidade] = useState(loja?.cidade || '');
  const [estado, setEstado] = useState(loja?.estado || '');
  const [cep, setCep] = useState(loja?.cep || '');

  const [pixChave, setPixChave] = useState(loja?.pix_chave || '');
  const [pixNome, setPixNome] = useState(loja?.pix_nome || '');

  const [logoUrl, setLogoUrl] = useState(loja?.logo_url || '');
  const [logoPreview, setLogoPreview] = useState(loja?.logo_url || '');

  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const lojaJaCriada = Boolean(loja?.id);

  const publicUrl = useMemo(() => {
    if (!slug) {
      return 'lojacomapp.com.br/sua-loja';
    }

    return `lojacomapp.com.br/${slug}`;
  }, [slug]);

  function handleNomeChange(value: string) {
    setNome(value);

    if (!lojaJaCriada && !slug) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlug(slugify(value));
  }

  async function handleLogoUpload(file: File) {
    setErro(null);
    setSucesso(null);

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

    if (!allowedTypes.includes(file.type)) {
      setErro('Envie uma imagem PNG, JPG, WEBP ou SVG.');
      return;
    }

    if (file.size > 1024 * 1024 * 5) {
      setErro('A logo precisa ter no máximo 5MB.');
      return;
    }

    setUploadingLogo(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${userId}/logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('loja-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('loja-assets')
        .getPublicUrl(filePath);

      setLogoUrl(data.publicUrl);
      setLogoPreview(data.publicUrl);
      setSucesso('Logo enviada com sucesso.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar a logo.';

      setErro(message);
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setErro(null);
    setSucesso(null);

    try {
      if (!nome.trim()) {
        throw new Error('Informe o nome da loja.');
      }

      if (!slug.trim()) {
        throw new Error('Informe o link da loja.');
      }

      const payload = {
        proprietario_id: userId,
        nome: nome.trim(),
        slug: slug.trim(),
        descricao: descricao.trim() || null,
        logo_url: logoUrl || null,
        cor_primaria: corPrimaria || '#111827',
        whatsapp: whatsapp.trim() || null,
        email_contato: emailContato.trim() || null,
        endereco_loja: enderecoLoja.trim() || null,
        cidade: cidade.trim() || null,
        estado: estado.trim() || null,
        cep: cep.trim() || null,
        pix_chave: pixChave.trim() || null,
        pix_nome: pixNome.trim() || null,
        ativa: true,
        updated_at: new Date().toISOString(),
      };

      if (loja?.id) {
        const { error } = await supabase
          .from('lojas')
          .update(payload)
          .eq('id', loja.id);

        if (error) {
          throw error;
        }

        setSucesso('Loja atualizada com sucesso.');
      } else {
        const { error } = await supabase.from('lojas').insert({
          ...payload,
          plano: 'basic',
        });

        if (error) {
          throw error;
        }

        setSucesso('Loja criada com sucesso.');
      }

      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar a loja.';

      if (
        message.toLowerCase().includes('duplicate') ||
        message.toLowerCase().includes('unique')
      ) {
        setErro('Esse link de loja já está em uso. Escolha outro.');
      } else {
        setErro(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-500 shadow-sm">
            <DevicePhoneMobileIcon className="h-4 w-4 text-lime-500" />
            Configuração do app da loja
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-[-0.05em] text-zinc-950 lg:text-5xl">
            {lojaJaCriada ? 'Editar sua loja' : 'Crie sua loja virtual'}
          </h1>

          <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-zinc-500">
            Essas informações serão usadas na loja pública e também no PWA que
            o cliente instala no celular.
          </p>
        </div>

        {slug && (
          <a
            href={`/${slug}`}
            target="_blank"
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 text-sm font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
          >
            Ver loja
            <EyeIcon className="h-4 w-4" />
          </a>
        )}
      </section>

      <form
        onSubmit={handleSubmit}
        className="mt-7 grid gap-5 xl:grid-cols-[1.35fr_0.75fr]"
      >
        <div className="space-y-5">
          <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm lg:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-300 text-zinc-950">
                <ShoppingBagIcon className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-lg font-black tracking-[-0.04em] text-zinc-950">
                  Dados principais
                </h2>
                <p className="text-sm font-medium text-zinc-400">
                  Nome, link e apresentação da loja.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field label="Nome da loja">
                <input
                  value={nome}
                  onChange={(event) => handleNomeChange(event.target.value)}
                  placeholder="Ex. Velune"
                  required
                  className="input-store"
                />
              </Field>

              <Field label="Link da loja">
                <div className="flex h-12 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 focus-within:border-zinc-950 focus-within:ring-4 focus-within:ring-zinc-950/5">
                  <span className="flex items-center border-r border-zinc-200 px-4 text-sm font-bold text-zinc-400">
                    /
                  </span>
                  <input
                    value={slug}
                    onChange={(event) => handleSlugChange(event.target.value)}
                    placeholder="sua-loja"
                    required
                    className="h-full min-w-0 flex-1 bg-transparent px-4 text-sm font-bold text-zinc-950 outline-none placeholder:text-zinc-300"
                  />
                </div>
              </Field>

              <div className="md:col-span-2">
                <Field label="Descrição curta">
                  <textarea
                    value={descricao}
                    onChange={(event) => setDescricao(event.target.value)}
                    placeholder="Ex. Moda, acessórios e produtos selecionados para seu estilo."
                    rows={4}
                    className="min-h-28 w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-950 outline-none transition placeholder:text-zinc-300 focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/5"
                  />
                </Field>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm lg:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-700">
                <PaintBrushIcon className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-lg font-black tracking-[-0.04em] text-zinc-950">
                  Identidade do app
                </h2>
                <p className="text-sm font-medium text-zinc-400">
                  Logo e cor principal usadas no PWA.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-[0.7fr_1.3fr]">
              <div className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-4">
                <div
                  className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] text-white shadow-sm"
                  style={{ backgroundColor: corPrimaria }}
                >
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoPreview}
                      alt="Logo da loja"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ShoppingBagIcon className="h-12 w-12" />
                  )}
                </div>

                <p className="mt-4 text-center text-xs font-bold text-zinc-400">
                  Prévia do ícone
                </p>
              </div>

              <div className="space-y-5">
                <Field label="Logo/ícone da loja">
                  <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-center transition hover:bg-zinc-100">
                    <CloudArrowUpIcon className="h-7 w-7 text-zinc-400" />
                    <span className="mt-2 text-sm font-black text-zinc-700">
                      {uploadingLogo ? 'Enviando...' : 'Enviar logo'}
                    </span>
                    <span className="mt-1 text-xs font-medium text-zinc-400">
                      PNG, JPG, WEBP ou SVG até 5MB
                    </span>

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      disabled={uploadingLogo}
                      onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (file) {
                          handleLogoUpload(file);
                        }
                      }}
                    />
                  </label>
                </Field>

                <Field label="Cor principal">
                  <div className="flex h-12 items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-3">
                    <input
                      type="color"
                      value={corPrimaria}
                      onChange={(event) => setCorPrimaria(event.target.value)}
                      className="h-8 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                    />

                    <input
                      value={corPrimaria}
                      onChange={(event) => setCorPrimaria(event.target.value)}
                      className="h-full flex-1 bg-transparent text-sm font-bold text-zinc-950 outline-none"
                    />
                  </div>
                </Field>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm lg:p-6">
            <h2 className="text-lg font-black tracking-[-0.04em] text-zinc-950">
              Contato e pagamento
            </h2>

            <p className="mt-1 text-sm font-medium text-zinc-400">
              Dados usados no checkout e atendimento.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field label="WhatsApp">
                <input
                  value={whatsapp}
                  onChange={(event) => setWhatsapp(event.target.value)}
                  placeholder="Ex. 69999999999"
                  className="input-store"
                />
              </Field>

              <Field label="E-mail de contato">
                <input
                  type="email"
                  value={emailContato}
                  onChange={(event) => setEmailContato(event.target.value)}
                  placeholder="contato@loja.com"
                  className="input-store"
                />
              </Field>

              <Field label="Chave Pix">
                <input
                  value={pixChave}
                  onChange={(event) => setPixChave(event.target.value)}
                  placeholder="CPF, CNPJ, e-mail, telefone ou aleatória"
                  className="input-store"
                />
              </Field>

              <Field label="Nome do recebedor Pix">
                <input
                  value={pixNome}
                  onChange={(event) => setPixNome(event.target.value)}
                  placeholder="Nome que aparece no Pix"
                  className="input-store"
                />
              </Field>
            </div>
          </div>

          <div className="rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm lg:p-6">
            <h2 className="text-lg font-black tracking-[-0.04em] text-zinc-950">
              Endereço da loja
            </h2>

            <p className="mt-1 text-sm font-medium text-zinc-400">
              Útil para retirada, entrega local e informações públicas.
            </p>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field label="Endereço">
                  <input
                    value={enderecoLoja}
                    onChange={(event) => setEnderecoLoja(event.target.value)}
                    placeholder="Rua, número, bairro"
                    className="input-store"
                  />
                </Field>
              </div>

              <Field label="Cidade">
                <input
                  value={cidade}
                  onChange={(event) => setCidade(event.target.value)}
                  placeholder="Cidade"
                  className="input-store"
                />
              </Field>

              <Field label="Estado">
                <input
                  value={estado}
                  onChange={(event) =>
                    setEstado(event.target.value.toUpperCase().slice(0, 2))
                  }
                  placeholder="UF"
                  className="input-store"
                />
              </Field>

              <Field label="CEP">
                <input
                  value={cep}
                  onChange={(event) => setCep(event.target.value)}
                  placeholder="00000-000"
                  className="input-store"
                />
              </Field>
            </div>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="sticky top-8 rounded-[2rem] border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="rounded-[1.7rem] border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl text-white"
                  style={{ backgroundColor: corPrimaria }}
                >
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ShoppingBagIcon className="h-6 w-6" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-zinc-950">
                    {nome || 'Nome da loja'}
                  </p>
                  <p className="truncate text-xs font-bold text-zinc-400">
                    {publicUrl}
                  </p>
                </div>
              </div>

              <div
                className="mt-5 rounded-[1.4rem] p-4 text-white"
                style={{ backgroundColor: corPrimaria }}
              >
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
                  Loja com app
                </p>
                <p className="mt-2 text-xl font-black tracking-[-0.05em]">
                  {nome || 'Sua loja'}
                </p>
                <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-white/75">
                  {descricao ||
                    'Sua loja online pronta para vender e ser instalada no celular.'}
                </p>
              </div>
            </div>

            {erro && (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {erro}
              </div>
            )}

            {sucesso && (
              <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
                {sucesso}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || uploadingLogo}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 text-sm font-black text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? 'Salvando...'
                : lojaJaCriada
                  ? 'Salvar alterações'
                  : 'Criar loja'}

              {!loading && <ArrowRightIcon className="h-4 w-4" />}
            </button>

            <p className="mt-3 text-center text-xs font-medium leading-5 text-zinc-400">
              Depois vamos usar esses dados no app público e no manifesto PWA.
            </p>
          </div>
        </aside>
      </form>

      <style jsx global>{`
        .input-store {
          height: 3rem;
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgb(228 228 231);
          background: white;
          padding: 0 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: rgb(9 9 11);
          outline: none;
          transition: all 150ms ease;
        }

        .input-store::placeholder {
          color: rgb(212 212 216);
        }

        .input-store:focus {
          border-color: rgb(9 9 11);
          box-shadow: 0 0 0 4px rgb(9 9 11 / 0.05);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-zinc-700">
        {label}
      </span>

      {children}
    </label>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}