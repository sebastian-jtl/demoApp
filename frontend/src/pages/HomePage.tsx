import { useEffect, useState, useCallback } from 'react';
import { wawiClient } from '@/lib/wawiClient';
import { getSessionToken } from '@/lib/bridgeService';
import { ItemList } from '@/components/ItemList';
import { ItemCreateModal } from '@/components/ItemCreateModal';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from 'lucide-react';

export const HomePage = () => {
  const [items, setItems] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
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
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchItems();
  };
  
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleItemCreated = () => {
    fetchItems();
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Artikeldaten</h1>

      {error && <p className="text-red-600">{error}</p>}
      
      <div className="bg-white p-4 rounded shadow w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Artikelliste</h2>
          <div className="flex gap-2">
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              disabled={isRefreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Aktualisieren</span>
            </Button>
            <Button 
              onClick={handleOpenCreateModal} 
              variant="default" 
              size="sm"
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Neuer Artikel</span>
            </Button>
          </div>
        </div>
        
        <ItemList items={items} isLoading={loading} />
        
        <ItemCreateModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onItemCreated={handleItemCreated}
        />
      </div>
    </div>
  );
};
