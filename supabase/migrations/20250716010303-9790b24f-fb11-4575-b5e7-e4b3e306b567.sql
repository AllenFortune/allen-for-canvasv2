
-- Create enum for rubric types
CREATE TYPE rubric_type AS ENUM ('analytic', 'holistic', 'single_point');

-- Create enum for rubric status
CREATE TYPE rubric_status AS ENUM ('draft', 'published', 'archived');

-- Create table for storing generated rubrics
CREATE TABLE public.rubrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  rubric_type rubric_type NOT NULL DEFAULT 'analytic',
  status rubric_status NOT NULL DEFAULT 'draft',
  points_possible INTEGER NOT NULL DEFAULT 100,
  
  -- Rubric structure and criteria
  criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
  performance_levels JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Source information
  source_type TEXT, -- 'canvas_assignment', 'manual_input', 'file_upload'
  source_assignment_id INTEGER,
  source_content TEXT,
  
  -- DIVER framework alignment
  diver_alignment JSONB DEFAULT '{}'::jsonb,
  ai_literacy_components JSONB DEFAULT '[]'::jsonb,
  
  -- Canvas integration
  canvas_rubric_id INTEGER,
  exported_to_canvas BOOLEAN DEFAULT false,
  export_log JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0
);

-- Add Row Level Security (RLS)
ALTER TABLE public.rubrics ENABLE ROW LEVEL SECURITY;

-- Create policies for rubrics table
CREATE POLICY "Users can view their own rubrics" 
  ON public.rubrics 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rubrics" 
  ON public.rubrics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rubrics" 
  ON public.rubrics 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rubrics" 
  ON public.rubrics 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_rubrics_user_id ON public.rubrics(user_id);
CREATE INDEX idx_rubrics_status ON public.rubrics(status);
CREATE INDEX idx_rubrics_created_at ON public.rubrics(created_at DESC);
CREATE INDEX idx_rubrics_canvas_assignment ON public.rubrics(source_assignment_id) WHERE source_type = 'canvas_assignment';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_rubrics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_rubrics_updated_at
  BEFORE UPDATE ON public.rubrics
  FOR EACH ROW
  EXECUTE FUNCTION update_rubrics_updated_at();

-- Create table for rubric templates (predefined templates for common use cases)
CREATE TABLE public.rubric_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  rubric_type rubric_type NOT NULL,
  subject_area TEXT,
  grade_level TEXT,
  criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
  performance_levels JSONB NOT NULL DEFAULT '[]'::jsonb,
  diver_alignment JSONB DEFAULT '{}'::jsonb,
  is_public BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for rubric templates
ALTER TABLE public.rubric_templates ENABLE ROW LEVEL SECURITY;

-- Public templates are viewable by all authenticated users
CREATE POLICY "Anyone can view public rubric templates" 
  ON public.rubric_templates 
  FOR SELECT 
  USING (is_public = true);

-- Users can create templates
CREATE POLICY "Users can create rubric templates" 
  ON public.rubric_templates 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

-- Users can update their own templates
CREATE POLICY "Users can update their own rubric templates" 
  ON public.rubric_templates 
  FOR UPDATE 
  USING (auth.uid() = created_by);

-- Create function to increment rubric usage
CREATE OR REPLACE FUNCTION increment_rubric_usage(rubric_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.rubrics 
  SET 
    usage_count = usage_count + 1,
    last_used_at = now()
  WHERE id = rubric_id AND user_id = auth.uid();
END;
$$;
