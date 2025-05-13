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

interface CustomerEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerUpdated?: () => void;
  customer: {
    Id: number;
    BillingAddress?: {
      FirstName?: string;
      LastName?: string;
    };
    firstName?: string;
    lastName?: string;
    firstname?: string;
    lastname?: string;
    first_name?: string;
    last_name?: string;
    vorname?: string;
    nachname?: string;
    Vorname?: string;
    Nachname?: string;
  } | null;
}

export const CustomerEditModal: React.FC<CustomerEditModalProps> = ({
  isOpen,
  onClose,
  onCustomerUpdated,
  customer
}) => {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      const extractedFirstName = 
        customer.BillingAddress?.FirstName || 
        customer.firstName || 
        customer.firstname || 
        customer.first_name || 
        customer.vorname || 
        customer.Vorname || 
        "";
      
      const extractedLastName = 
        customer.BillingAddress?.LastName || 
        customer.lastName || 
        customer.lastname || 
        customer.last_name || 
        customer.nachname || 
        customer.Nachname || 
        "";
      
      setFirstName(extractedFirstName);
      setLastName(extractedLastName);
    }
  }, [customer]);

  const handleSave = async () => {
    if (!customer) return;
    
    if (!firstName.trim() && !lastName.trim()) {
      setError("Bitte geben Sie mindestens einen Namen ein.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      
      const token = await getSessionToken();
      
      const updateData: any = {
        BillingAddress: {}
      };
      
      if (firstName.trim()) {
        updateData.BillingAddress.FirstName = firstName.trim();
      }
      
      if (lastName.trim()) {
        updateData.BillingAddress.LastName = lastName.trim();
      }
      
      if (Object.keys(updateData.BillingAddress).length > 0) {
        await wawiClient.patch(
          `/api/erp/customers/${customer.Id}`,
          token,
          updateData
        );
        
        if (onCustomerUpdated) {
          onCustomerUpdated();
        }
      }
      
      onClose();
    } catch (err: any) {
      console.error("Error updating customer:", err);
      setError(`Fehler beim Aktualisieren des Kunden: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kundendaten bearbeiten</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {error && (
            <div className="text-red-500 text-sm mb-2">{error}</div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="firstName" className="text-right">
              Vorname
            </label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="col-span-3"
              placeholder="Vorname eingeben"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="lastName" className="text-right">
              Nachname
            </label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="col-span-3"
              placeholder="Nachname eingeben"
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
