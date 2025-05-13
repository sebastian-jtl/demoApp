import * as React from "react";
import { useState, useEffect } from "react";
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

interface ItemEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemUpdated?: () => void;
  item: {
    Id: number;
    SKU?: string;
    sku?: string;
    Sku?: string;
    articleNumber?: string;
    ArticleNumber?: string;
    Name?: string;
    name?: string;
    ItemName?: string;
    itemName?: string;
    description?: string;
    Description?: string;
  } | null;
}

export const ItemEditModal: React.FC<ItemEditModalProps> = ({
  isOpen,
  onClose,
  onItemUpdated,
  item
}) => {
  const [sku, setSku] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      const extractedSku = 
        item.SKU || 
        item.sku || 
        item.Sku || 
        item.articleNumber || 
        item.ArticleNumber || 
        "";
      
      const extractedName = 
        item.Name || 
        item.name || 
        item.ItemName || 
        item.itemName || 
        item.description || 
        item.Description || 
        "";
      
      setSku(extractedSku);
      setName(extractedName);
    }
  }, [item]);

  const handleSave = async () => {
    if (!item) return;
    
    if (!sku.trim() && !name.trim()) {
      setError("Bitte geben Sie mindestens SKU oder Name ein.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const token = await getSessionToken();
      
      const updateData: any = {};
      
      if (sku.trim()) {
        updateData.SKU = sku.trim();
      }
      
      if (name.trim()) {
        updateData.Name = name.trim();
      }
      
      if (Object.keys(updateData).length > 0) {
        await wawiClient.patch(
          `/api/erp/items/${item.Id}`,
          token,
          updateData
        );
        
        if (onItemUpdated) {
          onItemUpdated();
        }
      }
      
      onClose();
    } catch (err: any) {
      console.error("Error updating item:", err);
      setError(`Fehler beim Aktualisieren des Artikels: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Artikeldaten bearbeiten</DialogTitle>
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
            onClick={handleSave} 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Speichern..." : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
