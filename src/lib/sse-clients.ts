// Utiliser globalThis pour persister entre les hot reloads en dev
declare global {
  var sseClients: Map<number, Set<ReadableStreamDefaultController>> | undefined;
}

// Map pour stocker les clients connectés par planId - persiste entre les requêtes
const clients = globalThis.sseClients ?? new Map<number, Set<ReadableStreamDefaultController>>();

if (process.env.NODE_ENV !== 'production') {
  globalThis.sseClients = clients;
}

export function addClient(planId: number, controller: ReadableStreamDefaultController) {
  if (!clients.has(planId)) {
    clients.set(planId, new Set());
  }
  clients.get(planId)!.add(controller);
  console.log(`[SSE] Client added to plan ${planId}. Total clients for this plan: ${clients.get(planId)!.size}, Total plans: ${clients.size}`);
}

export function removeClient(planId: number, controller: ReadableStreamDefaultController) {
  const clientSet = clients.get(planId);
  if (clientSet) {
    clientSet.delete(controller);
    console.log(`[SSE] Client removed from plan ${planId}. Remaining clients: ${clientSet.size}`);
    if (clientSet.size === 0) {
      clients.delete(planId);
      console.log(`[SSE] No more clients for plan ${planId}, removed from map`);
    }
  }
}

export function broadcastToClients(planId: number, data: any) {
  const clientSet = clients.get(planId);
  console.log(`[SSE] Broadcast to plan ${planId}, ${clientSet?.size || 0} clients connected, Total plans active: ${clients.size}`);
  
  if (clientSet && clientSet.size > 0) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    const deadClients: ReadableStreamDefaultController[] = [];
    let successCount = 0;
    
    clientSet.forEach((controller) => {
      try {
        controller.enqueue(message);
        successCount++;
        console.log(`[SSE] ✅ Message sent successfully to client`);
      } catch (error) {
        console.log(`[SSE] ❌ Client disconnected, will be removed:`, error);
        deadClients.push(controller);
      }
    });

    console.log(`[SSE] Broadcast complete: ${successCount}/${clientSet.size} clients received the message`);

    // Nettoyer les clients déconnectés
    deadClients.forEach((controller) => {
      clientSet.delete(controller);
    });

    if (clientSet.size === 0) {
      clients.delete(planId);
    }
  } else {
    console.log(`[SSE] ⚠️ No clients connected for plan ${planId}. Available plans:`, Array.from(clients.keys()));
  }
}

export function getClientCount(planId: number): number {
  return clients.get(planId)?.size || 0;
}
