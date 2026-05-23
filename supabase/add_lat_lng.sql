-- Migration: add lat/lng columns for map view
-- รันใน Supabase SQL Editor (ถ้า project สร้างไปแล้ว)

alter table public.items
  add column if not exists lat double precision,
  add column if not exists lng double precision;
