import { Briefcase, Zap, Megaphone, Mic, MessageCircle } from 'lucide-react'

const MODES = [
  {
    id: 'corporate-genz',
    name: 'Corporate → Gen Z',
    description: 'Transform formal business speak into casual Gen Z vibes',
    icon: Briefcase,
    color: 'from-blue-500 to-cyan-500',
    example: 'Please be advised → yo bestie'
  },
  {
    id: 'angry-passive',
    name: 'Angry → Passive Aggressive',
    description: 'Convert direct anger into subtle passive-aggressive tone',
    icon: Zap,
    color: 'from-red-500 to-orange-500',
    example: 'This is unacceptable! → I\'m sure you had your reasons...'
  },
  {
    id: 'meeting-sports',
    name: 'Meeting → Sports Commentary',
    description: 'Turn boring meetings into exciting sports commentary',
    icon: Megaphone,
    color: 'from-green-500 to-emerald-500',
    example: 'We decided to → AND THERE IT IS! They\'ve made a STUNNING play!'
  },
  {
    id: 'rant-bbc',
    name: 'Rant → BBC News Anchor',
    description: 'Transform emotional rants into calm, professional news delivery',
    icon: Mic,
    color: 'from-purple-500 to-pink-500',
    example: 'I CAN\'T BELIEVE → In news this evening...'
  },
  {
    id: 'customer-professional',
    name: 'Angry Customer → Professional',
    description: 'Soften aggressive messages into diplomatic responses',
    icon: MessageCircle,
    color: 'from-indigo-500 to-blue-500',
    example: 'Your service is terrible! → I understand your frustration...'
  }
]

export default function ModeSelector({ selectedMode, onModeChange }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl text-white text-center mb-6 text-shadow">
        Choose Your Transformation
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODES.map((mode) => {
          const Icon = mode.icon
          const isSelected = selectedMode === mode.id
          
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`mode-card ${isSelected ? 'selected' : ''}`}
            >
              <div className="mode-icon">
                <Icon />
              </div>
              
              <h3 className="text-white font-bold text-lg mb-2 text-shadow">
                {mode.name}
              </h3>
              
              <p className="text-white-80 text-sm mb-3">
                {mode.description}
              </p>
              
              <div className="text-xs text-white-70">
                "{mode.example}"
              </div>
              
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '24px',
                  height: '24px',
                  background: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
                    borderRadius: '50%'
                  }}></div>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}