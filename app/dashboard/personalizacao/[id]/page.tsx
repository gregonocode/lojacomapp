import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import ThemeEditor from './theme-editor';

export default async function ThemeEditorPage({ params }: PageProps<'/dashboard/personalizacao/[id]'>) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: loja } = await supabase
    .from('lojas')
    .select('id, nome, slug, descricao, logo_url, cor_primaria, banner_url')
    .eq('proprietario_id', user.id)
    .maybeSingle();

  return (
    <ThemeEditor
      themeId={id}
      userId={user.id}
      store={{
        id: loja?.id || '',
        nome: loja?.nome || 'Minha loja',
        slug: loja?.slug || 'minha-loja',
        descricao: loja?.descricao || 'Produtos selecionados para você comprar online com praticidade.',
        logoUrl: loja?.logo_url || null,
        primaryColor: loja?.cor_primaria || '#7367d9',
        bannerUrl: loja?.banner_url || null,
      }}
    />
  );
}
