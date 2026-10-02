export async function createVoiceOver(voiceId: string, text: string) {
  const response = await fetch('/api/voice-over', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voiceId, text }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? 'Voice-over failed');
  return body.voiceOver.url as string;
}
