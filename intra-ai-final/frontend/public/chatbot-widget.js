(function () {
  'use strict';
  var config = window.IntraAIConfig || {};
  var botId = config.botId;
  if (!botId) { console.error('INTRA AI: botId is required'); return; }

  var BASE_URL = config.baseUrl || 'http://localhost:3000';
  var position = config.position || 'bottom-right';

  // Styles
  var style = document.createElement('style');
  style.textContent = [
    '#intra-ai-widget { position: fixed; z-index: 99999; }',
    '#intra-ai-widget.bottom-right { bottom: 24px; right: 24px; }',
    '#intra-ai-widget.bottom-left { bottom: 24px; left: 24px; }',
    '#intra-ai-btn { width: 60px; height: 60px; border-radius: 50%; border: none; cursor: pointer; font-size: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); transition: transform 0.2s; display: flex; align-items: center; justify-content: center; }',
    '#intra-ai-btn:hover { transform: scale(1.08); }',
    '#intra-ai-frame { position: absolute; width: 380px; height: 580px; border: none; border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.18); overflow: hidden; transition: all 0.3s; transform-origin: bottom right; }',
    '#intra-ai-frame.hidden { transform: scale(0.9); opacity: 0; pointer-events: none; }',
    '#intra-ai-widget.bottom-right #intra-ai-frame { bottom: 72px; right: 0; }',
    '#intra-ai-widget.bottom-left #intra-ai-frame { bottom: 72px; left: 0; transform-origin: bottom left; }',
    '@media (max-width: 480px) { #intra-ai-frame { width: calc(100vw - 24px); height: calc(100vh - 100px); right: 0; bottom: 72px; } }',
  ].join('');
  document.head.appendChild(style);

  // Widget container
  var widget = document.createElement('div');
  widget.id = 'intra-ai-widget';
  widget.className = position;

  // iframe
  var frame = document.createElement('iframe');
  frame.id = 'intra-ai-frame';
  frame.src = BASE_URL + '/chatbot/' + botId;
  frame.className = 'hidden';
  frame.title = 'AI Chat';
  frame.allow = 'microphone';

  // Toggle button
  var btn = document.createElement('button');
  btn.id = 'intra-ai-btn';
  btn.innerHTML = '🤖';
  btn.setAttribute('aria-label', 'Open chat');
  btn.style.backgroundColor = config.primaryColor || '#2563EB';

  var open = false;
  btn.addEventListener('click', function () {
    open = !open;
    frame.className = open ? '' : 'hidden';
    btn.innerHTML = open ? '✕' : '🤖';
    btn.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
  });

  widget.appendChild(frame);
  widget.appendChild(btn);
  document.body.appendChild(widget);
})();
