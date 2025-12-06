import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface SavedQuote {
  id: string;
  user_id: string;
  plan_ids: string[];
  form_data: Json;
  status: 'pending' | 'contacted' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateQuoteData {
  plan_ids: string[];
  form_data: Json;
  notes?: string;
}

export type QuoteStatus = 'pending' | 'contacted' | 'completed' | 'cancelled';

/**
 * Get all quotes for the current user
 */
export const getUserQuotes = async (
  userId: string
): Promise<{ quotes: SavedQuote[]; error: Error | null }> => {
  const { data, error } = await supabase
    .from('saved_quotes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return {
    quotes: (data as SavedQuote[]) || [],
    error: error as Error | null,
  };
};

/**
 * Save a new quote
 */
export const saveQuote = async (
  userId: string,
  quoteData: CreateQuoteData
): Promise<{ quote: SavedQuote | null; error: Error | null }> => {
  const { data, error } = await supabase
    .from('saved_quotes')
    .insert([
      {
        user_id: userId,
        plan_ids: quoteData.plan_ids,
        form_data: quoteData.form_data,
        notes: quoteData.notes || null,
      },
    ])
    .select()
    .single();

  return {
    quote: data as SavedQuote | null,
    error: error as Error | null,
  };
};

/**
 * Update quote status
 */
export const updateQuoteStatus = async (
  quoteId: string,
  status: QuoteStatus
): Promise<{ quote: SavedQuote | null; error: Error | null }> => {
  const { data, error } = await supabase
    .from('saved_quotes')
    .update({ status })
    .eq('id', quoteId)
    .select()
    .single();

  return {
    quote: data as SavedQuote | null,
    error: error as Error | null,
  };
};

/**
 * Update quote notes
 */
export const updateQuoteNotes = async (
  quoteId: string,
  notes: string
): Promise<{ quote: SavedQuote | null; error: Error | null }> => {
  const { data, error } = await supabase
    .from('saved_quotes')
    .update({ notes })
    .eq('id', quoteId)
    .select()
    .single();

  return {
    quote: data as SavedQuote | null,
    error: error as Error | null,
  };
};

/**
 * Delete a quote
 */
export const deleteQuote = async (
  quoteId: string
): Promise<{ error: Error | null }> => {
  const { error } = await supabase
    .from('saved_quotes')
    .delete()
    .eq('id', quoteId);

  return { error: error as Error | null };
};

const QuotesService = {
  getUserQuotes,
  saveQuote,
  updateQuoteStatus,
  updateQuoteNotes,
  deleteQuote,
};

export default QuotesService;
