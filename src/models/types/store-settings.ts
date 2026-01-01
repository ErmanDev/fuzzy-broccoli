export type StoreSettings = {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  pickupTime?: string;
  storeHours?: {
    monday?: { open: string; close: string; isOpen: boolean };
    tuesday?: { open: string; close: string; isOpen: boolean };
    wednesday?: { open: string; close: string; isOpen: boolean };
    thursday?: { open: string; close: string; isOpen: boolean };
    friday?: { open: string; close: string; isOpen: boolean };
    saturday?: { open: string; close: string; isOpen: boolean };
    sunday?: { open: string; close: string; isOpen: boolean };
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
};

