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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { wawiClient } from "@/lib/wawiClient";
import { getSessionToken } from "@/lib/bridgeService";
import { ChevronDown } from "lucide-react";

interface Category {
  Id: number;
  Name: string;
  id?: number;
  name?: string;
  categoryId?: number;
}

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
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const resetForm = () => {
    setSku("");
    setName("");
    setSelectedCategory(null);
    setError(null);
  };
  
  const getCategoryId = (category: Category): number => {
    return category.Id || category.id || category.categoryId || 0;
  };
  
  const getCategoryName = (category: Category): string => {
    return category.Name || category.name || "Unbekannte Kategorie";
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      setCategoryError(null);
      
      const token = await getSessionToken();
      const data = await wawiClient.get<any>('/api/erp/categories', token);
      
      console.log('Categories data received:', data);
      
      if (data && Array.isArray(data.Items)) {
        setCategories(data.Items);
        if (data.Items.length > 0) {
          setSelectedCategory(data.Items[0]);
        }
      } else if (Array.isArray(data)) {
        setCategories(data);
        if (data.length > 0) {
          setSelectedCategory(data[0]);
        }
      } else if (data && typeof data === 'object') {
        const possibleItems = 
          data.items || 
          data.categories || 
          data.results || 
          data.data;
          
        if (Array.isArray(possibleItems)) {
          setCategories(possibleItems);
          if (possibleItems.length > 0) {
            setSelectedCategory(possibleItems[0]);
          }
        } else {
          console.error('Unexpected categories data format:', data);
          setCategoryError('Unerwartetes Datenformat für Kategorien');
        }
      } else {
        console.error('Unexpected categories data format:', data);
        setCategoryError('Unerwartetes Datenformat für Kategorien');
      }
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setCategoryError(`Fehler beim Abrufen der Kategorien: ${err.message || err}`);
    } finally {
      setIsLoadingCategories(false);
    }
  };
  
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const handleCreate = async () => {
    if (!sku.trim() && !name.trim()) {
      setError("Bitte geben Sie mindestens SKU oder Name ein.");
      return;
    }
    
    if (!selectedCategory) {
      setError("Bitte wählen Sie eine Kategorie aus.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const token = await getSessionToken();
      const categoryId = getCategoryId(selectedCategory);
      
      const itemData = {
        SKU: sku.trim() || "Neu",
        Name: name.trim() || "Neuer Artikel",
        categories: [{ categoryId }]  // Format as array of objects with categoryId property
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
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="category" className="text-right">
              Kategorie
            </label>
            <div className="col-span-3">
              {isLoadingCategories ? (
                <div className="text-sm text-gray-500">Lade Kategorien...</div>
              ) : categoryError ? (
                <div className="text-sm text-red-500">{categoryError}</div>
              ) : categories.length === 0 ? (
                <div className="text-sm text-gray-500">Keine Kategorien verfügbar</div>
              ) : (
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-between"
                      disabled={isSubmitting}
                      aria-label="Kategorie auswählen"
                      title="Kategorie auswählen"
                    >
                      {selectedCategory 
                        ? getCategoryName(selectedCategory) 
                        : "Kategorie auswählen"}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full max-h-[200px] overflow-y-auto">
                    {categories.map((category, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => setSelectedCategory(category)}
                      >
                        {getCategoryName(category)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
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
