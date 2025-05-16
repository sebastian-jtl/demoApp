import * as React from "react";
import { useState } from 'react';
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

interface ItemCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: { sku: string; name: string }) => void;
  isLoading?: boolean;
}

export const ItemCreateDialog: React.FC<ItemCreateDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

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
    setSku('');
    setName('');
    setError(null);
  };

  const handleDialogClose = () => {
    setSku('');
    setName('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDialogClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Artikel erstellen</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="create-sku" className="text-right text-sm font-medium">
              SKU
            </label>
            <Input
              id="create-sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="col-span-3"
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="create-name" className="text-right text-sm font-medium">
              Name
            </label>
            <Input
              id="create-name"
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
            {isLoading ? 'Erstellen...' : 'Erstellen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
