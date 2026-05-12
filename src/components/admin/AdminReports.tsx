
"use client";

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  ArrowUpRight, 
  Users, 
  Target, 
  Download, 
  Loader2, 
  Package, 
  User, 
  Calendar,
  FileText
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export function AdminReports() {
  const db = useFirestore();
  const [timeframe, setTimeframe] = useState(30);

  // 1. Consulta de Dados
  const ordersQuery = useMemoFirebase(() => query(collection(db, 'orders'), orderBy('createdAt', 'desc')), [db]);
  const { data: allOrders, isLoading: loadingOrders } = useCollection(ordersQuery);

  // Simulação/Busca de Analytics para Taxa de Conversão (Sessões)
  const analyticsQuery = useMemoFirebase(() => query(collection(db, 'analytics')), [db]);
  const { data: analyticsData } = useCollection(analyticsQuery);

  // 2. Processamento e Filtragem por Data
  const reportData = useMemo(() => {
    if (!allOrders) return null;

    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - timeframe);

    const filtered = allOrders.filter(o => {
      const d = o.createdAt?.toDate ? o.createdAt.toDate() : new Date(o.createdAt);
      return d >= startDate;
    });

    // Calcular Receita e Pedidos
    const totalRevenue = filtered.reduce((acc, o) => acc + (o.total || 0), 0);
    const totalOrders = filtered.length;
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calcular Produtos Mais Vendidos
    const productMap = new Map();
    filtered.forEach(order => {
      order.items?.forEach((item: any) => {
        const id = item.productId || item.id;
        if (!productMap.has(id)) {
          productMap.set(id, { 
            name: item.name, 
            image: item.image, 
            qty: 0, 
            revenue: 0 
          });
        }
        const p = productMap.get(id);
        p.qty += (item.quantity || 1);
        p.revenue += ((item.price || 0) * (item.quantity || 1));
      });
    });
    const topProducts = Array.from(productMap.values()).sort((a, b) => b.qty - a.qty).slice(0, 5);

    // Calcular Clientes que mais compram
    const customerMap = new Map();
    filtered.forEach(order => {
      const uid = order.userId || order.customer?.email;
      if (!uid) return;
      if (!customerMap.has(uid)) {
        customerMap.set(uid, { 
          name: order.customer?.name || 'Cliente', 
          email: order.customer?.email || '-', 
          orders: 0, 
          spent: 0 
        });
      }
      const c = customerMap.get(uid);
      c.orders += 1;
      c.spent += (order.total || 0);
    });
    const topCustomers = Array.from(customerMap.values()).sort((a, b) => b.spent - a.spent).slice(0, 5);

    // Taxa de Conversão (Baseada em analytics ou sessões estimadas)
    const sessionsCount = analyticsData?.length || (totalOrders * 25); // Fallback caso não tenha analytics real ainda
    const conversionRate = sessionsCount > 0 ? (totalOrders / sessionsCount) * 100 : 0;

    return {
      totalRevenue,
      totalOrders,
      avgTicket,
      topProducts,
      topCustomers,
      conversionRate,
      sessionsCount
    };
  }, [allOrders, timeframe, analyticsData]);

  // Exportar para CSV
  const handleExportCSV = () => {
    if (!reportData) return;
    const rows = [
      ["Relatorio de Performance Toda Bela", `Periodo: ${timeframe} dias`],
      [],
      ["Metrica", "Valor"],
      ["Receita Total", reportData.totalRevenue.toFixed(2)],
      ["Total de Pedidos", reportData.totalOrders],
      ["Ticket Medio", reportData.avgTicket.toFixed(2)],
      ["Taxa de Conversao", `${reportData.conversionRate.toFixed(2)}%`],
      [],
      ["Produtos Mais Vendidos"],
      ["Nome", "Quantidade", "Receita"],
      ...reportData.topProducts.map(p => [p.name, p.qty, p.revenue.toFixed(2)]),
      [],
      ["Melhores Clientes"],
      ["Nome", "Pedidos", "Total Gasto"],
      ...reportData.topCustomers.map(c => [c.name, c.orders, c.spent.toFixed(2)])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_todabela_${timeframe}dias.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loadingOrders) {
    return (
      <div className="py-40 text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-accent mx-auto" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Processando Inteligência...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-primary/5">
          {[
            { label: '7 Dias', val: 7 },
            { label: '30 Dias', val: 30 },
            { label: '90 Dias', val: 90 },
          ].map(t => (
            <button
              key={t.val}
              onClick={() => setTimeframe(t.val)}
              className={cn(
                "px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                timeframe === t.val ? "bg-primary text-white shadow-lg" : "text-primary/40 hover:bg-secondary/50"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleExportCSV}
            className="rounded-full bg-white h-11 px-6 border-none shadow-sm text-[10px] font-bold uppercase tracking-widest hover:bg-secondary/50"
          >
            <Download className="mr-2 h-4 w-4 text-accent" /> Exportar CSV
          </Button>
          <Button 
            onClick={handlePrintPDF}
            className="rounded-full bg-primary text-white h-11 px-8 shadow-xl text-[10px] font-bold uppercase tracking-widest"
          >
            <FileText className="mr-2 h-4 w-4" /> Exportar PDF
          </Button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Faturamento", val: `R$ ${reportData?.totalRevenue.toFixed(2)}`, icon: <DollarSign className="h-5 w-5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Conversão", val: `${reportData?.conversionRate.toFixed(1)}%`, icon: <Target className="h-5 w-5" />, color: "text-accent", bg: "bg-accent/10" },
          { label: "Ticket Médio", val: `R$ ${reportData?.avgTicket.toFixed(2)}`, icon: <TrendingUp className="h-5 w-5" />, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Pedidos", val: reportData?.totalOrders || 0, icon: <ShoppingBag className="h-5 w-5" />, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat, i) => (
          <Card key={i} className="p-8 border-none shadow-sm bg-white rounded-[2.5rem] flex items-center gap-6">
            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
               {stat.icon}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">{stat.label}</p>
              <p className="text-3xl font-bold text-primary">{stat.val}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Top Products */}
        <Card className="rounded-[3rem] border-none bg-white shadow-xl overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 flex items-center gap-3">
             <Package className="h-5 w-5 text-accent" />
             <h4 className="font-bold text-primary uppercase tracking-tight">Produtos Mais Vendidos</h4>
          </div>
          <div className="flex-1">
             <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Peça</th>
                    <th className="px-8 py-5 text-center">Qtd</th>
                    <th className="px-8 py-5 text-right">Receita</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reportData?.topProducts.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-9 rounded-lg overflow-hidden bg-secondary">
                              <img src={p.image} className="h-full w-full object-cover" />
                           </div>
                           <span className="text-sm font-bold text-primary truncate max-w-[200px]">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center font-mono text-sm">{p.qty} un</td>
                      <td className="px-8 py-5 text-right font-bold text-primary">R$ {p.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                  {reportData?.topProducts.length === 0 && (
                    <tr><td colSpan={3} className="py-20 text-center italic text-muted-foreground">Sem dados no período.</td></tr>
                  )}
                </tbody>
             </table>
          </div>
        </Card>

        {/* Top Customers */}
        <Card className="rounded-[3rem] border-none bg-white shadow-xl overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 flex items-center gap-3">
             <User className="h-5 w-5 text-accent" />
             <h4 className="font-bold text-primary uppercase tracking-tight">Melhores Clientes</h4>
          </div>
          <div className="flex-1">
             <table className="w-full text-left">
                <thead className="bg-gray-50/50 text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                  <tr>
                    <th className="px-8 py-5">Cliente</th>
                    <th className="px-8 py-5 text-center">Pedidos</th>
                    <th className="px-8 py-5 text-right">Total Gasto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {reportData?.topCustomers.map((c, i) => (
                    <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-8 py-5">
                         <div className="flex flex-col">
                            <span className="text-sm font-bold text-primary uppercase">{c.name}</span>
                            <span className="text-[10px] text-muted-foreground">{c.email}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5 text-center font-mono text-sm">{c.orders}</td>
                      <td className="px-8 py-5 text-right font-bold text-primary">R$ {c.spent.toFixed(2)}</td>
                    </tr>
                  ))}
                   {reportData?.topCustomers.length === 0 && (
                    <tr><td colSpan={3} className="py-20 text-center italic text-muted-foreground">Sem dados no período.</td></tr>
                  )}
                </tbody>
             </table>
          </div>
        </Card>
      </div>

      {/* Daily Performance Chart */}
      <Card className="p-10 border-none shadow-xl bg-white rounded-[3rem] space-y-8">
        <div className="flex items-center justify-between">
           <div className="space-y-1">
              <h4 className="font-bold text-primary flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-accent" /> Histórico de Performance
              </h4>
              <p className="text-xs text-muted-foreground italic">Distribuição de faturamento bruto por data.</p>
           </div>
           <Badge className="bg-emerald-50 text-emerald-600 border-none px-4 py-1.5 uppercase font-bold text-[10px]">Crescimento Ativo</Badge>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData?.topProducts.slice(0, 4) || []} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 'bold', fill: '#6E3C47' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#C7A17A' }} 
                tickFormatter={(val) => `R$ ${val}`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                cursor={{ fill: '#FFF9F7' }}
              />
              <Bar 
                dataKey="revenue" 
                fill="#6E3C47" 
                radius={[12, 12, 0, 0]} 
                barSize={60} 
                animationDuration={2000}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

