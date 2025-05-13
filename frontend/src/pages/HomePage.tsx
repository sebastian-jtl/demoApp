import { useEffect, useState } from 'react';
import { wawiClient } from '@/lib/wawiClient';
import { getSessionToken } from '@/lib/bridgeService';
import { ItemList } from '@/components/ItemList';

export const HomePage = () => {
  const [items, setItems] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const token = await getSessionToken();
        const data = await wawiClient.get<any>('/api/erp/items', token);
        console.log('Item data received:', data);
        setItems(data);
      } catch (err: any) {
        console.error('Error fetching items:', err);
        setError(`Fehler beim Abrufen der Artikeldaten: ${err}`);
        setItems(null);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Artikeldaten</h1>

      {error && <p className="text-red-600">{error}</p>}
      
      <div className="bg-white p-4 rounded shadow w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-4">Artikelliste</h2>
        
        <ItemList items={items} isLoading={loading} />
      </div>
    </div>
  );
};
