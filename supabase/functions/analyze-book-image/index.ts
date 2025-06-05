import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing environment variables");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const image = formData.get("image");

    if (!image || !(image instanceof File)) {
      throw new Error("No image file provided");
    }

    // Upload image to Supabase Storage temporarily
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("temp-images")
      .upload(`analyze/${Date.now()}-${image.name}`, image, {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // Get public URL for the uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from("temp-images")
      .getPublicUrl(uploadData.path);

    // Call OpenAI API with the image URL
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this book cover image and extract the following information in JSON format: title (in Hebrew if available), author (in Hebrew if available), description (in Hebrew if available), and ISBN. If you can't find certain information, leave it as an empty string.",
              },
              {
                type: "image_url",
                image_url: publicUrl,
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const bookInfo = JSON.parse(aiResponse.choices[0].message.content);

    // Clean up temporary image
    await supabase.storage
      .from("temp-images")
      .remove([uploadData.path]);

    return new Response(
      JSON.stringify(bookInfo),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Error analyzing image:", error);
    return new Response(
      JSON.stringify({ error: "Failed to analyze image" }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    );
  }
});