import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
async function run() {
  const { data } = await supabase.from('fluxo_caixa_v30').select('*');
  for (const d of data) {
    if (d.descricao && d.descricao.includes("Renov")) {
      console.log(`ID:${d.id} ID_EMP:[${d.id_emprestimo}] DESCR:[${d.descricao}]`);
    }
  }
}
run();
