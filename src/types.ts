export interface ApplianceService {
  id: string;
  name: string;
  price: number;
  description: string;
  iconName: string;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface BookingDetails {
  name: string;
  phone: string;
  address: string;
  applianceType: string;
  express: boolean;
  warranty: boolean;
}
