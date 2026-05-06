// Mente Financeira Dashboard 
import { useState, useEffect, useCallback, useRef } from "react";
import { DollarSign, Wallet, Users, AlertTriangle, Search, ArrowLeft, Loader2, PlusCircle, LogOut, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ClienteTable, { type Pagamento } from "@/components/ClienteTable";
import ResumoGrafico from "@/components/ResumoGrafico";
import { calcularSaldo, type SaldoData } from "@/services/saldoService";

type View = "home" | "saldo" | "abertos" | "devendo" | "buscar";

interface Emprestimo {
  id: number;
  nome: string;
  valor_principal: number;
  valor_total: number;
  data_inicio: string | null;
  data_vencimento: string | null;
  situacao: string | null;
  banco_origem: string | null;
}

const BANCOS = ["Sócios", "Buac", "Loirinha", "Carlos"] as const;

const menuItems = [
  { id: "saldo" as View, icon: Wallet, title: "Disponível para Empréstimo", desc: "Valor disponível" },
  { id: "abertos" as View, icon: Users, title: "Clientes em Aberto", desc: "Contratos ativos" },
  { id: "devendo" as View, icon: AlertTriangle, title: "Clientes Devendo", desc: "Vencidos e atrasados" },
  { id: "buscar" as View, icon: Search, title: "Buscar Cliente", desc: "Pesquisar por nome" },
];

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.round(eased * target * 100) / 100);
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
}

function SaldoPremium({ loading, data }: { loading: boolean; data: SaldoData | null }) {
  const targetVal = data?.disponivelUso ?? 0;
  const displayVal = useCountUp(loading ? 0 : targetVal);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 120px)" }}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center px-4 py-8"
      style={{ minHeight: "calc(100vh - 120px)" }}
    >
      <div
        className={`relative w-full max-w-md rounded-3xl p-8 sm:p-12 text-center transition-all duration-700 ease-out hover:scale-[1.02] ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
        style={{
          background: "linear-gradient(135deg, hsla(217, 33%, 17%, 0.7), hsla(222, 47%, 11%, 0.8))",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid hsla(142, 71%, 45%, 0.15)",
          boxShadow: "0 0 60px -12px hsla(142, 71%, 45%, 0.12), 0 25px 50px -12px rgba(0,0,0,0.4)",
        }}
      >
        <div className="absolute -inset-px rounded-3xl pointer-events-none saldo-glow-ring"
          style={{
            background: "linear-gradient(135deg, hsla(142, 71%, 45%, 0.08), transparent 60%)",
          }}
        />
        
        <p className="text-muted-foreground text-xs sm:text-sm font-medium tracking-widest uppercase mb-4 sm:mb-6">Disponível para Empréstimo</p>
        <h2 className="text-4xl sm:text-6xl font-bold text-foreground tracking-tight mb-8 sm:mb-12 tabular-nums">
          {formatCurrency(displayVal)}
        </h2>

        <div className="grid grid-cols-2 gap-4 mt-4 pt-8 border-t border-white/5">
          <div className="text-left">
            <p className="text-muted-foreground text-[10px] sm:text-xs uppercase tracking-wider mb-1">Caixinha Contas</p>
            <p className="text-base sm:text-lg font-semibold text-blue-400">{formatCurrency(data?.caixinhaContas ?? 0)}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-[10px] sm:text-xs uppercase tracking-wider mb-1">Reserva Lucro</p>
            <p className="text-base sm:text-lg font-semibold text-amber-500">{formatCurrency(data?.caixinhaLucro ?? 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const emptyForm = { nome: "", valor_principal: "", valor_total: "", data_inicio: "", data_vencimento: "", banco_origem: "" };

export default function Index() {
  const [view, setView] = useState<View>("home");
  const [saldoData, setSaldoData] = useState<SaldoData | null>(null);
  const [abertos, setAbertos] = useState<Emprestimo[]>([]);
  const [devendo, setDevendo] = useState<Emprestimo[]>([]);
  const [buscaResult, setBuscaResult] = useState<Emprestimo[]>([]);
  const [buscaPagamentos, setBuscaPagamentos] = useState<Pagamento[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showNovoDialog, setShowNovoDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");
  const [novoForm, setNovoForm] = useState(emptyForm);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    };
    checkUser();
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await calcularSaldo();
      setSaldoData(data);
    } catch {
      setError("Erro ao carregar dados do saldo");
    } finally {
      setLoading(false);
    }
  };

  const fetchSaldo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await calcularSaldo();
      setSaldoData(data);
    } catch {
      setError("Erro ao carregar dados do saldo");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAbertos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const hoje = new Date().toISOString().split("T")[0];
      const { data, error: err } = await supabase
        .from("emprestimos_v30")
        .select("id, nome, valor_principal, valor_total, data_inicio, data_vencimento, situacao, banco_origem")
        .eq("situacao", "ativo")
        .gte("data_vencimento", hoje)
        .order("data_vencimento", { ascending: true });
      if (err) throw err;
      setAbertos((data as Emprestimo[]) ?? []);
    } catch {
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDevendo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const hoje = new Date().toISOString().split("T")[0];
      const { data, error: err } = await supabase
        .from("emprestimos_v30")
        .select("id, nome, valor_principal, valor_total, data_inicio, data_vencimento, situacao, banco_origem")
        .eq("situacao", "ativo")
        .lt("data_vencimento", hoje)
        .order("data_vencimento", { ascending: true });
      if (err) throw err;
      setDevendo((data as Emprestimo[]) ?? []);
    } catch {
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBusca = useCallback(async (termo: string) => {
    if (!termo.trim()) {
      setBuscaResult([]);
      setBuscaPagamentos([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const termoNorm = termo.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

      // Busca geral local para ignorar perfeitamente os acentos
      const { data, error: err } = await supabase
        .from("emprestimos_v30")
        .select("id, nome, valor_principal, valor_total, data_inicio, data_vencimento, situacao, banco_origem")
        .order("data_vencimento", { ascending: true });
        
      if (err) throw err;
      
      let emprestimos = (data as Emprestimo[]) ?? [];
      emprestimos = emprestimos.filter(c => 
        (c.nome || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(termoNorm)
      );
      
      setBuscaResult(emprestimos);

      // Buscamos TODOS os relatórios financeiros para realizar match interconectado (incluindo renovações órfãs)
      const { data: allPagData, error: pagErr } = await supabase
        .from("fluxo_caixa_v30")
        .select("id, descricao, valor, data_movimento, tipo, id_emprestimo")
        .order("data_movimento", { ascending: false });

      if (pagErr) throw pagErr;
      
      const allPagamentos = (allPagData as Pagamento[]) ?? [];
      const idsRelacionados = emprestimos.map((e) => e.id);
      
      // Strings para match secundário de renovações (ex: "emp #274")
      const regexIds = emprestimos.map(e => `emp #${e.id}`);

      const pagamentosFiltrados = allPagamentos.filter(p => {
        // Encontra diretamente pelo ID
        if (p.id_emprestimo && idsRelacionados.includes(p.id_emprestimo)) return true;
        
        const descNorm = (p.descricao || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        
        // Encontra pela substring de texto bruto procurado
        if (descNorm.includes(termoNorm)) return true;
        
        // Encontra renovações órfãs que citam o contrato (ex: Juros Renovação [...] Emp #274)
        if (regexIds.some(empStr => descNorm.includes(empStr))) return true;

        return false;
      });

      setBuscaPagamentos(pagamentosFiltrados);

    } catch {
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === "saldo" || view === "home") fetchSaldo();
    if (view === "abertos") fetchAbertos();
    if (view === "devendo") fetchDevendo();
  }, [view, fetchSaldo, fetchAbertos, fetchDevendo]);

  useEffect(() => {
    // Configurar real-time com Supabase
    const channel1 = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fluxo_caixa_v30' },
        () => {
          if (view === "saldo") fetchSaldo();
          if (view === "buscar") fetchBusca(busca);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'emprestimos_v30' },
        () => {
          if (view === "saldo") fetchSaldo();
          if (view === "abertos") fetchAbertos();
          if (view === "devendo") fetchDevendo();
          if (view === "buscar") fetchBusca(busca);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel1);
    };
  }, [view, fetchSaldo, fetchAbertos, fetchDevendo, fetchBusca, busca]);

  useEffect(() => {
    if (view === "buscar") {
      const timeout = setTimeout(() => fetchBusca(busca), 300);
      return () => clearTimeout(timeout);
    }
  }, [busca, view, fetchBusca]);

  const handleUpdate = async (id: number, updates: { nome?: string; valor_principal?: number; valor_total?: number; data_inicio?: string; data_vencimento?: string; banco_origem?: string }) => {
    const { error: err } = await supabase
      .from("emprestimos_v30")
      .update(updates)
      .eq("id", id);
    if (err) {
      setError("Erro ao salvar dados");
      return;
    }
    if (view === "abertos") fetchAbertos();
    if (view === "devendo") fetchDevendo();
    if (view === "buscar") fetchBusca(busca);
  };

  const handleDeleteEmprestimo = async (id: number) => {
    const { error: err } = await supabase
      .from("emprestimos_v30")
      .delete()
      .eq("id", id);
    if (err) {
      setError("Erro ao excluir cadastro");
      return;
    }
    if (view === "abertos") fetchAbertos();
    if (view === "devendo") fetchDevendo();
    if (view === "buscar") fetchBusca(busca);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (error) {
      toast.error("Erro ao alterar senha: " + error.message);
    } else {
      toast.success("Senha alterada com sucesso!");
      setShowPasswordDialog(false);
      setNewPassword("");
    }
  };

  const handleDeletePagamento = async (id: number) => {
    const { error: err } = await supabase
      .from("fluxo_caixa_v30")
      .delete()
      .eq("id", id);
    if (err) {
      setError("Erro ao excluir pagamento");
      return;
    }
    fetchBusca(busca);
  };

  const handleNovoSalvar = async () => {
    if (!novoForm.nome.trim() || !novoForm.valor_principal || !novoForm.valor_total) {
      setError("Preencha nome, valor emprestado e valor volta");
      return;
    }
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.from("emprestimos_v30").insert({
      nome: novoForm.nome.trim(),
      valor_principal: Number(novoForm.valor_principal),
      valor_total: Number(novoForm.valor_total),
      data_inicio: novoForm.data_inicio || null,
      data_vencimento: novoForm.data_vencimento || null,
      banco_origem: novoForm.banco_origem || null,
      situacao: "ativo",
    });
    setSaving(false);
    if (err) {
      setError("Erro ao salvar empréstimo");
      return;
    }
    setNovoForm(emptyForm);
    setShowNovoDialog(false);
    // Refresh current view data
    if (view === "abertos") fetchAbertos();
    if (view === "devendo") fetchDevendo();
    if (view === "buscar") fetchBusca(busca);
  };

  const handleImportEmprestimos = async (parsedData: Record<string, string>[]) => {
    setLoading(true);
    let successCount = 0;
    let errorCount = 0;

    for (const row of parsedData) {
      if (!row["ID"]) continue;
      
      const id = Number(row["ID"]);
      if (isNaN(id)) continue;

      const updates: any = {};
      if (row["Nome"] !== undefined) updates.nome = row["Nome"];
      if (row["Valor Emprestado"] !== undefined) updates.valor_principal = Number(row["Valor Emprestado"]);
      if (row["Valor Volta"] !== undefined) updates.valor_total = Number(row["Valor Volta"]);
      if (row["Data Início"] !== undefined) updates.data_inicio = row["Data Início"] || null;
      if (row["Data Vencimento"] !== undefined) updates.data_vencimento = row["Data Vencimento"] || null;
      if (row["Banco Origem"] !== undefined) updates.banco_origem = row["Banco Origem"] || null;

      const { error } = await supabase.from("emprestimos_v30").update(updates).eq("id", id);
      if (error) {
        errorCount++;
        console.error("Error updating ID:", id, error);
      } else {
        successCount++;
      }
    }

    if (errorCount > 0) {
      toast.error(`Importação concluída com ${errorCount} erro(s). ${successCount} atualizados.`);
    } else if (successCount > 0) {
      toast.success(`${successCount} registro(s) atualizado(s) com sucesso!`);
    } else {
      toast.info("Nenhum registro com ID encontrado no arquivo CSV.");
    }

    if (view === "abertos") fetchAbertos();
    if (view === "devendo") fetchDevendo();
    if (view === "buscar") fetchBusca(busca);
    setLoading(false);
  };

  const changeView = (v: View) => {
    setView(v);
    setBusca("");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 sm:px-6 py-4 sm:py-5">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          {view !== "home" && (
            <button onClick={() => changeView("home")} className="text-muted-foreground hover:text-foreground transition-colors mr-1 sm:mr-2 p-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden flex items-center justify-center border border-primary/20">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-foreground">Mente Financeira</h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Usuário</span>
              <span className="text-sm font-medium text-foreground">{userEmail}</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-primary transition-all gap-2 hidden sm:flex"
              onClick={() => setShowPasswordDialog(true)}
            >
              <RefreshCw className="w-4 h-4" />
              Alterar Senha
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-destructive transition-all gap-2"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-semibold uppercase tracking-tight">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {error && (
          <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg px-4 py-3 mb-6 text-sm">
            {error}
          </div>
        )}

        {view === "home" && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => changeView(item.id)}
                  className="bg-card hover:bg-accent border border-border rounded-xl p-4 sm:p-6 text-left transition-all duration-200 hover:border-primary/30 group"
                >
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-hover:text-primary mb-3 sm:mb-4 transition-colors" />
                  <p className="text-foreground font-semibold text-sm sm:text-base">{item.title}</p>
                  <p className="text-muted-foreground text-xs sm:text-sm mt-1">{item.desc}</p>
                </button>
              ))}
              <button
                onClick={() => setShowNovoDialog(true)}
                className="bg-card hover:bg-accent border border-border rounded-xl p-4 sm:p-6 text-left transition-all duration-200 hover:border-primary/30 group border-dashed"
              >
                <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground group-hover:text-primary mb-3 sm:mb-4 transition-colors" />
                <p className="text-foreground font-semibold text-sm sm:text-base">Novo Empréstimo</p>
                <p className="text-muted-foreground text-xs sm:text-sm mt-1">Cadastrar novo</p>
              </button>
            </div>
            
            {!loading && saldoData && saldoData.saldoTotal === 0 && (
              <div className="mt-8 p-6 border border-amber-500/20 bg-amber-500/5 rounded-2xl text-center">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
                <h3 className="text-amber-500 font-semibold mb-1">Nenhum dado encontrado</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Se você sabe que existem dados mas eles não aparecem, pode ser necessário atualizar as permissões (RLS) no seu Supabase para usuários autenticados. Verifique o arquivo <code className="text-primary">SUPABASE_CONFIG.sql</code> no seu projeto.
                </p>
              </div>
            )}

            {!loading && saldoData && saldoData.saldoTotal !== 0 && (
              <ResumoGrafico data={saldoData} />
            )}
          </>
        )}

        {view === "saldo" && (
          <SaldoPremium loading={loading} data={saldoData} />
        )}

        {view === "abertos" && (
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6">Clientes em Aberto</h2>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <ClienteTable contratos={abertos} onUpdate={handleUpdate} onDeleteEmprestimo={handleDeleteEmprestimo} showSituacao={false} onImportEmprestimos={handleImportEmprestimos} />
            )}
          </div>
        )}

        {view === "devendo" && (
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6">Clientes Devendo</h2>
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <ClienteTable contratos={devendo} onUpdate={handleUpdate} onDeleteEmprestimo={handleDeleteEmprestimo} showSituacao={false} isDevendo={true} onImportEmprestimos={handleImportEmprestimos} />
            )}
          </div>
        )}

        {view === "buscar" && (
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4">Buscar Cliente</h2>
            <Input
              placeholder="Digite o nome do cliente..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="max-w-md mb-6 bg-card text-sm sm:text-base h-10 sm:h-11"
            />
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : busca.trim() ? (
              <ClienteTable contratos={buscaResult} onUpdate={handleUpdate} onDeleteEmprestimo={handleDeleteEmprestimo} showSituacao={true} pagamentos={buscaPagamentos} onDeletePagamento={handleDeletePagamento} onImportEmprestimos={handleImportEmprestimos} />
            ) : null}
          </div>
        )}
      </main>

      {/* Novo Empréstimo Dialog */}
      <Dialog open={showNovoDialog} onOpenChange={setShowNovoDialog}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Novo Empréstimo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Nome</label>
              <Input value={novoForm.nome} onChange={(e) => setNovoForm({ ...novoForm, nome: e.target.value })} className="bg-accent" placeholder="Nome do cliente" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Valor Emprestado</label>
                <Input type="number" value={novoForm.valor_principal} onChange={(e) => setNovoForm({ ...novoForm, valor_principal: e.target.value })} className="bg-accent" placeholder="0" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Valor Volta</label>
                <Input type="number" value={novoForm.valor_total} onChange={(e) => setNovoForm({ ...novoForm, valor_total: e.target.value })} className="bg-accent" placeholder="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Data Início</label>
                <Input type="date" value={novoForm.data_inicio} onChange={(e) => setNovoForm({ ...novoForm, data_inicio: e.target.value })} className="bg-accent" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Data Vencimento</label>
                <Input type="date" value={novoForm.data_vencimento} onChange={(e) => setNovoForm({ ...novoForm, data_vencimento: e.target.value })} className="bg-accent" />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Banco Origem</label>
              <Select value={novoForm.banco_origem} onValueChange={(v) => setNovoForm({ ...novoForm, banco_origem: v })}>
                <SelectTrigger className="bg-accent">
                  <SelectValue placeholder="Selecionar banco" />
                </SelectTrigger>
                <SelectContent>
                  {BANCOS.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleNovoSalvar} disabled={saving} className="flex-1">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
              </Button>
              <Button variant="outline" onClick={() => { setShowNovoDialog(false); setNovoForm(emptyForm); }} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Nova Senha</label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleUpdatePassword}
              disabled={saving}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Confirmar Nova Senha"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
