import { useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Plane, Cylinder, Sphere, Text } from '@react-three/drei';
import * as THREE from 'three';

// ─── Types ───────────────────────────────────────────────────────────────────
type Screen = 'menu' | 'cutscene' | 'school' | 'end';

interface DialogueLine {
  speaker: string;
  text: string;
  color?: string;
}

// ─── Dialogue data ────────────────────────────────────────────────────────────
const CAR_DIALOGUE: DialogueLine[] = [
  { speaker: 'Mrs. Wilson', text: 'This traffic is so fucking stupid..', color: '#e57373' },
  { speaker: 'Jax', text: 'Mom... how come there\'s so much traffic today?', color: '#90caf9' },
  { speaker: 'Mrs. Wilson', text: 'First, you\'re cutting your hair when you get home. Second, I don\'t know.', color: '#e57373' },
  { speaker: 'Ramona', text: 'I heard something broke out of Morrow Lab. We might go into another pandemic.', color: '#ce93d8' },
  { speaker: 'Jax', text: 'It\'s only been four years since Covid, I don\'t want another pandemic!', color: '#90caf9' },
  { speaker: 'Mrs. Wilson', text: 'We\'re not going into another pandemic. Stop listening to your sister\'s bullshit.', color: '#e57373' },
  { speaker: 'Ramona', text: 'It\'s not bullshit! You\'re always glued to the TV, how come you don\'t know this?', color: '#ce93d8' },
  { speaker: 'Mrs. Wilson', text: 'Now stop talking about this.', color: '#e57373' },
  { speaker: '[Jax gets a Snapchat from Carmen]', text: '"Have you heard about the Morrow Lab situation?"', color: '#888' },
];

const CARMEN_DIALOGUE: DialogueLine[] = [
  { speaker: 'Carmen', text: 'JAX! Over here!', color: '#f48fb1' },
  { speaker: 'Carmen', text: 'Did you see the news? Everyone on the bus won\'t shut up about Morrow Lab.', color: '#f48fb1' },
  { speaker: 'Jax', text: 'My sister was talking about it the whole ride. Said something broke out?', color: '#90caf9' },
  { speaker: 'Carmen', text: 'Yeah. Nobody knows what exactly. The lab\'s been on lockdown since Saturday night.', color: '#f48fb1' },
  { speaker: 'Jax', text: 'That\'s... kind of terrifying actually.', color: '#90caf9' },
  { speaker: 'Carmen', text: 'Right? Okay we should go inside before first bell. Walk with me?', color: '#f48fb1' },
];

// ─── Dialogue Box ─────────────────────────────────────────────────────────────
function DialogueBox({ lines, onDone }: { lines: DialogueLine[]; onDone: () => void }) {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState('');
  const [typing, setTyping] = useState(true);
  const current = lines[idx];
  const charRef = useRef(0);

  useEffect(() => {
    charRef.current = 0;
    setShown('');
    setTyping(true);
    const full = current.text;
    const iv = setInterval(() => {
      charRef.current++;
      setShown(full.slice(0, charRef.current));
      if (charRef.current >= full.length) { setTyping(false); clearInterval(iv); }
    }, 20);
    return () => clearInterval(iv);
  }, [idx]);

  const advance = () => {
    if (typing) { setShown(current.text); setTyping(false); return; }
    if (idx < lines.length - 1) setIdx(i => i + 1);
    else onDone();
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30 p-4 pb-6" onClick={advance} style={{ cursor: 'pointer' }}>
      <div style={{ background: 'rgba(6,6,10,0.94)', border: '1px solid rgba(255,255,255,0.08)', padding: '16px 20px 14px', maxWidth: '760px', margin: '0 auto', backdropFilter: 'blur(6px)' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '12px', letterSpacing: '0.22em', marginBottom: '6px', color: current.color ?? '#fff' }}>
          {current.speaker}
        </div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '17px', fontWeight: 300, lineHeight: '1.65', color: 'rgba(220,215,208,0.9)', minHeight: '50px' }}>
          {shown}
          {typing && <span style={{ borderRight: '2px solid rgba(255,255,255,0.5)', animation: 'blink 0.7s step-end infinite' }}>&nbsp;</span>}
        </div>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: 'rgba(180,180,180,0.25)', marginTop: '10px', textAlign: 'right', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {idx + 1}/{lines.length} · {typing ? 'reading...' : 'click to continue'}
        </div>
      </div>
    </div>
  );
}

// ─── CAR INTERIOR 3D ─────────────────────────────────────────────────────────
function CarInterior() {
  const t = useRef(0);
  useFrame((state, delta) => {
    t.current += delta * 0.4;
    state.camera.position.set(Math.sin(t.current * 0.6) * 0.04, 1.1 + Math.sin(t.current * 1.2) * 0.012, 1.6);
    state.camera.lookAt(0, 0.7, -1.5);
  });

  return (
    <>
      <ambientLight intensity={0.35} color="#d4c5a9" />
      <directionalLight position={[1, 4, 2]} intensity={0.5} color="#fff8e7" />
      <pointLight position={[-1.5, 2, -1.5]} intensity={1.2} color="#ff8800" />
      <pointLight position={[1.5, 2, -1.5]} intensity={0.4} color="#ff6600" />

      {/* Floor */}
      <Plane args={[2.4, 3.5]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.44, -0.3]}>
        <meshStandardMaterial color="#0c0c0c" roughness={1} />
      </Plane>
      {/* Roof */}
      <Plane args={[2.4, 3.5]} rotation={[Math.PI / 2, 0, 0]} position={[0, 1.65, -0.3]}>
        <meshStandardMaterial color="#141414" roughness={1} />
      </Plane>
      {/* Left wall */}
      <Plane args={[3.5, 2.2]} rotation={[0, Math.PI / 2, 0]} position={[-1.15, 0.7, -0.3]}>
        <meshStandardMaterial color="#111" roughness={1} />
      </Plane>
      {/* Right wall */}
      <Plane args={[3.5, 2.2]} rotation={[0, -Math.PI / 2, 0]} position={[1.15, 0.7, -0.3]}>
        <meshStandardMaterial color="#111" roughness={1} />
      </Plane>
      {/* Windows left */}
      <Plane args={[0.95, 0.65]} rotation={[0, Math.PI / 2, 0]} position={[-1.14, 1.05, 0.3]}>
        <meshStandardMaterial color="#1a2a3a" roughness={0.05} metalness={0.3} transparent opacity={0.55} />
      </Plane>
      <Plane args={[0.95, 0.65]} rotation={[0, -Math.PI / 2, 0]} position={[1.14, 1.05, 0.3]}>
        <meshStandardMaterial color="#1a2a3a" roughness={0.05} metalness={0.3} transparent opacity={0.55} />
      </Plane>

      {/* Dashboard */}
      <Box args={[2.3, 0.35, 0.45]} position={[0, 0.6, -1.5]}>
        <meshStandardMaterial color="#0f0f0f" roughness={0.8} />
      </Box>
      {/* Steering wheel */}
      <Cylinder args={[0.22, 0.22, 0.04, 16]} position={[-0.52, 0.72, -1.3]} rotation={[1.1, 0, 0]}>
        <meshStandardMaterial color="#222" roughness={0.6} />
      </Cylinder>

      {/* Front seats */}
      <Box args={[0.7, 0.75, 0.55]} position={[-0.52, 0.08, -0.38]}>
        <meshStandardMaterial color="#191919" roughness={0.95} />
      </Box>
      <Box args={[0.7, 0.85, 0.1]} position={[-0.52, 0.6, -0.64]}>
        <meshStandardMaterial color="#111" roughness={0.95} />
      </Box>
      <Box args={[0.7, 0.75, 0.55]} position={[0.52, 0.08, -0.38]}>
        <meshStandardMaterial color="#191919" roughness={0.95} />
      </Box>
      <Box args={[0.7, 0.85, 0.1]} position={[0.52, 0.6, -0.64]}>
        <meshStandardMaterial color="#111" roughness={0.95} />
      </Box>

      {/* MRS WILSON */}
      <group position={[-0.52, 0.35, -0.52]}>
        <Box args={[0.36, 0.55, 0.24]} position={[0, 0.28, 0]}><meshStandardMaterial color="#383838" roughness={0.9} /></Box>
        <Box args={[0.3, 0.3, 0.26]} position={[0, 0.68, 0]}><meshStandardMaterial color="#ead4be" roughness={0.8} /></Box>
        <Box args={[0.32, 0.16, 0.28]} position={[0, 0.84, 0]}><meshStandardMaterial color="#2c1a0e" roughness={1} /></Box>
      </group>

      {/* RAMONA */}
      <group position={[0.52, 0.35, 0.28]}>
        <Box args={[0.36, 0.55, 0.24]} position={[0, 0.28, 0]}><meshStandardMaterial color="#4a3060" roughness={0.9} /></Box>
        <Box args={[0.3, 0.3, 0.26]} position={[0, 0.68, 0]}><meshStandardMaterial color="#c8a882" roughness={0.8} /></Box>
        <Box args={[0.32, 0.24, 0.28]} position={[0, 0.86, 0]}><meshStandardMaterial color="#100808" roughness={1} /></Box>
      </group>

      {/* JAX (sitting, back-left, camera POV near him) */}
      <group position={[-0.52, 0.35, 0.28]}>
        <Box args={[0.42, 0.52, 0.24]} position={[0, 0.28, 0]}><meshStandardMaterial color="#2a2a2a" roughness={0.9} /></Box>
        <Box args={[0.32, 0.3, 0.26]} position={[0, 0.68, 0]}><meshStandardMaterial color="#f0d9c8" roughness={0.8} /></Box>
        <Box args={[0.34, 0.14, 0.28]} position={[0, 0.82, 0]}><meshStandardMaterial color="#888" roughness={0.95} /></Box>
        <Box args={[0.36, 0.1, 0.3]} position={[0, 0.76, 0]}><meshStandardMaterial color="#111" roughness={1} /></Box>
        {/* Phone glow */}
        <Box args={[0.09, 0.16, 0.02]} position={[0.14, 0.56, 0.14]}>
          <meshStandardMaterial color="#2a4a8a" roughness={0.1} emissive="#1a3a7a" emissiveIntensity={1.5} />
        </Box>
        <pointLight position={[0.14, 0.56, 0.18]} intensity={0.5} color="#4466cc" distance={0.8} />
      </group>

      {/* Traffic cars outside */}
      {[
        { x: 2.2, z: -1, col: '#c0392b' },
        { x: 2.8, z: -2.5, col: '#888' },
        { x: -2.2, z: -0.5, col: '#2980b9' },
        { x: -2.8, z: -2, col: '#27ae60' },
      ].map((c, i) => (
        <group key={i} position={[c.x, 0.5, c.z]}>
          <Box args={[0.9, 0.45, 1.8]}><meshStandardMaterial color={c.col} roughness={0.7} /></Box>
        </group>
      ))}
    </>
  );
}

// ─── SCHOOL PLAYER ────────────────────────────────────────────────────────────
function PlayerController({
  posRef,
  rotRef,
  keys,
  onInteract,
}: {
  posRef: React.MutableRefObject<THREE.Vector3>;
  rotRef: React.MutableRefObject<number>;
  keys: React.MutableRefObject<Record<string, boolean>>;
  onInteract: (id: string) => void;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const legLRef = useRef<THREE.Mesh>(null!);
  const legRRef = useRef<THREE.Mesh>(null!);
  const armLRef = useRef<THREE.Group>(null!);
  const armRRef = useRef<THREE.Group>(null!);
  const walkT = useRef(0);
  const interacted = useRef<Record<string, boolean>>({});
  const SPEED = 4.5;
  const ROT = 2.4;

  useFrame((state, delta) => {
    const k = keys.current;
    if (k['ArrowLeft'] || k['a'] || k['A']) rotRef.current += ROT * delta;
    if (k['ArrowRight'] || k['d'] || k['D']) rotRef.current -= ROT * delta;

    let moving = false;
    const dir = new THREE.Vector3();
    if (k['ArrowUp'] || k['w'] || k['W']) { dir.z = -1; moving = true; }
    if (k['ArrowDown'] || k['s'] || k['S']) { dir.z = 1; moving = true; }

    if (moving) {
      dir.applyEuler(new THREE.Euler(0, rotRef.current, 0)).multiplyScalar(SPEED * delta);
      posRef.current.add(dir);
      posRef.current.x = Math.max(-13, Math.min(13, posRef.current.x));
      posRef.current.z = Math.max(-20, Math.min(9, posRef.current.z));
      walkT.current += delta * 6;
    }

    if (groupRef.current) {
      groupRef.current.position.copy(posRef.current);
      groupRef.current.rotation.y = rotRef.current;
    }

    // Leg swing
    const sw = moving ? Math.sin(walkT.current) * 0.42 : 0;
    if (legLRef.current) legLRef.current.rotation.x += (sw - legLRef.current.rotation.x) * 0.25;
    if (legRRef.current) legRRef.current.rotation.x += (-sw - legRRef.current.rotation.x) * 0.25;
    if (armLRef.current) armLRef.current.rotation.x += (-sw * 0.5 - armLRef.current.rotation.x) * 0.25;
    if (armRRef.current) armRRef.current.rotation.x += (sw * 0.5 - armRRef.current.rotation.x) * 0.25;

    // Camera follow
    const cd = 5, ch = 3.5;
    const tx = posRef.current.x - Math.sin(rotRef.current) * cd;
    const tz = posRef.current.z + Math.cos(rotRef.current) * cd;
    state.camera.position.lerp(new THREE.Vector3(tx, ch, tz), 0.09);
    state.camera.lookAt(posRef.current.x, 1.3, posRef.current.z);

    // Interaction zones
    const p = posRef.current;
    if (!interacted.current['carmen'] && Math.hypot(p.x - (-5.5), p.z - (-2.5)) < 2.2) {
      interacted.current['carmen'] = true;
      onInteract('carmen');
    }
    if (!interacted.current['school'] && Math.hypot(p.x - 0, p.z - (-15)) < 2.8) {
      interacted.current['school'] = true;
      onInteract('school');
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <Box args={[0.52, 0.65, 0.28]} position={[0, 1.05, 0]}><meshStandardMaterial color="#2a2a2a" roughness={0.9} /></Box>
      {/* Head */}
      <Box args={[0.34, 0.34, 0.3]} position={[0, 1.55, 0]}><meshStandardMaterial color="#f0d9c8" roughness={0.8} /></Box>
      {/* Hair — messy */}
      <Box args={[0.36, 0.09, 0.32]} position={[0, 1.73, -0.02]}><meshStandardMaterial color="#111" roughness={1} /></Box>
      <Box args={[0.16, 0.07, 0.1]} position={[0.1, 1.69, 0.14]}><meshStandardMaterial color="#111" roughness={1} /></Box>
      <Box args={[0.12, 0.07, 0.08]} position={[-0.12, 1.7, 0.13]}><meshStandardMaterial color="#111" roughness={1} /></Box>
      {/* Beanie */}
      <Box args={[0.38, 0.15, 0.34]} position={[0, 1.81, 0]}><meshStandardMaterial color="#888" roughness={0.95} /></Box>
      {/* Eyes */}
      <Box args={[0.06, 0.05, 0.01]} position={[-0.08, 1.55, 0.156]}><meshStandardMaterial color="#111" /></Box>
      <Box args={[0.06, 0.05, 0.01]} position={[0.08, 1.55, 0.156]}><meshStandardMaterial color="#111" /></Box>
      {/* Pants */}
      <mesh ref={legLRef} position={[-0.13, 0.6, 0]}>
        <Box args={[0.22, 0.52, 0.24]}><meshStandardMaterial color="#1a1a2e" roughness={0.95} /></Box>
      </mesh>
      <mesh ref={legRRef} position={[0.13, 0.6, 0]}>
        <Box args={[0.22, 0.52, 0.24]}><meshStandardMaterial color="#1a1a2e" roughness={0.95} /></Box>
      </mesh>
      {/* Shoes */}
      <Box args={[0.24, 0.1, 0.3]} position={[-0.13, 0.33, 0.04]}><meshStandardMaterial color="#222" roughness={0.7} /></Box>
      <Box args={[0.24, 0.1, 0.3]} position={[0.13, 0.33, 0.04]}><meshStandardMaterial color="#222" roughness={0.7} /></Box>
      {/* Arms */}
      <group ref={armLRef} position={[-0.32, 1.2, 0]}>
        <Box args={[0.18, 0.5, 0.2]}><meshStandardMaterial color="#2a2a2a" roughness={0.9} /></Box>
        <Box args={[0.15, 0.12, 0.15]} position={[0, -0.32, 0]}><meshStandardMaterial color="#f0d9c8" roughness={0.8} /></Box>
      </group>
      <group ref={armRRef} position={[0.32, 1.2, 0]}>
        <Box args={[0.18, 0.5, 0.2]}><meshStandardMaterial color="#2a2a2a" roughness={0.9} /></Box>
        <Box args={[0.15, 0.12, 0.15]} position={[0, -0.32, 0]}><meshStandardMaterial color="#f0d9c8" roughness={0.8} /></Box>
        <Box args={[0.08, 0.14, 0.02]} position={[0.05, -0.39, 0.09]}><meshStandardMaterial color="#111" roughness={0.3} metalness={0.5} /></Box>
      </group>
    </group>
  );
}

// ─── SCHOOL WORLD ─────────────────────────────────────────────────────────────
function SchoolWorld({
  posRef,
  rotRef,
  keys,
  onInteract,
}: {
  posRef: React.MutableRefObject<THREE.Vector3>;
  rotRef: React.MutableRefObject<number>;
  keys: React.MutableRefObject<Record<string, boolean>>;
  onInteract: (id: string) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.5} color="#c8d8f0" />
      <directionalLight position={[5, 14, 6]} intensity={1.1} color="#f0f4ff" />
      <pointLight position={[0, 8, -14]} intensity={0.6} color="#c0d4f0" />
      <fog attach="fog" args={['#181c28', 20, 50]} />

      {/* Ground */}
      <Plane args={[50, 50]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -5]}>
        <meshStandardMaterial color="#1a1c22" roughness={1} />
      </Plane>
      {/* Sidewalk strip */}
      <Box args={[24, 0.1, 3.5]} position={[0, 0.05, -12.5]}>
        <meshStandardMaterial color="#25272e" roughness={0.95} />
      </Box>

      {/* ── SCHOOL BUILDING ── */}
      <Box args={[20, 8, 4.5]} position={[0, 4, -17]}>
        <meshStandardMaterial color="#252830" roughness={0.9} />
      </Box>
      {/* Roof */}
      <Box args={[21, 0.45, 5.5]} position={[0, 8.22, -16.5]}>
        <meshStandardMaterial color="#18191e" roughness={0.9} />
      </Box>
      {/* Windows row top */}
      {[-7, -3.5, 0, 3.5, 7].map((x, i) => (
        <group key={i}>
          <Box args={[2, 1.5, 0.12]} position={[x, 5.5, -14.75]}>
            <meshStandardMaterial color="#8ab0d0" roughness={0.08} metalness={0.4} transparent opacity={0.75} />
          </Box>
          <pointLight position={[x, 5.5, -14.2]} intensity={0.6} color="#b8ccf0" distance={4} />
          <Box args={[2, 1.5, 0.12]} position={[x, 2.8, -14.75]}>
            <meshStandardMaterial color="#8ab0d0" roughness={0.08} metalness={0.4} transparent opacity={0.75} />
          </Box>
        </group>
      ))}
      {/* Main door */}
      <Box args={[1.8, 3.0, 0.14]} position={[0, 1.5, -14.73]}>
        <meshStandardMaterial color="#3a4a5a" roughness={0.5} metalness={0.3} />
      </Box>
      <Box args={[2.2, 0.18, 0.18]} position={[0, 3.08, -14.72]}>
        <meshStandardMaterial color="#555" roughness={0.7} />
      </Box>
      {/* School name */}
      <Text position={[0, 7.3, -14.6]} fontSize={0.32} color="#aabbcc" anchorX="center" outlineWidth={0.02} outlineColor="#000">
        Morrow Middle School
      </Text>
      {/* Walk-here prompt */}
      <Text position={[0, 3.9, -14.5]} fontSize={0.2} color="#ffd700" anchorX="center" outlineWidth={0.015} outlineColor="#000">
        [Walk to entrance]
      </Text>

      {/* ── BUS STOP ── */}
      <group position={[-5.5, 0, -3]}>
        <Box args={[2.6, 2.8, 0.12]} position={[0, 1.4, 0]}>
          <meshStandardMaterial color="#2e3545" transparent opacity={0.8} roughness={0.6} />
        </Box>
        <Box args={[0.1, 2.8, 1.4]} position={[-1.25, 1.4, -0.6]}>
          <meshStandardMaterial color="#555" roughness={0.8} />
        </Box>
        <Box args={[2.6, 0.12, 1.4]} position={[0, 2.8, -0.6]}>
          <meshStandardMaterial color="#222" roughness={0.9} />
        </Box>
        <Box args={[2.1, 0.12, 0.4]} position={[0, 0.52, -0.8]}>
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </Box>
        <Cylinder args={[0.04, 0.04, 3, 8]} position={[1.15, 1.5, 0]}>
          <meshStandardMaterial color="#777" roughness={0.5} metalness={0.3} />
        </Cylinder>
        <Box args={[0.55, 0.28, 0.06]} position={[1.15, 2.7, 0]}>
          <meshStandardMaterial color="#c0392b" roughness={0.8} />
        </Box>
      </group>

      {/* ── CARMEN ── */}
      <group position={[-5.5, 0, -2.3]}>
        <Box args={[0.44, 0.62, 0.26]} position={[0, 1.05, 0]}><meshStandardMaterial color="#b5351a" roughness={0.9} /></Box>
        <Box args={[0.32, 0.32, 0.28]} position={[0, 1.54, 0]}><meshStandardMaterial color="#c68642" roughness={0.8} /></Box>
        <Box args={[0.34, 0.22, 0.3]} position={[0, 1.74, -0.03]}><meshStandardMaterial color="#0d0600" roughness={1} /></Box>
        <Box args={[0.42, 0.52, 0.24]} position={[0, 0.6, 0]}><meshStandardMaterial color="#1a1a2e" roughness={0.95} /></Box>
        <Box args={[0.09, 0.15, 0.02]} position={[0.21, 1.12, 0.14]}><meshStandardMaterial color="#111" roughness={0.3} metalness={0.5} /></Box>
        <Text position={[0, 2.4, 0]} fontSize={0.2} color="#f48fb1" anchorX="center" outlineWidth={0.018} outlineColor="#000">
          Carmen — walk up
        </Text>
      </group>

      {/* ── PARKED / TRAFFIC CARS ── */}
      {[
        { x: -3.5, z: 5.5, col: '#c0392b' },
        { x: -1, z: 7, col: '#888' },
        { x: 2, z: 5, col: '#2980b9' },
        { x: 5, z: 7.5, col: '#f39c12' },
        { x: 8, z: 5.5, col: '#1abc9c' },
      ].map((c, i) => (
        <group key={i} position={[c.x, 0, c.z]}>
          <Box args={[2, 0.9, 4.2]} position={[0, 0.45, 0]}><meshStandardMaterial color={c.col} roughness={0.65} /></Box>
          <Box args={[1.8, 0.55, 2.5]} position={[0, 1.17, -0.2]}><meshStandardMaterial color={c.col} roughness={0.65} /></Box>
          <Box args={[1.6, 0.42, 0.08]} position={[0, 1.2, 0.95]}><meshStandardMaterial color="#2a3a4a" transparent opacity={0.65} roughness={0.08} /></Box>
          {([-0.9, 0.9] as number[]).flatMap(wx =>
            ([-0.7, 1.3] as number[]).map((wz, wi) => (
              <Cylinder key={`${wx}-${wi}`} args={[0.3, 0.3, 0.26, 10]} position={[wx, 0.28, wz]} rotation={[0, 0, Math.PI / 2]}>
                <meshStandardMaterial color="#111" roughness={0.9} />
              </Cylinder>
            ))
          )}
        </group>
      ))}

      {/* ── STREET LAMPS ── */}
      {[-9, -4, 4, 9].map((x, i) => (
        <group key={i} position={[x, 0, -9]}>
          <Cylinder args={[0.06, 0.09, 6.5, 8]} position={[0, 3.25, 0]}>
            <meshStandardMaterial color="#555" roughness={0.7} metalness={0.4} />
          </Cylinder>
          <Box args={[1.4, 0.1, 0.45]} position={[0.5, 6.5, 0]}>
            <meshStandardMaterial color="#444" roughness={0.7} metalness={0.4} />
          </Box>
          <Sphere args={[0.16, 8, 8]} position={[1.1, 6.44, 0]}>
            <meshStandardMaterial color="#fff9d0" emissive="#ffe880" emissiveIntensity={3} />
          </Sphere>
          <pointLight position={[x + 1.1, 6.2, -9]} intensity={2} color="#ffe8a0" distance={12} />
        </group>
      ))}

      {/* ── TREES ── */}
      {[[-11, -6], [11, -6], [-11, -11], [11, -11], [-11, 1], [11, 1]].map(([x, z], i) => (
        <group key={i} position={[x as number, 0, z as number]}>
          <Cylinder args={[0.13, 0.18, 2.4, 7]} position={[0, 1.2, 0]}>
            <meshStandardMaterial color="#3a2a1a" roughness={1} />
          </Cylinder>
          <Sphere args={[1.15, 7, 6]} position={[0, 2.95, 0]}>
            <meshStandardMaterial color="#182618" roughness={1} />
          </Sphere>
        </group>
      ))}

      <PlayerController posRef={posRef} rotRef={rotRef} keys={keys} onInteract={onInteract} />
    </>
  );
}

// ─── SCHOOL SCREEN ────────────────────────────────────────────────────────────
function SchoolScreen({ onEnd }: { onEnd: () => void }) {
  const posRef = useRef(new THREE.Vector3(0, 0, 6));
  const rotRef = useRef(Math.PI);
  const keys = useRef<Record<string, boolean>>({});
  const [dialogue, setDialogue] = useState<DialogueLine[] | null>(null);

  useEffect(() => {
    const dn = (e: KeyboardEvent) => { keys.current[e.key] = true; };
    const up = (e: KeyboardEvent) => { keys.current[e.key] = false; };
    window.addEventListener('keydown', dn);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', dn); window.removeEventListener('keyup', up); };
  }, []);

  const handleInteract = useCallback((id: string) => {
    if (id === 'carmen') setDialogue(CARMEN_DIALOGUE);
    if (id === 'school') onEnd();
  }, [onEnd]);

  return (
    <div className="w-screen h-screen relative overflow-hidden">
      {/* HUD top */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-2" style={{ background: 'rgba(0,0,0,0.58)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '15px', letterSpacing: '0.18em', color: 'rgba(210,210,210,0.65)' }}>DOPPELGANGER</div>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', letterSpacing: '0.12em', color: 'rgba(192,57,43,0.65)', textTransform: 'uppercase' }}>Chapter I · Monday, Sept 9, 2024 · 7:43 AM</div>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', color: 'rgba(180,180,180,0.28)', letterSpacing: '0.1em' }}>JAXTON WILSON</div>
      </div>

      {/* Infection status */}
      <div className="absolute z-20" style={{ top: '48px', left: '16px', background: 'rgba(0,0,0,0.52)', border: '1px solid rgba(255,255,255,0.06)', padding: '8px 12px' }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', letterSpacing: '0.15em', color: 'rgba(39,174,96,0.7)', textTransform: 'uppercase', marginBottom: '3px' }}>● Infection Status</div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '13px', color: 'rgba(200,200,200,0.55)' }}>Stage 0 — Clean</div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 right-4 z-20" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '0.1em', color: 'rgba(180,180,180,0.22)', textAlign: 'right', textTransform: 'uppercase', lineHeight: '1.9' }}>
        W / ↑ &nbsp;Forward<br />
        A / D &nbsp;Turn<br />
        S / ↓ &nbsp;Back
      </div>

      <Canvas camera={{ fov: 58, position: [0, 3.5, 10] }} style={{ background: '#0f1018' }}>
        <SchoolWorld posRef={posRef} rotRef={rotRef} keys={keys} onInteract={handleInteract} />
      </Canvas>

      {dialogue && <DialogueBox lines={dialogue} onDone={() => setDialogue(null)} />}
    </div>
  );
}

// ─── CUTSCENE ─────────────────────────────────────────────────────────────────
function CutsceneScreen({ onDone }: { onDone: () => void }) {
  return (
    <div className="w-screen h-screen relative overflow-hidden">
      <div className="absolute top-3 left-1/2 z-30 -translate-x-1/2" style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(180,180,180,0.3)', textTransform: 'uppercase' }}>
        Monday · Sept 9 · 7:41 AM · In the car
      </div>
      <button
        className="absolute top-3 right-4 z-30"
        style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(180,180,180,0.22)', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}
        onClick={onDone}
      >
        skip →
      </button>
      <Canvas camera={{ fov: 65, position: [0, 1.1, 1.6] }} style={{ background: '#070707' }}>
        <CarInterior />
      </Canvas>
      <DialogueBox lines={CAR_DIALOGUE} onDone={onDone} />
    </div>
  );
}

// ─── MAIN MENU ────────────────────────────────────────────────────────────────
function MainMenu({ onStart }: { onStart: () => void }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 300); }, []);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center text-center px-6 relative overflow-hidden" style={{ background: '#09090f', fontFamily: "'Barlow Condensed', sans-serif" }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 60%, rgba(192,57,43,0.07) 0%, transparent 55%), radial-gradient(ellipse at 70% 30%, rgba(30,50,80,0.12) 0%, transparent 55%)' }} />
      <div className="relative z-10 flex flex-col items-center gap-5">
        <div style={{ opacity: vis ? 1 : 0, transition: 'opacity 0.9s, transform 0.9s', transform: vis ? 'none' : 'translateY(10px)' }}>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '10px', letterSpacing: '0.35em', color: 'rgba(192,57,43,0.5)', textTransform: 'uppercase', marginBottom: '12px' }}>
            2024 &nbsp;·&nbsp; Chapter I
          </div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(52px, 10vw, 108px)', color: '#d8d8d8', letterSpacing: '0.07em', lineHeight: 1 }}>
            DOPPELGANGER
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: 'italic', fontSize: '14px', color: 'rgba(180,180,180,0.35)', letterSpacing: '0.12em', marginTop: '8px', textTransform: 'uppercase' }}>
            Something escaped from Morrow Lab
          </div>
        </div>

        <div style={{ opacity: vis ? 1 : 0, transition: 'opacity 1.2s 0.5s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onStart}
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '17px', letterSpacing: '0.28em', color: '#d8d8d8', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '11px 44px', cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(192,57,43,0.7)'; (e.currentTarget as HTMLElement).style.background = 'rgba(192,57,43,0.07)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            START CHAPTER I
          </button>
          <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(150,150,150,0.22)', textTransform: 'uppercase' }}>
            Playing as Jaxton Wilson · 7th Grade
          </div>
        </div>

        {/* Character bar */}
        <div style={{ display: 'flex', gap: '18px', opacity: vis ? 1 : 0, transition: 'opacity 1.5s 0.9s' }}>
          {[
            { name: 'JAX', col: '#888', active: true },
            { name: 'CARMEN', col: '#c68642', active: false },
            { name: 'KALEB', col: '#2a2a2a', active: false },
            { name: 'AIDEN', col: '#d4a574', active: false },
            { name: 'REAGAN', col: '#e8d0c0', active: false },
          ].map((ch) => (
            <div key={ch.name} style={{ textAlign: 'center', opacity: ch.active ? 1 : 0.28 }}>
              <div style={{ width: '38px', height: '38px', border: `1px solid ${ch.active ? 'rgba(192,57,43,0.6)' : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 5px', background: ch.active ? 'rgba(192,57,43,0.07)' : 'transparent' }}>
                <div style={{ width: '20px', height: '20px', background: ch.col, borderRadius: '2px' }} />
              </div>
              <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '8px', color: 'rgba(180,180,180,0.38)', letterSpacing: '0.1em' }}>{ch.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '20px', fontFamily: "'Barlow Condensed', sans-serif", fontStyle: 'italic', fontSize: '12px', color: 'rgba(150,150,150,0.18)', opacity: vis ? 1 : 0, transition: 'opacity 2s 1.2s' }}>
        "Clones want to feel real. That's what makes them dangerous."
      </div>
    </div>
  );
}

// ─── END CARD ─────────────────────────────────────────────────────────────────
function EndCard({ onRestart }: { onRestart: () => void }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 400); }, []);
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center text-center px-8" style={{ background: '#060608', fontFamily: "'Barlow Condensed', sans-serif" }}>
      <div style={{ opacity: vis ? 1 : 0, transition: 'opacity 1.5s' }}>
        <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: '9px', letterSpacing: '0.28em', color: 'rgba(192,57,43,0.45)', textTransform: 'uppercase', marginBottom: '14px' }}>End of Chapter I</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(40px, 8vw, 78px)', color: '#d8d8d8', letterSpacing: '0.06em', lineHeight: 1, marginBottom: '16px' }}>The Day It Began</div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: 'italic', fontSize: '15px', color: 'rgba(180,180,180,0.42)', maxWidth: '420px', lineHeight: '1.7', margin: '0 auto 30px' }}>
          Jax doesn't know it yet. But something from Morrow Lab is already much closer than he thinks.
        </div>
        <button
          onClick={onRestart}
          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '15px', letterSpacing: '0.25em', color: '#d8d8d8', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 36px', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(192,57,43,0.6)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function Index() {
  const [screen, setScreen] = useState<Screen>('menu');
  return (
    <>
      {screen === 'menu' && <MainMenu onStart={() => setScreen('cutscene')} />}
      {screen === 'cutscene' && <CutsceneScreen onDone={() => setScreen('school')} />}
      {screen === 'school' && <SchoolScreen onEnd={() => setScreen('end')} />}
      {screen === 'end' && <EndCard onRestart={() => setScreen('menu')} />}
    </>
  );
}
