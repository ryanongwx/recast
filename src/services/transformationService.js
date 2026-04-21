// Mock transformation service - replace with actual AI API calls
const TRANSFORMATION_PROMPTS = {
  'corporate-genz': {
    systemPrompt: "You are a Gen Z translator. Transform formal corporate language into casual Gen Z speak. Use slang like 'fr fr', 'bestie', 'no cap', 'periodt', 'slay', 'vibe check', etc. Add emojis where appropriate. Keep the core meaning but make it sound like a Gen Z person texting their friend.",
    temperature: 0.8
  },
  'angry-passive': {
    systemPrompt: "You are a passive-aggressive communication expert. Transform direct angry messages into subtle, passive-aggressive responses. Use phrases like 'I'm sure you had your reasons', 'It would have been helpful if', 'I suppose', 'Interesting choice', etc. Maintain politeness while conveying subtle displeasure.",
    temperature: 0.7
  },
  'meeting-sports': {
    systemPrompt: "You are a sports commentator. Transform boring meeting content into exciting sports commentary. Use phrases like 'AND THERE IT IS!', 'WHAT A PLAY!', 'STUNNING MOVE!', 'The crowd goes wild!', etc. Make mundane business decisions sound like thrilling sports moments.",
    temperature: 0.9
  },
  'rant-bbc': {
    systemPrompt: "You are a BBC news anchor. Transform emotional rants and outbursts into calm, professional news delivery. Use formal language, phrases like 'In news this evening', 'Reports indicate', 'According to sources', 'This developing story', etc. Maintain journalistic objectivity and composure.",
    temperature: 0.3
  },
  'customer-professional': {
    systemPrompt: "You are a customer service expert. Transform angry customer complaints into calm, professional, empathetic responses. Use phrases like 'I understand your frustration', 'I sincerely apologize', 'Let me personally ensure', 'We value your feedback', etc. Show empathy while maintaining professionalism.",
    temperature: 0.5
  }
}

// Mock responses for demo purposes
const MOCK_RESPONSES = {
  'corporate-genz': {
    'Please be advised that we need to schedule a meeting to discuss the quarterly performance metrics and align on strategic initiatives moving forward.': 
      'yo bestie we gotta hop on a call to chat about how we did this quarter and figure out our next moves fr fr 💯',
    'We are implementing new protocols to enhance operational efficiency.':
      'we\'re switching up our whole vibe to make things run smoother no cap ✨',
    'Your attendance at tomorrow\'s board meeting is required.':
      'bestie you NEED to show up to the board meeting tomorrow or we\'re all gonna be in trouble periodt 📅'
  },
  'angry-passive': {
    'This is completely unacceptable! You missed the deadline again and now the entire project is behind schedule!':
      'I\'m sure you had your reasons for the timeline adjustment, though it would have been helpful to have a heads up about the project schedule changes.',
    'You never listen to what I say!':
      'I suppose my input might not always come across as clearly as I\'d hoped.',
    'This is the worst idea ever!':
      'Interesting approach - I\'m sure you\'ve given this considerable thought.'
  },
  'meeting-sports': {
    'We reviewed the budget allocations and decided to reallocate resources to the marketing department for Q2.':
      'AND THERE IT IS! The budget committee has made a STUNNING play, folks! They\'re moving those resources like a championship team - straight to marketing for the second quarter! What a strategic move!',
    'The project timeline has been extended by two weeks.':
      'INCREDIBLE! The project team has called for OVERTIME! Two more weeks on the clock, ladies and gentlemen! This is what champions do when they need that extra push!',
    'We need to hire three new developers.':
      'BREAKING NEWS from the recruitment front! The team is making a TRIPLE PLAY - three new developers joining the roster! The crowd goes WILD!'
  },
  'rant-bbc': {
    'I CAN\'T BELIEVE THEY CANCELLED MY FAVORITE SHOW!!! This is the WORST decision ever made in television history! The executives are completely out of touch with what viewers actually want!!!':
      'In entertainment news this evening, network executives have announced the cancellation of a popular television programme, prompting considerable discussion among viewers regarding programming decisions and audience preferences.',
    'THIS TRAFFIC IS INSANE! I\'VE BEEN STUCK HERE FOR AN HOUR!!!':
      'Transport authorities report significant delays on major roadways this morning, with commuters experiencing extended travel times of up to one hour.',
    'THE WEATHER IS ABSOLUTELY TERRIBLE TODAY!!!':
      'The Met Office has issued weather warnings for the region, with conditions described as challenging for outdoor activities.'
  },
  'customer-professional': {
    'Your service is terrible! I\'ve been waiting for hours and nobody has helped me! This is ridiculous and I want my money back right now!':
      'I understand your frustration with the wait time, and I sincerely apologize for the inconvenience. Let me personally ensure we resolve this matter promptly and discuss how we can make this right for you.',
    'This product is garbage! It broke after one day!':
      'I\'m truly sorry to hear about the product issue you\'ve experienced. This certainly doesn\'t meet our quality standards, and I\'d like to arrange an immediate replacement and investigate how we can prevent this in the future.',
    'You people have no idea what you\'re doing!':
      'I appreciate you bringing this to our attention, and I understand your concerns. Let me connect you with our most experienced team member who can provide the specialized assistance you deserve.'
  }
}

export async function transformText(inputText, mode) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))
  
  // Check for exact matches first
  const mockResponses = MOCK_RESPONSES[mode] || {}
  if (mockResponses[inputText]) {
    return mockResponses[inputText]
  }
  
  // For demo purposes, generate a simple transformation
  const prompt = TRANSFORMATION_PROMPTS[mode]
  if (!prompt) {
    throw new Error('Invalid transformation mode')
  }
  
  // This would be replaced with actual AI API call
  // For now, return a generic transformation based on the mode
  return generateMockTransformation(inputText, mode)
}

function generateMockTransformation(text, mode) {
  const lowerText = text.toLowerCase()
  
  switch (mode) {
    case 'corporate-genz':
      return text
        .replace(/please be advised/gi, 'yo bestie')
        .replace(/we need to/gi, 'we gotta')
        .replace(/schedule a meeting/gi, 'hop on a call')
        .replace(/discuss/gi, 'chat about')
        .replace(/moving forward/gi, 'fr fr 💯')
        .replace(/implement/gi, 'switch up')
        .replace(/enhance/gi, 'make things better')
        .replace(/required/gi, 'you NEED to show up')
        
    case 'angry-passive':
      return text
        .replace(/this is (completely )?unacceptable/gi, 'I\'m sure you had your reasons')
        .replace(/you (never|always)/gi, 'I suppose you might')
        .replace(/worst/gi, 'interesting')
        .replace(/terrible/gi, 'challenging')
        .replace(/!/g, '.')
        
    case 'meeting-sports':
      return `AND THERE IT IS! ${text.replace(/we decided/gi, 'The team has made a STUNNING decision')} What a play, folks!`
      
    case 'rant-bbc':
      return `In news this evening, ${text.toLowerCase().replace(/!!!/g, '.').replace(/i can't believe/gi, 'reports indicate that').replace(/this is the worst/gi, 'sources suggest this represents a significant')}`
      
    case 'customer-professional':
      return `I understand your frustration, and I sincerely apologize for the inconvenience. ${text.replace(/terrible/gi, 'challenging').replace(/ridiculous/gi, 'concerning').replace(/!/g, '.')} Let me personally ensure we resolve this matter promptly.`
      
    default:
      return text
  }
}