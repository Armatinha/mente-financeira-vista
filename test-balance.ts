import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;

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
  let dbContasDest = 0;
  let dbLucroDest = 0;

  for (const mov of fluxo || []) {
    let val = Number(mov.valor) || 0;
    const tipoOriginal = mov.tipo;
    const tipo = (mov.tipo || "").toLowerCase().trim();
    const dest = (mov.destino || "").toLowerCase().trim();

    let sinal = 0;
    if (TIPOS_SOMAM.includes(tipo)) {
      sinal = 1;
    } else if (TIPOS_SUBTRAEM.includes(tipo)) {
      sinal = -1;
      val = -val;
    }

    if (dest === "banco") dbBancoDest += val;
    else if (dest === "contas") dbContasDest += val;
    else if (dest === "lucro") dbLucroDest += val;
    
    // if (dest === 'banco') {
    //   console.log(`[BANCO] ${tipoOriginal} -> ${val}`);
    // }
  }

  console.log("=== CALCULATED ===");
  console.log(`bancoDest (Saldo disponivel): ${dbBancoDest}`);
  console.log(`contasDest (Caixinha contas): ${dbContasDest}`);
  console.log(`lucroDest (Caixinha lucro): ${dbLucroDest}`);
  console.log(`saldoTotal: ${dbBancoDest + dbContasDest + dbLucroDest}`);
}

testSaldo();
