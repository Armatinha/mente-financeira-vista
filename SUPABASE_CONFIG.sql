-- SCRIPT DE CORREÇÃO DE PERMISSÕES (RLS)
-- Execute este script no SQL Editor do seu projeto Supabase para liberar o acesso aos dados após o login.

-- 1. Liberar acesso à tabela de EMPRÉSTIMOS
ALTER TABLE public.emprestimos_v30 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo para usuários autenticados" ON public.emprestimos_v30;
CREATE POLICY "Permitir tudo para usuários autenticados" ON public.emprestimos_v30 
FOR ALL TO authenticated 
USING (true) 
WITH CHECK (true);

-- 2. Liberar acesso à tabela de FLUXO DE CAIXA
ALTER TABLE public.fluxo_caixa_v30 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir tudo para usuários autenticados" ON public.fluxo_caixa_v30;
CREATE POLICY "Permitir tudo para usuários autenticados" ON public.fluxo_caixa_v30 
FOR ALL TO authenticated 
USING (true) 
WITH CHECK (true);

-- 3. Garantir acesso às Views de Relatório (apenas leitura)
ALTER TABLE public.auditoria_socios_mesmo_vencimento ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Leitura para autenticados" ON public.auditoria_socios_mesmo_vencimento;
CREATE POLICY "Leitura para autenticados" ON public.auditoria_socios_mesmo_vencimento 
FOR SELECT TO authenticated 
USING (true);

-- OBSERVAÇÃO: Se você quiser que o acesso público (sem login) continue funcionando simultaneamente,
-- você deve adicionar também políticas para 'anon'.
