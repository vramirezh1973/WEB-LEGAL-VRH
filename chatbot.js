(function () {
  'use strict';

  const styles = `
    #vrh-chat-launcher{position:fixed;right:22px;bottom:94px;z-index:9500;border:0;border-radius:999px;background:#0D1B40;color:#fff;padding:13px 18px;box-shadow:0 6px 24px rgba(13,27,64,.28);font:600 15px/1.25 'Segoe UI',Arial,sans-serif;cursor:pointer;transition:transform .2s,background .2s}
    #vrh-chat-launcher:hover{background:#162454;transform:translateY(-2px)}
    #vrh-chat-launcher:focus-visible,#vrh-chat-panel button:focus-visible,#vrh-chat-input:focus-visible{outline:3px solid #C9A84C;outline-offset:3px}
    #vrh-chat-panel{position:fixed;right:22px;bottom:156px;width:min(390px,calc(100vw - 28px));height:min(590px,calc(100dvh - 180px));z-index:9501;background:#fff;border:1px solid #DDD8CE;border-radius:16px;box-shadow:0 12px 44px rgba(13,27,64,.24);display:none;flex-direction:column;overflow:hidden;font:14px/1.5 'Segoe UI',Arial,sans-serif;color:#1A1A2E}
    #vrh-chat-panel.is-open{display:flex}
    .vrh-chat-head{background:#0D1B40;color:#fff;padding:15px 16px;display:flex;justify-content:space-between;align-items:center;gap:12px}
    .vrh-chat-head strong{display:block;font:700 17px Georgia,serif}.vrh-chat-head small{display:block;color:#E6C97A;font-size:12px;margin-top:3px}
    #vrh-chat-close{flex:0 0 36px;background:transparent;border:1px solid rgba(255,255,255,.45);color:#fff;border-radius:8px;width:36px;height:36px;font-size:21px;cursor:pointer}
    #vrh-chat-messages{flex:1;overflow:auto;padding:13px;background:#F5F3EF;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain}
    .vrh-chat-message{max-width:92%;padding:10px 12px;border-radius:12px;line-height:1.5;white-space:pre-line;overflow-wrap:anywhere}
    .vrh-chat-message.is-bot{background:#fff;border:1px solid #DDD8CE;align-self:flex-start;border-bottom-left-radius:4px}
    .vrh-chat-message.is-user{background:#0D1B40;color:#fff;align-self:flex-end;border-bottom-right-radius:4px}
    .vrh-chat-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:9px}
    .vrh-chat-actions button,.vrh-chat-actions a{background:#fff;color:#0D1B40;border:1px solid #C9A84C;border-radius:999px;padding:7px 10px;font:600 12px/1.3 'Segoe UI',Arial,sans-serif;cursor:pointer;text-decoration:none}
    .vrh-chat-actions button:hover,.vrh-chat-actions a:hover{background:#F5F3EF}
    .vrh-chat-form{display:flex;gap:8px;padding:10px;border-top:1px solid #DDD8CE;background:#fff}
    #vrh-chat-input{flex:1;min-width:0;border:1px solid #AAA;border-radius:9px;padding:10px;font:14px 'Segoe UI',Arial,sans-serif}
    #vrh-chat-send{border:0;border-radius:9px;background:#C9A84C;color:#0D1B40;padding:0 13px;font-weight:700;cursor:pointer}
    .vrh-chat-note{font-size:11px;line-height:1.4;color:#6B7280;padding:0 12px 10px;background:#fff}
    @media(max-width:480px){#vrh-chat-launcher{right:14px;bottom:88px}#vrh-chat-panel{right:10px;bottom:146px;width:calc(100vw - 20px);height:min(570px,calc(100dvh - 166px))}}
    @media(prefers-reduced-motion:reduce){#vrh-chat-launcher{transition:none}}
  `;

  const style = document.createElement('style');
  style.textContent = styles;
  document.head.appendChild(style);

  // Build a small, local knowledge base from the information actually published here.
  const pageFacts = Array.from(document.querySelectorAll(
    'main h1,main h2,main h3,main h4,main p,main li,main blockquote,main .faq-answer,footer h4,footer p,footer li'
  )).map((element) => (element.innerText || '').trim()).filter(Boolean);
  const practiceCards = Array.from(document.querySelectorAll('.area-card'))
    .map((card) => (card.innerText || '').replace(/\s+/g, ' ').trim()).filter(Boolean);

  function normalize(value) {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  const launcher = document.createElement('button');
  launcher.id = 'vrh-chat-launcher';
  launcher.type = 'button';
  launcher.setAttribute('aria-haspopup', 'dialog');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.setAttribute('aria-controls', 'vrh-chat-panel');
  launcher.textContent = '⚖  ¿Cómo podemos ayudarte?';

  const panel = document.createElement('section');
  panel.id = 'vrh-chat-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'vrh-chat-title');
  panel.innerHTML = `
    <div class="vrh-chat-head">
      <div><strong id="vrh-chat-title">Asistente del Estudio Jurídico</strong><small>Guía automática basada en este sitio</small></div>
      <button id="vrh-chat-close" type="button" aria-label="Cerrar asistente">×</button>
    </div>
    <div id="vrh-chat-messages" aria-live="polite" aria-label="Conversación"></div>
    <form class="vrh-chat-form" id="vrh-chat-form">
      <input id="vrh-chat-input" type="text" maxlength="500" autocomplete="off" placeholder="Escriba su consulta…" aria-label="Escriba su consulta">
      <button id="vrh-chat-send" type="submit">Enviar</button>
    </form>
    <div class="vrh-chat-note">Orientación informativa, no asesoría legal. Este chat funciona en su navegador; evite escribir datos confidenciales.</div>
  `;
  document.body.append(launcher, panel);

  const messageList = panel.querySelector('#vrh-chat-messages');
  const input = panel.querySelector('#vrh-chat-input');

  function addMessage(text, author, actions) {
    const message = document.createElement('div');
    message.className = `vrh-chat-message is-${author}`;
    message.textContent = text;

    if (actions && actions.length) {
      const actionRow = document.createElement('div');
      actionRow.className = 'vrh-chat-actions';
      actions.forEach((action) => {
        const control = action.href ? document.createElement('a') : document.createElement('button');
        if (action.href) {
          control.href = action.href;
          if (action.href.startsWith('http')) {
            control.target = '_blank';
            control.rel = 'noopener noreferrer';
          }
        } else {
          control.type = 'button';
          control.addEventListener('click', () => respond(action.query || action.label));
        }
        control.textContent = action.label;
        actionRow.appendChild(control);
      });
      message.appendChild(actionRow);
    }

    messageList.appendChild(message);
    messageList.scrollTop = messageList.scrollHeight;
  }

  const contactAction = [{ label: 'Ir a contacto', href: '#contacto' }];
  const practiceActions = [
    { label: 'Ver áreas de práctica', href: '#areas' },
    ...contactAction,
  ];

  function findPageAnswer(query) {
    const words = normalize(query).match(/[a-z0-9]{3,}/g) || [];
    const matches = pageFacts.map((text) => {
      const normalizedText = normalize(text);
      const score = words.reduce((total, word) => total + (normalizedText.includes(word) ? 1 : 0), 0);
      return { text, score };
    }).filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
    return matches.map((item) => item.text).join('\n');
  }

  function getResponse(query) {
    const normalized = normalize(query);
    const faq = (id) => document.querySelector(id)?.innerText.trim();

    if (/hola|buenos|buenas|ayuda|que hacen|como me orientan/.test(normalized)) {
      return {
        text: 'Con gusto le orientamos. Puedo explicarle las áreas de práctica, la primera consulta, la atención virtual o cómo contactar al estudio. ¿Qué necesita?',
        actions: [
          { label: 'Áreas legales', query: '¿Qué áreas legales atienden?' },
          { label: 'Primera consulta', query: '¿Cuánto cuesta la primera consulta?' },
          { label: 'Atención virtual', query: '¿Atienden en línea?' },
          ...contactAction,
        ],
      };
    }

    if (/precio|costo|cuanto|consulta|agendar|cita|reserv/.test(normalized)) {
      return {
        text: (faq('#faq-a1') || 'La información de la página indica que la primera consulta es gratuita y sin compromiso.') + ' Para coordinarla, puede usar el formulario o los datos publicados en contacto.',
        actions: contactAction,
      };
    }

    if (/area|servicio|civil|mercantil|societ|laboral|familia|administrativ|digital|tecnolog/.test(normalized)) {
      const terms = normalized.match(/civil|mercantil|societ|laboral|familia|administrativ|digital|tecnolog/g) || [];
      const matchingCards = practiceCards.filter((card) => terms.some((term) => normalize(card).includes(term)));
      const information = matchingCards.length ? matchingCards : practiceCards;
      return {
        text: (information.join('\n') || faq('#faq-a2') || findPageAnswer(query) || 'Revise las áreas de práctica publicadas en el sitio.') + '\n\nPara evaluar una situación concreta, solicite una consulta profesional.',
        actions: practiceActions,
      };
    }

    if (/virtual|online|linea|videollamada|presencial|exterior/.test(normalized)) {
      return {
        text: faq('#faq-a3') || findPageAnswer(query) || 'Puede consultar en la sección de contacto las modalidades de atención publicadas.',
        actions: contactAction,
      };
    }

    if (/direccion|ubicacion|donde|horario|telefono|whatsapp|correo|email|contact/.test(normalized)) {
      return {
        text: (document.querySelector('#contacto')?.innerText || 'Consulte los datos publicados en la sección de contacto.').replace(/\s+/g, ' ').trim(),
        actions: contactAction,
      };
    }

    if (/confidencial|privacidad|proteccion de datos/.test(normalized)) {
      return {
        text: (faq('#faq-a5') || findPageAnswer(query) || 'Consulte la Política de Privacidad enlazada en el sitio.') + ' Evite incluir información sensible en este chat.',
        actions: [{ label: 'Ver información de contacto', href: '#contacto' }],
      };
    }

    if (/garanti|resultado|ganar|probabilidad/.test(normalized)) {
      return {
        text: (faq('#faq-a4') || findPageAnswer(query) || 'La página no ofrece garantías de resultados específicos.') + ' Para una evaluación de su situación, solicite una consulta profesional.',
        actions: contactAction,
      };
    }

    if (/urgente|emergencia|inmediato/.test(normalized)) {
      return {
        text: 'Para consultas urgentes, utilice los medios de contacto publicados en el sitio. No comparta información confidencial en este chat.',
        actions: contactAction,
      };
    }

    if (/nosotros|firma|equipo|quienes somos/.test(normalized)) {
      const about = document.querySelector('#nosotros');
      return {
        text: (about?.innerText || findPageAnswer(query) || 'El sitio describe los servicios jurídicos que ofrece el estudio.') + '\n\nPuede revisar la sección Sobre nosotros para más información.',
        actions: [{ label: 'Sobre nosotros', href: '#nosotros' }, ...contactAction],
      };
    }

    const pageAnswer = findPageAnswer(query);
    if (pageAnswer) {
      return {
        text: 'Encontré esta información relacionada en el sitio:\n' + pageAnswer + '\n\n¿Quiere que le ayude a ubicar un servicio o contactar al estudio?',
        actions: practiceActions,
      };
    }

    return {
      text: 'No encuentro una respuesta específica publicada en esta página. Puedo orientarle sobre servicios, consultas, modalidades de atención y contacto. Para preguntas sobre un caso concreto, solicite una consulta profesional.',
      actions: practiceActions,
    };
  }

  function respond(rawQuery) {
    const query = rawQuery.trim();
    if (!query) return;
    addMessage(query, 'user');
    const response = getResponse(query);
    addMessage(response.text, 'bot', response.actions);
  }

  launcher.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('is-open');
    launcher.setAttribute('aria-expanded', String(isOpen));
    if (isOpen && !messageList.children.length) {
      addMessage('¡Hola! Soy el asistente del Estudio Jurídico. Le ayudo a encontrar información publicada en este sitio y a llegar al servicio adecuado. ¿Qué desea consultar?', 'bot', [
        { label: 'Áreas de práctica', query: '¿Qué áreas legales atienden?' },
        { label: 'Primera consulta', query: '¿Cuánto cuesta la primera consulta?' },
        { label: 'Atención virtual', query: '¿Atienden en línea?' },
        ...contactAction,
      ]);
    }
    if (isOpen) input.focus();
  });

  panel.querySelector('#vrh-chat-close').addEventListener('click', () => {
    panel.classList.remove('is-open');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  });

  panel.querySelector('#vrh-chat-form').addEventListener('submit', (event) => {
    event.preventDefault();
    respond(input.value);
    input.value = '';
  });

  panel.addEventListener('click', (event) => {
    if (event.target.closest('a[href^="#"]')) {
      panel.classList.remove('is-open');
      launcher.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel.classList.contains('is-open')) {
      panel.classList.remove('is-open');
      launcher.setAttribute('aria-expanded', 'false');
      launcher.focus();
    }
  });
})();
