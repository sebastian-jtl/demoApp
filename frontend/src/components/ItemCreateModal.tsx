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
  ParentId?: number | null;
  parentId?: number | null;
  children?: Category[];
  level?: number;
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
  const [asin, setAsin] = useState<string>("");
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
    setAsin("");
    setSelectedCategory(null);
    setError(null);
  };
  
  const getCategoryId = (category: Category): number => {
    return category.Id || category.id || category.categoryId || 0;
  };
  
  const getCategoryName = (category: Category): string => {
    return category.Name || category.name || "Unbekannte Kategorie";
  };
  
  const buildCategoryTree = (categories: Category[]): Category[] => {
    const categoryMap = new Map<number, Category>();
    const rootCategories: Category[] = [];
    
    categories.forEach(category => {
      const id = getCategoryId(category);
      categoryMap.set(id, { ...category, children: [], level: 0 });
    });
    
    categories.forEach(category => {
      const id = getCategoryId(category);
      const parentId = category.ParentId || category.parentId;
      const mappedCategory = categoryMap.get(id);
      
      if (!mappedCategory) return;
      
      if (parentId === null || parentId === undefined || parentId === 0) {
        rootCategories.push(mappedCategory);
      } else {
        const parent = categoryMap.get(parentId);
        if (parent) {
          if (!parent.children) {
            parent.children = [];
          }
          mappedCategory.level = (parent.level || 0) + 1;
          parent.children.push(mappedCategory);
        } else {
          rootCategories.push(mappedCategory);
        }
      }
    });
    
    return rootCategories;
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  const renderCategoryTree = (categories: Category[], level: number): JSX.Element[] => {
    return categories.flatMap((category, index) => {
      const indent = level * 16; // 16px per level
      
      const items: JSX.Element[] = [
        <DropdownMenuItem
          key={`${getCategoryId(category)}-${index}`}
          onClick={() => setSelectedCategory(category)}
          style={{ paddingLeft: `${indent + 8}px` }}
          className="flex items-center"
        >
          {level > 0 && (
            <span className="mr-1 text-gray-400">{'└─'}</span>
          )}
          <span>{getCategoryName(category)}</span>
        </DropdownMenuItem>
      ];
      
      if (category.children && category.children.length > 0) {
        items.push(...renderCategoryTree(category.children, level + 1));
      }
      
      return items;
    });
  };
  
  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      setCategoryError(null);
      
      const token = await getSessionToken();
      const data = await wawiClient.get<any>('/api/erp/categories', token);
      
      console.log('Categories data received:', data);
      
      let flatCategories: Category[] = [];
      
      if (data && Array.isArray(data.Items)) {
        flatCategories = data.Items;
      } else if (Array.isArray(data)) {
        flatCategories = data;
      } else if (data && typeof data === 'object') {
        const possibleItems = 
          data.items || 
          data.categories || 
          data.results || 
          data.data;
          
        if (Array.isArray(possibleItems)) {
          flatCategories = possibleItems;
        } else {
          console.error('Unexpected categories data format:', data);
          setCategoryError('Unerwartetes Datenformat für Kategorien');
          return;
        }
      } else {
        console.error('Unexpected categories data format:', data);
        setCategoryError('Unerwartetes Datenformat für Kategorien');
        return;
      }
      
      const treeCategories = buildCategoryTree(flatCategories);
      setCategories(treeCategories);
      
      if (flatCategories.length > 0) {
        setSelectedCategory(flatCategories[0]);
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
        ASIN: asin.trim() || "",
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
            <label htmlFor="asin" className="text-right">
              ASIN
            </label>
            <Input
              id="asin"
              value={asin}
              onChange={(e) => setAsin(e.target.value)}
              className="col-span-3"
              placeholder="ASIN eingeben"
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
                  <DropdownMenuContent className="w-full max-h-[300px] overflow-y-auto">
                    {/* Recursive rendering of category tree */}
                    {renderCategoryTree(categories, 0)}
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
