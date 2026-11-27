(function () {
  'use strict';

  const styles = `
    #vrh-chat-launcher{position:fixed;right:24px;bottom:92px;z-index:9500;display:flex;align-items:center;gap:11px;border:1px solid rgba(230,201,122,.65);border-radius:999px;background:linear-gradient(135deg,#11224b,#1b3471);color:#fff;padding:12px 18px 12px 13px;box-shadow:0 12px 32px rgba(13,27,64,.32);font:650 14px/1.2 'Segoe UI',Arial,sans-serif;cursor:pointer;transition:transform .2s,box-shadow .2s}
    #vrh-chat-launcher:hover{transform:translateY(-3px);box-shadow:0 16px 38px rgba(13,27,64,.4)}
    .vrh-launch-icon{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;background:#c9a84c;color:#0d1b40;font-size:20px}
    #vrh-chat-launcher:focus-visible,#vrh-chat-panel button:focus-visible,#vrh-chat-input:focus-visible{outline:3px solid #c9a84c;outline-offset:3px}
    #vrh-chat-panel{position:fixed;right:22px;bottom:158px;width:min(410px,calc(100vw - 28px));height:min(650px,calc(100dvh - 180px));z-index:9501;background:#fff;border:1px solid #e3dfd7;border-radius:22px;box-shadow:0 24px 75px rgba(13,27,64,.28);display:none;flex-direction:column;overflow:hidden;font:14px/1.55 'Segoe UI',Arial,sans-serif;color:#1a1a2e}
    #vrh-chat-panel.is-open{display:flex;animation:vrh-chat-in .22s ease-out}
    @keyframes vrh-chat-in{from{opacity:0;transform:translateY(9px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
    .vrh-chat-head{background:radial-gradient(circle at 100% 0,rgba(201,168,76,.3),transparent 42%),linear-gradient(135deg,#0d1b40,#1b3471);color:#fff;padding:18px;display:flex;justify-content:space-between;align-items:center;gap:12px}
    .vrh-chat-brand{display:flex;align-items:center;gap:11px}.vrh-chat-mark{display:grid;place-items:center;width:42px;height:42px;border:1px solid rgba(230,201,122,.55);border-radius:14px;background:rgba(255,255,255,.09);font-size:22px}
    .vrh-chat-head strong{display:block;font:700 16px Georgia,serif;letter-spacing:.1px}.vrh-chat-head small{display:flex;align-items:center;gap:6px;color:#e9d699;font-size:11px;margin-top:4px}
    .vrh-chat-online{width:7px;height:7px;border-radius:50%;background:#7adea3;box-shadow:0 0 0 3px rgba(122,222,163,.14)}
    #vrh-chat-close{flex:0 0 34px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.28);color:#fff;border-radius:10px;width:34px;height:34px;font-size:21px;cursor:pointer}
    #vrh-chat-messages{flex:1;overflow:auto;padding:16px;background:linear-gradient(#f8f7f4,#f2f0eb);display:flex;flex-direction:column;gap:11px;overscroll-behavior:contain}
    .vrh-chat-intro{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#8a7950;font-weight:700;margin:0 2px 1px}
    .vrh-chat-message{max-width:94%;padding:11px 13px;border-radius:15px;line-height:1.55;white-space:pre-line;overflow-wrap:anywhere;box-shadow:0 2px 7px rgba(13,27,64,.04)}
    .vrh-chat-message.is-bot{background:#fff;border:1px solid #e7e3dc;align-self:flex-start;border-bottom-left-radius:5px}.vrh-chat-message.is-user{background:#142750;color:#fff;align-self:flex-end;border-bottom-right-radius:5px}
    .vrh-chat-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.vrh-chat-actions button,.vrh-chat-actions a{background:#fff;color:#142750;border:1px solid #ddd4bd;border-radius:999px;padding:7px 10px;font:600 11px/1.25 'Segoe UI',Arial,sans-serif;cursor:pointer;text-decoration:none;transition:background .15s,border-color .15s}.vrh-chat-actions button:hover,.vrh-chat-actions a:hover{background:#f7f1df;border-color:#c9a84c}
    .vrh-chat-sources{display:flex;flex-direction:column;gap:6px;margin-top:10px;padding-top:9px;border-top:1px solid #eee9df}.vrh-chat-sources strong{font-size:10px;color:#7a6a41;text-transform:uppercase;letter-spacing:.07em}.vrh-chat-sources a{font-size:11px;line-height:1.35;color:#164d86;text-decoration:underline;text-underline-offset:2px}
    .vrh-chat-form{display:flex;gap:8px;padding:11px 12px 9px;border-top:1px solid #e8e4dc;background:#fff}.vrh-chat-form label{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    #vrh-chat-input{flex:1;min-width:0;border:1px solid #d5d3cf;border-radius:12px;padding:11px 12px;font:14px 'Segoe UI',Arial,sans-serif}#vrh-chat-input:focus{border-color:#a9893e;outline:2px solid rgba(201,168,76,.2)}
    #vrh-chat-send{border:0;border-radius:12px;background:#c9a84c;color:#0d1b40;padding:0 15px;font-weight:700;cursor:pointer}.vrh-chat-note{font-size:10px;line-height:1.4;color:#737780;padding:0 14px 12px;background:#fff}
    @media(max-width:480px){#vrh-chat-launcher{right:14px;bottom:88px;padding:8px 13px 8px 8px}#vrh-chat-panel{right:9px;bottom:145px;width:calc(100vw - 18px);height:min(620px,calc(100dvh - 160px));border-radius:19px}}
    @media(prefers-reduced-motion:reduce){#vrh-chat-launcher,#vrh-chat-panel.is-open{transition:none;animation:none}}
  `;
  const style = document.createElement('style'); style.textContent = styles; document.head.appendChild(style);

  const normalize = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // El contenido de todas las secciones se indexa en el navegador al cargar la página.
  const pageFacts = Array.from(document.querySelectorAll('main h1,main h2,main h3,main h4,main p,main li,main blockquote,main .faq-answer,footer h4,footer p,footer li'))
    .map((node) => (node.innerText || '').trim()).filter(Boolean);
  const practiceCards = Array.from(document.querySelectorAll('.area-card')).map((node) => (node.innerText || '').replace(/\s+/g, ' ').trim());
  const legalTopics = window.VRH_LEGAL_KNOWLEDGE?.topics || [];

  const launcher = document.createElement('button'); launcher.id = 'vrh-chat-launcher'; launcher.type = 'button';
  launcher.setAttribute('aria-haspopup', 'dialog'); launcher.setAttribute('aria-expanded', 'false'); launcher.setAttribute('aria-controls', 'vrh-chat-panel');
  launcher.innerHTML = '<span class="vrh-launch-icon" aria-hidden="true">⚖</span><span>Asistente legal</span>';
  const panel = document.createElement('section'); panel.id = 'vrh-chat-panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'false'); panel.setAttribute('aria-labelledby', 'vrh-chat-title');
  panel.innerHTML = '<div class="vrh-chat-head"><div class="vrh-chat-brand"><span class="vrh-chat-mark" aria-hidden="true">⚖</span><div><strong id="vrh-chat-title">Asistente VRH</strong><small><i class="vrh-chat-online"></i> Guía del sitio y fuentes legales</small></div></div><button id="vrh-chat-close" type="button" aria-label="Cerrar asistente">×</button></div><div id="vrh-chat-messages" aria-live="polite" aria-label="Conversación"></div><form class="vrh-chat-form" id="vrh-chat-form"><label for="vrh-chat-input">Escriba su consulta</label><input id="vrh-chat-input" type="text" maxlength="500" autocomplete="off" placeholder="¿En qué podemos orientarle?"><button id="vrh-chat-send" type="submit">Enviar</button></form><div class="vrh-chat-note">Información general, no asesoría legal ni diagnóstico de su caso. Verifique la vigencia en fuentes oficiales. No comparta datos personales o confidenciales.</div>';
  document.body.append(launcher, panel);
  const messageList = panel.querySelector('#vrh-chat-messages'); const input = panel.querySelector('#vrh-chat-input');
  const contactAction = [{ label: 'Contactar al estudio', href: '#contacto' }];
  const practiceActions = [{ label: 'Ver áreas de práctica', href: '#areas' }, ...contactAction];

  function addMessage(text, author, actions, sources) {
    const message = document.createElement('div'); message.className = 'vrh-chat-message is-' + author; message.textContent = text;
    if (actions?.length) { const row = document.createElement('div'); row.className = 'vrh-chat-actions'; actions.forEach((action) => {
      const control = action.href ? document.createElement('a') : document.createElement('button');
      if (action.href) { control.href = action.href; if (action.href.startsWith('http')) { control.target = '_blank'; control.rel = 'noopener noreferrer'; } }
      else { control.type = 'button'; control.addEventListener('click', () => respond(action.query || action.label)); }
      control.textContent = action.label; row.appendChild(control);
    }); message.appendChild(row); }
    if (sources?.length) { const group = document.createElement('div'); group.className = 'vrh-chat-sources'; const title = document.createElement('strong'); title.textContent = 'Fuentes institucionales'; group.appendChild(title);
      sources.slice(0, 3).forEach((source) => { const link = document.createElement('a'); link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = source.label + ' ↗'; group.appendChild(link); }); message.appendChild(group); }
    messageList.appendChild(message); messageList.scrollTop = messageList.scrollHeight;
  }

  function findPageAnswer(query) {
    const words = normalize(query).match(/[a-z0-9]{3,}/g) || [];
    return pageFacts.map((text) => ({ text, score: words.reduce((n, word) => n + (normalize(text).includes(word) ? 1 : 0), 0) }))
      .filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 3).map((item) => item.text).join('\n');
  }
  function getResponse(query) {
    const q = normalize(query); const faq = (id) => document.querySelector(id)?.innerText.trim();
    if (/hola|buenos|buenas|ayuda|que hacen|como me orientan/.test(q)) return { text: 'Con gusto le orientamos. Puedo mostrarle los servicios del estudio, responder preguntas generales por materia y enlazarle a fuentes oficiales. ¿Qué necesita?', actions: [{label:'Áreas del estudio',query:'¿Qué servicios ofrecen?'},{label:'Leyes de Ecuador',query:'¿Qué normas legales puedo consultar?'},{label:'Primera consulta',query:'¿Cuánto cuesta la primera consulta?'},...contactAction] };
    if (/precio|costo|cuanto|consulta|agendar|cita|reserv/.test(q)) return { text: (faq('#faq-a1') || 'La página indica que la primera consulta es gratuita y sin compromiso.') + ' Para coordinarla, use el formulario o los datos de contacto publicados.', actions: contactAction };
    if (/area|servicio|ofrecen|atienden|practica/.test(q)) {
      const terms = q.match(/civil|mercantil|societ|laboral|familia|administrativ|digital|tecnolog/g) || []; const cards = practiceCards.filter((card) => terms.some((term) => normalize(card).includes(term)));
      return { text: (cards.length ? cards : practiceCards).join('\n\n') + '\n\nPara evaluar una situación concreta, solicite una consulta profesional.', actions: practiceActions };
    }
    const matches = legalTopics.map((topic) => ({ topic, score: topic.terms.reduce((n, term) => n + (q.includes(normalize(term)) ? Math.max(1, normalize(term).split(' ').length) : 0), 0) }))
      .filter((item) => item.score > 0).sort((a, b) => b.score - a.score);
    if (matches.length) { const picked = matches.slice(0, 2).map((item) => item.topic); return { text: picked.map((item) => item.area + ': ' + item.summary).join('\n\n') + '\n\nLa norma aplicable y sus plazos dependen de los hechos y pueden cambiar. Esta guía no analiza su caso ni garantiza que los enlaces consoliden reformas posteriores.', actions: [...practiceActions, {label:'Consultar todas las materias',query:'¿Qué normas legales puedo consultar?'}], sources: picked.flatMap((item) => item.sources) }; }
    if (/ley|norma|codigo|fuente|legal|ecuador/.test(q)) return { text: 'El índice incluye orientación general constitucional, civil y procesal, laboral, familia, societario, administrativo, datos personales, penal, tributario y propiedad intelectual/consumo. Para cada materia enlaza portales oficiales; confirme allí el texto vigente.', actions: [{label:'Civil y procesos',query:'¿Qué dice el COGEP sobre procesos civiles?'},{label:'Laboral',query:'¿Qué ley regula el trabajo?'},{label:'Datos personales',query:'¿Qué ley protege los datos personales?'},{label:'Familia',query:'¿Qué normativa aplica para alimentos y custodia?'}], sources: [{label:'Normativa vigente — Consejo de la Judicatura',url:'https://www.funcionjudicial.gob.ec/normativa/'},{label:'Registro Oficial del Ecuador',url:'https://www.registroficial.gob.ec/'}] };
    if (/virtual|online|linea|videollamada|presencial|exterior/.test(q)) return { text: faq('#faq-a3') || 'Consulte las modalidades publicadas en la sección de contacto.', actions: contactAction };
    if (/direccion|ubicacion|donde|horario|telefono|whatsapp|correo|email|contact/.test(q)) return { text: (document.querySelector('#contacto')?.innerText || 'Consulte los datos publicados en contacto.').replace(/\s+/g, ' ').trim(), actions: contactAction };
    if (/confidencial|privacidad|proteccion de datos/.test(q)) return { text: (faq('#faq-a5') || 'Consulte la Política de Privacidad enlazada en el sitio.') + ' Evite incluir información personal o sensible en el chat.', actions: contactAction, sources: legalTopics.find((item) => item.area.includes('datos'))?.sources };
    if (/garanti|resultado|ganar|probabilidad/.test(q)) return { text: (faq('#faq-a4') || 'El sitio no ofrece garantías de resultados específicos.') + ' Para una evaluación, solicite una consulta profesional.', actions: contactAction };
    if (/urgente|emergencia|inmediato|deten/.test(q)) return { text: 'Si alguien corre peligro, contacte los servicios de emergencia. Para una actuación legal urgente, llame al estudio por los medios publicados. No comparta datos sensibles en este chat.', actions: contactAction };
    if (/nosotros|firma|equipo|quienes somos/.test(q)) return { text: (document.querySelector('#nosotros')?.innerText || 'El sitio describe los servicios jurídicos del estudio.') + '\n\nPuede revisar la sección Sobre nosotros.', actions: [{label:'Sobre nosotros',href:'#nosotros'},...contactAction] };
    const pageAnswer = findPageAnswer(query); if (pageAnswer) return { text: 'Encontré esta información relacionada en el sitio:\n' + pageAnswer + '\n\n¿Quiere que le ayude a ubicar un servicio?', actions: practiceActions };
    return { text: 'No encuentro una respuesta confiable para esa consulta. Puedo mostrarle los servicios, orientarle por materia con enlaces oficiales o llevarle al contacto. Para preguntas sobre un caso concreto, solicite revisión profesional.', actions: [{label:'Áreas del estudio',href:'#areas'},{label:'Normativa ecuatoriana',query:'¿Qué normas legales puedo consultar?'},...contactAction] };
  }
  function respond(raw) { const query = raw.trim(); if (!query) return; addMessage(query, 'user'); const answer = getResponse(query); addMessage(answer.text, 'bot', answer.actions, answer.sources); }
  launcher.addEventListener('click', () => { const open = panel.classList.toggle('is-open'); launcher.setAttribute('aria-expanded', String(open)); if (open && !messageList.children.length) {
    const intro = document.createElement('div'); intro.className = 'vrh-chat-intro'; intro.textContent = 'Bienvenida · Estudio Jurídico VRH'; messageList.appendChild(intro);
    addMessage('Le ayudo a encontrar información de nuestros servicios y fuentes legales oficiales de Ecuador. Puede empezar por una materia o escribir su pregunta.', 'bot', [{label:'Servicios',query:'¿Qué servicios ofrecen?'},{label:'Normativa',query:'¿Qué normas legales puedo consultar?'},{label:'Agendar consulta',query:'¿Cuánto cuesta la primera consulta?'}]);
  } if (open) input.focus(); });
  panel.querySelector('#vrh-chat-close').addEventListener('click', () => { panel.classList.remove('is-open'); launcher.setAttribute('aria-expanded', 'false'); launcher.focus(); });
  panel.querySelector('#vrh-chat-form').addEventListener('submit', (event) => { event.preventDefault(); respond(input.value); input.value = ''; });
  panel.addEventListener('click', (event) => { if (event.target.closest('a[href^="#"]')) { panel.classList.remove('is-open'); launcher.setAttribute('aria-expanded', 'false'); } });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && panel.classList.contains('is-open')) { panel.classList.remove('is-open'); launcher.setAttribute('aria-expanded', 'false'); launcher.focus(); } });
})();
