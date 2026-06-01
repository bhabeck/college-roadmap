import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://caoctlosfpvjdkcrwqjj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhb2N0bG9zZnB2amRrY3J3cWpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyNzQ2OTAsImV4cCI6MjA5NTg1MDY5MH0.Vzx14aWCNplsW6LKXgAOa7P151iAFUmC76RuAcMK7co'
)