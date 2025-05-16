import * as React from "react";
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Plus } from 'lucide-react';

interface ItemEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: { 
    sku: string; 
    name: string; 
    asins?: string[]; 
    isbn?: string;
    upc?: string;
    amazonFnsku?: string;
    ownIdentifier?: string;
    manufacturerNumber?: string;
  }) => void;
  item: { 
    sku: string; 
    name: string; 
    asins?: string[]; 
    isbn?: string;
    upc?: string;
    amazonFnsku?: string;
    ownIdentifier?: string;
    manufacturerNumber?: string;
  } | null;
  isLoading?: boolean;
}

export const ItemEditDialog: React.FC<ItemEditDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  item,
  isLoading = false,
}) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [asins, setAsins] = useState<string[]>([]);
  const [isbn, setIsbn] = useState('');
  const [upc, setUpc] = useState('');
  const [amazonFnsku, setAmazonFnsku] = useState('');
  const [ownIdentifier, setOwnIdentifier] = useState('');
  const [manufacturerNumber, setManufacturerNumber] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setSku(item.sku);
      setName(item.name);
      setAsins(item.asins || []);
      setIsbn(item.isbn || '');
      setUpc(item.upc || '');
      setAmazonFnsku(item.amazonFnsku || '');
      setOwnIdentifier(item.ownIdentifier || '');
      setManufacturerNumber(item.manufacturerNumber || '');
      setError(null);
    }
  }, [item]);

  const handleSave = () => {
    if (!sku.trim()) {
      setError('SKU ist erforderlich');
      return;
    }
    if (!name.trim()) {
      setError('Name ist erforderlich');
      return;
    }
    onSave({ 
      sku, 
      name, 
      asins: asins.filter(asin => asin.trim() !== ''),
      isbn: isbn.trim() !== '' ? isbn : undefined,
      upc: upc.trim() !== '' ? upc : undefined,
      amazonFnsku: amazonFnsku.trim() !== '' ? amazonFnsku : undefined,
      ownIdentifier: ownIdentifier.trim() !== '' ? ownIdentifier : undefined,
      manufacturerNumber: manufacturerNumber.trim() !== '' ? manufacturerNumber : undefined
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Artikel bearbeiten</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="sku" className="text-right text-sm font-medium">
              SKU
            </label>
            <Input
              id="sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="col-span-3"
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="asins" className="text-right text-sm font-medium">
              ASINs
            </label>
            <div className="col-span-3 space-y-2">
              {asins.map((asin, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    id={index === 0 ? "asins" : `asins-${index}`}
                    value={asin}
                    onChange={(e) => {
                      const newAsins = [...asins];
                      newAsins[index] = e.target.value;
                      setAsins(newAsins);
                    }}
                    className="flex-1"
                    placeholder="Enter ASIN (Optional)"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const newAsins = [...asins];
                      newAsins.splice(index, 1);
                      setAsins(newAsins);
                    }}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAsins([...asins, ''])}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" /> Add ASIN
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="isbn" className="text-right text-sm font-medium">
              ISBN
            </label>
            <Input
              id="isbn"
              value={isbn}
              onChange={(e) => setIsbn(e.target.value)}
              className="col-span-3"
              placeholder="Enter ISBN (Optional)"
              disabled={isLoading}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="upc" className="text-right text-sm font-medium">
              UPC
            </label>
            <Input
              id="upc"
              value={upc}
              onChange={(e) => setUpc(e.target.value)}
              className="col-span-3"
              placeholder="Enter UPC (Optional)"
              disabled={isLoading}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="amazonFnsku" className="text-right text-sm font-medium">
              Amazon FNSKU
            </label>
            <Input
              id="amazonFnsku"
              value={amazonFnsku}
              onChange={(e) => setAmazonFnsku(e.target.value)}
              className="col-span-3"
              placeholder="Enter Amazon FNSKU (Optional)"
              disabled={isLoading}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="ownIdentifier" className="text-right text-sm font-medium">
              Eigene ID
            </label>
            <Input
              id="ownIdentifier"
              value={ownIdentifier}
              onChange={(e) => setOwnIdentifier(e.target.value)}
              className="col-span-3"
              placeholder="Enter Own Identifier (Optional)"
              disabled={isLoading}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="manufacturerNumber" className="text-right text-sm font-medium">
              Herstellernummer
            </label>
            <Input
              id="manufacturerNumber"
              value={manufacturerNumber}
              onChange={(e) => setManufacturerNumber(e.target.value)}
              className="col-span-3"
              placeholder="Enter Manufacturer Number (Optional)"
              disabled={isLoading}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Abbrechen
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Speichern...' : 'Speichern'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
