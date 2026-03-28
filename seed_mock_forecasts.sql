-- AURA CROWD - TEST FORECAST SEEDER
-- Run this in your Supabase SQL Editor to inject test predictions into the ML table.

DO $$
DECLARE
    baga_id UUID;
    calangute_id UUID;
BEGIN
    -- Dynamically grab the UUIDs for the popular hotspots
    SELECT id INTO baga_id FROM public.locations WHERE name = 'Baga Beach' LIMIT 1;
    SELECT id INTO calangute_id FROM public.locations WHERE name = 'Calangute Beach' LIMIT 1;

    -- TEST CASE 1: Baga Beach at 16:00 (4:00 PM) Today
    -- Baga Beach Capacity is 5000. We inject 5500 to FORCE the Overcrowded Nudge Modal!
    IF baga_id IS NOT NULL THEN
        INSERT INTO public.forecasts (location_id, forecast_date, hour, predicted_visitors)
        VALUES (baga_id, CURRENT_DATE, 16, 5500)
        ON CONFLICT (location_id, forecast_date, hour) DO UPDATE 
        SET predicted_visitors = EXCLUDED.predicted_visitors;

        -- TEST CASE 2: Baga Beach at 10:00 AM Today
        -- We inject 2000 to FORCE the Safe "Clear To Visit" status.
        INSERT INTO public.forecasts (location_id, forecast_date, hour, predicted_visitors)
        VALUES (baga_id, CURRENT_DATE, 10, 2000)
        ON CONFLICT (location_id, forecast_date, hour) DO UPDATE 
        SET predicted_visitors = EXCLUDED.predicted_visitors;
    END IF;

    -- TEST CASE 3: Calangute Beach Tomorrow at 14:00 (2:00 PM)
    -- Calangute's capacity is 6000. Injecting 8000 forces the modal.
    IF calangute_id IS NOT NULL THEN
        INSERT INTO public.forecasts (location_id, forecast_date, hour, predicted_visitors)
        VALUES (calangute_id, CURRENT_DATE + INTERVAL '1 day', 14, 8000)
        ON CONFLICT (location_id, forecast_date, hour) DO UPDATE 
        SET predicted_visitors = EXCLUDED.predicted_visitors;
    END IF;

END $$;
