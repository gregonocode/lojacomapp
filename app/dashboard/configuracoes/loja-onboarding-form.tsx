'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRightIcon,
  AtSymbolIcon,
  BanknotesIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  DevicePhoneMobileIcon,
  EyeIcon,
  MapPinIcon,
  PencilSquareIcon,
  PhoneIcon,
  ShoppingBagIcon,
} from '@heroicons/react/24/outline';
import { createClient } from '@/app/lib/supabase/client';

type Loja = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
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

type CardKey = 'dados' | 'contato' | 'endereco';

export default function LojaOnboardingForm({
  userId,
  userEmail,
  loja,
}: LojaOnboardingFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [nome, setNome] = useState(loja?.nome || '');
  const [descricao, setDescricao] = useState(loja?.descricao || '');
  const [whatsapp, setWhatsapp] = useState(loja?.whatsapp || '');
  const [emailContato, setEmailContato] = useState(
    loja?.email_contato || userEmail,
  );

  const [enderecoLoja, setEnderecoLoja] = useState(loja?.endereco_loja || '');
  const [cidade, setCidade] = useState(loja?.cidade || '');
  const [estado, setEstado] = useState(loja?.estado || '');
  const [cep, setCep] = useState(loja?.cep || '');

  const [pixChave, setPixChave] = useState(loja?.pix_chave || '');
  const [pixNome, setPixNome] = useState(loja?.pix_nome || '');

  const [openCard, setOpenCard] = useState<CardKey | null>(
    loja?.id ? null : 'dados',
  );

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const lojaJaCriada = Boolean(loja?.id);
  const slug = useMemo(() => slugify(nome), [nome]);

  const publicUrl = useMemo(() => {
    if (!slug) {
      return 'lojacomapp.com.br/sua-loja';
    }

    return `lojacomapp.com.br/${slug}`;
  }, [slug]);

  function toggleCard(card: CardKey) {
    setOpenCard((current) => (current === card ? null : card));
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

      if (!slug) {
        throw new Error('Informe um nome válido para gerar o link da loja.');
      }

      const payload = {
        proprietario_id: userId,
        nome: nome.trim(),
        slug,
        descricao: descricao.trim() || null,
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

      setOpenCard(null);
      router.refresh();
    } catch (error) {
      const normalizedMessage = getErrorMessage(error);
      const normalizedCode = getErrorCode(error);
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar a loja.';

      if (
        normalizedMessage.toLowerCase().includes('duplicate') ||
        normalizedMessage.toLowerCase().includes('unique')
      ) {
        setErro('Esse link de loja já está em uso. Escolha outro.');
      } else if (
        normalizedCode === '23503' ||
        normalizedMessage.includes('lojas_proprietario_id_fkey')
      ) {
        setErro(
          'Seu usuário ainda não está vinculado corretamente ao cadastro de lojas. Ajuste a chave estrangeira proprietario_id no Supabase e tente salvar novamente.',
        );
      } else {
        setErro(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6 lg:py-6">
          <div className="min-w-0">
            

            <h1 className="mt-4 text-2xl font-black tracking-tight text-zinc-950 lg:text-4xl">
              {lojaJaCriada ? 'Configurações da loja' : 'Crie sua loja virtual'}
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-500">
              Edite apenas o que precisar. Os dados ficam organizados em cards
              e sua loja continua simples de gerenciar.
            </p>
          </div>

          {slug && (
            <a
              href={`/${slug}`}
              target="_blank"
              className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-5 text-sm font-black text-zinc-700 shadow-sm transition hover:bg-zinc-50"
            >
              Ver loja
              <EyeIcon className="h-4 w-4" />
            </a>
          )}
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]"
      >
        <div className="space-y-5">
          <EditableSectionCard
            id="dados"
            openCard={openCard}
            onToggle={toggleCard}
            icon={ShoppingBagIcon}
            title="Dados principais"
            description="Nome e apresentação pública da loja."
            summary={
              <div className="grid gap-3 md:grid-cols-3">
                <SummaryBox label="Nome da loja" value={nome || 'Não informado'} />
                <SummaryBox label="Link público" value={`/${slug || 'sua-loja'}`} />
                <SummaryBox
                  label="Descrição"
                  value={descricao || 'Não informado'}
                />
              </div>
            }
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Nome da loja">
                <input
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Ex. Velune"
                  required
                  className="input-store"
                />
              </Field>

              <div className="rounded-3xl border border-zinc-200 bg-[#F7F7F4] p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-zinc-400">
                  Link da loja
                </p>

                <p className="mt-2 truncate text-sm font-black text-zinc-950">
                  {publicUrl}
                </p>

                <p className="mt-2 text-xs font-semibold leading-5 text-zinc-400">
                  O link é criado automaticamente a partir do nome da loja.
                </p>
              </div>

              <div className="md:col-span-2">
                <Field label="Descrição curta">
                  <textarea
                    value={descricao}
                    onChange={(event) => setDescricao(event.target.value)}
                    placeholder="Ex. Moda, acessórios e produtos selecionados para seu estilo."
                    rows={4}
                    className="min-h-32 w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-950 outline-none transition placeholder:text-zinc-300 focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/5"
                  />
                </Field>
              </div>
            </div>
          </EditableSectionCard>

          <EditableSectionCard
            id="contato"
            openCard={openCard}
            onToggle={toggleCard}
            icon={PhoneIcon}
            title="Contato e pagamento"
            description="WhatsApp, e-mail e informações de Pix."
            summary={
              <div className="grid gap-3 md:grid-cols-3">
                <SummaryBox label="WhatsApp" value={whatsapp || 'Não informado'} />
                <SummaryBox
                  label="E-mail"
                  value={emailContato || 'Não informado'}
                />
                <SummaryBox label="Pix" value={pixChave || 'Não informado'} />
              </div>
            }
          >
            <div className="grid gap-5 md:grid-cols-2">
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
          </EditableSectionCard>

          <EditableSectionCard
            id="endereco"
            openCard={openCard}
            onToggle={toggleCard}
            icon={MapPinIcon}
            title="Endereço da loja"
            description="Dados usados para retirada e informações públicas."
            summary={
              <div className="grid gap-3 md:grid-cols-3">
                <SummaryBox
                  label="Endereço"
                  value={enderecoLoja || 'Não informado'}
                />
                <SummaryBox
                  label="Cidade"
                  value={
                    cidade || estado
                      ? `${cidade || 'Cidade'}${estado ? `/${estado}` : ''}`
                      : 'Não informado'
                  }
                />
                <SummaryBox label="CEP" value={cep || 'Não informado'} />
              </div>
            }
          >
            <div className="grid gap-5 md:grid-cols-2">
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
          </EditableSectionCard>
        </div>

        <aside>
          <div className="sticky top-24 space-y-5">
            <div className="rounded-[28px] border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                    Prévia
                  </p>
                  <h2 className="mt-1 text-lg font-black tracking-tight text-zinc-950">
                    Resumo da loja
                  </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4f2ff] text-zinc-950">
                  <ShoppingBagIcon className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-5 overflow-hidden rounded-3xl border border-zinc-200 bg-[#F7F7F4]">
                <div className="bg-zinc-950 px-4 py-5 text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white/15 text-white ring-1 ring-white/20">
                      <ShoppingBagIcon className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">
                        {nome || 'Nome da loja'}
                      </p>
                      <p className="truncate text-xs font-bold text-white/70">
                        /{slug || 'sua-loja'}
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 text-2xl font-black tracking-tight">
                    {nome || 'Sua loja'}
                  </p>

                  <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-white/75">
                    {descricao ||
                      'Sua loja online pronta para vender e ser instalada no celular.'}
                  </p>
                </div>

                <div className="space-y-3 p-4">
                  <PreviewRow
                    icon={BuildingStorefrontIcon}
                    label="Status"
                    value={lojaJaCriada ? 'Loja configurada' : 'Primeira configuração'}
                  />
                  <PreviewRow
                    icon={AtSymbolIcon}
                    label="Contato"
                    value={emailContato || 'contato@loja.com'}
                  />
                  <PreviewRow
                    icon={BanknotesIcon}
                    label="Pix"
                    value={pixChave || 'Não informado'}
                  />
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
                disabled={loading}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 text-sm font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? 'Salvando...'
                  : lojaJaCriada
                    ? 'Salvar alterações'
                    : 'Criar loja'}

                {!loading && <ArrowRightIcon className="h-4 w-4" />}
              </button>

              <p className="mt-3 text-center text-xs font-semibold leading-5 text-zinc-400">
                Abra um card, edite as informações e salve tudo por aqui.
              </p>
            </div>

            {lojaJaCriada && (
              <Link
                href="/dashboard/configuracoes/identidade-visual"
                className="flex h-12 w-full items-center justify-center rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-black text-zinc-700 shadow-sm transition hover:bg-zinc-50"
              >
                Configurar identidade visual
              </Link>
            )}
          </div>
        </aside>
      </form>

      <style jsx global>{`
        .input-store {
          height: 3.25rem;
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgb(228 228 231);
          background: white;
          padding: 0 1rem;
          font-size: 0.875rem;
          font-weight: 650;
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

function EditableSectionCard({
  id,
  openCard,
  onToggle,
  icon: Icon,
  title,
  description,
  summary,
  children,
}: {
  id: CardKey;
  openCard: CardKey | null;
  onToggle: (card: CardKey) => void;
  icon: React.ElementType;
  title: string;
  description: string;
  summary: React.ReactNode;
  children: React.ReactNode;
}) {
  const isOpen = openCard === id;

  return (
    <section className="overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between lg:p-6">
        <div className="flex items-start gap-4">
          <div
            className={[
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-zinc-950',
              isOpen ? 'bg-[#f4f2ff]' : 'bg-[#F7F7F4]',
            ].join(' ')}
          >
            <Icon className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-lg font-black tracking-tight text-zinc-950">
              {title}
            </h2>
            <p className="mt-1 text-sm font-semibold leading-5 text-zinc-400">
              {description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggle(id)}
          className={[
            'flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-black transition',
            isOpen
              ? 'bg-zinc-950 text-white hover:bg-black'
              : 'border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50',
          ].join(' ')}
        >
          {isOpen ? (
            <>
              Fechar
              <ChevronDownIcon className="h-4 w-4 rotate-180" />
            </>
          ) : (
            <>
              Editar
              <PencilSquareIcon className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      <div className="border-t border-zinc-100 bg-[#FBFBFA] px-5 py-4 lg:px-6">
        {summary}
      </div>

      {isOpen && (
        <div className="border-t border-zinc-100 px-5 py-5 lg:px-6 lg:py-6">
          {children}
        </div>
      )}
    </section>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-3xl border border-zinc-200 bg-white px-4 py-4">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-zinc-400">
        {label}
      </p>
      <p className="mt-2 truncate text-sm font-black text-zinc-950">{value}</p>
    </div>
  );
}

function PreviewRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-zinc-500 shadow-sm ring-1 ring-zinc-200">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.12em] text-zinc-400">
          {label}
        </p>
        <p className="truncate text-sm font-black text-zinc-800">{value}</p>
      </div>
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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return 'Não foi possível salvar a loja.';
}

function getErrorCode(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code;
  }

  return null;
}
