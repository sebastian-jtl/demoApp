import { useEffect, useState, useCallback } from 'react';
import { wawiClient } from '@/lib/wawiClient';
import { getSessionToken } from '@/lib/bridgeService';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const HomePage = () => {
  const [items, setItems] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

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

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Artikeldaten</h1>

      {error && <p className="text-red-600">{error}</p>}
      
      <Card className="w-full max-w-3xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Artikelliste</CardTitle>
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
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-gray-600">Lade Daten...</p>
          ) : items ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(items) ? (
                  items.map((item, index) => (
                    <TableRow key={item.Id || index}>
                      <TableCell>{item.SKU || 'N/A'}</TableCell>
                      <TableCell>{item.Name || 'N/A'}</TableCell>
                      <TableCell>{item.Id || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                ) : items.Items && Array.isArray(items.Items) ? (
                  items.Items.map((item, index) => (
                    <TableRow key={item.Id || index}>
                      <TableCell>{item.SKU || 'N/A'}</TableCell>
                      <TableCell>{item.Name || 'N/A'}</TableCell>
                      <TableCell>{item.Id || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">Keine Artikel gefunden</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <p className="text-gray-600">Keine Daten verfügbar</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
