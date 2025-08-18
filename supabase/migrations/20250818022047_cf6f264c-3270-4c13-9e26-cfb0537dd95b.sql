-- Check which functions still don't have explicit search_path set
-- This query will help identify the problematic functions

-- First let's check all user-defined functions in the public schema
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
    AND p.prokind = 'f'  -- only functions, not procedures
    AND NOT (pg_get_functiondef(p.oid) LIKE '%SET search_path%')
ORDER BY p.proname;