import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Lock, Mail, ArrowRight, ShieldCheck, RefreshCw } from "lucide-react";

const WHITELIST = ["nudoze@proton.me", "mcdouglasf4phantomii@gmail.com"];

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState<"login" | "reset">("login");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/");
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!WHITELIST.includes(email.toLowerCase())) {
      toast.error("Acesso restrito. Este e-mail não tem permissão.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("E-mail ou senha incorretos.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Bem-vindo de volta!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error("Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Digite seu e-mail primeiro.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("E-mail de recuperação enviado!");
      setView("login");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-emerald-500/20 border border-white/10 mb-6 shadow-xl overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Mente Financeira</h1>
          <p className="text-muted-foreground mt-2">Acesso Restrito & Seguro</p>
        </div>

        <div className="bg-[#141414]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {view === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground ml-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-black/40 border-white/5 focus:border-primary/50 transition-all h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-medium text-muted-foreground">Senha</label>
                  <button 
                    type="button"
                    onClick={() => setView("reset")}
                    className="text-xs text-primary hover:underline transition-all"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-black/40 border-white/5 focus:border-primary/50 transition-all h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base transition-all active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="flex items-center gap-2">
                    Entrar <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground ml-1">Digite seu e-mail cadastrado</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-black/40 border-white/5 focus:border-primary/50 transition-all h-12 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar Recuperação"}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost"
                  className="w-full h-12 rounded-xl text-muted-foreground hover:text-white transition-all"
                  onClick={() => setView("login")}
                >
                  Voltar para o Login
                </Button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          © 2024 Mente Financeira Vista. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
