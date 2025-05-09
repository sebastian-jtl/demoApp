import * as React from "react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  // Berechne, welche Seiten angezeigt werden sollen (wir zeigen max. 5 Seiten an)
  const getVisiblePages = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    // Anpassen, wenn wir am Ende sind
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  // Debug-Log für aktuellen Zustand
  console.log(`[Pagination] Current page: ${currentPage}, Total pages: ${totalPages}`);
  
  const handlePageClick = (page: number) => {
    console.log(`[Pagination] Clicking page ${page}`);
    onPageChange(page);
  };
  
  if (totalPages <= 1) return null;
  
  return (
    <div className={cn("flex items-center justify-center space-x-2 py-4", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Zurück
      </Button>
      
      {getVisiblePages().map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageClick(page)}
          className="w-9"
        >
          {page}
        </Button>
      ))}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Weiter
      </Button>
    </div>
  );
} 