import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';

type Screen = 'menu' | 'play' | 'inventory' | 'game-over' | 'win';

interface Item {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  qty: number;
}

interface State {
  hp: number;
  sanity: number;
  stamina: number;
  scene: number;
  items: Item[];
  log: string[];
  tension: number;
}

const BG = 'https://cdn.ezst.app/projects/9a837e52-f853-48ca-9649-61f562b1f681/files/dd98fe4e-73f1-41fe-a87d-c5a116511df3.jpg';

const SCENES = [
  {
    loc: 'Parking Structure — Level B2',
    time: '11:47 PM',
    text: `You squeeze through the gap in the chain-link fence. The parking structure is black except for one broken fluorescent that strobes on the second level. Your phone flashlight cuts a narrow cone through the dark. Spray paint on the concrete: THEY KNOW. Under it, in different handwriting, in red — your name.`,
    choices: ['Keep moving. Whoever wrote that is long gone.', 'Take a photo. Document everything.', 'Turn back. This isn\'t worth it.'],
  },
  {
    loc: 'Stairwell — 3rd Floor',
    time: '11:53 PM',
    text: `The stairwell smells like mold and something burnt. Water drips somewhere above. You hear footsteps stop the moment yours do. You hold your breath. Your phone buzzes — a text from a number you don't recognize: "wrong floor." You look up. Through the grate above, two shoes. Perfectly still.`,
    choices: ['Run down. Get out.', 'Shine your light up through the grate.', 'Text back: "who is this?"'],
  },
  {
    loc: 'Office Block — Floor 6',
    time: '12:14 AM',
    text: `Rows of dead cubicles. Monitors crusted with dust, chairs overturned. One computer is on. The screen shows a webcam feed — this room, live, from an angle you can't locate. You watch yourself walk into frame. You stop. The figure on screen keeps walking.`,
    choices: ['Unplug the monitor.', 'Look for the camera.', 'Don\'t move. Wait and see what it does.'],
  },
  {
    loc: 'Server Room — Sublevel',
    time: '12:41 AM',
    text: `The servers are dead but the room still hums. In the corner, zip-tied to a pipe: a phone. Your exact model, your case, same crack on the bottom left corner. You check your pocket. Your phone is there. You pick up the zip-tied one. The last photo in its camera roll is you, asleep, taken from inside your apartment.`,
    choices: ['Pocket it. Evidence.', 'Smash it on the floor.', 'Call the most recent contact.'],
  },
  {
    loc: 'Rooftop',
    time: '1:09 AM',
    text: `Wind up here. City spread out below — orange sodium glow, distant sirens. You should feel relief. You don't. Someone is standing at the far edge of the roof. Same jacket as you. Same shoes. Same build. They turn around slowly. You can't see their face from here. They raise one hand. Wave. Exactly the way you would.`,
    choices: ['Shout at them.', 'Back away toward the door.', 'Walk toward them.'],
  },
  {
    loc: 'Rooftop — Edge',
    time: '1:22 AM',
    text: `Up close, it is your face. Exact. Pores, scar on your chin, the small asymmetry of your left eye. It says nothing. You notice it isn't breathing. Then it leans in and whispers something you can't unhear — the exact thought you were about to have. The city below looks very far down. You understand now what it wants.`,
    choices: ['I\'m not you.', 'What are you?', 'Run.'],
  },
];

const CAUSES = [
  'You stopped being able to tell which one was real.',
  'It knew your next move before you did.',
  'The building had two exits. It covered both.',
  'You looked in a window. You didn\'t see yourself.',
];

const INIT: State = {
  hp: 100, sanity: 100, stamina: 100,
  scene: 0,
  items: [
    { id: 'phone', name: 'Smartphone', emoji: '📱', desc: 'Battery at 34%. Flashlight open. Last call: Mom, 3 days ago.', qty: 1 },
    { id: 'lighter', name: 'Lighter', emoji: '🔥', desc: 'Half-full. Mostly psychological comfort.', qty: 1 },
    { id: 'pills', name: 'Ibuprofen', emoji: '💊', desc: 'Pocket-worn bottle. Won\'t help with what\'s happening.', qty: 3 },
    { id: 'key', name: 'Apartment Key', emoji: '🗝️', desc: 'You want to believe you\'ll use this again.', qty: 1 },
  ],
  log: ['11:47 PM — entered parking structure', '11:47 PM — found writing on the wall'],
  tension: 10,
};

function Shell({ children, shake = false }: { children: React.ReactNode; shake?: boolean }) {
  return (
    <div
      className={`w-screen h-screen overflow-hidden relative${shake ? ' animate-shake' : ''}`}
      style={{ background: '#0f0f0f', fontFamily: "'Barlow Condensed', sans-serif" }}
    >
      <div className="absolute inset-0 scanlines z-10 pointer-events-none" />
      {children}
    </div>
  );
}

function MainMenu({ onStart }: { onStart: () => void }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 400);
    const t2 = setTimeout(() => setStep(2), 1100);
    const t3 = setTimeout(() => setStep(3), 1900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <Shell>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG})`, filter: 'brightness(0.18) contrast(1.1) saturate(0.3)' }}
      />
      <div className="relative z-20 flex flex-col items-center justify-center h-full gap-6 px-6">
        <div style={{ opacity: step >= 1 ? 1 : 0, transition: 'opacity 0.8s', textAlign: 'center' }}>
          <div className="tag mb-3" style={{ color: 'rgba(192,57,43,0.6)', letterSpacing: '0.3em' }}>
            2024 &nbsp;·&nbsp; abandoned building &nbsp;·&nbsp; single player
          </div>
          <div className="animate-glitch">
            <span style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 'clamp(56px, 11vw, 130px)',
              color: '#d0d0d0',
              letterSpacing: '0.06em',
              lineHeight: 1,
              display: 'block',
            }}>
              DOPPELGANGER
            </span>
          </div>
          <div style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '13px',
            color: 'rgba(180,180,180,0.4)',
            letterSpacing: '0.18em',
            marginTop: '8px',
            opacity: step >= 2 ? 1 : 0,
            transition: 'opacity 0.6s',
            textTransform: 'uppercase',
          }}>
            Something in that building knows who you are
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 mt-2" style={{ opacity: step >= 3 ? 1 : 0, transition: 'opacity 0.6s' }}>
          <button
            onClick={onStart}
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '18px',
              letterSpacing: '0.25em',
              color: '#d0d0d0',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              padding: '10px 40px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(192,57,43,0.7)';
              (e.currentTarget as HTMLElement).style.color = '#fff';
              (e.currentTarget as HTMLElement).style.background = 'rgba(192,57,43,0.08)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
              (e.currentTarget as HTMLElement).style.color = '#d0d0d0';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            ENTER THE BUILDING
          </button>
          <button style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: '10px',
            letterSpacing: '0.2em',
            color: 'rgba(150,150,150,0.3)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textTransform: 'uppercase',
          }}>
            settings
          </button>
        </div>

        <div className="absolute bottom-5" style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontStyle: 'italic',
          fontSize: '12px',
          color: 'rgba(150,150,150,0.22)',
          letterSpacing: '0.05em',
          opacity: step >= 3 ? 1 : 0,
          transition: 'opacity 1s',
        }}>
          "I saw myself across the street. I was not there."
        </div>
      </div>
    </Shell>
  );
}

function Gameplay({ state, onChoice, onInventory }: { state: State; onChoice: (i: number) => void; onInventory: () => void }) {
  const s = SCENES[Math.min(state.scene, SCENES.length - 1)];
  const [textIn, setTextIn] = useState(false);
  const [choicesIn, setChoicesIn] = useState(false);

  useEffect(() => {
    setTextIn(false);
    setChoicesIn(false);
    const t1 = setTimeout(() => setTextIn(true), 120);
    const t2 = setTimeout(() => setChoicesIn(true), 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [state.scene]);

  const danger = state.tension > 65;

  return (
    <Shell>
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BG})`, filter: 'brightness(0.08) contrast(1.2) saturate(0)' }} />

      {danger && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            boxShadow: `inset 0 0 ${60 + state.tension}px rgba(192,57,43,${0.07 + state.tension / 600})`,
            animation: state.tension > 80 ? 'pulse-danger 1.2s ease-in-out infinite' : 'none',
          }}
        />
      )}

      <div className="relative z-20 flex flex-col h-full">
        {/* HUD top */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.6)' }}>
          <div className="flex flex-col gap-1.5 w-44">
            {[
              { label: 'HP', val: state.hp, cls: 'hp-bar' },
              { label: 'SANITY', val: state.sanity, cls: 'sanity-bar' },
              { label: 'STAM', val: state.stamina, cls: 'stamina-bar' },
            ].map(bar => (
              <div key={bar.label} className="flex items-center gap-2">
                <span className="tag w-12 text-right shrink-0" style={{ color: 'rgba(180,180,180,0.32)' }}>{bar.label}</span>
                <div className="flex-1 h-1 rounded-sm overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className={bar.cls} style={{ width: `${bar.val}%`, height: '100%' }} />
                </div>
                <span className="tag w-6" style={{ color: 'rgba(180,180,180,0.28)' }}>{bar.val}</span>
              </div>
            ))}
          </div>

          <div className="text-center flex-1 px-4">
            <div className="tag mb-0.5" style={{ color: 'rgba(192,57,43,0.5)' }}>{s.time}</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '17px', letterSpacing: '0.12em', color: 'rgba(220,220,220,0.7)' }}>
              {s.loc}
            </div>
          </div>

          <div className="flex gap-2">
            <button className="grunge-border p-2 transition-colors hover:bg-white/5" style={{ color: 'rgba(180,180,180,0.45)' }} onClick={onInventory}>
              <Icon name="Backpack" size={15} />
            </button>
            <button className="grunge-border p-2 transition-colors hover:bg-white/5" style={{ color: 'rgba(180,180,180,0.3)' }}>
              <Icon name="FileText" size={15} />
            </button>
          </div>
        </div>

        {/* Narrative */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-14 max-w-2xl mx-auto w-full py-6">
          <div style={{
            opacity: textIn ? 1 : 0,
            transform: textIn ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.6s ease',
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: '16px',
            fontWeight: 300,
            lineHeight: '1.85',
            color: 'rgba(210,205,200,0.8)',
            marginBottom: '28px',
            letterSpacing: '0.02em',
          }}>
            {s.text}
          </div>

          <div className="flex flex-col gap-2" style={{
            opacity: choicesIn ? 1 : 0,
            transform: choicesIn ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.5s ease',
          }}>
            <div className="tag mb-1" style={{ color: 'rgba(255,255,255,0.18)' }}>── choose ──</div>
            {s.choices.map((c, i) => (
              <button key={i} className="choice-btn" onClick={() => onChoice(i)}>
                <span style={{ color: 'rgba(192,57,43,0.55)', marginRight: '10px', fontFamily: "'Share Tech Mono', monospace", fontSize: '11px' }}>
                  [{String.fromCharCode(65 + i)}]
                </span>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Log */}
        <div className="px-4 py-2 shrink-0 overflow-hidden" style={{
          borderTop: '1px solid rgba(255,255,255,0.04)',
          background: 'rgba(0,0,0,0.5)',
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: '10px',
          color: 'rgba(180,180,180,0.2)',
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}>
          {state.log.slice(-2).join('  ·  ')}
        </div>
      </div>
    </Shell>
  );
}

function Inventory({ state, onClose }: { state: State; onClose: () => void }) {
  const [sel, setSel] = useState<Item | null>(null);
  return (
    <Shell>
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BG})`, filter: 'brightness(0.07) saturate(0)' }} />
      <div className="relative z-20 flex flex-col h-full p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="tag mb-1">personal effects</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '28px', letterSpacing: '0.1em', color: 'rgba(220,220,220,0.8)' }}>INVENTORY</div>
          </div>
          <button className="grunge-border p-2 hover:bg-white/5 transition-colors" style={{ color: 'rgba(180,180,180,0.45)' }} onClick={onClose}>
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="flex gap-5 flex-1 min-h-0">
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-2 content-start">
              {state.items.map(item => (
                <button key={item.id} className={`inv-slot p-3${sel?.id === item.id ? ' active' : ''}`} onClick={() => setSel(sel?.id === item.id ? null : item)}>
                  <span style={{ fontSize: '28px', lineHeight: 1 }}>{item.emoji}</span>
                  <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '0.08em', color: 'rgba(180,180,180,0.5)', textTransform: 'uppercase', textAlign: 'center' }}>
                    {item.name}
                  </span>
                  {item.qty > 1 && <span className="tag">×{item.qty}</span>}
                </button>
              ))}
              {Array.from({ length: Math.max(0, 9 - state.items.length) }).map((_, i) => (
                <div key={i} className="inv-slot" style={{ opacity: 0.15 }}>
                  <div style={{ width: 20, height: 20, border: '1px dashed rgba(255,255,255,0.12)' }} />
                </div>
              ))}
            </div>
          </div>

          <div className="w-48 shrink-0 p-4 flex flex-col" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.4)' }}>
            {sel ? (
              <>
                <div style={{ fontSize: '36px', textAlign: 'center', marginBottom: '10px' }}>{sel.emoji}</div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '16px', letterSpacing: '0.1em', color: 'rgba(220,220,220,0.8)', marginBottom: '8px' }}>{sel.name}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: 'italic', fontSize: '13px', color: 'rgba(180,180,180,0.48)', lineHeight: '1.6', flex: 1 }}>{sel.desc}</div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', color: 'rgba(180,180,180,0.18)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                select item
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span className="tag" style={{ color: 'rgba(255,255,255,0.16)' }}>Equipped</span>
          {['📱', '🔥', '—', '—'].map((e, i) => (
            <div key={i} className="inv-slot" style={{ width: 38, height: 38, fontSize: '18px', opacity: e === '—' ? 0.15 : 1 }}>{e}</div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function GameOver({ cause, onRestart }: { cause: string; onRestart: () => void }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 600); }, []);
  return (
    <Shell>
      <div className="absolute inset-0" style={{ background: vis ? 'radial-gradient(ellipse at center, rgba(30,0,0,0.65) 0%, #000 80%)' : '#000', transition: 'background 2s' }} />
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-8">
        <div style={{ opacity: vis ? 1 : 0, transform: vis ? 'scale(1)' : 'scale(0.97)', transition: 'all 1.5s ease' }}>
          <div className="tag mb-4" style={{ color: 'rgba(192,57,43,0.55)', letterSpacing: '0.3em' }}>— GAME OVER —</div>
          <div className="animate-glitch" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(52px, 10vw, 100px)', color: '#c0392b', letterSpacing: '0.08em', lineHeight: 1 }}>
            YOU DIDN'T MAKE IT
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: 'italic', fontSize: '15px', color: 'rgba(180,180,180,0.38)', marginTop: '16px', maxWidth: '420px' }}>
            {cause}
          </div>
          <div style={{ width: '80px', height: '1px', background: 'rgba(192,57,43,0.25)', margin: '24px auto' }} />
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={onRestart}
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '16px', letterSpacing: '0.25em', color: '#d0d0d0', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 36px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(192,57,43,0.6)'; (e.currentTarget as HTMLElement).style.background = 'rgba(192,57,43,0.07)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              TRY AGAIN
            </button>
            <button onClick={onRestart} style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(150,150,150,0.22)', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>
              main menu
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Win({ onRestart }: { onRestart: () => void }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 500); }, []);
  return (
    <Shell>
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${BG})`, filter: 'brightness(0.1) saturate(0.1)' }} />
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center px-8">
        <div style={{ opacity: vis ? 1 : 0, transition: 'opacity 2s' }}>
          <div className="tag mb-4" style={{ letterSpacing: '0.3em', color: 'rgba(255,255,255,0.25)' }}>— END —</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(48px, 9vw, 90px)', color: 'rgba(210,210,210,0.82)', letterSpacing: '0.08em', lineHeight: 1 }}>
            YOU GOT OUT
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: 'italic', fontSize: '15px', color: 'rgba(180,180,180,0.32)', marginTop: '14px', maxWidth: '380px' }}>
            But it didn't chase you. It watched you leave. It already knows where you live.
          </div>
          <div style={{ marginTop: '32px' }}>
            <button
              onClick={onRestart}
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '16px', letterSpacing: '0.25em', color: '#d0d0d0', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 36px', cursor: 'pointer' }}
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      </div>
    </Shell>
  );
}

export default function Index() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [state, setState] = useState<State>(INIT);
  const [shake, setShake] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 450);
  };

  const handleChoice = useCallback((i: number) => {
    triggerShake();
    setState(prev => {
      const sanityDelta = i === 1 ? -3 : i === 2 ? +2 : -8;
      const hpDelta = Math.random() < 0.25 ? -(Math.floor(Math.random() * 12) + 5) : 0;
      const newSanity = Math.max(0, prev.sanity + sanityDelta);
      const newHp = Math.max(0, prev.hp + hpDelta);
      const newScene = prev.scene + 1;
      const newTension = Math.min(100, prev.tension + 12 + i * 4);

      if (newSanity <= 0 || newHp <= 0) {
        setTimeout(() => setScreen('game-over'), 400);
        return { ...prev, sanity: newSanity, hp: newHp };
      }
      if (newScene >= SCENES.length) {
        setTimeout(() => setScreen('win'), 400);
        return prev;
      }

      const s = SCENES[newScene];
      return {
        ...prev,
        scene: newScene,
        sanity: newSanity,
        hp: newHp,
        tension: newTension,
        stamina: Math.max(0, prev.stamina - 6),
        log: [...prev.log, `${s.time} — ${s.loc}`],
      };
    });
  }, []);

  const restart = useCallback(() => {
    setState(INIT);
    setScreen('menu');
  }, []);

  const cause = CAUSES[state.scene % CAUSES.length];

  return (
    <div className={shake && screen === 'play' ? 'animate-shake' : ''}>
      {screen === 'menu' && <MainMenu onStart={() => setScreen('play')} />}
      {screen === 'play' && <Gameplay state={state} onChoice={handleChoice} onInventory={() => setScreen('inventory')} />}
      {screen === 'inventory' && <Inventory state={state} onClose={() => setScreen('play')} />}
      {screen === 'game-over' && <GameOver cause={cause} onRestart={restart} />}
      {screen === 'win' && <Win onRestart={restart} />}
    </div>
  );
}
