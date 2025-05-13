import { useEffect, useState } from 'react';
import { wawiClient } from '@/lib/wawiClient';
import { getSessionToken } from '@/lib/bridgeService';

export const HomePage = () => {
  const [customers, setCustomers] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = await getSessionToken();
        const data = await wawiClient.get<any>('/api/erp/customers', token);
        setCustomers(data);
      } catch (err: any) {
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

      {loading && <p className="text-gray-600">Lade Daten...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {customers && (
        <div className="bg-white p-4 rounded shadow w-full max-w-3xl">
          <h2 className="text-xl font-semibold mb-4">Kundenliste</h2>
          
          {/* Debug section to understand data structure */}
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
            <p>Data type: {typeof customers}</p>
            <p>Is array: {Array.isArray(customers) ? 'Yes' : 'No'}</p>
            {typeof customers === 'object' && !Array.isArray(customers) && (
              <p>Object keys: {Object.keys(customers).join(', ')}</p>
            )}
          </div>
          
          {/* Handle different possible data structures */}
          {(() => {
            if (typeof customers === 'object' && customers !== null) {
              if (customers.Items && Array.isArray(customers.Items)) {
                return renderCustomerList(customers.Items);
              }
              
              if (Array.isArray(customers)) {
                return renderCustomerList(customers);
              }
              
              const customersArray = customers.data || customers.items || customers.results || 
                                    customers.customers || customers.customerList;
              
              if (Array.isArray(customersArray)) {
                return renderCustomerList(customersArray);
              }
              
              const keys = Object.keys(customers);
              if (keys.length > 0 && keys.every(key => !isNaN(Number(key)))) {
                const arrayFromObject = keys.map(key => customers[key]);
                return renderCustomerList(arrayFromObject);
              }
            }
            
            return (
              <div>
                <p className="text-gray-500 mb-2">Keine Kundendaten verfügbar oder ungültiges Format.</p>
                <details>
                  <summary className="text-blue-500 cursor-pointer">Datenstruktur anzeigen</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(customers, null, 2)}
                  </pre>
                </details>
              </div>
            );
          })()}
        </div>
      )}
      
      {/* Helper function to render customer list */}
      {function renderCustomerList(customerArray) {
        return customerArray && customerArray.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {customerArray.map((customer, index) => {
              const firstName = customer.BillingAddress?.FirstName || 
                               customer.firstName || customer.firstname || customer.first_name || 
                               customer.vorname || customer.Vorname || '';
              
              const lastName = customer.BillingAddress?.LastName || 
                              customer.lastName || customer.lastname || customer.last_name || 
                              customer.nachname || customer.Nachname || '';
              
              return (
                <li key={index} className="py-3 flex items-center">
                  <div className="flex-1">
                    <p className="font-medium">
                      {firstName} {lastName}
                    </p>
                    {customer.BillingAddress?.City && (
                      <p className="text-sm text-gray-500">
                        {customer.BillingAddress.City}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500">Keine Kunden gefunden.</p>
        );
      }}
    </div>
  );
};
