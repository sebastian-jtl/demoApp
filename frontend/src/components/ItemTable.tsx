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
type SortField = 'sku' | 'name' | 'asin' | 'isbn' | 'upc' | 'amazonFnsku' | 'ownIdentifier' | 'manufacturerNumber';

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
    const asin = item.Identifiers?.Asins?.[0] || item.identifiers?.asins?.[0] || item.Asins?.[0] || '';
    const isbn = item.Identifiers?.ISBN || item.identifiers?.isbn || item.ISBN || '';
    const upc = item.Identifiers?.UPC || item.identifiers?.upc || item.UPC || '';
    const amazonFnsku = item.Identifiers?.AmazonFnsku || item.identifiers?.amazonFnsku || item.AmazonFnsku || '';
    const ownIdentifier = item.Identifiers?.OwnIdentifier || item.identifiers?.ownIdentifier || item.OwnIdentifier || '';
    const manufacturerNumber = item.ManufacturerNumber || item.manufacturerNumber || '';
    
    return { sku, name, asin, isbn, upc, amazonFnsku, ownIdentifier, manufacturerNumber };
  };

  const sortedItems = useMemo(() => {
    const itemsArray = extractItemsArray(items);
    if (!itemsArray.length) return [];

    return [...itemsArray].sort((a, b) => {
      const itemA = extractItemData(a);
      const itemB = extractItemData(b);
      
      const valueA = (sortField === 'sku' ? itemA.sku : 
                 sortField === 'name' ? itemA.name : 
                 sortField === 'asin' ? itemA.asin :
                 sortField === 'isbn' ? itemA.isbn :
                 sortField === 'upc' ? itemA.upc :
                 sortField === 'amazonFnsku' ? itemA.amazonFnsku :
                 sortField === 'ownIdentifier' ? itemA.ownIdentifier :
                 itemA.manufacturerNumber) || '';
      const valueB = (sortField === 'sku' ? itemB.sku : 
                 sortField === 'name' ? itemB.name : 
                 sortField === 'asin' ? itemB.asin :
                 sortField === 'isbn' ? itemB.isbn :
                 sortField === 'upc' ? itemB.upc :
                 sortField === 'amazonFnsku' ? itemB.amazonFnsku :
                 sortField === 'ownIdentifier' ? itemB.ownIdentifier :
                 itemB.manufacturerNumber) || '';

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
            <TableHead 
              className="cursor-pointer hover:bg-muted/50" 
              onClick={() => handleSort('asin')}
            >
              ASIN{getSortIndicator('asin')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50" 
              onClick={() => handleSort('isbn')}
            >
              ISBN{getSortIndicator('isbn')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50" 
              onClick={() => handleSort('upc')}
            >
              UPC{getSortIndicator('upc')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50" 
              onClick={() => handleSort('amazonFnsku')}
            >
              Amazon FNSKU{getSortIndicator('amazonFnsku')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50" 
              onClick={() => handleSort('ownIdentifier')}
            >
              Eigene ID{getSortIndicator('ownIdentifier')}
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50" 
              onClick={() => handleSort('manufacturerNumber')}
            >
              Herstellernummer{getSortIndicator('manufacturerNumber')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedItems.map((item, index) => {
            const { sku, name, asin } = extractItemData(item);
            return (
              <TableRow 
                key={index}
                onClick={() => onItemClick && onItemClick(item)}
                className={onItemClick ? "cursor-pointer hover:bg-gray-50" : ""}
              >
                <TableCell>{sku}</TableCell>
                <TableCell>{name}</TableCell>
                <TableCell>{asin}</TableCell>
                <TableCell>{isbn}</TableCell>
                <TableCell>{upc}</TableCell>
                <TableCell>{amazonFnsku}</TableCell>
                <TableCell>{ownIdentifier}</TableCell>
                <TableCell>{manufacturerNumber}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
