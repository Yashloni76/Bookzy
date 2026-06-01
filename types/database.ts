export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          owner_id: string
          business_name: string
          slug: string
          category: string | null
          city: string | null
          whatsapp_number: string | null
          description: string | null
          logo_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          business_name: string
          slug: string
          category?: string | null
          city?: string | null
          whatsapp_number?: string | null
          description?: string | null
          logo_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          business_name?: string
          slug?: string
          category?: string | null
          city?: string | null
          whatsapp_number?: string | null
          description?: string | null
          logo_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      services: {
        Row: {
          id: string
          business_id: string
          name: string
          duration_minutes: number
          price: number | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          duration_minutes: number
          price?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          duration_minutes?: number
          price?: number | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      business_hours: {
        Row: {
          id: string
          business_id: string
          day_of_week: number
          open_time: string | null
          close_time: string | null
          is_closed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          day_of_week: number
          open_time?: string | null
          close_time?: string | null
          is_closed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          day_of_week?: number
          open_time?: string | null
          close_time?: string | null
          is_closed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_hours_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      blocked_slots: {
        Row: {
          id: string
          business_id: string
          block_date: string
          start_time: string
          end_time: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          business_id: string
          block_date: string
          start_time: string
          end_time: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          block_date?: string
          start_time?: string
          end_time?: string
          reason?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocked_slots_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      customers: {
        Row: {
          id: string
          business_id: string
          name: string
          whatsapp_number: string
          email: string | null
          no_show_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          name: string
          whatsapp_number: string
          email?: string | null
          no_show_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          name?: string
          whatsapp_number?: string
          email?: string | null
          no_show_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          business_id: string
          service_id: string
          customer_id: string | null
          customer_name: string
          customer_whatsapp: string
          customer_email: string | null
          appointment_date: string
          start_time: string
          end_time: string
          status: string
          notes: string | null
          cancel_token: string
          cancelled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_id: string
          service_id: string
          customer_id?: string | null
          customer_name: string
          customer_whatsapp: string
          customer_email?: string | null
          appointment_date: string
          start_time: string
          end_time: string
          status?: string
          notes?: string | null
          cancel_token?: string
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_id?: string
          service_id?: string
          customer_id?: string | null
          customer_name?: string
          customer_whatsapp?: string
          customer_email?: string | null
          appointment_date?: string
          start_time?: string
          end_time?: string
          status?: string
          notes?: string | null
          cancel_token?: string
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
      }
      reminders_log: {
        Row: {
          id: string
          booking_id: string
          reminder_type: string
          channel: string
          sent_at: string
          provider_message_id: string | null
        }
        Insert: {
          id?: string
          booking_id: string
          reminder_type: string
          channel?: string
          sent_at?: string
          provider_message_id?: string | null
        }
        Update: {
          id?: string
          booking_id?: string
          reminder_type?: string
          channel?: string
          sent_at?: string
          provider_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_log_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
