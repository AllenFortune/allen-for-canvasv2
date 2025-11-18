-- Manual reset for allenfortune@whccd.edu to fix their subscription renewal
-- This will archive their old usage and reset their submission count to 0

SELECT public.reset_user_submissions('allenfortune@whccd.edu');