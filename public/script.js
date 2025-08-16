const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
let thinkingMessage = null;
let conversationId = null;

// Load marked.js and DOMPurify from CDN
const scriptMarked = document.createElement('script');
scriptMarked.src = 'https://cdn.jsdelivr.net/npm/marked@11.2.0/lib/marked.umd.min.js';
document.head.appendChild(scriptMarked);

const scriptPurify = document.createElement('script');
scriptPurify.src = 'https://cdn.jsdelivr.net/npm/dompurify@3.1.4/dist/purify.min.js';
document.head.appendChild(scriptPurify);

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';

  thinkingMessage = appendMessage('bot', 'Thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        userMessage,
        conversationId
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.conversationId) {
      conversationId = data.conversationId;
    }

    if (data && data.result) {
      replaceMessage(thinkingMessage, data.result);
    } else {
      replaceMessage(thinkingMessage, 'Sorry, no response received.');
    }
  } catch (error) {
    console.error('Error:', error);
    replaceMessage(thinkingMessage, 'Failed to get response from server.');
  }
});

// Improved markdown rendering with better error handling
function renderMarkdown(text) {
  try {
    if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') {
      console.warn('Waiting for markdown libraries to load...');
      return text;
    }

    const html = marked.parse(text, {
      gfm: true,
      breaks: true,
      sanitize: false
    });

    const cleanHtml = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'em', 'strong', 'code', 'pre', 'a', 'ul', 'ol', 'li']
    });

    return cleanHtml;
  } catch (error) {
    console.error('Markdown rendering error:', error);
    return text;
  }
}

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  
  const content = document.createElement('div');
  content.classList.add('content');
  content.innerHTML = renderMarkdown(text);
  
  msg.appendChild(content);
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  
  return msg;
}

function replaceMessage(oldMessage, newText) {
  if (oldMessage) {
    const content = document.createElement('div');
    content.classList.add('content');
    content.innerHTML = renderMarkdown(newText);
    
    oldMessage.innerHTML = '';
    oldMessage.appendChild(content);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}
