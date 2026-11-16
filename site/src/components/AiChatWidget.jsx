import { useState, useRef, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useApp } from '../context/AppContext';
import './AiChatWidget.css';

const QUICK_PROMPTS = [
  { label: '🎂 Cât tort îmi trebuie?', prompt: 'Cât tort îmi recomanzi pentru 25 de persoane și ce preț are?' },
  { label: '🍬 Candy Bar nuntă/botez', prompt: 'Cum funcționează un Candy Bar pentru 60 de invitați?' },
  { label: '🍓 Arome & Compoziții', prompt: 'Ce compoziții și arome de tort aveți disponibile?' },
  { label: '📍 Locații & Program', prompt: 'Unde se află laboratorul și punctele de desfacere?' },
  { label: '📝 Ofertă personalizată', prompt: 'Vreau să cer o ofertă de preț pentru un eveniment.' }
];

export default function AiChatWidget() {
  const { user } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState(false);

  const [offerForm, setOfferForm] = useState({
    name: '',
    phone: '',
    email: '',
    eventType: 'Tort Aniversar',
    guestCount: '',
    eventDate: '',
    notes: ''
  });

  const [messages, setMessages] = useState([
    {
      id: 'msg-welcome-1',
      sender: 'ai',
      text: 'Bună! Sunt Asistentul Dulce de la Laboratorul Emanuela 🍰✨\n\nTe pot ajuta cu sfaturi despre gramajul torturilor, idei pentru Candy Bar, selecția aromelor sau o ofertă de preț personalizată. Cu ce te pot încânta?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen, showOfferForm]);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (user) {
      setOfferForm((prev) => ({
        ...prev,
        name: prev.name || user.displayName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phoneNumber || user.phone || ''
      }));
    }
  }, [user]);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  const generateAiReply = (rawInput) => {
    const text = rawInput.toLowerCase();
    let reply = '';
    let suggestOffer = false;

    // Detect guest count
    const guestMatch = text.match(/(\d+)\s*(persoane|invitați|invitati|oameni|portii|porții|pax|pers)/i);
    const guests = guestMatch ? parseInt(guestMatch[1], 10) : null;

    if (guests) {
      const kg = Math.max(1.5, (guests * 0.12).toFixed(1));
      const minPrice = Math.round(kg * 110);
      const maxPrice = Math.round(kg * 140);
      reply = `Pentru aproximativ ${guests} persoane, recomandăm un tort de circa ${kg} kg (calculat la un gramaj generos de ~120g/porție).\n\n💰 Prețul orientativ la Laboratorul Emanuela este între ${minPrice} și ${maxPrice} RON (aprox. 110 - 140 RON/kg, în funcție de compoziție și complexitatea decorului artizanal).\n\nCe aromă vă tentează cel mai mult? Trio Mousse de ciocolată belgiană, Fistic cu zmeură proaspătă, Pavlova sau Red Velvet?`;
      suggestOffer = true;
    } else if (text.includes('pret') || text.includes('preț') || text.includes('cost') || text.includes('cât costă') || text.includes('cat costa')) {
      reply = `Torturile noastre artizanale pornesc de la 110 RON/kg și ajung la 140 RON/kg pentru rețete speciale (fistic pur, fructe proaspete, decor cu flori naturale sau figurine modelate manual).\n\nPentru câte persoane estimezi evenimentul? Îți pot calcula gramajul și prețul exact pe loc!`;
    } else if (text.includes('candy') || text.includes('bar') || text.includes('desert bar')) {
      reply = `Candy Bar-ul Emanuela este spectacolul oricărui eveniment! 🍬✨\n\nRecomandăm o medie de 100-150g per invitat (~3-4 mini-deserturi/persoană). Pachetul include o selecție fină:\n• Mini Pavlova cu fructe de pădure\n• Macarons parizieni asortați\n• Shot-uri de mousse fin (Baby Blue / Baby Pink / Ciocolată)\n• Mini tarte cu vanilie bourbon și fructe proaspete\n• Cake pops & mini amandine\n\nAsigurăm și suporturi elegante, etichete personalizate și montaj la sală!`;
      suggestOffer = true;
    } else if (text.includes('arom') || text.includes('gust') || text.includes('compoziti') || text.includes('compoziție') || text.includes('ciocolat') || text.includes('fistic') || text.includes('zmeur')) {
      reply = `Iată câteva dintre cele mai iubite compoziții artizanale Emanuela:\n\n1. 🍫 Trio Mousse — ciocolată belgiană neagră, lapte și albă, pe blat pufos de cacao.\n2. 🍓 Fistic & Zmeură — cremă fină de fistic 100% pur cu inserție răcoritoare de zmeură.\n3. 👑 Pavlova de casă — bezea crocantă la exterior și moale la interior, frișcă naturală și fructe de pădure.\n4. ❤️ Red Velvet — blat catifelat ușor vanilat cu cremă delicată de mascarpone și lămâie.\n5. 🥕 Carrot Cake — blat aromat cu scorțișoară, morcov proaspăt și nuci crocante caramelizate.\n\nAi vreo preferință de gust?`;
    } else if (text.includes('locat') || text.includes('locaț') || text.includes('unde') || text.includes('adresa') || text.includes('program') || text.includes('orar') || text.includes('garbovat') || text.includes('gârbovăț')) {
      reply = `Te așteptăm cu drag cu gusturi proaspete în fiecare zi:\n\n📍 Laboratorul Central: Comuna Gârbovăț (Galați) — inima producției noastre artizanale!\n📍 Cofetăria Galați: Str. Brăilei (L-S 08:00 - 20:00, D 09:00 - 18:00)\n📍 Punctul Mazepa: Cartier Mazepa 1\n\nComenzile de torturi speciale pot fi ridicate din oricare locație sau livrate cu transport frigorific dedicat.`;
    } else if (text.includes('alerg') || text.includes('gluten') || text.includes('zahar') || text.includes('zahăr') || text.includes('vegan') || text.includes('post')) {
      reply = `Siguranța și sănătatea sunt esențiale pentru noi! 🌿\n\n• Avem torturi și prăjituri fără zahăr adăugat, îndulcite natural cu eritritol și extract de stevia.\n• Oferim opțiuni delicioase de post (fără ou și fără lactate) și mousse-uri realizate fără făină de grâu.\n\n⚠️ Deoarece în laborator procesăm și gluten, ouă și lactate, te rugăm să ne anunți din timp dacă este vorba despre o alergie severă sau boală celiacă!`;
    } else if (text.includes('ofert') || text.includes('comanda') || text.includes('comandă') || text.includes('cerere') || text.includes('nunta') || text.includes('botez')) {
      reply = `Minunat! Putem pregăti o ofertă dedicată pentru evenimentul tău. Completează formularul rapid de mai jos, iar maestrul nostru cofetar te va contacta în cel mai scurt timp cu toate detaliile!`;
      suggestOffer = true;
    } else {
      reply = `La Laboratorul Emanuela punem pasiune în fiecare detaliu din 2005. Toate produsele noastre sunt create din ingrediente 100% naturale: frișcă din lapte, ciocolată veritabilă și ouă proaspete.\n\nDorești să afli recomandări de gramaj pentru evenimentul tău sau să soliciți o ofertă de preț?`;
    }

    return { reply, suggestOffer };
  };

  const handleSendMessage = (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const { reply, suggestOffer } = generateAiReply(query);
      const aiMsg = {
        id: `msg-${Date.now()}-ai`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestOffer
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);

      if (suggestOffer) {
        setShowOfferForm(true);
      }
    }, 700);
  };

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!offerForm.name.trim() || !offerForm.phone.trim()) {
      alert('Te rugăm să completezi numele și numărul de telefon!');
      return;
    }

    setIsSubmitting(true);
    try {
      // Save offer request to Firestore offerRequests collection
      const transcript = messages
        .map((m) => `${m.sender === 'user' ? 'Client' : 'Asistent AI'} [${m.timestamp}]: ${m.text}`)
        .join('\n\n');

      await addDoc(collection(db, 'offerRequests'), {
        customerName: offerForm.name.trim(),
        phone: offerForm.phone.trim(),
        email: offerForm.email.trim() || null,
        eventType: offerForm.eventType,
        guestCount: Number(offerForm.guestCount) || null,
        eventDate: offerForm.eventDate || null,
        productName: `${offerForm.eventType}${offerForm.guestCount ? ` (${offerForm.guestCount} pers)` : ''}`,
        notes: offerForm.notes || 'Cerere inițiată prin Asistentul AI de pe website',
        message: offerForm.notes || 'Cerere inițiată prin Asistentul AI de pe website',
        source: 'website_ai_chat',
        status: 'new',
        aiChatTranscript: transcript,
        messages: messages.map((m) => ({
          sender: m.sender,
          text: m.text,
          timestamp: m.timestamp
        })),
        createdAt: serverTimestamp()
      });

      setOfferSuccess(true);
      setShowOfferForm(false);

      const confirmMsg = {
        id: `msg-${Date.now()}-confirmed`,
        sender: 'ai',
        text: `🎉 Mulțumim frumos, ${offerForm.name.trim()}! Am înregistrat cererea ta pentru ${offerForm.eventType}.\n\nUn maestru cofetar de la laboratorul Emanuela va analiza detaliile și te va contacta la numărul ${offerForm.phone.trim()} cu oferta personalizată și mostre de compoziții!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, confirmMsg]);
    } catch (err) {
      console.error('Failed to submit offer request:', err);
      alert('A apărut o problemă la transmiterea cererii. Te rugăm să ne contactezi la telefon sau să încerci din nou.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ai-chat-root">
      {/* Floating Launcher Pill / Bubble */}
      {!isOpen && (
        <button
          type="button"
          className="ai-chat-launcher"
          onClick={toggleOpen}
          aria-label="Deschide Asistentul Dulce AI"
        >
          <div className="ai-launcher-avatar">
            <span className="ai-launcher-icon">👩‍🍳</span>
            <span className="ai-launcher-online-dot" />
          </div>
          <div className="ai-launcher-text">
            <strong>Asistent Dulce AI</strong>
            <small>Consultanță torturi & evenimente</small>
          </div>
          {hasUnread && <span className="ai-launcher-badge">1</span>}
        </button>
      )}

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div className="ai-chat-window" role="dialog" aria-modal="true" aria-label="Asistent Dulce Emanuela">
          {/* Header */}
          <header className="ai-chat-header">
            <div className="ai-chat-header-info">
              <div className="ai-chat-avatar-wrap">
                <span className="ai-chat-avatar-icon">🍰</span>
                <span className="ai-chat-avatar-status" />
              </div>
              <div>
                <h3 className="ai-chat-title">Laborator Emanuela · AI</h3>
                <span className="ai-chat-subtitle">Asistent virtual · Răspunde instant</span>
              </div>
            </div>

            <div className="ai-chat-header-actions">
              <button
                type="button"
                className="ai-chat-close-btn"
                onClick={toggleOpen}
                aria-label="Închide fereastra de chat"
              >
                ✕
              </button>
            </div>
          </header>

          {/* Messages Body */}
          <div className="ai-chat-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`ai-message-row ${msg.sender === 'user' ? 'user-row' : 'ai-row'}`}>
                {msg.sender === 'ai' && (
                  <div className="ai-message-avatar" aria-hidden="true">
                    👩‍🍳
                  </div>
                )}
                <div className={`ai-bubble ${msg.sender === 'user' ? 'user-bubble' : 'ai-bubble-content'}`}>
                  <p className="ai-bubble-text">{msg.text}</p>
                  <span className="ai-bubble-time">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="ai-message-row ai-row">
                <div className="ai-message-avatar" aria-hidden="true">👩‍🍳</div>
                <div className="ai-bubble ai-bubble-content ai-typing-indicator">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            {/* Quick Action Suggestion Chips */}
            <div className="ai-suggestions-container">
              <span className="ai-suggestions-label">Întrebări frecvente:</span>
              <div className="ai-suggestions-grid">
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="ai-suggestion-chip"
                    onClick={() => handleSendMessage(qp.prompt)}
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Embedded Offer Form */}
            {showOfferForm && !offerSuccess && (
              <div className="ai-offer-card">
                <div className="ai-offer-header">
                  <h4>📝 Cere o Ofertă Personalizată</h4>
                  <button
                    type="button"
                    className="ai-offer-close"
                    onClick={() => setShowOfferForm(false)}
                  >
                    ✕
                  </button>
                </div>
                <p className="ai-offer-desc">
                  Trimite detaliile evenimentului tău direct către cofetăria noastră pentru un calcul exact și degustare!
                </p>

                <form onSubmit={handleSubmitOffer} className="ai-offer-form">
                  <div className="ai-form-group">
                    <label>Nume complet *</label>
                    <input
                      type="text"
                      placeholder="ex: Maria Popescu"
                      required
                      value={offerForm.name}
                      onChange={(e) => setOfferForm({ ...offerForm, name: e.target.value })}
                    />
                  </div>

                  <div className="ai-form-row">
                    <div className="ai-form-group">
                      <label>Telefon *</label>
                      <input
                        type="tel"
                        placeholder="07xxxxxxxx"
                        required
                        value={offerForm.phone}
                        onChange={(e) => setOfferForm({ ...offerForm, phone: e.target.value })}
                      />
                    </div>
                    <div className="ai-form-group">
                      <label>Email (opțional)</label>
                      <input
                        type="email"
                        placeholder="adresa@email.com"
                        value={offerForm.email}
                        onChange={(e) => setOfferForm({ ...offerForm, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="ai-form-row">
                    <div className="ai-form-group">
                      <label>Tip eveniment</label>
                      <select
                        value={offerForm.eventType}
                        onChange={(e) => setOfferForm({ ...offerForm, eventType: e.target.value })}
                      >
                        <option value="Tort Aniversar">Tort Aniversar</option>
                        <option value="Tort Nuntă">Tort Nuntă</option>
                        <option value="Tort Botez">Tort Botez</option>
                        <option value="Candy Bar Complet">Candy Bar Complet</option>
                        <option value="Eveniment Corporate">Eveniment Corporate</option>
                      </select>
                    </div>
                    <div className="ai-form-group">
                      <label>Nr. persoane</label>
                      <input
                        type="number"
                        placeholder="ex: 35"
                        min="5"
                        value={offerForm.guestCount}
                        onChange={(e) => setOfferForm({ ...offerForm, guestCount: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="ai-form-group">
                    <label>Data evenimentului</label>
                    <input
                      type="date"
                      value={offerForm.eventDate}
                      onChange={(e) => setOfferForm({ ...offerForm, eventDate: e.target.value })}
                    />
                  </div>

                  <div className="ai-form-group">
                    <label>Alte dorințe sau compoziții preferate</label>
                    <textarea
                      rows={2}
                      placeholder="ex: decor pastel, flori naturale, fără nuci..."
                      value={offerForm.notes}
                      onChange={(e) => setOfferForm({ ...offerForm, notes: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="ai-offer-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Se trimite cererea…' : 'Trimite cererea către cofetar ✨'}
                  </button>
                </form>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <footer className="ai-chat-footer">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="ai-chat-input-form"
            >
              <input
                type="text"
                className="ai-chat-input"
                placeholder="Întreabă despre torturi, arome, prețuri…"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button
                type="submit"
                className="ai-chat-send-btn"
                disabled={!inputText.trim() || isTyping}
                aria-label="Trimite mesaj"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </footer>
        </div>
      )}
    </div>
  );
}
