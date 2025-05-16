import * as React from "react";
import { useState, useEffect, useCallback } from 'react';
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
import { getSessionToken } from '@/lib/bridgeService';
import { wawiClient } from '@/lib/wawiClient';
import { Check, ChevronsUpDown, X, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ItemCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: { sku: string; name: string; categoryId?: string; asins?: string[] }) => void;
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
  const [categoryId, setCategoryId] = useState<string>('');
  const [asins, setAsins] = useState<string[]>(['']);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryTree, setCategoryTree] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setCategoryLoading(true);
    try {
      const token = await getSessionToken();
      const data = await wawiClient.get<any>('/api/erp/categories', token);
      
      console.log('Raw API response:', data);
      
      const categoriesArray = Array.isArray(data) ? data : 
                             data.Items || data.items || 
                             data.Categories || data.categories || 
                             data.results || [];
      
      console.log('Categories extracted:', categoriesArray);
      setCategories(categoriesArray);
      
      const tree = buildCategoryTree(categoriesArray);
      console.log('Category tree built:', tree);
      setCategoryTree(tree);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError('Fehler beim Laden der Kategorien');
    } finally {
      setCategoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      console.log('Dialog opened, fetching categories');
      fetchCategories();
    }
  }, [isOpen, fetchCategories]);

  const buildCategoryTree = (flatCategories: any[]) => {
    if (flatCategories.length === 0) {
      return [];
    }
    
    let idField = 'id';
    if (flatCategories[0].Id !== undefined) {
      idField = 'Id';
    }
    
    let parentIdField = 'parentId';
    if (flatCategories[0].ParentId !== undefined) {
      parentIdField = 'ParentId';
    } else if (flatCategories[0].ParentCategoryId !== undefined) {
      parentIdField = 'ParentCategoryId';
    }
    
    console.log('Using ID field:', idField, 'and parent ID field:', parentIdField);
    
    const categoryMap = new Map();
    flatCategories.forEach(category => {
      categoryMap.set(category[idField], { ...category, children: [] });
    });
    
    const rootCategories: any[] = [];
    flatCategories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category[idField]);
      const parentId = category[parentIdField];
      
      if (!parentId) {
        rootCategories.push(categoryWithChildren);
      } else {
        const parentCategory = categoryMap.get(parentId);
        if (parentCategory) {
          parentCategory.children.push(categoryWithChildren);
        } else {
          rootCategories.push(categoryWithChildren);
        }
      }
    });
    
    return rootCategories;
  };

  const renderCategoryTree = (categories: any[], depth = 0) => {
    return categories.map(category => {
      const id = category.id || category.Id;
      const name = category.name || category.Name;
      const hasChildren = category.children && category.children.length > 0;
      
      return (
        <React.Fragment key={id}>
          <DropdownMenuItem
            onClick={() => {
              setCategoryId(id);
              setIsCategoryDropdownOpen(false);
            }}
            className={`pl-${depth * 4 + 2} ${categoryId === id ? 'bg-accent text-accent-foreground' : ''}`}
          >
            <Check className={`mr-2 h-4 w-4 ${categoryId === id ? 'opacity-100' : 'opacity-0'}`} />
            {name}
          </DropdownMenuItem>
          {hasChildren && renderCategoryTree(category.children, depth + 1)}
        </React.Fragment>
      );
    });
  };

  const handleSave = () => {
    if (!sku.trim()) {
      setError('SKU ist erforderlich');
      return;
    }
    if (!name.trim()) {
      setError('Name ist erforderlich');
      return;
    }
    if (!categoryId) {
      setError('Kategorie ist erforderlich');
      return;
    }
    onSave({ sku, name, categoryId, asins: asins.filter(asin => asin.trim() !== '') });
    setSku('');
    setName('');
    setCategoryId('');
    setError(null);
  };

  const handleDialogClose = () => {
    setSku('');
    setName('');
    setCategoryId('');
    setAsins(['']);
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
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="create-category" className="text-right text-sm font-medium">
              Kategorie
            </label>
            <div className="col-span-3">
              <DropdownMenu open={isCategoryDropdownOpen} onOpenChange={setIsCategoryDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isCategoryDropdownOpen}
                    className="w-full justify-between"
                    disabled={isLoading || categoryLoading}
                  >
                    {categoryId ? 
                      categories.find(category => {
                        const id = category.id || category.Id;
                        return id === categoryId;
                      })?.Name || 
                      categories.find(category => {
                        const id = category.id || category.Id;
                        return id === categoryId;
                      })?.name || 
                      'Kategorie auswählen' 
                      : 'Kategorie auswählen'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                  {categoryLoading ? (
                    <div className="px-2 py-1.5 text-sm">Lade Kategorien...</div>
                  ) : categoryTree.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm">Keine Kategorien gefunden</div>
                  ) : (
                    renderCategoryTree(categoryTree)
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="create-asins" className="text-right text-sm font-medium">
              ASINs
            </label>
            <div className="col-span-3 space-y-2">
              {asins.map((asin, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    id={index === 0 ? "create-asins" : `create-asins-${index}`}
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
                    disabled={isLoading || asins.length === 1}
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
            {isLoading ? 'Erstellen...' : 'Erstellen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
