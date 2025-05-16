import { useCallback, useEffect, useState } from 'react';
import { wawiClient } from '@/lib/wawiClient';
import { getSessionToken } from '@/lib/bridgeService';
import { ItemTable } from '@/components/ItemTable';
import { RefreshCw } from 'lucide-react';

export const HomePage = () => {
  const [items, setItems] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getSessionToken();
      const data = await wawiClient.get<any>('/api/erp/items', token);
      setItems(data);
      setError(null);
    } catch (err: any) {
      setError(`Fehler beim Abrufen der Artikel: ${err}`);
      setItems(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="flex items-center justify-between w-full max-w-5xl mb-4">
        <h1 className="text-4xl font-bold text-gray-800">Artikelliste</h1>
        <button
          onClick={fetchItems}
          className="flex items-center justify-center p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          disabled={loading}
          aria-label="Aktualisieren"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {error && <p className="text-red-600 mb-4 w-full max-w-5xl">{error}</p>}
      <div className="bg-white p-4 rounded shadow w-full max-w-5xl">
        <ItemTable items={items} isLoading={loading} />
      </div>
    </div>
  );
};
