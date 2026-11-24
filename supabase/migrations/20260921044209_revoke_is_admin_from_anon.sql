/*
# Revoke is_admin() execute from anon

The is_admin() SECURITY DEFINER function should only be callable by authenticated users.
A previous migration included the revoke but the anon grant persisted. This re-applies it.
*/

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
