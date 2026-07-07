'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BanknotesIcon,
  CheckCircleIcon,
  CubeIcon,
  EyeIcon,
  PhotoIcon,
  ShoppingBagIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { createClient } from '@/app/lib/supabase/client';

type Loja = {
  id: string;
  nome: string;
  slug: string;
};

type ProdutoFormProps = {
  loja: Loja;
};

export default function ProdutoForm({ loja }: ProdutoFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [nome, setNome] = useState('');
  const [marca, setMarca] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [precoAntigo, setPrecoAntigo] = useState('');
  const [estoque, setEstoque] = useState('0');
  const [imagemUrl, setImagemUrl] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const precoPreview = useMemo(() => {
    return formatCurrency(parseMoney(preco));
  }, [preco]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setErro(null);
    setSucesso(null);

    try {
      if (!nome.trim()) {
        throw new Error('Informe o nome do produto.');
      }

      const precoNumber = parseMoney(preco);

      if (precoNumber <= 0) {
        throw new Error('Informe um preco valido para o produto.');
      }

      const precoAntigoNumber = precoAntigo.trim()
        ? parseMoney(precoAntigo)
        : null;

      const { error } = await supabase.from('produtos').insert({
        loja_id: loja.id,
        nome: nome.trim(),
        marca: marca.trim() || null,
        descricao: descricao.trim() || null,
        preco: precoNumber,
        preco_antigo: precoAntigoNumber,
        imagem_url: imagemUrl.trim() || null,
        estoque: Number(estoque || 0),
        ativo,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      setSucesso('Produto cadastrado com sucesso.');
      router.refresh();
      router.push('/dashboard/produtos');
    } catch (error) {
      setErro(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-5">
        <Link
          href="/dashboard/produtos"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-700 shadow-sm transition hover:bg-zinc-50"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Voltar
        </Link>
      </div>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 border-b border-zinc-100 px-5 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-700">
              <ShoppingBagIcon className="h-4 w-4" />
              Cadastro de produto
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-950 lg:text-4xl">
              Novo produto
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-zinc-500">
              Adicione as informacoes que o cliente vai ver no catalogo da{' '}
              {loja.nome}.
            </p>
          </div>

          <Link
            href={`/${loja.slug}`}
            target="_blank"
            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50"
          >
            Ver loja
            <EyeIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"
      >
        <div className="space-y-5">
          <SectionCard
            icon={TagIcon}
            title="Dados principais"
            description="Nome, marca e descricao do item."
          >
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field label="Nome do produto">
                <input
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Ex. Camiseta oversized"
                  required
                  className="input-product"
                />
              </Field>

              <Field label="Marca">
                <input
                  value={marca}
                  onChange={(event) => setMarca(event.target.value)}
                  placeholder="Ex. Velune"
                  className="input-product"
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Descricao">
                  <textarea
                    value={descricao}
                    onChange={(event) => setDescricao(event.target.value)}
                    placeholder="Detalhes, composicao, medidas ou qualquer informacao importante."
                    rows={5}
                    className="min-h-32 w-full resize-none rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-950 outline-none transition placeholder:text-zinc-300 focus:border-zinc-950 focus:ring-4 focus:ring-zinc-950/5"
                  />
                </Field>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={BanknotesIcon}
            title="Preco e estoque"
            description="Valores exibidos na vitrine e disponibilidade."
          >
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <Field label="Preco">
                <input
                  value={preco}
                  onChange={(event) => setPreco(event.target.value)}
                  placeholder="Ex. 129,90"
                  inputMode="decimal"
                  required
                  className="input-product"
                />
              </Field>

              <Field label="Preco antigo">
                <input
                  value={precoAntigo}
                  onChange={(event) => setPrecoAntigo(event.target.value)}
                  placeholder="Ex. 159,90"
                  inputMode="decimal"
                  className="input-product"
                />
              </Field>

              <Field label="Estoque">
                <input
                  type="number"
                  min="0"
                  value={estoque}
                  onChange={(event) => setEstoque(event.target.value)}
                  className="input-product"
                />
              </Field>

              <label className="flex h-12 items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 md:col-span-3">
                <input
                  type="checkbox"
                  checked={ativo}
                  onChange={(event) => setAtivo(event.target.checked)}
                  className="h-4 w-4 rounded border-zinc-300 text-purple-700"
                />
                <span className="text-sm font-bold text-zinc-700">
                  Produto ativo na loja
                </span>
              </label>
            </div>
          </SectionCard>

          <SectionCard
            icon={PhotoIcon}
            title="Imagem"
            description="URL da foto principal do produto."
          >
            <div className="mt-6">
              <Field label="URL da imagem">
                <input
                  value={imagemUrl}
                  onChange={(event) => setImagemUrl(event.target.value)}
                  placeholder="https://..."
                  type="url"
                  className="input-product"
                />
              </Field>
            </div>
          </SectionCard>
        </div>

        <aside>
          <div className="sticky top-8 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-zinc-400">Previa</p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-zinc-950">
              Card do produto
            </h2>

            <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-zinc-100 text-zinc-400">
                {imagemUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imagemUrl}
                    alt={nome || 'Produto'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <CubeIcon className="h-12 w-12" />
                )}
              </div>

              <div className="mt-4">
                <p className="text-xs font-bold uppercase text-zinc-400">
                  {marca || 'Marca'}
                </p>
                <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-bold leading-5 text-zinc-950">
                  {nome || 'Nome do produto'}
                </h3>
                <p className="mt-3 text-lg font-black text-zinc-950">
                  {precoPreview}
                </p>
              </div>
            </div>

            {erro && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {erro}
              </div>
            )}

            {sucesso && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
                {sucesso}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#181818] text-sm font-black text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Salvando...' : 'Cadastrar produto'}
              {!loading && <ArrowRightIcon className="h-4 w-4" />}
            </button>
          </div>
        </aside>
      </form>

      <style jsx global>{`
        .input-product {
          height: 3rem;
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgb(228 228 231);
          background: white;
          padding: 0 1rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: rgb(9 9 11);
          outline: none;
          transition: all 150ms ease;
        }

        .input-product::placeholder {
          color: rgb(212 212 216);
        }

        .input-product:focus {
          border-color: rgb(9 9 11);
          box-shadow: 0 0 0 4px rgb(9 9 11 / 0.05);
        }
      `}</style>
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-950">
            {title}
          </h2>
          <p className="text-sm font-medium text-zinc-400">{description}</p>
        </div>
      </div>

      {children}
    </section>
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

function parseMoney(value: string) {
  const normalized = value
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const parsed = Number(normalized);

  if (Number.isNaN(parsed)) {
    return 0;
  }

  return parsed;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return 'Nao foi possivel cadastrar o produto.';
}
