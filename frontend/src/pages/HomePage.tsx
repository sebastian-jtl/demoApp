import { useEffect, useState } from 'react';
import { wawiClient } from '@/lib/wawiClient';
import { getSessionToken } from '@/lib/bridgeService';
import { CustomerList } from '@/components/CustomerList';

export const HomePage = () => {
  const [customers, setCustomers] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = await getSessionToken();
        const data = await wawiClient.get<any>('/api/erp/customers', token);
        console.log('Customer data received:', data);
        setCustomers(data);
      } catch (err: any) {
        console.error('Error fetching customers:', err);
        setError(`Fehler beim Abrufen der Kundendaten: ${err}`);
        setCustomers(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Kundendaten</h1>

      {error && <p className="text-red-600">{error}</p>}
      
      <div className="bg-white p-4 rounded shadow w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-4">Kundenliste</h2>
        
        <CustomerList customers={customers} isLoading={loading} />
      </div>
    </div>
  );
};
