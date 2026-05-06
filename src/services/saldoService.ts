/**
 * saldoService.ts
 *
 * Fonte de verdade para cálculo dos saldos.
 * Recalcula tudo em tempo real a partir do banco de dados.
 */

import { supabase } from "@/integrations/supabase/client";

export interface SaldoData {
  saldoTotal: number;
  caixinhaContas: number;
  caixinhaLucro: number;
  disponivelUso: number;
  bancos: { nome: string; valor: number }[];
  totalBancos: number;
}

const TIPOS_SOMAM = ["entrada", "juros", "pagamento", "ajuste", "renovacao"];
const TIPOS_SUBTRAEM = ["saida", "emprestimo"];

export async function calcularSaldo(): Promise<SaldoData> {
  // 1. Buscar todos os registros de fluxo de caixa
  const { data: fluxo, error: errFluxo } = await supabase
    .from("fluxo_caixa_v30")
    .select("tipo, destino, valor");

  if (errFluxo) {
    console.error("Erro ao buscar fluxo_caixa_v30:", errFluxo);
    throw errFluxo;
  }

  // 2. Buscar todos os empréstimos ativos para total por banco
  const { data: emprestimos, error: errEmp } = await supabase
    .from("emprestimos_v30")
    .select("banco_origem, valor_principal")
    .eq("situacao", "ativo");

  if (errEmp) {
    console.error("Erro ao buscar emprestimos_v30:", errEmp);
    throw errEmp;
  }

  // 3. Calcular saldos por destino
  let bancoDest = 0;
  let contasDest = 0;
  let lucroDest = 0;

  for (const mov of fluxo || []) {
    const tipoRaw = (mov.tipo || "").toLowerCase().trim();
    // Normalizar para remover acentos
    const tipo = tipoRaw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    let val = Number(mov.valor) || 0;

    if (TIPOS_SOMAM.includes(tipo)) {
      // soma
    } else if (TIPOS_SUBTRAEM.includes(tipo)) {
      val = -val;
    } else {
      continue; // Ignora tipos desconhecidos
    }

    const dest = (mov.destino || "").toLowerCase().trim();
    if (dest === "contas" || dest === "juros") {
      contasDest += val;
    } else if (dest === "lucro") {
      lucroDest += val;
    } else if (dest === "banco" || dest === "principal") {
      bancoDest += val;
    }
  }

  // 4. Totais por banco
  const bancosMap: Record<string, number> = {};
  let totalBancos = 0;

  for (const emp of emprestimos || []) {
    const val = Number(emp.valor_principal) || 0;
    const banco = (emp.banco_origem || "Desconhecido").trim();
    bancosMap[banco] = (bancosMap[banco] || 0) + val;
    totalBancos += val;
  }

  const outputBancos = Object.entries(bancosMap)
    .map(([nome, valor]) => ({ nome, valor }))
    .sort((a, b) => a.nome.localeCompare(b.nome));

  return {
    saldoTotal: bancoDest + contasDest + lucroDest,
    caixinhaContas: contasDest,
    caixinhaLucro: lucroDest,
    disponivelUso: bancoDest,
    bancos: outputBancos,
    totalBancos: totalBancos
  };
}
