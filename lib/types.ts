// Hand-maintained DB types. Replace with `supabase gen types typescript` output once you
// have the Supabase CLI installed locally.

export type UserRole = "resident" | "vendor" | "admin";
export type CategoryKind = "product" | "service";
export type VendorStatus = "pending" | "approved" | "suspended";
export type OrderStatus =
  | "placed"
  | "accepted"
  | "rejected"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";
export type PaymentMode = "cod" | "upi_direct";
export type BookingStatus =
  | "requested"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Society {
  id: string;
  slug: string;
  name: string;
  block: string | null;
  location: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  phone: string | null;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  society_id: string | null;
  flat_no: string | null;
  tower: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  kind: CategoryKind;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Vendor {
  id: string;
  user_id: string;
  society_id: string;
  business_name: string;
  tagline: string | null;
  description: string | null;
  photo_url: string | null;
  banner_url: string | null;
  contact_phone: string | null;
  whatsapp_phone: string | null;
  payout_upi: string | null;
  status: VendorStatus;
  is_open: boolean;
  delivery_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface VendorWithCategories extends Vendor {
  categories: Category[];
  avg_rating?: number;
  review_count?: number;
}

export interface Listing {
  id: string;
  vendor_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  image_url: string | null;
  stock: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  vendor_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  starting_price: number | null;
  pricing_unit: string;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  resident_id: string;
  vendor_id: string;
  society_id: string;
  status: OrderStatus;
  subtotal: number;
  total: number;
  flat_no: string;
  tower: string | null;
  contact_phone: string;
  delivery_notes: string | null;
  payment_mode: PaymentMode;
  placed_at: string;
  accepted_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  listing_id: string | null;
  name_snapshot: string;
  unit: string;
  qty: number;
  unit_price: number;
  line_total: number;
}

export interface Booking {
  id: string;
  resident_id: string;
  vendor_id: string;
  service_id: string | null;
  society_id: string;
  service_name_snapshot: string;
  flat_no: string;
  tower: string | null;
  contact_phone: string;
  preferred_at: string | null;
  preferred_slot: string | null;
  notes: string | null;
  status: BookingStatus;
  created_at: string;
  confirmed_at: string | null;
  completed_at: string | null;
}

export interface Review {
  id: string;
  resident_id: string;
  vendor_id: string;
  order_id: string | null;
  booking_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

// Minimal Database shape so generic helpers compile. Expand as needed.
export interface Database {
  public: {
    Tables: {
      societies: { Row: Society; Insert: Partial<Society>; Update: Partial<Society> };
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      categories: { Row: Category; Insert: Partial<Category>; Update: Partial<Category> };
      vendors: { Row: Vendor; Insert: Partial<Vendor>; Update: Partial<Vendor> };
      listings: { Row: Listing; Insert: Partial<Listing>; Update: Partial<Listing> };
      services: { Row: Service; Insert: Partial<Service>; Update: Partial<Service> };
      orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> };
      order_items: {
        Row: OrderItem;
        Insert: Partial<OrderItem>;
        Update: Partial<OrderItem>;
      };
      bookings: { Row: Booking; Insert: Partial<Booking>; Update: Partial<Booking> };
      reviews: { Row: Review; Insert: Partial<Review>; Update: Partial<Review> };
    };
    Views: {
      vendor_stats: {
        Row: { vendor_id: string; avg_rating: number; review_count: number };
      };
    };
  };
}
