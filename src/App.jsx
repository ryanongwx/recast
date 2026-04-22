import { useState, useRef, useEffect } from 'react'
import './App.css'
import ModeSelector from './components/ModeSelector'
import TextEditor from './components/TextEditor'
import ControlPanel from './components/ControlPanel'
import SettingsPanel from './components/SettingsPanel'
import { transformText } from './services/transformationService.js'

// Detect if running as a Chrome extension
const IS_EXTENSION = typeof chrome !== 'undefined' && !!chrome.runtime?.id

const DEMO_EXAMPLES = {
  'corporate-genz': "Please be advised that we need to schedule a meeting to discuss the quarterly performance metrics and align on strategic initiatives moving forward.",
  'angry-passive': "This is completely unacceptable! You missed the deadline again and now the entire project is behind schedule because of you!",
  'meeting-sports': "We reviewed the budget allocations and decided to reallocate resources to the marketing department for Q2.",
  'rant-bbc': "I CAN'T BELIEVE THEY CANCELLED MY FAVORITE SHOW!!! This is the WORST decision ever made in television history! The executives are completely out of touch with what viewers actually want!!!",
  'customer-professional': "Your service is terrible! I've been waiting for hours and nobody has helped me! This is ridiculous and I want my money back right now!",
}

export default function App() {
  const [selectedMode, setSelectedMode] = useState('rant-bbc')
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isTransforming, setIsTransforming] = useState(false)
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false)
  const [isPlayingTransformed, setIsPlayingTransformed] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const currentAudioRef = useRef(null)

  // On mount: check for text passed via context menu or grab page selection
  useEffect(() => {
    if (!IS_EXTENSION) return
    chrome.storage.session.get('pendingText', ({ pendingText }) => {
      if (pendingText) {
        setInputText(pendingText)
        chrome.storage.session.remove('pendingText')
      } else {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (!tabs[0]?.id) return
          chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_SELECTION' }, (res) => {
            if (chrome.runtime.lastError) return
            if (res?.text) setInputText(res.text)
          })
        })
      }
    })
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (inputText.trim() && !isTransforming) handleTransform()
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClear()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [inputText, isTransforming])

  const showStatus = (msg) => {
    setStatusMessage(msg)
    setTimeout(() => setStatusMessage(''), 4000)
  }

  const handleTransform = async () => {
    if (!inputText.trim()) return
    setIsTransforming(true)
    setOutputText('')
    try {
      let result
      if (IS_EXTENSION) {
        const response = await chrome.runtime.sendMessage({
          type: 'TRANSFORM_REQUEST',
          payload: { text: inputText, mode: selectedMode },
        })
        if (!response.ok) throw new Error(response.error)
        result = response.text
      } else {
        result = await transformText(inputText, selectedMode)
      }
      setOutputText(result)
    } catch (err) {
      showStatus(`Error: ${err.message}`)
    } finally {
      setIsTransforming(false)
    }
  }

  const stopAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause()
      currentAudioRef.current = null
    }
    setIsPlayingOriginal(false)
    setIsPlayingTransformed(false)
  }

  const handlePlayAudio = async (text, isOriginal) => {
    if (isOriginal && isPlayingOriginal) { stopAudio(); return }
    if (!isOriginal && isPlayingTransformed) { stopAudio(); return }
    stopAudio()
    if (!text.trim()) return

    isOriginal ? setIsPlayingOriginal(true) : setIsPlayingTransformed(true)

    try {
      let audioUrl

      if (IS_EXTENSION) {
        const response = await chrome.runtime.sendMessage({
          type: 'TTS_REQUEST',
          payload: { text, mode: selectedMode, isOriginal },
        })
        if (!response.ok) throw new Error(response.error)
        const binary = atob(response.base64Audio)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        const blob = new Blob([bytes], { type: 'audio/mpeg' })
        audioUrl = URL.createObjectURL(blob)
      } else {
        audioUrl = generateDevAudio()
      }

      const audio = new Audio(audioUrl)
      currentAudioRef.current = audio
      audio.onended = () => { stopAudio(); URL.revokeObjectURL(audioUrl) }
      audio.onerror = () => { stopAudio(); showStatus('Audio playback failed') }
      await audio.play()
    } catch (err) {
      stopAudio()
      showStatus(`Voice error: ${err.message}`)
    }
  }

  const handleTryExample = () => {
    setInputText(DEMO_EXAMPLES[selectedMode] ?? '')
    setOutputText('')
  }

  const handleClear = () => {
    stopAudio()
    setInputText('')
    setOutputText('')
    setStatusMessage('')
  }

  if (showSettings) {
    return <SettingsPanel onBack={() => setShowSettings(false)} />
  }

  return (
    <div className="gradient-bg">
      <div className="popup-container">
        <div className="header">
          <div className="header-title">
            <span className="header-emoji">🎭</span>
            <h1>Recast</h1>
            <span className="header-tagline">Vibe Translator</span>
          </div>
          <button className="settings-btn" onClick={() => setShowSettings(true)} title="Settings">
            ⚙️
          </button>
        </div>

        <ModeSelector selectedMode={selectedMode} onModeChange={(mode) => {
          setSelectedMode(mode)
          setOutputText('')
        }} />

        <div className="glass-effect editor-wrapper">
          <TextEditor
            inputText={inputText}
            outputText={outputText}
            onInputChange={setInputText}
            isTransforming={isTransforming}
            selectedMode={selectedMode}
          />
          <ControlPanel
            onTransform={handleTransform}
            onPlayOriginal={() => handlePlayAudio(inputText, true)}
            onPlayTransformed={() => handlePlayAudio(outputText, false)}
            onTryExample={handleTryExample}
            onClear={handleClear}
            isTransforming={isTransforming}
            isPlayingOriginal={isPlayingOriginal}
            isPlayingTransformed={isPlayingTransformed}
            hasInput={!!inputText.trim()}
            hasOutput={!!outputText.trim()}
          />
        </div>

        {statusMessage && <div className="status-message">{statusMessage}</div>}

        <div className="footer">
          <span>Powered by ElevenLabs AI</span>
          <span className="shortcut-hint">Ctrl+Enter to transform</span>
        </div>
      </div>
    </div>
  )
}

// Dev-mode audio placeholder
function generateDevAudio() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const duration = 0.4
  const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.sin(2 * Math.PI * 440 * i / ctx.sampleRate) * 0.1
  }
  const pcm = new Int16Array(data.length)
  for (let i = 0; i < data.length; i++) pcm[i] = Math.max(-32768, Math.min(32767, data[i] * 32767))
  const header = new ArrayBuffer(44)
  const v = new DataView(header)
  const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)) }
  w(0, 'RIFF'); v.setUint32(4, 36 + pcm.byteLength, true); w(8, 'WAVE')
  w(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true)
  v.setUint32(24, ctx.sampleRate, true); v.setUint32(28, ctx.sampleRate * 2, true)
  v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, pcm.byteLength, true)
  return URL.createObjectURL(new Blob([header, pcm.buffer], { type: 'audio/wav' }))
}