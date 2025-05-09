import { useEffect, useState } from 'react';
import { wawiClient } from '@/lib/wawiClient';
import { getSessionToken } from '@/lib/bridgeService';

export const HomePage = () => {
  const [erpInfo, setErpInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchErpInfo = async () => {
      try {
        const token = await getSessionToken();
        const data = await wawiClient.get<any>('/api/erp/info', token);
        setErpInfo(data);
      } catch (err: any) {
        setError(`Fehler beim Abrufen der ERP-Informatione: ${err}`);
        setErpInfo(null);
      } finally {
        setLoading(false);
      }
    };

    fetchErpInfo();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">ERP Info</h1>

      {loading && <p className="text-gray-600">Lade Daten...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {erpInfo && (
        <pre className="bg-white p-4 rounded shadow text-sm w-full max-w-3xl overflow-x-auto">
          {JSON.stringify(erpInfo, null, 2)}
        </pre>
      )}
    </div>
  );
};
