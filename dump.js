import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);
async function run() {
  console.log("Testing WRITE access to fluxo_caixa_v30...");
  const { data: insertData, error: insertError } = await supabase
    .from("fluxo_caixa_v30")
    .insert([{ 
      valor: 0.01, 
      descricao: "TESTE RLS FIX", 
      tipo: "entrada",
      data_movimento: new Date().toISOString()
    }])
    .select();

  if (insertError) {
    console.error("Write Error:", JSON.stringify(insertError, null, 2));
  } else {
    console.log("Write Success! Data inserted:", JSON.stringify(insertData, null, 2));
    
    // Clean up
    if (insertData && insertData.length > 0) {
      await supabase.from("fluxo_caixa_v30").delete().eq("id", insertData[0].id);
      console.log("Cleaned up test record.");
    }
  }

  console.log("\nTesting READ access to fluxo_caixa_v30...");
  const { data: readData, error: readError } = await supabase.from("fluxo_caixa_v30").select("*").limit(5);
  console.log("Read Response:", JSON.stringify({ data: readData, error: readError }, null, 2));

  const response = await supabase.from('usuarios_config').select('*');
  console.log("Full Supabase Response (Config):", JSON.stringify(response, null, 2));
  const { data, error } = response;
  if (error) {
    console.error("Supabase Error:", error);
    return;
  }
  if (!data || data.length === 0) {
    console.log("No data found in usuarios_config");
    return;
  }
  for (const d of data) console.log(`ID:${d.id} NOME:[${d.nome}] CHAT_ID:[${d.chat_id}]`);
}
run();
