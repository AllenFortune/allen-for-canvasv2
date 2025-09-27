-- Fix Allen's pending submission purchase
UPDATE submission_purchases 
SET status = 'completed', updated_at = NOW()
WHERE email = 'allenfortune@whccd.edu' 
  AND stripe_session_id = 'cs_live_a1tQMCG667d69aEgsjjQCre1hou7RyfWgIRScgzgLJj4k7d1hH8cGH9YyZ'
  AND status = 'pending';