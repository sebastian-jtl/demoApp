import * as React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { wawiClient } from "@/lib/wawiClient";
import { getSessionToken } from "@/lib/bridgeService";

interface ItemCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemCreated?: () => void;
}

export const ItemCreateModal: React.FC<ItemCreateModalProps> = ({
  isOpen,
  onClose,
  onItemCreated
}) => {
  const [sku, setSku] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setSku("");
    setName("");
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    if (!sku.trim() && !name.trim()) {
      setError("Bitte geben Sie mindestens SKU oder Name ein.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const token = await getSessionToken();
      
      const itemData = {
        SKU: sku.trim() || "Neu",
        Name: name.trim() || "Neuer Artikel"
      };
      
      await wawiClient.post(
        `/api/erp/items`,
        token,
        itemData
      );
      
      if (onItemCreated) {
        onItemCreated();
      }
      
      resetForm();
      onClose();
    } catch (err: any) {
      console.error("Error creating item:", err);
      setError(`Fehler beim Erstellen des Artikels: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Neuen Artikel erstellen</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {error && (
            <div className="text-red-500 text-sm mb-2">{error}</div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="sku" className="text-right">
              SKU
            </label>
            <Input
              id="sku"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="col-span-3"
              placeholder="SKU eingeben"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Name eingeben"
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSubmitting}>
              Abbrechen
            </Button>
          </DialogClose>
          <Button 
            onClick={handleCreate} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Erstellen..." : "Erstellen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
