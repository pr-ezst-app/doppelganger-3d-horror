import { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '@/components/ui/icon';

type GameScreen = 'menu' | 'chapter-select' | 'gameplay' | 'inventory' | 'game-over' | 'victory';

interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
}

interface GameState {
  hp: number;
  maxHp: number;
  sanity: number;
  maxSanity: number;
  stamina: number;
  maxStamina: number;
  chapter: number;
  location: string;
  daysCounted: number;
  inventory: InventoryItem[];
  narrativeLog: string[];
  isAware: boolean;
  tension: number;
}

const CHAPTERS = [
  { id: 1, title: 'The Awakening', subtitle: 'Something is wrong with your reflection', locked: false },
  { id: 2, title: 'The Estate', subtitle: 'The old manor holds dark secrets', locked: false },
  { id: 3, title: 'Mirrors & Madness', subtitle: 'Trust no one. Not even yourself.', locked: false },
];

const NARRATIVE_EVENTS = [
  { location: 'The Fog Garden', text: 'You push through the iron gate. Fog rolls across your ankles like cold fingers. Something in the mist moves. You tell yourself it\'s nothing.' },
  { location: 'The Chapel Ruins', text: 'Rotting pews line the walls. A hymn book lies open, its pages yellowed and damp. The writing inside isn\'t in any language you recognize. It shifts when you look away.' },
  { location: 'The Cellar', text: 'You descend. The air smells of iron and old earth. In the corner, scratched into the stone floor — your name. Over and over. Hundreds of times.' },
  { location: 'The Mirror Room', text: 'Seven mirrors. Seven reflections. But one of them blinks a second too late. You freeze. The reflection smiles when you don\'t.' },
  { location: 'The Bell Tower', text: 'The bell has not rung in forty years. As you climb the final stair, it rings once. In the distance, something answers.' },
  { location: 'The Doppelganger\'s Study', text: 'You find a journal. Your handwriting fills the pages — dates you\'ve never lived, places you\'ve never been. The final entry reads: "It already knows you\'re here."' },
];

const INITIAL_ITEMS: InventoryItem[] = [
  { id: 'lantern', name: 'Brass Lantern', icon: '🕯️', description: 'A flickering lantern. Its light seems reluctant to illuminate certain corners.', count: 1 },
  { id: 'journal', name: 'Field Journal', icon: '📖', description: 'Your notes. Some entries you don\'t remember writing.', count: 1 },
  { id: 'vial', name: 'Laudanum', icon: '🧪', description: 'Steadies the nerves. Or numbs them. Hard to tell the difference.', count: 2 },
  { id: 'key', name: 'Skeleton Key', icon: '🗝️', description: 'Old iron. Opens things that perhaps should remain closed.', count: 1 },
];

const SPLASH_IMAGE = 'https://cdn.ezst.app/projects/9a837e52-f853-48ca-9649-61f562b1f681/files/3641b894-9b73-46a1-ac43-2a90e83e6589.jpg';

function Particle({ style }: { style: React.CSSProperties }) {
  return <div className="absolute w-0.5 h-0.5 rounded-full bg-amber-200 opacity-0" style={style} />;
}

function FogLayer({ delay, opacity }: { delay: number; opacity: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse 120% 60% at 50% 80%, rgba(180,160,120,0.12) 0%, transparent 70%)',
        animation: `fog-drift ${10 + delay * 3}s ease-in-out ${delay}s infinite alternate`,
        opacity,
      }}
    />
  );
}

function BloodDrip({ left, delay }: { left: string; delay: number }) {
  return (
    <div
      className="absolute top-0 w-0.5 bg-red-900 rounded-b-full"
      style={{
        left,
        height: `${20 + Math.random() * 40}px`,
        animation: `drip 1.5s ${delay}s ease-out both`,
        opacity: 0.7,
      }}
    />
  );
}

function MainMenu({ onStart, onChapterSelect }: { onStart: () => void; onChapterSelect: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [subtitleVisible, setSubtitleVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setMounted(true), 300);
    const t2 = setTimeout(() => setSubtitleVisible(true), 1200);
    const t3 = setTimeout(() => setMenuVisible(true), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const particles = Array.from({ length: 18 }, (_, i) => ({
    left: `${5 + (i * 5.5)}%`,
    animationDuration: `${8 + (i % 5) * 3}s`,
    animationDelay: `${(i * 0.7) % 6}s`,
    '--drift': `${(i % 3 === 0 ? -1 : 1) * (20 + i * 5)}px`,
  }));

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: '#050302' }}>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${SPLASH_IMAGE})`,
          filter: 'brightness(0.3) saturate(0.6) sepia(0.4)',
          transform: 'scale(1.05)',
        }}
      />
      <FogLayer delay={0} opacity={0.8} />
      <FogLayer delay={2} opacity={0.5} />
      <FogLayer delay={5} opacity={0.3} />

      <div className="absolute inset-0 scanline-overlay" />

      {particles.map((p, i) => (
        <Particle
          key={i}
          style={{
            left: p.left,
            bottom: '-4px',
            animation: `float-particle ${p.animationDuration} ${p.animationDelay} infinite linear`,
            '--drift': p['--drift'],
          } as React.CSSProperties}
        />
      ))}

      <div className="absolute top-0 left-0 right-0 flex justify-center overflow-hidden" style={{ height: '4px' }}>
        {[8, 15, 25, 35, 42, 52, 61, 70, 78, 88].map((left, i) => (
          <BloodDrip key={i} left={`${left}%`} delay={i * 0.3} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-6">
        <div
          className="text-center transition-all duration-1000"
          style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-20px)' }}
        >
          <div
            className="font-gothic text-white mb-2 animate-flicker"
            style={{ fontSize: 'clamp(48px, 8vw, 96px)', textShadow: '0 0 40px rgba(139,0,0,0.8), 0 0 80px rgba(139,0,0,0.4), 0 2px 4px rgba(0,0,0,0.9)' }}
          >
            Doppelganger
          </div>
          <div
            className="font-cinzel tracking-[0.4em] text-xs uppercase transition-all duration-1000"
            style={{
              color: '#8B6914',
              opacity: subtitleVisible ? 0.8 : 0,
              transform: subtitleVisible ? 'translateY(0)' : 'translateY(8px)',
              letterSpacing: '0.4em',
            }}
          >
            A Gothic Horror Narrative
          </div>
        </div>

        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: '50%', width: '120px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(139,0,0,0.6), transparent)', opacity: menuVisible ? 1 : 0 }}
        />

        <div
          className="flex flex-col items-center gap-3 mt-4 transition-all duration-1000"
          style={{ opacity: menuVisible ? 1 : 0, transform: menuVisible ? 'translateY(0)' : 'translateY(16px)' }}
        >
          <button className="nav-btn text-sm" onClick={onChapterSelect}>
            ⊹ Begin Your Descent ⊹
          </button>
          <button
            className="font-cinzel tracking-widest text-xs uppercase transition-all duration-200"
            style={{ color: 'rgba(139, 0, 0, 0.6)', letterSpacing: '0.3em' }}
            onClick={() => {}}
          >
            ⚙ Settings
          </button>
        </div>

        <div
          className="absolute bottom-6 font-fell italic text-xs text-center transition-all duration-1000"
          style={{ color: 'rgba(180,160,130,0.4)', opacity: menuVisible ? 1 : 0 }}
        >
          "The mirror never lies. It is the face that deceives."
        </div>
      </div>
    </div>
  );
}

function ChapterSelect({ onSelect, onBack }: { onSelect: (ch: number) => void; onBack: () => void }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center" style={{ background: 'radial-gradient(ellipse at center, #0d0805 0%, #050302 100%)' }}>
      <FogLayer delay={0} opacity={0.4} />
      <div className="absolute inset-0 scanline-overlay" />

      <div className="relative z-10 w-full max-w-2xl px-8">
        <div className="text-center mb-10">
          <div className="font-cinzel tracking-[0.3em] text-xs uppercase mb-3" style={{ color: 'rgba(139,0,0,0.7)' }}>
            ── Select Chapter ──
          </div>
          <div className="font-gothic text-4xl" style={{ color: '#c9a84c', textShadow: '0 0 20px rgba(201,168,76,0.4)' }}>
            Your Story Awaits
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {CHAPTERS.map((ch, idx) => (
            <button
              key={ch.id}
              className="relative text-left p-5 transition-all duration-300"
              style={{
                background: hovered === ch.id
                  ? 'linear-gradient(90deg, rgba(139,0,0,0.15), rgba(10,5,5,0.9))'
                  : 'rgba(10,5,5,0.8)',
                border: `1px solid ${hovered === ch.id ? 'rgba(220,20,60,0.6)' : 'rgba(139,0,0,0.2)'}`,
                boxShadow: hovered === ch.id ? '0 0 30px rgba(139,0,0,0.3), inset 0 0 20px rgba(139,0,0,0.05)' : 'none',
                opacity: ch.locked ? 0.3 : 1,
              }}
              onMouseEnter={() => !ch.locked && setHovered(ch.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => !ch.locked && onSelect(ch.id)}
              disabled={ch.locked}
            >
              <div className="flex items-start gap-4">
                <span
                  className="font-cinzel text-3xl font-black shrink-0"
                  style={{ color: 'rgba(139,0,0,0.4)', lineHeight: 1, marginTop: '2px' }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-cinzel text-base font-bold mb-1" style={{ color: '#c9a84c' }}>
                    {ch.title}
                  </div>
                  <div className="font-fell italic text-sm" style={{ color: 'rgba(180,160,130,0.6)' }}>
                    {ch.subtitle}
                  </div>
                </div>
                {!ch.locked && hovered === ch.id && (
                  <div className="shrink-0 self-center" style={{ color: 'rgba(220,20,60,0.7)' }}>→</div>
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          className="mt-8 font-cinzel tracking-widest text-xs uppercase w-full text-center transition-colors duration-200"
          style={{ color: 'rgba(180,160,130,0.4)' }}
          onClick={onBack}
        >
          ← Return to Darkness
        </button>
      </div>
    </div>
  );
}

function GameplayHUD({
  gameState,
  onInventory,
  onNextScene,
}: {
  gameState: GameState;
  onInventory: () => void;
  onNextScene: () => void;
}) {
  const currentEvent = NARRATIVE_EVENTS[(gameState.daysCounted) % NARRATIVE_EVENTS.length];
  const [textVisible, setTextVisible] = useState(false);
  const [choicesVisible, setChoicesVisible] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    setTextVisible(false);
    setChoicesVisible(false);
    const t1 = setTimeout(() => setTextVisible(true), 200);
    const t2 = setTimeout(() => setChoicesVisible(true), 1500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [gameState.daysCounted]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const choices = [
    { text: 'Investigate further', sanity: -5, tension: +10 },
    { text: 'Retreat to safety', sanity: +3, tension: -5 },
    { text: 'Document the anomaly', sanity: -2, tension: +5 },
  ];

  return (
    <div
      className={`relative w-full h-full flex flex-col ${shake ? 'animate-shake' : ''}`}
      style={{ background: 'radial-gradient(ellipse at 30% 70%, #0f0805 0%, #050302 100%)' }}
    >
      <FogLayer delay={0} opacity={0.5} />
      <div className="absolute inset-0 scanline-overlay" />

      {/* Top HUD */}
      <div
        className="relative z-20 flex items-start justify-between p-4 gap-4"
        style={{ borderBottom: '1px solid rgba(139,0,0,0.15)', background: 'rgba(5,3,2,0.85)' }}
      >
        {/* Stats */}
        <div className="flex flex-col gap-2 min-w-[180px]">
          {[
            { label: 'VITALITY', value: gameState.hp, max: gameState.maxHp, cls: 'hp-bar', icon: '❤' },
            { label: 'SANITY', value: gameState.sanity, max: gameState.maxSanity, cls: 'sanity-bar', icon: '☯' },
            { label: 'STAMINA', value: gameState.stamina, max: gameState.maxStamina, cls: 'stamina-bar', icon: '⚡' },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-2">
              <span className="text-xs w-3" style={{ color: 'rgba(180,160,130,0.5)' }}>{stat.icon}</span>
              <div className="flex-1">
                <div className="flex justify-between mb-0.5">
                  <span className="font-cinzel text-[8px] tracking-widest" style={{ color: 'rgba(180,160,130,0.5)' }}>{stat.label}</span>
                  <span className="font-cinzel text-[8px]" style={{ color: 'rgba(180,160,130,0.5)' }}>{stat.value}/{stat.max}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className={stat.cls + ' h-full rounded-full'} style={{ width: `${(stat.value / stat.max) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Location */}
        <div className="flex-1 text-center">
          <div className="font-cinzel tracking-[0.2em] text-[10px] uppercase mb-1" style={{ color: 'rgba(139,0,0,0.6)' }}>
            Chapter {gameState.chapter} · Day {gameState.daysCounted}
          </div>
          <div className="font-gothic text-xl animate-flicker" style={{ color: '#c9a84c', textShadow: '0 0 15px rgba(201,168,76,0.4)' }}>
            {currentEvent.location}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            className="horror-border p-2 transition-all duration-200 hover:bg-red-900/20"
            style={{ color: '#c9a84c' }}
            onClick={onInventory}
            title="Inventory"
          >
            <Icon name="Package" size={16} />
          </button>
          <button
            className="horror-border p-2 transition-all duration-200 hover:bg-red-900/20"
            style={{ color: 'rgba(180,160,130,0.5)' }}
            title="Map"
          >
            <Icon name="Map" size={16} />
          </button>
        </div>
      </div>

      {/* Tension indicator */}
      {gameState.tension > 60 && (
        <div
          className="absolute inset-0 pointer-events-none z-10 rounded-none"
          style={{
            border: `${Math.min(4, (gameState.tension - 60) / 10)}px solid rgba(139,0,0,${0.3 + (gameState.tension - 60) / 200})`,
            boxShadow: `inset 0 0 ${60 + gameState.tension}px rgba(139,0,0,${0.1 + gameState.tension / 500})`,
            animation: gameState.tension > 80 ? 'pulse-red 1.5s ease-in-out infinite' : 'none',
          }}
        />
      )}

      {/* Main narrative area */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-8 md:px-16 max-w-3xl mx-auto w-full">
        <div
          className="mb-8 transition-all duration-1000"
          style={{ opacity: textVisible ? 1 : 0, transform: textVisible ? 'translateY(0)' : 'translateY(12px)' }}
        >
          <div
            className="font-fell italic text-base md:text-lg leading-relaxed"
            style={{ color: 'rgba(210,190,160,0.85)', lineHeight: '1.9' }}
          >
            {currentEvent.text}
          </div>
        </div>

        {/* Choices */}
        <div
          className="flex flex-col gap-3 transition-all duration-1000"
          style={{ opacity: choicesVisible ? 1 : 0, transform: choicesVisible ? 'translateY(0)' : 'translateY(16px)' }}
        >
          <div className="font-cinzel text-[9px] tracking-[0.3em] uppercase mb-1" style={{ color: 'rgba(139,0,0,0.5)' }}>
            ── What will you do? ──
          </div>
          {choices.map((choice, i) => (
            <button
              key={i}
              className="text-left p-3 transition-all duration-200 group"
              style={{
                background: 'rgba(10,5,5,0.6)',
                border: '1px solid rgba(139,0,0,0.2)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(220,20,60,0.5)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(139,0,0,0.1)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,0,0,0.2)';
                (e.currentTarget as HTMLElement).style.background = 'rgba(10,5,5,0.6)';
              }}
              onClick={() => { triggerShake(); setTimeout(onNextScene, 600); }}
            >
              <div className="flex items-center gap-3">
                <span className="font-cinzel text-xs font-bold" style={{ color: 'rgba(139,0,0,0.6)' }}>
                  {String.fromCharCode(65 + i)}.
                </span>
                <span className="font-fell italic text-sm" style={{ color: 'rgba(210,190,160,0.8)' }}>
                  {choice.text}
                </span>
                <div className="ml-auto flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {choice.sanity < 0 && <span className="text-xs" style={{ color: 'rgba(100,30,180,0.7)' }}>-{Math.abs(choice.sanity)} 🧠</span>}
                  {choice.sanity > 0 && <span className="text-xs" style={{ color: 'rgba(30,150,80,0.7)' }}>+{choice.sanity} 🧠</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Narrative log strip */}
      <div
        className="relative z-20 px-6 py-2 text-xs overflow-hidden whitespace-nowrap"
        style={{ borderTop: '1px solid rgba(139,0,0,0.1)', background: 'rgba(5,3,2,0.9)', color: 'rgba(180,160,130,0.3)', fontFamily: 'Cinzel, serif', letterSpacing: '0.05em' }}
      >
        {gameState.narrativeLog.slice(-3).join('  ·  ')}
      </div>
    </div>
  );
}

function InventoryScreen({ gameState, onClose }: { gameState: GameState; onClose: () => void }) {
  const [selected, setSelected] = useState<InventoryItem | null>(null);

  return (
    <div
      className="relative w-full h-full flex flex-col"
      style={{ background: 'radial-gradient(ellipse at top, #100805 0%, #050302 100%)' }}
    >
      <div className="absolute inset-0 scanline-overlay" />
      <FogLayer delay={0} opacity={0.3} />

      <div className="relative z-10 p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="font-cinzel tracking-[0.3em] text-[10px] uppercase mb-1" style={{ color: 'rgba(139,0,0,0.6)' }}>
              Personal Effects
            </div>
            <div className="font-gothic text-3xl" style={{ color: '#c9a84c', textShadow: '0 0 15px rgba(201,168,76,0.3)' }}>
              Inventory
            </div>
          </div>
          <button
            className="horror-border p-2 transition-all hover:bg-red-900/20"
            style={{ color: 'rgba(180,160,130,0.6)' }}
            onClick={onClose}
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="flex gap-6 flex-1 min-h-0">
          {/* Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-3">
              {gameState.inventory.map(item => (
                <button
                  key={item.id}
                  className="inventory-slot aspect-square flex flex-col items-center justify-center gap-2 p-4 transition-all"
                  style={{
                    border: selected?.id === item.id ? '1px solid rgba(220,20,60,0.7)' : '1px solid rgba(139,0,0,0.3)',
                    boxShadow: selected?.id === item.id ? '0 0 20px rgba(139,0,0,0.4), inset 0 0 10px rgba(139,0,0,0.1)' : 'none',
                  }}
                  onClick={() => setSelected(item === selected ? null : item)}
                >
                  <span className="text-3xl">{item.icon}</span>
                  <span className="font-cinzel text-[9px] tracking-wider text-center uppercase" style={{ color: '#c9a84c' }}>
                    {item.name}
                  </span>
                  {item.count > 1 && (
                    <span className="font-cinzel text-[8px]" style={{ color: 'rgba(139,0,0,0.7)' }}>×{item.count}</span>
                  )}
                </button>
              ))}
              {Array.from({ length: Math.max(0, 9 - gameState.inventory.length) }, (_, i) => (
                <div
                  key={`empty-${i}`}
                  className="inventory-slot aspect-square flex items-center justify-center"
                  style={{ opacity: 0.3 }}
                >
                  <div style={{ width: '24px', height: '24px', border: '1px dashed rgba(139,0,0,0.2)', borderRadius: '2px' }} />
                </div>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div
            className="w-52 shrink-0 p-4 flex flex-col"
            style={{ background: 'rgba(10,5,5,0.8)', border: '1px solid rgba(139,0,0,0.2)' }}
          >
            {selected ? (
              <>
                <div className="text-4xl mb-3 text-center">{selected.icon}</div>
                <div className="font-cinzel text-sm font-bold mb-2 text-center" style={{ color: '#c9a84c' }}>
                  {selected.name}
                </div>
                <div className="font-fell italic text-xs leading-relaxed mb-4" style={{ color: 'rgba(180,160,130,0.7)' }}>
                  {selected.description}
                </div>
                {selected.id === 'vial' && (
                  <button
                    className="nav-btn text-xs mt-auto"
                    onClick={() => {}}
                  >
                    Use Item
                  </button>
                )}
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center font-fell italic text-xs text-center" style={{ color: 'rgba(180,160,130,0.3)' }}>
                Select an item to inspect it
              </div>
            )}
          </div>
        </div>

        {/* Equipment slots */}
        <div
          className="mt-4 pt-4 flex gap-3"
          style={{ borderTop: '1px solid rgba(139,0,0,0.15)' }}
        >
          <div className="font-cinzel text-[9px] tracking-widest uppercase self-center mr-2" style={{ color: 'rgba(139,0,0,0.5)' }}>
            Equipped
          </div>
          {['🕯️', '🗝️', '—', '—'].map((slot, i) => (
            <div
              key={i}
              className="w-10 h-10 flex items-center justify-center text-xl inventory-slot"
              style={{ opacity: slot === '—' ? 0.3 : 1 }}
            >
              {slot}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GameOverScreen({ onRestart, cause }: { onRestart: () => void; cause: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 800); }, []);

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center"
      style={{ background: '#020101' }}
    >
      <div
        className="absolute inset-0 transition-all duration-[3000ms]"
        style={{
          background: visible ? 'radial-gradient(ellipse at center, rgba(50,0,0,0.4) 0%, #020101 70%)' : '#020101',
        }}
      />

      {visible && (
        <>
          {[12, 28, 45, 62, 78].map((left, i) => (
            <BloodDrip key={i} left={`${left}%`} delay={i * 0.4} />
          ))}
        </>
      )}

      <div className="absolute inset-0 scanline-overlay" />

      <div
        className="relative z-10 text-center transition-all duration-[2000ms]"
        style={{ opacity: visible ? 1 : 0, transform: visible ? 'scale(1)' : 'scale(0.95)' }}
      >
        <div
          className="font-gothic mb-2 animate-flicker"
          style={{
            fontSize: 'clamp(56px, 10vw, 120px)',
            color: '#8B0000',
            textShadow: '0 0 40px rgba(139,0,0,0.9), 0 0 80px rgba(139,0,0,0.5), 0 0 120px rgba(139,0,0,0.3)',
          }}
        >
          You Perished
        </div>

        <div className="font-fell italic text-base mb-2" style={{ color: 'rgba(180,160,130,0.5)' }}>
          {cause}
        </div>

        <div
          className="w-32 mx-auto my-6"
          style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(139,0,0,0.4), transparent)' }}
        />

        <div className="font-cinzel text-xs tracking-[0.3em] mb-2 uppercase" style={{ color: 'rgba(139,0,0,0.4)' }}>
          The Doppelganger claims another soul
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <button className="nav-btn text-sm" onClick={onRestart}>
            ⊹ Try Again ⊹
          </button>
          <button
            className="font-cinzel text-[10px] tracking-widest uppercase transition-colors"
            style={{ color: 'rgba(180,160,130,0.3)' }}
            onClick={onRestart}
          >
            Return to Menu
          </button>
        </div>
      </div>
    </div>
  );
}

function VictoryScreen({ onRestart }: { onRestart: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 500); }, []);

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center"
      style={{ background: 'radial-gradient(ellipse at center, #0a0705 0%, #020101 100%)' }}
    >
      <FogLayer delay={0} opacity={0.5} />
      <div className="absolute inset-0 scanline-overlay" />

      <div
        className="relative z-10 text-center"
        style={{ opacity: visible ? 1 : 0, transition: 'all 2s', transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
      >
        <div
          className="font-gothic mb-4 animate-flicker"
          style={{
            fontSize: 'clamp(48px, 8vw, 96px)',
            color: '#c9a84c',
            textShadow: '0 0 30px rgba(201,168,76,0.6), 0 0 60px rgba(201,168,76,0.3)',
          }}
        >
          You Survived
        </div>
        <div className="font-fell italic text-base mb-8" style={{ color: 'rgba(180,160,130,0.6)' }}>
          But did you escape? Or did it let you go?
        </div>
        <button className="nav-btn text-sm" onClick={onRestart}>
          ⊹ Play Again ⊹
        </button>
      </div>
    </div>
  );
}

const INITIAL_STATE: GameState = {
  hp: 85,
  maxHp: 100,
  sanity: 72,
  maxSanity: 100,
  stamina: 90,
  maxStamina: 100,
  chapter: 1,
  location: 'The Fog Garden',
  daysCounted: 0,
  inventory: INITIAL_ITEMS,
  narrativeLog: ['You arrive at the estate.', 'The gate creaks open.', 'Something watches from the mist.'],
  isAware: false,
  tension: 20,
};

const DEATH_CAUSES = [
  'The Doppelganger wore your face as it walked into the light.',
  'Sanity shattered like a mirror — in seven pieces.',
  'You followed the wrong reflection into the dark.',
  'They found you. What they buried was not you.',
];

export default function Index() {
  const [screen, setScreen] = useState<GameScreen>('menu');
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const [prevScreen, setPrevScreen] = useState<GameScreen>('menu');

  const goTo = useCallback((s: GameScreen) => {
    setPrevScreen(screen);
    setScreen(s);
  }, [screen]);

  const startGame = useCallback((chapter: number) => {
    setGameState({ ...INITIAL_STATE, chapter });
    goTo('gameplay');
  }, [goTo]);

  const nextScene = useCallback(() => {
    setGameState(prev => {
      const newDay = prev.daysCounted + 1;
      const newSanity = Math.max(0, prev.sanity - (5 + Math.floor(Math.random() * 10)));
      const newHp = Math.max(0, prev.hp - (Math.random() < 0.3 ? Math.floor(Math.random() * 15) : 0));
      const newTension = Math.min(100, prev.tension + 8 + Math.floor(Math.random() * 12));
      const location = NARRATIVE_EVENTS[newDay % NARRATIVE_EVENTS.length].location;

      if (newSanity <= 0 || newHp <= 0) {
        setTimeout(() => goTo('game-over'), 100);
        return prev;
      }
      if (newDay >= 6) {
        setTimeout(() => goTo('victory'), 100);
        return prev;
      }

      return {
        ...prev,
        daysCounted: newDay,
        sanity: newSanity,
        hp: newHp,
        tension: newTension,
        location,
        narrativeLog: [...prev.narrativeLog, `Day ${newDay}: Entered ${location}.`],
      };
    });
  }, [goTo]);

  const restart = useCallback(() => {
    setGameState(INITIAL_STATE);
    goTo('menu');
  }, [goTo]);

  const deathCause = DEATH_CAUSES[gameState.daysCounted % DEATH_CAUSES.length];

  return (
    <div
      className="w-screen h-screen overflow-hidden"
      style={{ background: '#050302' }}
    >
      {screen === 'menu' && (
        <MainMenu onStart={() => goTo('chapter-select')} onChapterSelect={() => goTo('chapter-select')} />
      )}
      {screen === 'chapter-select' && (
        <ChapterSelect onSelect={startGame} onBack={() => goTo('menu')} />
      )}
      {screen === 'gameplay' && (
        <GameplayHUD
          gameState={gameState}
          onInventory={() => goTo('inventory')}
          onNextScene={nextScene}
        />
      )}
      {screen === 'inventory' && (
        <InventoryScreen gameState={gameState} onClose={() => goTo('gameplay')} />
      )}
      {screen === 'game-over' && (
        <GameOverScreen onRestart={restart} cause={deathCause} />
      )}
      {screen === 'victory' && (
        <VictoryScreen onRestart={restart} />
      )}
    </div>
  );
}
