// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jvjlavzpuimkqgyynfvn.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2amxhdnpwdWlta3FneXluZnZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDgzNTAsImV4cCI6MjA2NTQ4NDM1MH0.yre8-c5p3l40yv1-WojDnt-gIHz-PsgfnzGSLueVkPQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);