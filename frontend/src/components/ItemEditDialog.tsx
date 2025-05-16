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

interface ItemEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: { sku: string; name: string }) => void;
  item: { sku: string; name: string } | null;
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setSku(item.sku);
      setName(item.name);
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
    onSave({ sku, name });
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
