# PRD - Mente Financeira Vista

## 1. Visão Geral do Produto
O **Mente Financeira Vista** é uma plataforma de gestão financeira pessoal e empresarial projetada para oferecer visibilidade em tempo real sobre fluxos de caixa, empréstimos e saúde financeira geral. O sistema integra-se diretamente ao Supabase para persistência de dados e utiliza uma interface moderna baseada em React.

## 2. Objetivos Principais
- Fornecer um painel centralizado para monitoramento de saldo e transações.
- Automatizar o cálculo de saldos baseados em entradas, saídas e parcelas de empréstimos.
- Garantir a segurança dos dados financeiros através de políticas de Row Level Security (RLS).
- Oferecer uma experiência de usuário fluida e responsiva.

## 3. Público-Alvo
- Pequenos empreendedores que precisam gerir fluxo de caixa.
- Indivíduos que buscam controle rigoroso sobre empréstimos e parcelas.
- Usuários que necessitam de um sistema de gestão financeira acessível via web.

## 4. Requisitos Funcionais

### 4.1. Dashboard Financeiro
- **Visualização de Indicadores:** Exibição de Saldo Total, Entradas Mensais, Saídas Mensais e Total de Empréstimos.
- **Gráficos:** Visualização de tendências financeiras utilizando Recharts.
- **Atualização em Tempo Real:** Sincronização automática com o Supabase.

### 4.2. Gestão de Fluxo de Caixa
- **Registro de Transações:** Cadastro de entradas e saídas com descrição, valor e data.
- **Categorização:** Classificação de movimentações para melhor organização.
- **Histórico:** Listagem detalhada de todas as movimentações passadas.

### 4.3. Gestão de Empréstimos
- **Controle de Parcelas:** Registro e acompanhamento de empréstimos tomados ou concedidos.
- **Vínculo com Caixa:** Integração automática onde pagamentos de parcelas refletem no fluxo de caixa.

### 4.4. Configurações de Usuário
- **Identificação:** Armazenamento de preferências e identificadores (como Chat ID para notificações).
- **Gerenciamento de Sessão:** Controle básico de acesso e configurações persistentes.

## 5. Requisitos Não Funcionais
- **Performance:** Carregamento rápido de componentes e transições suaves.
- **Segurança:** Implementação obrigatória de RLS no Supabase para proteção de dados.
- **Escalabilidade:** Arquitetura baseada em serviços para facilitar a adição de novas tabelas e funcionalidades.
- **Responsividade:** Interface adaptável para dispositivos móveis e desktop.

## 6. Stack Tecnológica
- **Frontend:** React + Vite + TypeScript.
- **Estilização:** Tailwind CSS + Shadcn/UI.
- **Backend/Banco de Dados:** Supabase (PostgreSQL + RLS).
- **Ícones:** Lucide React.
- **Gráficos:** Recharts.

## 7. Roadmap Futuro
- Integração com APIs bancárias (Open Banking).
- Sistema de notificações via Telegram/WhatsApp para vencimentos.
- Módulo de relatórios exportáveis em PDF/Excel.
- Suporte a múltiplas contas/usuários com permissões granulares.
