import * as React from "react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemEditModal } from "@/components/ItemEditModal";

interface ItemListProps {
  items: any;
  isLoading?: boolean;
}

const ItemDebugSection = ({ data }: { data: any }) => (
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

export const ItemList: React.FC<ItemListProps> = ({ items, isLoading = false }) => {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  const handleCardClick = (item: any) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };
  
  const handleItemUpdated = () => {
    console.log('Item updated, should refresh data');
  };
  
  const extractItemData = (item: any) => {
    const sku = item.SKU || item.sku || item.Sku || item.articleNumber || item.ArticleNumber || '';
    const name = item.Name || item.name || item.ItemName || item.itemName || item.description || item.Description || '';
    const asin = item.ASIN || item.asin || item.AmazonId || item.amazonId || '';
    
    return { sku, name, asin };
  };

  const extractItemsArray = (data: any): any[] => {
    try {
      console.log('Extracting items array from data:', typeof data);
      
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
        
        const itemsArray = data.data || data.items || data.results || 
                          data.products || data.productList || data.articles;
        
        if (Array.isArray(itemsArray)) {
          return itemsArray;
        }
        
        const keys = Object.keys(data);
        if (keys.length > 0 && keys.every(key => !isNaN(Number(key)))) {
          return keys.map(key => data[key]);
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error extracting items array:', error);
      return [];
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-gray-600">Lade Artikeldaten...</p>;
    }

    try {
      const itemsArray = extractItemsArray(items);
      
      if (!itemsArray.length) {
        return <p className="text-gray-500">Keine Artikel gefunden.</p>;
      }
      
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {itemsArray.map((item, index) => {
            const { sku, name, asin } = extractItemData(item);
            
            return (
              <Card 
                key={index} 
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleCardClick(item)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-gray-500">
                  {sku && <div>SKU: {sku}</div>}
                  {asin && <div>ASIN: {asin}</div>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      );
    } catch (error) {
      console.error('Error rendering item list:', error);
      return (
        <div>
          <p className="text-red-500 mb-2">Fehler beim Rendern der Artikelliste: {String(error)}</p>
          <details>
            <summary className="text-blue-500 cursor-pointer">Fehlerdetails</summary>
            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
              {String(error)}
              {error instanceof Error && error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      <ItemDebugSection data={items} />
      {renderContent()}
      
      <ItemEditModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onItemUpdated={handleItemUpdated}
        item={selectedItem}
      />
    </div>
  );
};
