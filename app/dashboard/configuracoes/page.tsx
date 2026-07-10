import { redirect } from 'next/navigation';
import { createClient } from '@/app/lib/supabase/server';
import LojaOnboardingForm from './loja-onboarding-form';

export default async function ConfiguracoesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: loja } = await supabase
    .from('lojas')
    .select(
      `
      id,
      nome,
      slug,
      descricao,
      whatsapp,
      email_contato,
      endereco_loja,
      cidade,
      estado,
      cep,
      pix_chave,
      pix_nome,
      ativa
    `,
    )
    .eq('proprietario_id', user.id)
    .maybeSingle();

  return (
    <LojaOnboardingForm
      userId={user.id}
      userEmail={user.email || ''}
      loja={loja}
    />
  );
}
