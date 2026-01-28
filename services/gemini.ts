
import { GoogleGenAI, Type } from "@google/genai";
import { Panel, SceneMetadata, StylePreset } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const parseScriptToPanels = async (
  script: string, 
  style: StylePreset, 
  heroAsset: string
): Promise<{ metadata: SceneMetadata, panels: Panel[] }> => {
  const ai = getAI();
  
  const prompt = `
    Analyze this screenplay excerpt and convert it into exactly 4 storyboard panels.
    
    STYLE PRESET: ${style}
    HERO ASSET: ${heroAsset}
    
    SCRIPT:
    """
    ${script}
    """
    
    RULES:
    1. Extract location and time.
    2. Maintain strict visual continuity. The hero asset must look identical in every shot.
    3. Generate technical prompts: [Cinematography] + [Subject] + [Action] + [Context] + [Style & Ambiance].
    4. TONALITY: Professional cinematic photography. High-end film stock. Avoid vibrant/fake "AI colors". 
    5. CONTINUITY: Provide a "continuity_focus" for each panel specifically describing the visual DNA of ${heroAsset}.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scene_metadata: {
            type: Type.OBJECT,
            properties: {
              location: { type: Type.STRING },
              time: { type: Type.STRING },
              global_style: { type: Type.STRING }
            },
            required: ["location", "time", "global_style"]
          },
          panels: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                panel_id: { type: Type.NUMBER },
                shot_type: { type: Type.STRING },
                image_prompt: { type: Type.STRING },
                continuity_focus: { type: Type.STRING }
              },
              required: ["panel_id", "shot_type", "image_prompt", "continuity_focus"]
            }
          }
        },
        required: ["scene_metadata", "panels"]
      }
    }
  });

  const data = JSON.parse(response.text || '{}');
  return {
    metadata: data.scene_metadata,
    panels: data.panels
  };
};

export const generatePanelImage = async (
  prompt: string, 
  aspectRatio: string,
  prevImageBase64?: string
): Promise<string> => {
  const ai = getAI();
  const geminiAspectRatio = aspectRatio === '2.39:1' ? '16:9' : (aspectRatio as any);

  const contents: any[] = [];
  
  // Add reference image for continuity if available
  if (prevImageBase64) {
    contents.push({
      inlineData: {
        mimeType: 'image/png',
        data: prevImageBase64.split(',')[1],
      }
    });
    contents.push({ 
      text: `Referencing the character/subject and lighting from the attached image, generate the next shot: ${prompt}. Ensure the subject remains consistent in features and clothing.`
    });
  } else {
    contents.push({ text: prompt });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: contents },
    config: {
      imageConfig: {
        aspectRatio: geminiAspectRatio,
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to generate image part");
};
