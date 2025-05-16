import { useCallback, useEffect, useState } from 'react';
import { wawiClient } from '@/lib/wawiClient';
import { getSessionToken } from '@/lib/bridgeService';
import { ItemTable } from '@/components/ItemTable';
import { ItemEditDialog } from '@/components/ItemEditDialog';
import { ItemCreateDialog } from '@/components/ItemCreateDialog';
import { RefreshCw, Plus } from 'lucide-react';

export const HomePage = () => {
  const [items, setItems] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

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

  const handleItemClick = useCallback((item: any) => {
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  }, []);

  const handleSaveItem = useCallback(
    async (updatedItem: { sku: string; name: string }) => {
      if (!selectedItem) return;
      
      setLoading(true);
      try {
        const token = await getSessionToken();
        const itemToUpdate: Record<string, string> = {};
        
        const originalSku = selectedItem.SKU || selectedItem.sku || selectedItem.Sku || '';
        const originalName = selectedItem.Name || selectedItem.name || selectedItem.ItemName || selectedItem.itemName || '';
        
        if (updatedItem.sku !== originalSku) {
          if (selectedItem.SKU !== undefined) itemToUpdate.SKU = updatedItem.sku;
          else if (selectedItem.sku !== undefined) itemToUpdate.sku = updatedItem.sku;
        }
        
        if (updatedItem.name !== originalName) {
          if (selectedItem.Name !== undefined) itemToUpdate.Name = updatedItem.name;
          else if (selectedItem.name !== undefined) itemToUpdate.name = updatedItem.name;
        }
        
        if (Object.keys(itemToUpdate).length > 0) {
          await wawiClient.patch(`/api/erp/items/${selectedItem.id || selectedItem.Id || selectedItem.ID}`, token, itemToUpdate);
          await fetchItems();
        }
        
        setIsEditDialogOpen(false);
      } catch (err: any) {
        setError(`Fehler beim Aktualisieren des Artikels: ${err}`);
      } finally {
        setLoading(false);
      }
    },
    [selectedItem, fetchItems]
  );

  const handleCreateItem = useCallback(
    async (newItem: { sku: string; name: string; categoryId?: string }) => {
      setLoading(true);
      try {
        const token = await getSessionToken();
        await wawiClient.post('/api/erp/items', token, newItem);
        await fetchItems();
        setIsCreateDialogOpen(false);
      } catch (err: any) {
        setError(`Fehler beim Erstellen des Artikels: ${err}`);
      } finally {
        setLoading(false);
      }
    },
    [fetchItems]
  );

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="flex items-center justify-between w-full max-w-5xl mb-4">
        <h1 className="text-4xl font-bold text-gray-800">Artikelliste</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center justify-center p-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            disabled={loading}
            aria-label="Neuer Artikel"
          >
            <Plus className="h-5 w-5" />
          </button>
          <button
            onClick={fetchItems}
            className="flex items-center justify-center p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            disabled={loading}
            aria-label="Aktualisieren"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4 w-full max-w-5xl">{error}</p>}
      <div className="bg-white p-4 rounded shadow w-full max-w-5xl">
        <ItemTable items={items} isLoading={loading} onItemClick={handleItemClick} />
      </div>
      
      <ItemEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveItem}
        item={selectedItem ? {
          sku: selectedItem.SKU || selectedItem.sku || selectedItem.Sku || '',
          name: selectedItem.Name || selectedItem.name || selectedItem.ItemName || selectedItem.itemName || ''
        } : null}
        isLoading={loading}
      />
      
      <ItemCreateDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSave={handleCreateItem}
        isLoading={loading}
      />
    </div>
  );
};
