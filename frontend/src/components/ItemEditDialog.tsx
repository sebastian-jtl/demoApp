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
  onSave: (item: { sku: string; name: string; asins?: string[] }) => void;
  item: { sku: string; name: string; asins?: string[] } | null;
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setSku(item.sku);
      setName(item.name);
      setAsins(item.asins || []);
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
    onSave({ sku, name, asins: asins.filter(asin => asin.trim() !== '') });
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
