
-- Add course_id field to rubrics table to store Canvas course context
ALTER TABLE public.rubrics 
ADD COLUMN course_id INTEGER;

-- Add comment to document the new field
COMMENT ON COLUMN public.rubrics.course_id IS 'Canvas course ID for rubrics created from Canvas assignments';
