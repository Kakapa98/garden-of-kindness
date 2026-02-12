import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { SupabaseClient } from "@supabase/supabase-js";
import { PublicFlower, MessageData, CreateMessageResponse, MessageViewData } from "../types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface FlowerRow {
  id: string;
  x_position: number;
  y_position: number;
  color_hex: string;
  visual_type: number;
  scale: number;
  bloom_delay: number;
}

interface PlantMessageRow extends FlowerRow {
  token: string;
}

interface MessageByTokenRow extends FlowerRow {
  token: string;
  sender: string;
  recipient: string;
  content: string;
  created_at: string;
}

const getSupabaseConfig = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase config. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.");
  }
  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
};

let supabaseClient: SupabaseClient | null = null;
const getSupabase = (): SupabaseClient => {
  if (supabaseClient) return supabaseClient;
  const { url, anonKey } = getSupabaseConfig();
  supabaseClient = createClient(url, anonKey);
  return supabaseClient;
};

const mapFlowerRow = (row: FlowerRow): PublicFlower => ({
  id: row.id,
  x: row.x_position,
  y: row.y_position,
  color: row.color_hex,
  type: row.visual_type,
  scale: row.scale,
  bloomDelay: row.bloom_delay,
});

export const getPublicFlowers = async (): Promise<PublicFlower[]> => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("flowers")
    .select("id,x_position,y_position,color_hex,visual_type,scale,bloom_delay")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) throw new Error(error.message);
  return (data || []).map(mapFlowerRow);
};

export const plantFlower = async (data: MessageData): Promise<CreateMessageResponse> => {
  const supabase = getSupabase();
  const { data: rows, error } = await supabase.rpc("plant_message", {
    p_sender_name: data.sender,
    p_recipient_name: data.recipient,
    p_content: data.content,
  });
  if (error) throw new Error(error.message);

  const row = Array.isArray(rows) ? rows[0] : rows as PlantMessageRow | null;
  if (!row) throw new Error("Failed to plant message.");

  return { token: row.token, flower: mapFlowerRow(row) };
};

export const getMessageByToken = async (token: string): Promise<MessageViewData | null> => {
  const supabase = getSupabase();
  const { data: rows, error } = await supabase.rpc("get_message_by_token", { p_access_token: token });
  if (error) throw new Error(error.message);

  const row = Array.isArray(rows) ? rows[0] : rows as MessageByTokenRow | null;
  if (!row) return null;

  return {
    token: row.token,
    sender: row.sender,
    recipient: row.recipient,
    content: row.content,
    timestamp: Date.parse(row.created_at),
    flowerId: row.id,
    flower: mapFlowerRow(row),
  };
};

export const getKindnessSuggestion = async (): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return "You are a wonderful friend and your kindness makes the world brighter.";
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Write a short, heartwarming, one-sentence message of kindness or gratitude suitable for a friend or stranger.",
      config: { maxOutputTokens: 60, temperature: 1.0 },
    });
    return response.text.trim();
  } catch (_error) {
    return "Your kindness creates ripples that reach further than you know.";
  }
};
