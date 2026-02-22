-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create financial_plans table
CREATE TABLE public.financial_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Plan',
  
  -- User inputs
  monthly_income NUMERIC NOT NULL,
  monthly_expenses NUMERIC NOT NULL,
  age INTEGER NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('retirement', 'education', 'house', 'business')),
  goal_amount NUMERIC NOT NULL,
  time_period INTEGER NOT NULL,
  risk_preference TEXT NOT NULL CHECK (risk_preference IN ('low', 'medium', 'high')),
  
  -- Calculated results
  monthly_savings NUMERIC,
  monthly_investment NUMERIC,
  savings_percentage NUMERIC,
  
  -- AI results
  ai_risk_assessment TEXT,
  ai_recommendations TEXT,
  ai_explanation TEXT,
  investment_allocation JSONB,
  
  -- Goal analysis
  goal_feasibility_score NUMERIC,
  projected_value NUMERIC,
  is_goal_achievable BOOLEAN,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on financial_plans
ALTER TABLE public.financial_plans ENABLE ROW LEVEL SECURITY;

-- Financial plans policies
CREATE POLICY "Users can view their own plans"
ON public.financial_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plans"
ON public.financial_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
ON public.financial_plans FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
ON public.financial_plans FOR DELETE
USING (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_plans_updated_at
  BEFORE UPDATE ON public.financial_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();