// Suno 노래 링크 → 곡 정보(제목, 가사, 길이, 미리듣기 주소) 프록시
// GET /api/clip?url=<suno 링크 또는 곡 ID>
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

async function resolveId(input) {
  const direct = input.match(UUID);
  if (direct) return direct[0].toLowerCase();
  // 공유용 짧은 링크: https://suno.com/s/AbCdEf
  const short = input.match(/suno\.(?:com|ai)\/s\/([A-Za-z0-9_-]+)/i);
  if (!short) return null;
  const r = await fetch(`https://suno.com/s/${short[1]}`, { redirect: 'follow', headers: { 'user-agent': UA } });
  const fromUrl = r.url.match(UUID);
  if (fromUrl) return fromUrl[0].toLowerCase();
  const html = await r.text();
  const m = html.match(/\/song\/([0-9a-f-]{36})/i) || html.match(UUID);
  return m ? (m[1] || m[0]).toLowerCase() : null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const input = String(req.query.url || '').trim();
  if (!input) return res.status(400).json({ error: 'Suno 노래 링크를 넣어 주세요.' });
  try {
    const id = await resolveId(input);
    if (!id) return res.status(400).json({ error: '링크에서 곡 ID를 찾지 못했어요. suno.com/song/… 또는 suno.com/s/… 링크인지 확인해 주세요.' });
    const r = await fetch(`https://studio-api.prod.suno.com/api/clip/${id}`, { headers: { 'user-agent': UA, accept: 'application/json' } });
    if (r.status === 404) return res.status(404).json({ error: '곡을 찾지 못했어요. 비공개 곡이면 Suno에서 공개(Public)로 바꾸거나 "내 곡 모드"를 써 주세요.' });
    if (!r.ok) return res.status(502).json({ error: `Suno 서버 응답 오류 (${r.status})` });
    const c = await r.json();
    const m = c.metadata || {};
    const audio = c.audio_url && !/forbidden/.test(c.audio_url) ? c.audio_url : null;
    res.setHeader('Cache-Control', 's-maxage=300');
    return res.status(200).json({
      id,
      title: c.title || 'Untitled',
      artist: c.display_name || c.handle || '',
      handle: c.handle || '',
      image: c.image_large_url || c.image_url || '',
      duration: m.duration || 0,
      lyrics: m.prompt || '',
      tags: m.tags || '',
      instrumental: !!m.make_instrumental || m.has_vocal === false,
      is_public: c.is_public !== false,
      video_url: c.video_url || '',
      audio_url: audio,
      model: c.major_model_version || '',
      created_at: c.created_at || ''
    });
  } catch (e) {
    return res.status(500).json({ error: '곡 정보를 가져오지 못했어요: ' + (e && e.message ? e.message : e) });
  }
}
