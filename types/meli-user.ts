export interface User {
  id: number;
  nickname: string;
  registration_date: string;
  first_name: string;
  last_name: string;
  country_id: string;
  email: string;

  identification: Identification;
  address: Address;
  phone: Phone;
  alternative_phone: AlternativePhone;

  user_type: string;
  tags: string[];
  logo: string | null;
  points: number;
  site_id: string;
  permalink: string;
  seller_experience: string;

  seller_reputation: SellerReputation;
  buyer_reputation: BuyerReputation;

  status: Status;
  credit: Credit;
}

export interface Identification {
  type: string;
  number: string;
}

export interface Address {
  state: string;
  city: string;
  address: string;
  zip_code: string;
}

export interface Phone {
  area_code: string;
  number: string;
  extension: string;
  verified: boolean;
}

export interface AlternativePhone {
  area_code: string;
  number: string;
  extension: string;
}

export interface SellerReputation {
  level_id: string | null;
  power_seller_status: string | null;
  transactions: SellerTransactions;
}

export interface SellerTransactions {
  period: string;
  total: number;
  completed: number;
  canceled: number;
  ratings: Ratings;
}

export interface Ratings {
  positive: number;
  negative: number;
  neutral: number;
}

export interface BuyerReputation {
  canceled_transactions: number;
  transactions: BuyerTransactions;
  tags: string[];
}

export interface BuyerTransactions {
  period: string;
  total: number | null;
  completed: number | null;
  canceled: {
    total: number | null;
    paid: number | null;
  };
  unrated: {
    total: number | null;
    paid: number | null;
  };
  not_yet_rated: {
    total: number | null;
    paid: number | null;
    units: number | null;
  };
}

export interface Status {
  site_status: string;

  list: StatusAction;
  buy: StatusAction;
  sell: StatusAction;

  billing: {
    allow: boolean;
    codes: string[];
  };

  mercadopago_tc_accepted: boolean;
  mercadopago_account_type: string;
  mercadoenvios: string;
  immediate_payment: boolean;
  confirmed_email: boolean;
  user_type: string;
  required_action: string;
}

export interface StatusAction {
  allow: boolean;
  codes: string[];
  immediate_payment: {
    required: boolean;
    reasons: string[];
  };
}

export interface Credit {
  consumed: number;
  credit_level_id: string;
}