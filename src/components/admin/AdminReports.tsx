
"use client";

import React from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query } from 'firebase/firestore';

export function AdminReports() {
  const db = useFirestore();
  const { data: orders } = useCollection(query(collection(db, 'orders')));

  const chartData = [
    { name: 'Seg', v: 400 },
    { name: 'Ter', v: 700 },
    { name: 'Qua', v: 200 },
    { name: 'Qui', v: 900 },
    { name: 'Sex', v: 500 },
    { name: 'Sab', v: 1100 },
    { name: 'Dom', v: 800 },
  ];

  return (
    <div className="space-y-10">
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="p-8 border-none shadow-sm space-y-4">
           <div className="flex justify-between items-start">
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600"><DollarSign className="h-6 w-6" /></div>
              <Badge className="bg-emerald-100 text-emerald-700 border-none flex gap-1"><ArrowUpRight className="h-3 w-3" /> 12%</Badge>
           </div>
           <div>
              <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">Faturamento Total</p>
              <h4 className="text-3xl font-bold text-primary">R$ 0,00</h4>
           </div>
        </Card>
        <Card className="p-8 border-none shadow-sm space-y-4">
           <div className="flex justify-between items-start">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600"><ShoppingBag className="h-6 w-6" /></div>
              <Badge className="bg-blue-100 text-blue-700 border-none flex gap-1"><ArrowUpRight className="h-3 w-3" /> 5%</Badge>
           </div>
           <div>
              <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">Pedidos Feitos</p>
              <h4 className="text-3xl font-bold text-primary">{orders?.length || 0}</h4>
           </div>
        </Card>
        <Card className="p-8 border-none shadow-sm space-y-4">
           <div className="flex justify-between items-start">
              <div className="p-3 rounded-2xl bg-purple-50 text-purple-600"><TrendingUp className="h-6 w-6" /></div>
              <Badge className="bg-purple-100 text-purple-700 border-none">Estável</Badge>
           </div>
           <div>
              <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-widest">Ticket Médio</p>
              <h4 className="text-3xl font-bold text-primary">R$ 0,00</h4>
           </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-8 border-none shadow-sm bg-white space-y-6">
          <h5 className="font-bold text-primary flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-accent" /> Desempenho Diário
          </h5>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f9f9f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="v" fill="#6E3C47" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8 border-none shadow-sm bg-white space-y-6">
          <h5 className="font-bold text-primary flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-accent" /> Fluxo de Caixa (Simulação)
          </h5>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C7A17A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C7A17A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="v" stroke="#C7A17A" strokeWidth={3} fillOpacity={1} fill="url(#colorV)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
