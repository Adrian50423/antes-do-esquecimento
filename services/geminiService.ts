
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { StoryPart, StoryCategory } from "../types";

// Always initialize with the exact environment variable.
const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStoryText = async (prompt: string): Promise<{ title: string; ethnicGroup: string; region: string; category: StoryCategory; parts: StoryPart[] }> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Você é um griot digital, guardião da memória africana. 
    Escreva uma história inspirada na cultura africana baseada no tema: "${prompt}".
    REGRAS RÍGIDAS:
    1. O conteúdo deve ser estritamente sobre cultura, tradição ou história africana.
    2. NÃO escreva romances modernos, ficção científica ou fantasia genérica.
    3. Use um tom solene e respeitoso (tradição oral).
    4. Idioma: Português.
    
    Formate como JSON:
    {
      "title": "Título Nobre",
      "ethnicGroup": "Povo Relacionado",
      "region": "Região Geográfica",
      "category": "TRADITIONAL | HISTORY | ETHNIC | WISDOM",
      "parts": [{ "text": "Parágrafo rico", "imagePrompt": "Prompt visual detalhado" }]
    }`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          ethnicGroup: { type: Type.STRING },
          region: { type: Type.STRING },
          category: { type: Type.STRING, enum: ["TRADITIONAL", "HISTORY", "ETHNIC", "WISDOM"] },
          parts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                imagePrompt: { type: Type.STRING }
              },
              required: ["text", "imagePrompt"]
            }
          }
        },
        required: ["title", "ethnicGroup", "region", "category", "parts"]
      }
    }
  });

  // Ensure response.text property access is correct.
  const jsonStr = response.text || '{}';
  return JSON.parse(jsonStr);
};

export const generateSceneImage = async (imagePrompt: string): Promise<string | undefined> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Cinematic high-quality African oil painting style, warm golden hour lighting, fine art, traditional textures: ${imagePrompt}` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      // Correctly extract image data from part.inlineData
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
  } catch (error) {
    console.error("Image generation failed", error);
  }
  return undefined;
};

export const generateNarration = async (text: string): Promise<string | undefined> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Narração solene em português de Angola, voz profunda e calma de um ancião contando uma história antiga: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Charon' },
          },
        },
      },
    });

    // Audio bytes returned by API are raw PCM data.
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (error) {
    console.error("Audio generation failed", error);
  }
  return undefined;
};

/**
 * Decodes raw PCM audio data as per API specification.
 */
export const decodeAudio = async (base64: string): Promise<AudioBuffer> => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const dataInt16 = new Int16Array(bytes.buffer);
  const numChannels = 1;
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, 24000);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};
