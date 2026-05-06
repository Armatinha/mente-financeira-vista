import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TIPOS_SOMAM = ["entrada", "juros", "pagamento", "ajuste"];
const TIPOS_SUBTRAEM = ["saida", "emprestimo", "saída", "empréstimo"];

async function testSaldo() {
  const { data: fluxo, error } = await supabase.from("fluxo_caixa_v30").select("*");
  if (error) {
    console.error("Error fetching", error);
    return;
  }

  let dbBancoDest = 0;
  let soma = 0;
  let subtrai = 0;

  for (const mov of fluxo || []) {
    let val = Number(mov.valor) || 0;
    const tipoOriginal = mov.tipo;
    const tipo = (mov.tipo || "").toLowerCase().trim();
    const dest = (mov.destino || "").toLowerCase().trim();

    if (dest !== "banco") continue; // Só calcular o do banco!

    if (TIPOS_SOMAM.includes(tipo)) {
      dbBancoDest += val;
      soma += val;
    } else if (TIPOS_SUBTRAEM.includes(tipo)) {
      dbBancoDest -= val;
      subtrai += val;
    } else {
        console.log(`[BANCO IGNORADO] ${tipoOriginal} -> ${val}`);
    }
  }

  console.log("=== EXTRATO BANCO ===");
  console.log(`Total Somado: ${soma}`);
  console.log(`Total Subtraido: ${subtrai}`);
  console.log(`bancoDest FINAL (Saldo disponivel): ${dbBancoDest}`);
}

testSaldo();
