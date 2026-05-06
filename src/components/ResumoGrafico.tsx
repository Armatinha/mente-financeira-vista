import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { type SaldoData } from "@/services/saldoService";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function ResumoGrafico({ data }: { data: SaldoData }) {
  const pieData = [
    { name: "Disponível", value: data.disponivelUso },
    { name: "Contas", value: data.caixinhaContas },
    { name: "Lucro", value: data.caixinhaLucro },
  ].filter(item => item.value > 0);

  const barData = data.bancos.map(b => ({
    nome: b.nome,
    valor: b.valor
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">Distribuição de Saldo</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">Empréstimos por Banco (Ativos)</h3>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.1)" vertical={false} />
              <XAxis dataKey="nome" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              />
              <Bar dataKey="valor" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
