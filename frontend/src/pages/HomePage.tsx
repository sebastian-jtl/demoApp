import { useEffect, useState } from 'react';
import { wawiClient } from '@/lib/wawiClient';
import { getSessionToken } from '@/lib/bridgeService';
import { ItemTable } from '@/components/ItemTable';

export const HomePage = () => {
  const [items, setItems] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = await getSessionToken();
        const data = await wawiClient.get<any>('/api/erp/items', token);
        setItems(data);
      } catch (err: any) {
        setError(`Fehler beim Abrufen der Artikel: ${err}`);
        setItems(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Artikelliste</h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      <div className="bg-white p-4 rounded shadow w-full max-w-5xl">
        <ItemTable items={items} isLoading={loading} />
      </div>
    </div>
  );
};
