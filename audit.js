import dotenv from "dotenv";
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TIPOS_SOMAM = ["entrada", "juros", "pagamento", "ajuste"];
const TIPOS_SUBTRAEM = ["saida", "emprestimo", "saída", "empréstimo"];

async function audit() {
  const { data: fluxo, error } = await supabase.from("fluxo_caixa_v30").select("*");
  if (error) return console.error(error);

  let totalBanco = 0;
  console.log("--- AUDITORIA DESTINO: BANCO ---");
  
  fluxo.forEach(m => {
    const dest = (m.destino || "").toLowerCase().trim();
    if (dest !== "banco") return;

    const tipoRaw = m.tipo || "";
    const tipo = tipoRaw.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const val = Number(m.valor) || 0;

    let operacao = "";
    if (TIPOS_SOMAM.includes(tipo)) {
        totalBanco += val;
        operacao = "SOMA (+)";
    } else if (TIPOS_SUBTRAEM.includes(tipo)) {
        totalBanco -= val;
        operacao = "SUBTRAI (-)";
    } else {
        operacao = "IGNORADO (?)";
    }

    console.log(`${tipoRaw.padEnd(12)} | ${m.valor.toString().padStart(8)} | ${operacao} | New: ${totalBanco.toFixed(2)}`);
  });

  console.log("\nRESULTADO FINAL BANCO (Saldo Disponível): R$ " + totalBanco.toFixed(2));
}

audit();
