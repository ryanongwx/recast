// Content script — runs on every page
// Listens for messages from the popup to get selected text

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'GET_SELECTION') {
    const selected = window.getSelection()?.toString().trim() ?? ''
    sendResponse({ text: selected })
  }
})