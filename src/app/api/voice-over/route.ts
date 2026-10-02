import { nanoid } from 'nanoid';
import { publicUrl, saveFile, storageKey } from '@/server/storage';

const API = 'https://api.elevenlabs.io/v1';
const MAX_CHARS = 5000;

async function findVoiceId(name: string, apiKey: string) {
  const response = await fetch(`${API}/voices`, { headers: { 'xi-api-key': apiKey } });
  if (!response.ok) throw new Error(`ElevenLabs voices request failed (${response.status})`);
  const { voices } = (await response.json()) as { voices: { voice_id: string; name: string }[] };
  return voices.find(voice => voice.name.toLowerCase().startsWith(name.toLowerCase()))?.voice_id;
}

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return Response.json({ error: 'ELEVENLABS_API_KEY is not configured' }, { status: 501 });

  const { voiceId, text } = (await request.json()) as { voiceId?: string; text?: string };
  if (!voiceId || !text?.trim()) return Response.json({ error: 'voiceId and text are required' }, { status: 400 });
  if (text.length > MAX_CHARS)
    return Response.json({ error: `Text is limited to ${MAX_CHARS} characters` }, { status: 400 });

  try {
    const elevenLabsVoiceId = await findVoiceId(voiceId, apiKey);
    if (!elevenLabsVoiceId) {
      return Response.json(
        { error: `Voice "${voiceId}" is not available on this ElevenLabs account` },
        { status: 400 },
      );
    }

    const response = await fetch(`${API}/text-to-speech/${elevenLabsVoiceId}`, {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' }),
    });
    if (!response.ok) throw new Error(`ElevenLabs text-to-speech failed (${response.status})`);

    const key = storageKey('voice-overs', `${voiceId}.mp3`);
    await saveFile(key, new Uint8Array(await response.arrayBuffer()));
    return Response.json({ voiceOver: { id: nanoid(), status: 'COMPLETED', url: publicUrl(key) } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Voice-over failed' }, { status: 502 });
  }
}
