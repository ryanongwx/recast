import { useState, useEffect } from 'react'

const IS_EXTENSION = typeof chrome !== 'undefined' && !!chrome.runtime?.id

export default function SettingsPanel({ onBack }) {
  const [elevenLabsKey, setElevenLabsKey] = useState('')
  const [openAiKey, setOpenAiKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (IS_EXTENSION) {
      chrome.storage.local.get(['elevenLabsApiKey', 'openAiApiKey'], (result) => {
        if (result.elevenLabsApiKey) setElevenLabsKey(result.elevenLabsApiKey)
        if (result.openAiApiKey) setOpenAiKey(result.openAiApiKey)
      })
    }
  }, [])

  const handleSave = () => {
    if (IS_EXTENSION) {
      chrome.storage.local.set({
        elevenLabsApiKey: elevenLabsKey.trim(),
        openAiApiKey: openAiKey.trim(),
      }, () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      })
    }
  }

  return (
    <div className="gradient-bg">
      <div className="popup-container">
        <div className="header">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <h2 style={{ color: 'white', margin: 0 }}>Settings</h2>
          <div style={{ width: '60px' }} />
        </div>

        <div className="glass-effect settings-body">
          <p className="settings-description">
            API keys are stored locally in your browser and never sent anywhere except the respective APIs.
          </p>

          <div className="settings-field">
            <label>ElevenLabs API Key</label>
            <input
              type="password"
              value={elevenLabsKey}
              onChange={(e) => setElevenLabsKey(e.target.value)}
              placeholder="sk_..."
              className="settings-input"
            />
            <a
              href="https://elevenlabs.io/app/settings/api-keys"
              target="_blank"
              rel="noreferrer"
              className="settings-link"
            >
              Get your key →
            </a>
          </div>

          <div className="settings-field">
            <label>OpenAI API Key <span className="optional">(optional — uses built-in transforms if omitted)</span></label>
            <input
              type="password"
              value={openAiKey}
              onChange={(e) => setOpenAiKey(e.target.value)}
              placeholder="sk-..."
              className="settings-input"
            />
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noreferrer"
              className="settings-link"
            >
              Get your key →
            </a>
          </div>

          <button className="btn btn-primary save-btn" onClick={handleSave}>
            {saved ? '✓ Saved!' : 'Save Keys'}
          </button>
        </div>

        <div className="footer">
          <span>Keys stored in chrome.storage.local</span>
        </div>
      </div>
    </div>
  )
}