
import { NextRequest, NextResponse } from 'next/server';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Consulta o status de um pedido no Firestore.
 * Utiliza o SDK de cliente configurado para rodar no servidor.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'orderId obrigatório' }, { status: 400 });
    }

    // Inicializa os SDKs do projeto
    const { firestore } = initializeFirebase();
    
    // Busca o documento do pedido
    const orderRef = doc(firestore, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return NextResponse.json({ error: 'Pedido não encontrado' }, { status: 404 });
    }

    const order = orderSnap.data();

    // Retorna os campos de status solicitados para o polling do frontend
    return NextResponse.json({
      status: order?.status || 'pending',
      paymentStatus: order?.paymentStatus || 'pending'
    });

  } catch (error: any) {
    console.error('Status API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
