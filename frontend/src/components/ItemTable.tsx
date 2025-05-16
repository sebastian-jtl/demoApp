import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface ItemTableProps {
  items: any;
  isLoading?: boolean;
  onItemClick?: (item: any) => void;
}

type SortDirection = 'asc' | 'desc';
type SortField = 'sku' | 'name';

export const ItemTable: React.FC<ItemTableProps> = ({ items, isLoading = false, onItemClick }) => {
  const [sortField, setSortField] = useState<SortField>('sku');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const extractItemsArray = (data: any): any[] => {
    try {
      if (!data) return [];
      
      if (Array.isArray(data)) {
        return data;
      }
      
      if (typeof data === 'object') {
        if (data.Items && Array.isArray(data.Items)) {
          return data.Items;
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

  const extractItemData = (item: any) => {
    const sku = item.SKU || item.sku || item.Sku || item.articleNumber || item.ArticleNumber || '';
    const name = item.Name || item.name || item.ItemName || item.itemName || item.description || item.Description || '';
    
    return { sku, name };
  };

  const sortedItems = useMemo(() => {
    const itemsArray = extractItemsArray(items);
    if (!itemsArray.length) return [];

    return [...itemsArray].sort((a, b) => {
      const itemA = extractItemData(a);
      const itemB = extractItemData(b);
      
      const valueA = sortField === 'sku' ? itemA.sku : itemA.name;
      const valueB = sortField === 'sku' ? itemB.sku : itemB.name;

      if (sortDirection === 'asc') {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });
  }, [items, sortField, sortDirection]);

  if (isLoading) {
    return <p className="text-gray-600">Lade Artikeldaten...</p>;
  }

  const itemsArray = extractItemsArray(items);
  if (!itemsArray.length) {
    return <p className="text-gray-500">Keine Artikel gefunden.</p>;
  }

  const getSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50" 
              onClick={() => handleSort('sku')}
            >
              SKU{getSortIndicator('sku')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50" 
              onClick={() => handleSort('name')}
            >
              Name{getSortIndicator('name')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.map((item, index) => {
            const { sku, name } = extractItemData(item);
            return (
              <TableRow 
                key={index}
                onClick={() => onItemClick && onItemClick(item)}
                className={onItemClick ? "cursor-pointer hover:bg-gray-50" : ""}
              >
                <TableCell>{sku}</TableCell>
                <TableCell>{name}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
