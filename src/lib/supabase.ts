import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ctnszohyjljhorwgrabl.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0bnN6b2h5amxqaG9yd2dyYWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0OTk3MzEsImV4cCI6MjA4OTA3NTczMX0.kG9E_fWc_zF59o8kmfGoZ8hhaSJO0NwbKsb9Yy1Sb24';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
