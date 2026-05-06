import { useState, useRef } from "react";
import { Pencil, Check, X, Trash2, Download, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { exportToCSV, parseCSV } from "@/lib/csv";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

export interface Pagamento {
  id: number;
  descricao: string | null;
  valor: number | null;
  data_movimento: string | null;
  tipo: string | null;
  id_emprestimo: number | null;
}

const BANCOS = ["Sócios", "Buac", "Loirinha", "Carlos"] as const;

interface ClienteTableProps {
  contratos: Emprestimo[];
  onUpdate: (id: number, data: { nome?: string; valor_principal?: number; valor_total?: number; data_inicio?: string; data_vencimento?: string; banco_origem?: string }) => void;
  onDeleteEmprestimo?: (id: number) => void;
  showSituacao?: boolean;
  isDevendo?: boolean;
  pagamentos?: Pagamento[];
  onDeletePagamento?: (id: number) => void;
  onImportEmprestimos?: (updates: any[]) => void;
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date + "T00:00:00").toLocaleDateString("pt-BR");
}

function formatDateTime(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR");
}

function calcDiasAtraso(dataVencimento: string | null): number {
  if (!dataVencimento) return 0;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const venc = new Date(dataVencimento + "T00:00:00");
  const diff = hoje.getTime() - venc.getTime();
  return diff > 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) : 0;
}

function getStatus(c: Emprestimo): { label: string; isVencido: boolean } {
  if (c.situacao === "quitado") return { label: "Quitado", isVencido: false };
  if (!c.data_vencimento) return { label: "Em aberto", isVencido: false };
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const venc = new Date(c.data_vencimento + "T00:00:00");
  if (venc < hoje) return { label: "Vencido", isVencido: true };
  return { label: "Em aberto", isVencido: false };
}

export default function ClienteTable({ contratos, onUpdate, onDeleteEmprestimo, showSituacao = false, isDevendo = false, pagamentos, onDeletePagamento, onImportEmprestimos }: ClienteTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ nome: "", valorPrincipal: 0, valorTotal: 0, dataInicio: "", dataVencimento: "", bancoOrigem: "" });
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteEmprestimoId, setDeleteEmprestimoId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalPrincipal = contratos.reduce((s, c) => s + (Number(c.valor_principal) || 0), 0);
  const totalReceber = contratos.reduce((s, c) => s + (Number(c.valor_total) || 0), 0);
  const totalJuros = totalReceber - totalPrincipal;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const parsed = parseCSV(text);
        if (onImportEmprestimos) {
          onImportEmprestimos(parsed);
        }
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const startEdit = (c: Emprestimo) => {
    setEditingId(c.id);
    setEditData({ nome: c.nome, valorPrincipal: c.valor_principal, valorTotal: c.valor_total, dataInicio: c.data_inicio ?? "", dataVencimento: c.data_vencimento ?? "", bancoOrigem: c.banco_origem ?? "" });
  };

  const saveEdit = () => {
    if (editingId !== null) {
      onUpdate(editingId, {
        nome: editData.nome,
        valor_principal: editData.valorPrincipal,
        valor_total: editData.valorTotal,
        data_inicio: editData.dataInicio || undefined,
        data_vencimento: editData.dataVencimento || undefined,
        banco_origem: editData.bancoOrigem || undefined,
      });
      setEditingId(null);
    }
  };

  const confirmDelete = () => {
    if (deleteId !== null && onDeletePagamento) {
      onDeletePagamento(deleteId);
      setDeleteId(null);
    }
  };

  const confirmDeleteEmprestimo = () => {
    if (deleteEmprestimoId !== null && onDeleteEmprestimo) {
      onDeleteEmprestimo(deleteEmprestimoId);
      setDeleteEmprestimoId(null);
    }
  };

  // Sort: for devendo, sort by name asc then dias atraso desc
  const sorted = isDevendo
    ? [...contratos].sort((a, b) => {
        const nameCompare = a.nome.localeCompare(b.nome, "pt-BR");
        if (nameCompare !== 0) return nameCompare;
        return calcDiasAtraso(b.data_vencimento) - calcDiasAtraso(a.data_vencimento);
      })
    : contratos;

  const handleDownloadCSV = () => {
    const dataToExport = sorted.map(c => {
      const diasAtraso = calcDiasAtraso(c.data_vencimento);
      const juros = (Number(c.valor_total) || 0) - (Number(c.valor_principal) || 0);
      const status = getStatus(c);

      return {
        "ID": c.id,
        "Nome": c.nome,
        "Valor Emprestado": Number(c.valor_principal) || 0,
        "Valor Volta": Number(c.valor_total) || 0,
        "Juros": juros,
        "Data Início": c.data_inicio || "", // Export YYYY-MM-DD for easier parsing on import
        "Data Vencimento": c.data_vencimento || "", // Export YYYY-MM-DD
        "Dias Atraso": diasAtraso,
        "Situação": status.label,
        "Banco Origem": c.banco_origem || ""
      };
    });

    const prefix = isDevendo ? "clientes_devendo" : "clientes";
    exportToCSV(dataToExport, `${prefix}_${new Date().toISOString().split("T")[0]}`);
  };

  const handleDownloadPagamentosCSV = () => {
    if (!pagamentos) return;
    const dataToExport = pagamentos.map(p => ({
      "Descrição": p.descricao || "Pagamento",
      "Valor": Number(p.valor) || 0,
      "Data Movimento": p.data_movimento ? formatDateTime(p.data_movimento) : ""
    }));
    exportToCSV(dataToExport, `pagamentos_${new Date().toISOString().split("T")[0]}`);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-secondary rounded-lg p-3 sm:p-4">
          <p className="text-muted-foreground text-xs sm:text-sm">Total Emprestado</p>
          <p className="text-foreground text-lg sm:text-xl font-bold">{formatCurrency(totalPrincipal)}</p>
        </div>
        <div className="bg-secondary rounded-lg p-3 sm:p-4">
          <p className="text-muted-foreground text-xs sm:text-sm">Total a Receber</p>
          <p className="text-primary text-lg sm:text-xl font-bold">{formatCurrency(totalReceber)}</p>
        </div>
        <div className="bg-secondary rounded-lg p-3 sm:p-4">
          <p className="text-muted-foreground text-xs sm:text-sm">Total de Juros</p>
          <p className="text-warning text-lg sm:text-xl font-bold">{formatCurrency(totalJuros)}</p>
        </div>
      </div>

      <div className="flex justify-end mb-4 gap-2">
        {onImportEmprestimos && (
          <>
            <input 
              type="file" 
              accept=".csv" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2">
              <Upload className="w-4 h-4" />
              Importar CSV
            </Button>
          </>
        )}
        <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="gap-2">
          <Download className="w-4 h-4" />
          Baixar CSV
        </Button>
      </div>

      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-xs sm:text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-3 px-3 sm:px-4 font-medium">Nome</th>
              <th className="text-right py-3 px-3 sm:px-4 font-medium">
                {isDevendo ? "Valor Emprestado" : "Valor Principal"}
              </th>
              <th className="text-right py-3 px-3 sm:px-4 font-medium">
                {isDevendo ? "Valor Volta" : "Valor Total"}
              </th>
              <th className="text-right py-3 px-3 sm:px-4 font-medium">Juros</th>
              <th className="text-right py-3 px-3 sm:px-4 font-medium">Início</th>
              <th className="text-right py-3 px-3 sm:px-4 font-medium">Vencimento</th>
              {(isDevendo || showSituacao) && <th className="text-right py-3 px-3 sm:px-4 font-medium">Dias Atraso</th>}
              {showSituacao && <th className="text-center py-3 px-3 sm:px-4 font-medium">Situação</th>}
              <th className="text-center py-3 px-3 sm:px-4 font-medium w-16 sm:w-20"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => {
              const diasAtraso = calcDiasAtraso(c.data_vencimento);
              const juros = (Number(c.valor_total) || 0) - (Number(c.valor_principal) || 0);
              const status = getStatus(c);
              return (
                <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                  {editingId === c.id ? (
                    <>
                      <td className="py-3 px-3 sm:px-4">
                        <Input
                          value={editData.nome}
                          onChange={(e) => setEditData({ ...editData, nome: e.target.value })}
                          className="h-8 bg-accent text-xs sm:text-sm"
                        />
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <Input
                          type="number"
                          value={editData.valorPrincipal}
                          onChange={(e) => setEditData({ ...editData, valorPrincipal: Number(e.target.value) })}
                          className="h-8 bg-accent text-right text-xs sm:text-sm"
                        />
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <Input
                          type="number"
                          value={editData.valorTotal}
                          onChange={(e) => setEditData({ ...editData, valorTotal: Number(e.target.value) })}
                          className="h-8 bg-accent text-right text-xs sm:text-sm"
                        />
                      </td>
                      <td className="text-right py-3 px-3 sm:px-4 text-warning">{formatCurrency(editData.valorTotal - editData.valorPrincipal)}</td>
                      <td className="py-3 px-3 sm:px-4">
                        <Input
                          type="date"
                          value={editData.dataInicio}
                          onChange={(e) => setEditData({ ...editData, dataInicio: e.target.value })}
                          className="h-8 bg-accent text-right text-xs sm:text-sm"
                        />
                      </td>
                      <td className="py-3 px-3 sm:px-4">
                        <Input
                          type="date"
                          value={editData.dataVencimento}
                          onChange={(e) => setEditData({ ...editData, dataVencimento: e.target.value })}
                          className="h-8 bg-accent text-right text-xs sm:text-sm"
                        />
                      </td>
                      {(isDevendo || showSituacao) && <td className="text-right py-3 px-3 sm:px-4 text-destructive font-semibold">{diasAtraso}</td>}
                      {showSituacao && (
                        <td className="text-center py-3 px-3 sm:px-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${status.isVencido ? "bg-destructive/15 text-destructive" : "bg-emerald-500/15 text-emerald-400"}`}>
                            {status.label}
                          </span>
                        </td>
                      )}
                      <td className="py-3 px-3 sm:px-4 text-center">
                        <div className="flex gap-1 justify-center">
                          <button onClick={saveEdit} className="text-primary hover:text-primary/80 p-1.5 sm:p-1">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-destructive hover:text-destructive/80 p-1.5 sm:p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className={`py-3 px-3 sm:px-4 font-medium ${showSituacao && status.isVencido ? "text-destructive" : "text-foreground"}`}>{c.nome}</td>
                      <td className="text-right py-3 px-3 sm:px-4 text-foreground">{formatCurrency(Number(c.valor_principal) || 0)}</td>
                      <td className={`text-right py-3 px-3 sm:px-4 font-semibold ${isDevendo || (showSituacao && status.isVencido) ? "text-destructive" : "text-primary"}`}>
                        {formatCurrency(Number(c.valor_total) || 0)}
                      </td>
                      <td className="text-right py-3 px-3 sm:px-4 text-warning">{formatCurrency(juros)}</td>
                      <td className="text-right py-3 px-3 sm:px-4 text-muted-foreground">{formatDate(c.data_inicio)}</td>
                      <td className="text-right py-3 px-3 sm:px-4 text-muted-foreground">{formatDate(c.data_vencimento)}</td>
                      {(isDevendo || showSituacao) && (
                        <td className={`text-right py-3 px-3 sm:px-4 font-semibold ${diasAtraso > 0 ? "text-destructive" : "text-muted-foreground"}`}>{diasAtraso}</td>
                      )}
                      {showSituacao && (
                        <td className="text-center py-3 px-3 sm:px-4">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${status.isVencido ? "bg-destructive/15 text-destructive" : "bg-emerald-500/15 text-emerald-400"}`}>
                            {status.label}
                          </span>
                        </td>
                      )}
                      <td className="py-3 px-3 sm:px-4 text-center">
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => startEdit(c)} className="text-muted-foreground hover:text-foreground p-1.5 sm:p-1 transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          {onDeleteEmprestimo && (
                            <button onClick={() => setDeleteEmprestimoId(c.id)} className="text-destructive/50 hover:text-destructive p-1.5 sm:p-1 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
            {contratos.length === 0 && (
              <tr>
                <td colSpan={isDevendo ? 9 : (showSituacao ? 9 : 7)} className="text-center py-8 text-muted-foreground">Nenhum cliente encontrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagamentos section */}
      {pagamentos && pagamentos.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm sm:text-base font-semibold text-foreground">Registros de Pagamento</h3>
            <Button variant="outline" size="sm" onClick={handleDownloadPagamentosCSV} className="gap-2">
              <Download className="w-4 h-4" />
              Baixar CSV
            </Button>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full text-xs sm:text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="text-left py-3 px-3 sm:px-4 font-medium">Descrição</th>
                  <th className="text-right py-3 px-3 sm:px-4 font-medium">Valor</th>
                  <th className="text-right py-3 px-3 sm:px-4 font-medium">Data</th>
                  <th className="text-center py-3 px-3 sm:px-4 font-medium w-12"></th>
                </tr>
              </thead>
              <tbody>
                {pagamentos.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-3 sm:px-4 text-foreground">{p.descricao ?? "Pagamento"}</td>
                    <td className="text-right py-3 px-3 sm:px-4 text-primary font-semibold">{formatCurrency(Number(p.valor) || 0)}</td>
                    <td className="text-right py-3 px-3 sm:px-4 text-muted-foreground">{formatDateTime(p.data_movimento)}</td>
                    <td className="py-3 px-3 sm:px-4 text-center">
                      {onDeletePagamento && (
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="text-destructive/60 hover:text-destructive p-1.5 sm:p-1 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete pagamento confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este registro de pagamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete emprestimo confirmation */}
      <AlertDialog open={deleteEmprestimoId !== null} onOpenChange={(open) => !open && setDeleteEmprestimoId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cadastro? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEmprestimo} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
