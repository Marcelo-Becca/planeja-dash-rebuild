-- Create task_subtasks table
CREATE TABLE public.task_subtasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid NOT NULL,
  text text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_subtasks ENABLE ROW LEVEL SECURITY;

-- Create policies for task_subtasks
CREATE POLICY "Authenticated users can view all task subtasks"
ON public.task_subtasks
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create subtasks"
ON public.task_subtasks
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update subtasks"
ON public.task_subtasks
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete subtasks"
ON public.task_subtasks
FOR DELETE
USING (auth.uid() IS NOT NULL);

-- Create task_comments table
CREATE TABLE public.task_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid NOT NULL,
  text text NOT NULL,
  author_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for task_comments
CREATE POLICY "Authenticated users can view all task comments"
ON public.task_comments
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON public.task_comments
FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments"
ON public.task_comments
FOR UPDATE
USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments"
ON public.task_comments
FOR DELETE
USING (auth.uid() = author_id);

-- Create trigger to update updated_at for task_subtasks
CREATE TRIGGER update_task_subtasks_updated_at
BEFORE UPDATE ON public.task_subtasks
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create trigger to update updated_at for task_comments
CREATE TRIGGER update_task_comments_updated_at
BEFORE UPDATE ON public.task_comments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();