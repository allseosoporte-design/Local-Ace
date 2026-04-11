
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert } from 'firebase-admin/app';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Inicialización segura de Firebase Admin para el entorno de API
 */
function getAdminDb() {
  if (getApps().length === 0) {
    const saPath = path.join(process.cwd(), 'serviceAccountKey.json');
    if (fs.existsSync(saPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
      initializeApp({ credential: cert(serviceAccount) });
    } else {
      initializeApp();
    }
  }
  return getFirestore();
}

export async function POST(req: NextRequest) {
  const db = getAdminDb();
  const hottokHeader = req.headers.get('x-hotmart-hottok');

  try {
    const body = await req.json();
    const { event, data } = body;

    // 1. Validar Firma Hottok
    const configDoc = await db.collection('adminConfig').doc('hotmart').get();
    const config = configDoc.data();

    if (!config || hottokHeader !== config.hottokSecret) {
      console.error('[Hotmart Webhook] Unauthorized: Invalid Hottok');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Registrar el log del evento inmediatamente (Auditoría)
    const eventId = data?.purchase?.transaction || `hm_${Date.now()}`;
    const logRef = db.collection('hotmartEventLogs').doc(eventId);
    
    await logRef.set({
      id: eventId,
      email: data?.buyer?.email || 'unknown',
      event: event,
      productId: data?.product?.id?.toString() || '',
      offerId: data?.offer?.code || '',
      status: 'received',
      eventDate: new Date(),
      processed: false,
      rawPayload: body
    });

    // 3. Responder 200 rápido a Hotmart para evitar timeouts
    // El procesamiento real ocurre después pero devolvemos la respuesta ya.
    processEvent(eventId, event, data, db);

    return NextResponse.json({ received: true }, { status: 200 });

  } catch (error: any) {
    console.error('[Hotmart Webhook Error]:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Lógica de procesamiento de eventos (Sincronización de suscripciones)
 */
async function processEvent(logId: string, event: string, data: any, db: FirebaseFirestore.Firestore) {
  const email = data?.buyer?.email;
  const offerId = data?.offer?.code;
  const logRef = db.collection('hotmartEventLogs').doc(logId);

  try {
    if (!email) throw new Error('No email found in payload');

    if (event === 'PURCHASE_COMPLETE') {
      // Buscar mapeo de plan
      const mappingQuery = await db.collection('hotmartPlanMappings')
        .where('offerId', '==', offerId)
        .where('active', '==', true)
        .limit(1)
        .get();

      if (mappingQuery.empty) throw new Error(`No active mapping found for offer: ${offerId}`);
      
      const mapping = mappingQuery.docs[0].data();
      const planId = mapping.internalPlanId;

      // Actualizar o crear suscripción de la empresa vinculada al email
      // En este SaaS, el businessId suele ser el UID del usuario.
      const businessQuery = await db.collection('businesses')
        .where('adminEmail', '==', email)
        .limit(1)
        .get();

      let businessId = '';
      if (!businessQuery.empty) {
        businessId = businessQuery.docs[0].id;
      } else {
        // Si no existe el negocio, el proceso de registro lo vinculará después
        // o podríamos crear un registro pendiente.
        console.warn(`[Hotmart] Business not found for email: ${email}. Subscription will be pending.`);
      }

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 30); // 30 días por defecto

      await db.collection('subscriptions').add({
        empresaId: businessId || email, // Usamos email como fallback
        planActivo: planId,
        fechaInicio: startDate,
        fechaVencimiento: endDate,
        hotmartTransaction: data.purchase.transaction,
        status: 'active'
      });

      await logRef.update({ processed: true, status: 'completed', processedDate: new Date() });

    } else if (event === 'PURCHASE_CANCELED' || event === 'PURCHASE_REFUNDED' || event === 'SUBSCRIPTION_CANCELLATION') {
      // Cancelar suscripciones activas
      const subsQuery = await db.collection('subscriptions')
        .where('empresaId', '==', email)
        .where('status', '==', 'active')
        .get();

      const batch = db.batch();
      subsQuery.forEach(doc => {
        batch.update(doc.ref, { status: 'cancelled', updatedAt: new Date() });
      });
      await batch.commit();

      await logRef.update({ processed: true, status: 'cancelled', processedDate: new Date() });
    }

  } catch (err: any) {
    await logRef.update({ processed: false, status: 'failed', errorMessage: err.message });
  }
}
