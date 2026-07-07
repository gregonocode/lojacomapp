import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import ProdutoForm from './produto-form';

export default async function NovoProdutoPage() {
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
    redirect('/dashboard/configuracoes');
  }

  return <ProdutoForm loja={loja} />;
}
