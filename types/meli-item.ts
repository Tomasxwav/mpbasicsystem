export interface MercadoLibreItem {
  id: string;
  site_id: string;
  title: string;
  family_name: string | null;
  seller_id: number;
  category_id: string;
  user_product_id: string;
  official_store_id: number | null;
  price: number;
  base_price: number;
  original_price: number | null;
  inventory_id: string | null;
  currency_id: string;
  initial_quantity: number;
  available_quantity: number;
  sold_quantity: number;
  sale_terms: SaleTerm[];
  buying_mode: string;
  listing_type_id: string;
  start_time: string;
  stop_time: string;
  end_time: string;
  expiration_time: string;
  condition: string;
  permalink: string;
  thumbnail_id: string;
  thumbnail: string;
  pictures: Picture[];
  video_id: string | null;
  descriptions: any[];
  accepts_mercadopago: boolean;
  non_mercado_pago_payment_methods: any[];
  shipping: Shipping;
  international_delivery_mode: string;
  seller_address: SellerAddress;
  seller_contact: any | null;
  location: Record<string, unknown>;
  geolocation: Geolocation;
  coverage_areas: any[];
  attributes: Attribute[];
  warnings: any[];
  listing_source: string;
  variations: any[];
  status: string;
  sub_status: string[];
  tags: string[];
  warranty: string;
  catalog_product_id: string | null;
  domain_id: string;
  seller_custom_field: string | null;
  parent_item_id: string | null;
  differential_pricing: any | null;
  deal_ids: any[];
  automatic_relist: boolean;
  date_created: string;
  last_updated: string;
  health: any | null;
  catalog_listing: boolean;
  item_relations: any[];
  channels: string[];
}

interface SaleTerm {
  id: string;
  name: string;
  value_id: string | null;
  value_name: string;
  value_struct: any | null;
  values: Value[];
  value_type: string;
}

interface Value {
  id: string | null;
  name: string;
  struct: StructValue | null;
}

interface StructValue {
  number: number;
  unit: string;
}

interface Picture {
  id: string;
  url: string;
  secure_url: string;
  size: string;
  max_size: string;
  quality: string;
}

interface Shipping {
  mode: string;
  methods: any[];
  tags: string[];
  dimensions: string | null;
  local_pick_up: boolean;
  free_shipping: boolean;
  logistic_type: string;
  store_pick_up: boolean;
}

interface SellerAddress {
  address_line: string;
  zip_code: string;
  city: City;
  state: State;
  country: Country;
  search_location: SearchLocation;
  latitude: number;
  longitude: number;
  id: number;
}

interface City {
  id: string;
  name: string;
}

interface State {
  id: string;
  name: string;
}

interface Country {
  id: string;
  name: string;
}

interface SearchLocation {
  city: City;
  state: State;
}

interface Geolocation {
  latitude: number;
  longitude: number;
}

export interface Attribute {
  id: string;
  name: string;
  value_id: string | null;
  value_name: string;
  values: Value[];
  value_type: string;
}