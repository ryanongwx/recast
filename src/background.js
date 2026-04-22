// Background service worker — handles API calls and context menu

// ── Context menu setup ──────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'recast-selection',
    title: 'Recast this text 🎭',
    contexts: ['selection'],
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'recast-selection' && info.selectionText) {
    // Store the selected text so the popup can pick it up
    chrome.storage.session.set({
      pendingText: info.selectionText,
      pendingSource: tab?.url ?? '',
    })
    // Open the popup by opening the extension page
    chrome.action.openPopup().catch(() => {
      // openPopup() requires user gesture in some Chrome versions — fallback
      chrome.windows.create({
        url: chrome.runtime.getURL('popup.html'),
        type: 'popup',
        width: 520,
        height: 680,
      })
    })
  }
})

// ── ElevenLabs TTS proxy ────────────────────────────────────────────────────
// The popup can't call ElevenLabs directly due to CORS in MV3 popups,
// so it sends a message here and we return the audio as a base64 string.

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'TTS_REQUEST') {
    handleTTS(message.payload)
      .then((base64Audio) => sendResponse({ ok: true, base64Audio }))
      .catch((err) => sendResponse({ ok: false, error: err.message }))
    return true // keep channel open for async response
  }

  if (message.type === 'TRANSFORM_REQUEST') {
    handleTransform(message.payload)
      .then((text) => sendResponse({ ok: true, text }))
      .catch((err) => sendResponse({ ok: false, error: err.message }))
    return true
  }
})

// ── ElevenLabs TTS ──────────────────────────────────────────────────────────

const VOICE_MAPPINGS = {
  'corporate-genz':    { original: 'JBFqnCBsd6RMkjVDRZzb', transformed: 'EXAVITQu4vr4xnSDxMaL' },
  'angry-passive':     { original: 'TxGEqnHWrfWFTfGW9XjX', transformed: 'MF3mGyEYCl7XYWocJS7h' },
  'meeting-sports':    { original: 'JBFqnCBsd6RMkjVDRZzb', transformed: 'onwK4e9ZLuTAKqWW03F9' },
  'rant-bbc':          { original: 'pqHfZKP75CvOlQylNhV4', transformed: 'N2lVS1w4EtoT3dr4eOWO' },
  'customer-professional': { original: 'pqHfZKP75CvOlQylNhV4', transformed: 'EXAVITQu4vr4xnSDxMaL' },
}

const VOICE_SETTINGS = {
  'corporate-genz':    { original: { stability: 0.7, similarity_boost: 0.8 }, transformed: { stability: 0.3, similarity_boost: 0.6 } },
  'angry-passive':     { original: { stability: 0.2, similarity_boost: 0.9 }, transformed: { stability: 0.8, similarity_boost: 0.7 } },
  'meeting-sports':    { original: { stability: 0.8, similarity_boost: 0.7 }, transformed: { stability: 0.1, similarity_boost: 0.9 } },
  'rant-bbc':          { original: { stability: 0.1, similarity_boost: 0.6 }, transformed: { stability: 0.9, similarity_boost: 0.8 } },
  'customer-professional': { original: { stability: 0.2, similarity_boost: 0.9 }, transformed: { stability: 0.8, similarity_boost: 0.7 } },
}

async function handleTTS({ text, mode, isOriginal }) {
  const stored = await chrome.storage.local.get('elevenLabsApiKey')
  const apiKey = stored.elevenLabsApiKey
  if (!apiKey) throw new Error('ElevenLabs API key not set. Open extension settings.')

  const voices = VOICE_MAPPINGS[mode] ?? VOICE_MAPPINGS['rant-bbc']
  const settings = VOICE_SETTINGS[mode] ?? VOICE_SETTINGS['rant-bbc']
  const voiceId = isOriginal ? voices.original : voices.transformed
  const voiceSettings = isOriginal ? settings.original : settings.transformed

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_flash_v2_5',
      voice_settings: {
        ...voiceSettings,
        use_speaker_boost: false,
      },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`ElevenLabs error ${response.status}: ${err}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

// ── AI Text Transformation ──────────────────────────────────────────────────

const SYSTEM_PROMPTS = {
  'corporate-genz': "You are a Gen Z translator. Transform formal corporate language into casual Gen Z speak. Use slang like 'fr fr', 'bestie', 'no cap', 'periodt', 'slay', 'vibe check'. Add relevant emojis. Keep the core meaning but make it sound like a Gen Z person texting. Reply with ONLY the transformed text, no explanation.",
  'angry-passive': "You are a passive-aggressive communication expert. Transform direct angry messages into subtle, passive-aggressive responses. Use phrases like 'I'm sure you had your reasons', 'It would have been helpful if', 'I suppose', 'Interesting choice'. Maintain politeness while conveying subtle displeasure. Reply with ONLY the transformed text.",
  'meeting-sports': "You are an enthusiastic sports commentator. Transform boring meeting content into exciting sports commentary. Use phrases like 'AND THERE IT IS!', 'WHAT A PLAY!', 'STUNNING MOVE!', 'The crowd goes wild!'. Make mundane business decisions sound like thrilling sports moments. Reply with ONLY the transformed text.",
  'rant-bbc': "You are a calm BBC news anchor. Transform emotional rants into professional news delivery. Use formal language, phrases like 'In news this evening', 'Reports indicate', 'According to sources'. Maintain journalistic objectivity. Reply with ONLY the transformed text.",
  'customer-professional': "You are a customer service expert. Transform angry customer complaints into calm, empathetic professional responses. Use phrases like 'I understand your frustration', 'I sincerely apologize', 'Let me personally ensure'. Reply with ONLY the transformed text.",
}

async function handleTransform({ text, mode }) {
  const stored = await chrome.storage.local.get('openAiApiKey')
  const apiKey = stored.openAiApiKey

  // If no API key, fall back to local mock transformation
  if (!apiKey) {
    return mockTransform(text, mode)
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS[mode] ?? SYSTEM_PROMPTS['rant-bbc'] },
        { role: 'user', content: text },
      ],
      temperature: 0.8,
      max_tokens: 500,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenAI error ${response.status}: ${err}`)
  }

  const data = await response.json()
  return data.choices[0].message.content.trim()
}

// ── Mock transformation fallback ────────────────────────────────────────────

function mockTransform(text, mode) {
  switch (mode) {
    case 'corporate-genz':
      return text
        .replace(/please be advised/gi, 'yo bestie')
        .replace(/we need to/gi, "we gotta")
        .replace(/schedule a meeting/gi, 'hop on a call')
        .replace(/discuss/gi, 'chat about')
        .replace(/moving forward/gi, 'fr fr 💯')
        .replace(/implement/gi, 'switch up')
        .replace(/enhance/gi, 'level up')
        .replace(/required/gi, 'lowkey mandatory')
        + ' no cap ✨'

    case 'angry-passive':
      return text
        .replace(/this is (completely )?unacceptable/gi, "I'm sure you had your reasons")
        .replace(/you (never|always)/gi, 'I suppose you might')
        .replace(/worst/gi, 'interesting')
        .replace(/terrible/gi, 'challenging')
        .replace(/!/g, '.')

    case 'meeting-sports':
      return `AND THERE IT IS! ${text.replace(/we decided/gi, "The team has made a STUNNING decision")} What a play, folks! The crowd goes WILD! 🏆`

    case 'rant-bbc':
      return `In news this evening, ${text
        .toLowerCase()
        .replace(/!!!/g, '.')
        .replace(/!!/g, '.')
        .replace(/!/g, '.')
        .replace(/i can't believe/gi, 'reports indicate that')
        .replace(/this is the worst/gi, 'sources suggest this represents a significant development in')
        .replace(/omg|wtf/gi, 'notably')
      } This story continues to develop.`

    case 'customer-professional':
      return `I understand your frustration, and I sincerely apologize for the inconvenience. ${text
        .replace(/terrible/gi, 'below our standards')
        .replace(/ridiculous/gi, 'concerning')
        .replace(/!/g, '.')
      } Let me personally ensure we resolve this matter promptly.`

    default:
      return text
  }
}