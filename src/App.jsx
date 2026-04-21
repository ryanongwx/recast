import { useState, useRef, useEffect } from 'react'
import './App.css'
import ModeSelector from './components/ModeSelector'
import TextEditor from './components/TextEditor'
import ControlPanel from './components/ControlPanel'
import { transformText } from './services/transformationService'
import { playTextToSpeech } from './services/elevenLabsService'

const DEMO_EXAMPLES = {
  'corporate-genz': {
    input: "Please be advised that we need to schedule a meeting to discuss the quarterly performance metrics and align on strategic initiatives moving forward.",
    expected: "yo bestie we gotta hop on a call to chat about how we did this quarter and figure out our next moves fr fr 💯"
  },
  'angry-passive': {
    input: "This is completely unacceptable! You missed the deadline again and now the entire project is behind schedule!",
    expected: "I'm sure you had your reasons for the timeline adjustment, though it would have been helpful to have a heads up about the project schedule changes."
  },
  'meeting-sports': {
    input: "We reviewed the budget allocations and decided to reallocate resources to the marketing department for Q2.",
    expected: "AND THERE IT IS! The budget committee has made a STUNNING play, folks! They're moving those resources like a championship team - straight to marketing for the second quarter! What a strategic move!"
  },
  'rant-bbc': {
    input: "I CAN'T BELIEVE THEY CANCELLED MY FAVORITE SHOW!!! This is the WORST decision ever made in television history! The executives are completely out of touch with what viewers actually want!!!",
    expected: "In entertainment news this evening, network executives have announced the cancellation of a popular television programme, prompting considerable discussion among viewers regarding programming decisions and audience preferences."
  },
  'customer-professional': {
    input: "Your service is terrible! I've been waiting for hours and nobody has helped me! This is ridiculous and I want my money back right now!",
    expected: "I understand your frustration with the wait time, and I sincerely apologize for the inconvenience. Let me personally ensure we resolve this matter promptly and discuss how we can make this right for you."
  }
}

function App() {
  const [selectedMode, setSelectedMode] = useState('rant-bbc')
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [isTransforming, setIsTransforming] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAudio, setCurrentAudio] = useState(null)
  const audioRef = useRef(null)

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ctrl/Cmd + Enter to transform
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        if (inputText.trim() && !isTransforming) {
          handleTransform()
        }
      }
      
      // Ctrl/Cmd + Shift + P to play original
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
        event.preventDefault()
        if (inputText.trim()) {
          handlePlayAudio(inputText, true)
        }
      }
      
      // Ctrl/Cmd + P to play transformed
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key === 'p') {
        event.preventDefault()
        if (outputText.trim()) {
          handlePlayAudio(outputText, false)
        }
      }
      
      // Escape to clear
      if (event.key === 'Escape') {
        event.preventDefault()
        handleClear()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [inputText, outputText, isTransforming])

  const handleTransform = async () => {
    if (!inputText.trim()) return
    
    setIsTransforming(true)
    try {
      const transformed = await transformText(inputText, selectedMode)
      setOutputText(transformed)
    } catch (error) {
      console.error('Transformation failed:', error)
      setOutputText('Sorry, transformation failed. Please try again.')
    } finally {
      setIsTransforming(false)
    }
  }

  const handlePlayAudio = async (text, isOriginal = false) => {
    if (isPlaying) {
      // Stop current audio
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.currentTime = 0
      }
      setIsPlaying(false)
      setCurrentAudio(null)
      return
    }

    if (!text.trim()) return

    setIsPlaying(true)
    try {
      const audioUrl = await playTextToSpeech(text, selectedMode, isOriginal)
      const audio = new Audio(audioUrl)
      setCurrentAudio(audio)
      
      audio.onended = () => {
        setIsPlaying(false)
        setCurrentAudio(null)
      }
      
      audio.onerror = () => {
        setIsPlaying(false)
        setCurrentAudio(null)
        console.error('Audio playback failed')
      }
      
      await audio.play()
    } catch (error) {
      console.error('Text-to-speech failed:', error)
      setIsPlaying(false)
      setCurrentAudio(null)
    }
  }

  const handleTryExample = () => {
    const example = DEMO_EXAMPLES[selectedMode]
    if (example) {
      setInputText(example.input)
      setOutputText(example.expected)
    }
  }

  const handleClear = () => {
    setInputText('')
    setOutputText('')
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
      setIsPlaying(false)
    }
  }

  return (
    <div className="gradient-bg">
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl text-white mb-4 text-shadow">
            Recast
          </h1>
          <p className="text-xl text-white-90 mb-2 text-shadow">
            Transform your vibe, instantly
          </p>
          <p className="text-lg text-white-80 text-shadow">
            Real-time text transformation with AI-powered voice synthesis
          </p>
        </div>

        {/* Mode Selector */}
        <ModeSelector 
          selectedMode={selectedMode}
          onModeChange={setSelectedMode}
        />

        {/* Main Content */}
        <div className="glass-effect rounded-2xl p-6 mb-6">
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
            isPlaying={isPlaying}
            hasInput={!!inputText.trim()}
            hasOutput={!!outputText.trim()}
          />
        </div>

        {/* Demo Section */}
        <div className="glass-effect p-6">
          <h3 className="text-2xl text-white mb-4 text-center">
            🎭 Try the Viral Demo
          </h3>
          <p className="text-white-90 text-center mb-4">
            Paste an unhinged Twitter rant and hear it back as a calm BBC news anchor
          </p>
          <div className="text-center">
            <button
              onClick={() => {
                setSelectedMode('rant-bbc')
                handleTryExample()
              }}
              className="btn btn-primary"
            >
              🎬 Load Viral Demo
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-white-70">
          <p className="mb-2">Built with ❤️ using Kiro's spec-driven development and ElevenLabs AI</p>
          <div className="text-sm text-white-50">
            <p>Keyboard shortcuts: Ctrl+Enter (Transform) • Ctrl+P (Play Transformed) • Ctrl+Shift+P (Play Original) • Esc (Clear)</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App