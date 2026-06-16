-- 0002_prevent_double_booking.sql

-- Enable btree_gist extension for exclusion constraints
CREATE EXTENSION IF NOT EXISTS btree_gist SCHEMA extensions;

-- Prevent two confirmed bookings for the same business & service on the same date from overlapping in time
ALTER TABLE public.bookings ADD CONSTRAINT 
  no_overlapping_bookings
  EXCLUDE USING gist (
    business_id WITH =,
    service_id WITH =,
    appointment_date WITH =,
    tsrange(
      (appointment_date + start_time)::timestamp,
      (appointment_date + end_time)::timestamp
    ) WITH &&
  )
  WHERE (status = 'confirmed');
