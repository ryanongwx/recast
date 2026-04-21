import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

// Voice mappings for different transformation modes
const VOICE_MAPPINGS = {
  'corporate-genz': {
    original: 'JBFqnCBsd6RMkjVDRZzb', // George - professional male
    transformed: 'EXAVITQu4vr4xnSDxMaL' // Bella - young female
  },
  'angry-passive': {
    original: 'TxGEqnHWrfWFTfGW9XjX', // Josh - direct male
    transformed: 'MF3mGyEYCl7XYWocJS7h' // Elli - soft female
  },
  'meeting-sports': {
    original: 'JBFqnCBsd6RMkjVDRZzb', // George - professional
    transformed: 'onwK4e9ZLuTAKqWW03F9' // Daniel - energetic male
  },
  'rant-bbc': {
    original: 'pqHfZKP75CvOlQylNhV4', // Bill - emotional male
    transformed: 'N2lVS1w4EtoT3dr4eOWO' // Callum - calm British male
  },
  'customer-professional': {
    original: 'pqHfZKP75CvOlQylNhV4', // Bill - angry male
    transformed: 'EXAVITQu4vr4xnSDxMaL' // Bella - professional female
  }
}

// Initialize ElevenLabs client
let client = null

function getClient() {
  if (!client) {
    const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY
    if (!apiKey) {
      throw new Error('ElevenLabs API key not found. Please set VITE_ELEVENLABS_API_KEY in your .env file.')
    }
    client = new ElevenLabsClient({ apiKey })
  }
  return client
}

export async function playTextToSpeech(text, mode, isOriginal = false) {
  try {
    const elevenLabsClient = getClient()
    
    // Get appropriate voice for the mode and whether it's original or transformed
    const voiceMapping = VOICE_MAPPINGS[mode]
    if (!voiceMapping) {
      throw new Error(`No voice mapping found for mode: ${mode}`)
    }
    
    const voiceId = isOriginal ? voiceMapping.original : voiceMapping.transformed
    
    // Configure voice settings based on the transformation type
    const voiceSettings = getVoiceSettings(mode, isOriginal)
    
    // Generate speech using ElevenLabs
    const audioStream = await elevenLabsClient.textToSpeech.convert(voiceId, {
      text: text,
      modelId: "eleven_flash_v2_5", // Low latency model
      voice_settings: voiceSettings
    })
    
    // Convert stream to blob URL for audio playback
    const chunks = []
    for await (const chunk of audioStream) {
      chunks.push(chunk)
    }
    
    const audioBlob = new Blob(chunks, { type: 'audio/mpeg' })
    const audioUrl = URL.createObjectURL(audioBlob)
    
    return audioUrl
    
  } catch (error) {
    console.error('ElevenLabs TTS Error:', error)
    
    // Fallback to mock audio for demo purposes
    return generateMockAudio(text, mode, isOriginal)
  }
}

function getVoiceSettings(mode, isOriginal) {
  // Base settings
  const baseSettings = {
    stability: 0.5,
    similarity_boost: 0.8,
    use_speaker_boost: false
  }
  
  // Adjust settings based on transformation mode
  switch (mode) {
    case 'corporate-genz':
      return {
        ...baseSettings,
        stability: isOriginal ? 0.7 : 0.3, // More stable for corporate, more expressive for Gen Z
        similarity_boost: isOriginal ? 0.8 : 0.6
      }
      
    case 'angry-passive':
      return {
        ...baseSettings,
        stability: isOriginal ? 0.2 : 0.8, // Unstable for angry, very stable for passive
        similarity_boost: isOriginal ? 0.9 : 0.7
      }
      
    case 'meeting-sports':
      return {
        ...baseSettings,
        stability: isOriginal ? 0.8 : 0.1, // Stable for meeting, very expressive for sports
        similarity_boost: isOriginal ? 0.7 : 0.9
      }
      
    case 'rant-bbc':
      return {
        ...baseSettings,
        stability: isOriginal ? 0.1 : 0.9, // Very expressive for rant, very stable for BBC
        similarity_boost: isOriginal ? 0.6 : 0.8
      }
      
    case 'customer-professional':
      return {
        ...baseSettings,
        stability: isOriginal ? 0.2 : 0.8, // Expressive for angry, stable for professional
        similarity_boost: isOriginal ? 0.9 : 0.7
      }
      
    default:
      return baseSettings
  }
}

// Mock audio generation for demo purposes when API is not available
function generateMockAudio(text, mode, isOriginal) {
  // Create a simple beep sound as placeholder
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const duration = Math.min(text.length * 0.1, 10) // Max 10 seconds
  
  const buffer = audioContext.createBuffer(1, audioContext.sampleRate * duration, audioContext.sampleRate)
  const data = buffer.getChannelData(0)
  
  // Generate different tones based on mode and original/transformed
  const frequency = isOriginal ? 440 : 880 // A4 vs A5
  
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.sin(2 * Math.PI * frequency * i / audioContext.sampleRate) * 0.1
  }
  
  // Convert buffer to blob URL
  return new Promise((resolve) => {
    const source = audioContext.createBufferSource()
    source.buffer = buffer
    
    // Create a simple WAV file
    const wavBlob = bufferToWav(buffer)
    const audioUrl = URL.createObjectURL(wavBlob)
    resolve(audioUrl)
  })
}

// Helper function to convert AudioBuffer to WAV blob
function bufferToWav(buffer) {
  const length = buffer.length
  const arrayBuffer = new ArrayBuffer(44 + length * 2)
  const view = new DataView(arrayBuffer)
  
  // WAV header
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }
  
  writeString(0, 'RIFF')
  view.setUint32(4, 36 + length * 2, true)
  writeString(8, 'WAVE')
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, buffer.sampleRate, true)
  view.setUint32(28, buffer.sampleRate * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeString(36, 'data')
  view.setUint32(40, length * 2, true)
  
  // Convert float samples to 16-bit PCM
  const data = buffer.getChannelData(0)
  let offset = 44
  for (let i = 0; i < length; i++) {
    const sample = Math.max(-1, Math.min(1, data[i]))
    view.setInt16(offset, sample * 0x7FFF, true)
    offset += 2
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' })
}