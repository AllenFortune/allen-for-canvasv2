-- Create custom_gpts table for storing teaching assistant configurations
CREATE TABLE public.custom_gpts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  subject_area TEXT,
  grade_level TEXT,
  purpose TEXT,
  gpt_id TEXT, -- OpenAI GPT ID when created
  status TEXT NOT NULL DEFAULT 'draft', -- draft, creating, active, error
  socratic_config JSONB DEFAULT '{}',
  knowledge_base_files JSONB DEFAULT '[]',
  canvas_config JSONB DEFAULT '{}',
  openai_config JSONB DEFAULT '{}',
  usage_stats JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.custom_gpts ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own custom GPTs" 
ON public.custom_gpts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom GPTs" 
ON public.custom_gpts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom GPTs" 
ON public.custom_gpts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom GPTs" 
ON public.custom_gpts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE TRIGGER update_custom_gpts_updated_at
BEFORE UPDATE ON public.custom_gpts
FOR EACH ROW
EXECUTE FUNCTION public.update_rubrics_updated_at();

-- Create table for knowledge base files
CREATE TABLE public.custom_gpt_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  custom_gpt_id UUID NOT NULL REFERENCES public.custom_gpts(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  content_type TEXT,
  file_size INTEGER,
  processed_content TEXT,
  openai_file_id TEXT, -- OpenAI file ID for knowledge base
  upload_status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, error
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for files
ALTER TABLE public.custom_gpt_files ENABLE ROW LEVEL SECURITY;

-- File policies (access through parent GPT)
CREATE POLICY "Users can manage files for their GPTs" 
ON public.custom_gpt_files 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.custom_gpts 
    WHERE id = custom_gpt_files.custom_gpt_id 
    AND user_id = auth.uid()
  )
);