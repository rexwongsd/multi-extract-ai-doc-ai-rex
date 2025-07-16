-- Critical Security Fixes Migration (Fixed)

-- 1. Fix Privilege Escalation in Profiles Table
-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;

-- Create a more restrictive update policy that prevents role changes
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile (except role)" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Prevent users from changing their own role
  (OLD.role IS NOT DISTINCT FROM NEW.role)
);

-- Create a security definer function for admin role management
CREATE OR REPLACE FUNCTION public.update_user_role(target_user_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role text;
BEGIN
  -- Get the current user's role
  SELECT role INTO current_user_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  -- Only allow admins to update roles
  IF current_user_role != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can update user roles';
  END IF;
  
  -- Update the target user's role
  UPDATE public.profiles 
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;

-- 2. Secure the Signup Table
-- Replace overly permissive policies with user-scoped restrictions
DROP POLICY IF EXISTS "Allow authenticated users to delete from Signup" ON public.signup;
DROP POLICY IF EXISTS "Allow authenticated users to insert into Signup" ON public.signup;
DROP POLICY IF EXISTS "Allow authenticated users to select from Signup" ON public.signup;
DROP POLICY IF EXISTS "Allow authenticated users to update Signup" ON public.signup;

-- Create more restrictive policies for Signup table
CREATE POLICY "Users can only insert signup records" 
ON public.signup 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all signup records" 
ON public.signup 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3. Create security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 4. Add constraint to ensure role field is properly controlled
ALTER TABLE public.profiles 
ADD CONSTRAINT valid_roles 
CHECK (role IN ('user', 'admin', 'moderator'));