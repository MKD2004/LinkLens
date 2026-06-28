export const sseClients = new Map();

export function addClient(shortId, res) {
  if (!sseClients.has(shortId)) {
    sseClients.set(shortId, new Set());
  }
  sseClients.get(shortId).add(res);
}

export function removeClient(shortId, res) {
  const clients = sseClients.get(shortId);
  if (!clients) return;
  clients.delete(res);
  if (clients.size === 0) sseClients.delete(shortId);
}

export function emitClick(shortId, clickData) {
  const clients = sseClients.get(shortId);
  if (!clients || clients.size === 0) return;
  const payload = `data: ${JSON.stringify(clickData)}\n\n`;
  clients.forEach((res) => {
    try {
      res.write(payload);
    } catch {
      removeClient(shortId, res);
    }
  });
}

export function getClientCount(shortId) {
  return sseClients.get(shortId)?.size || 0;
}
