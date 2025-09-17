// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://jvuunvnbpdfrttusgelz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2dXVudm5icGRmcnR0dXNnZWx6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0Nzk0NjksImV4cCI6MjA3MzA1NTQ2OX0.i5-X-GsirwcZl0CdAfGsA6qM4ml5itnekPh0RoDCPVY";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
