import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Lock, ShieldAlert, Check } from "lucide-react";

export default function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      toast.success("Senha atualizada com sucesso!");
      setTimeout(() => navigate("/auth"), 2000);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0a] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-6 shadow-xl">
            <RefreshCw className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Nova Senha</h1>
          <p className="text-muted-foreground mt-2">Defina sua nova credencial de acesso</p>
        </div>

        <div className="bg-[#141414]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Nova Senha</label>
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

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 bg-black/40 border-white/5 focus:border-primary/50 transition-all h-12 rounded-xl"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Atualizar Senha"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Re-importing RefreshCw because I used it in JSX but forgot to list it in imports if it's not there.
import { RefreshCw } from "lucide-react";
