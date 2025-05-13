import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomerEditModal } from "@/components/CustomerEditModal";

interface CustomerListProps {
  customers: any;
  isLoading?: boolean;
}

const CustomerDebugSection = ({ data }: { data: any }) => (
  <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
    <p>Data type: {typeof data}</p>
    <p>Is array: {Array.isArray(data) ? 'Yes' : 'No'}</p>
    {typeof data === 'object' && data !== null && !Array.isArray(data) && (
      <p>Object keys: {Object.keys(data).join(', ')}</p>
    )}
    <details>
      <summary className="text-blue-500 cursor-pointer">Raw data</summary>
      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </details>
  </div>
);

export const CustomerList: React.FC<CustomerListProps> = ({ customers, isLoading = false }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  const handleCardClick = (customer: any) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };
  
  const handleCustomerUpdated = () => {
    console.log('Customer updated, should refresh data');
  };
  const extractCustomerData = (customer: any) => {
    const firstName = customer.BillingAddress?.FirstName || 
                     customer.firstName || customer.firstname || customer.first_name || 
                     customer.vorname || customer.Vorname || '';
    
    const lastName = customer.BillingAddress?.LastName || 
                    customer.lastName || customer.lastname || customer.last_name || 
                    customer.nachname || customer.Nachname || '';
    
    const city = customer.BillingAddress?.City || customer.city || customer.City || '';
    
    const company = customer.BillingAddress?.Company || 
                   customer.company || customer.Company || 
                   customer.companyName || customer.CompanyName || '';
    
    const countryIso = customer.BillingAddress?.CountryIso || 
                      customer.countryIso || customer.CountryIso || 
                      customer.country || customer.Country || '';
    
    return { firstName, lastName, city, company, countryIso };
  };

  const extractCustomersArray = (data: any): any[] => {
    try {
      console.log('Extracting customers array from data:', typeof data);
      
      if (!data) return [];
      
      if (Array.isArray(data)) {
        console.log('Data is already an array with length:', data.length);
        return data;
      }
      
      if (typeof data === 'object') {
        console.log('Checking for Items array:', data.Items);
        
        if (data.Items && Array.isArray(data.Items)) {
          console.log('Found Items array with length:', data.Items.length);
          return data.Items;
        }
        
        if (typeof data.TotalItems === 'number' && data.Items === undefined) {
          console.log('Found TotalItems but no Items array, checking for other properties');
        }
        
        const customersArray = data.data || data.items || data.results || 
                              data.customers || data.customerList;
        
        if (Array.isArray(customersArray)) {
          return customersArray;
        }
        
        const keys = Object.keys(data);
        if (keys.length > 0 && keys.every(key => !isNaN(Number(key)))) {
          return keys.map(key => data[key]);
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error extracting customers array:', error);
      return [];
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-gray-600">Lade Kundendaten...</p>;
    }

    try {
      const customersArray = extractCustomersArray(customers);
      
      if (!customersArray.length) {
        return <p className="text-gray-500">Keine Kunden gefunden.</p>;
      }
      
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customersArray.map((customer, index) => {
            const { firstName, lastName, city, company, countryIso } = extractCustomerData(customer);
            
            return (
              <Card 
                key={index} 
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCardClick(customer)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {firstName} {lastName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-gray-500 space-y-1">
                  {company && <div>{company}</div>}
                  {city && <div>{city}</div>}
                  {countryIso && <div>Land: {countryIso}</div>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      );
    } catch (error) {
      console.error('Error rendering customer list:', error);
      return (
        <div>
          <p className="text-red-500 mb-2">Fehler beim Rendern der Kundenliste: {String(error)}</p>
          <details>
            <summary className="text-blue-500 cursor-pointer">Fehlerdetails</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {String(error)}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      <CustomerDebugSection data={customers} />
      {renderContent()}
      
      <CustomerEditModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onCustomerUpdated={handleCustomerUpdated}
        customer={selectedCustomer}
      />
    </div>
  );
};
