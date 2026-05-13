// Heidi sprite — cel-shaded SVG with mood + pose variants.
// Cel-shading: thick black outlines, flat fills, subtle highlight overlays.
// Mood: 'happy' | 'neutral' | 'sleepy' | 'excited' | 'sad' | 'grumpy' | 'love'
// Pose: 'sit' | 'lay' | 'crouch' | 'jump' | 'roll'
// Style: 'detailed' | 'kawaii' | 'minimal'

function HeidiEye({ cx, cy, r, mood, eyeColor, look }) {
  // look: {x, y} offset for pupil tracking, -1..1
  const lx = (look?.x || 0) * (r * 0.35);
  const ly = (look?.y || 0) * (r * 0.35);

  if (mood === 'sleepy') {
    return (
      <path d={`M ${cx - r} ${cy} Q ${cx} ${cy + r * 0.4} ${cx + r} ${cy}`}
        stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    );
  }
  if (mood === 'happy' || mood === 'love') {
    return (
      <path d={`M ${cx - r} ${cy + r * 0.2} Q ${cx} ${cy - r * 0.5} ${cx + r} ${cy + r * 0.2}`}
        stroke="#1a1a1a" strokeWidth="2.8" fill="none" strokeLinecap="round" />
    );
  }
  if (mood === 'grumpy') {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.55} fill={eyeColor} stroke="#1a1a1a" strokeWidth="2.5" />
        <ellipse cx={cx + lx} cy={cy + ly} rx={r * 0.25} ry={r * 0.45} fill="#1a1a1a" />
        <path d={`M ${cx - r * 1.1} ${cy - r * 0.7} L ${cx + r * 0.2} ${cy - r * 0.2}`}
          stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
      </g>
    );
  }
  if (mood === 'sad') {
    return (
      <g>
        <ellipse cx={cx} cy={cy} rx={r * 0.85} ry={r * 0.85} fill={eyeColor} stroke="#1a1a1a" strokeWidth="2.5" />
        <ellipse cx={cx + lx} cy={cy + r * 0.2} rx={r * 0.35} ry={r * 0.5} fill="#1a1a1a" />
        <circle cx={cx + lx + r * 0.2} cy={cy + r * 0.1} r={r * 0.18} fill="#fff" />
      </g>
    );
  }
  // neutral / excited
  const rr = mood === 'excited' ? r * 1.08 : r;
  return (
    <g>
      <circle cx={cx} cy={cy} r={rr} fill={eyeColor} stroke="#1a1a1a" strokeWidth="2.8" />
      <ellipse cx={cx + lx} cy={cy + ly} rx={rr * 0.32} ry={rr * 0.55} fill="#1a1a1a" />
      <circle cx={cx + lx + rr * 0.22} cy={cy + ly - rr * 0.25} r={rr * 0.18} fill="#fff" />
      <circle cx={cx + lx - rr * 0.15} cy={cy + ly + rr * 0.3} r={rr * 0.08} fill="#fff" opacity="0.7" />
    </g>
  );
}

function HeidiMouth({ cx, cy, mood }) {
  if (mood === 'sleepy') return null;
  if (mood === 'happy' || mood === 'love') {
    return (
      <g>
        <path d={`M ${cx - 8} ${cy} Q ${cx - 4} ${cy + 5} ${cx} ${cy}`}
          stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <path d={`M ${cx} ${cy} Q ${cx + 4} ${cy + 5} ${cx + 8} ${cy}`}
          stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        {mood === 'love' && (
          <path d={`M ${cx - 3} ${cy + 2} Q ${cx} ${cy + 8} ${cx + 3} ${cy + 2} Q ${cx + 5} ${cy + 5} ${cx} ${cy + 10} Q ${cx - 5} ${cy + 5} ${cx - 3} ${cy + 2}`}
            fill="#FFA8B8" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.9" />
        )}
      </g>
    );
  }
  if (mood === 'grumpy') {
    return (
      <path d={`M ${cx - 7} ${cy + 3} Q ${cx} ${cy - 2} ${cx + 7} ${cy + 3}`}
        stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    );
  }
  if (mood === 'sad') {
    return (
      <path d={`M ${cx - 6} ${cy + 4} Q ${cx} ${cy - 2} ${cx + 6} ${cy + 4}`}
        stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    );
  }
  // neutral / excited
  return (
    <g>
      <path d={`M ${cx - 7} ${cy} Q ${cx - 3.5} ${cy + 4} ${cx} ${cy}`}
        stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d={`M ${cx} ${cy} Q ${cx + 3.5} ${cy + 4} ${cx + 7} ${cy}`}
        stroke="#1a1a1a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {mood === 'excited' && (
        <ellipse cx={cx} cy={cy + 5} rx="3" ry="2.5" fill="#FFA8B8" stroke="#1a1a1a" strokeWidth="1.5" />
      )}
    </g>
  );
}

// Sit-pose silhouette path. Fluffy black body with big head.
function HeidiSit({ style, fur, furHi, mood }) {
  const purple = style === 'minimal';
  const k = style === 'kawaii';

  return (
    <g>
      {/* Tail — fluffy curve behind */}
      <path d="M 75 175 Q 35 165 30 130 Q 28 100 45 95 Q 60 92 65 110"
        fill={fur} stroke="#1a1a1a" strokeWidth={k ? 3 : 3.5} strokeLinejoin="round" strokeLinecap="round" />
      <path d="M 45 95 Q 35 92 32 105" stroke={furHi} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />

      {/* Body — pear-shaped fluffy mound */}
      <path d={
        k
          ? "M 95 110 Q 55 115 55 175 Q 55 220 110 220 Q 165 220 165 175 Q 165 115 125 110 Z"
          : "M 95 105 Q 50 110 48 160 Q 44 195 60 215 Q 80 230 110 228 Q 145 228 160 215 Q 178 195 172 160 Q 168 115 125 105 Z"
      }
        fill={fur} stroke="#1a1a1a" strokeWidth="3.5" strokeLinejoin="round" />
      {/* Fluffy chest highlight */}
      <path d="M 95 145 Q 88 160 92 185 Q 100 200 110 200 Q 122 200 128 185 Q 132 165 125 148"
        fill={furHi} opacity="0.35" />

      {/* Front paws */}
      <ellipse cx="85" cy="222" rx="14" ry="8" fill={fur} stroke="#1a1a1a" strokeWidth="3" />
      <ellipse cx="135" cy="222" rx="14" ry="8" fill={fur} stroke="#1a1a1a" strokeWidth="3" />
      {/* Toe beans */}
      <ellipse cx="80" cy="224" rx="2" ry="1.5" fill="#FFA8B8" opacity="0.7" />
      <ellipse cx="86" cy="225" rx="2" ry="1.5" fill="#FFA8B8" opacity="0.7" />
      <ellipse cx="92" cy="224" rx="2" ry="1.5" fill="#FFA8B8" opacity="0.7" />
      <ellipse cx="130" cy="224" rx="2" ry="1.5" fill="#FFA8B8" opacity="0.7" />
      <ellipse cx="136" cy="225" rx="2" ry="1.5" fill="#FFA8B8" opacity="0.7" />
      <ellipse cx="142" cy="224" rx="2" ry="1.5" fill="#FFA8B8" opacity="0.7" />

      {/* Head */}
      <HeidiHead style={style} fur={fur} furHi={furHi} mood={mood} cx={110} cy={75} />
    </g>
  );
}

function HeidiHead({ style, fur, furHi, mood, cx, cy, look }) {
  const k = style === 'kawaii';
  const earTilt = mood === 'sad' ? -8 : mood === 'grumpy' ? -15 : 0;

  return (
    <g>
      {/* Left ear */}
      <g transform={`rotate(${earTilt} ${cx - 30} ${cy - 20})`}>
        <path d={`M ${cx - 40} ${cy - 5} L ${cx - 32} ${cy - 50} L ${cx - 18} ${cy - 18} Z`}
          fill={fur} stroke="#1a1a1a" strokeWidth="3.2" strokeLinejoin="round" />
        <path d={`M ${cx - 35} ${cy - 12} L ${cx - 30} ${cy - 40} L ${cx - 23} ${cy - 18} Z`}
          fill="#FFA8B8" opacity="0.85" />
      </g>
      {/* Right ear */}
      <g transform={`rotate(${-earTilt} ${cx + 30} ${cy - 20})`}>
        <path d={`M ${cx + 40} ${cy - 5} L ${cx + 32} ${cy - 50} L ${cx + 18} ${cy - 18} Z`}
          fill={fur} stroke="#1a1a1a" strokeWidth="3.2" strokeLinejoin="round" />
        <path d={`M ${cx + 35} ${cy - 12} L ${cx + 30} ${cy - 40} L ${cx + 23} ${cy - 18} Z`}
          fill="#FFA8B8" opacity="0.85" />
      </g>

      {/* Head shape */}
      <ellipse cx={cx} cy={cy} rx={k ? 42 : 45} ry={k ? 40 : 42}
        fill={fur} stroke="#1a1a1a" strokeWidth="3.5" />
      {/* Cheek fluff */}
      {!k && (
        <>
          <path d={`M ${cx - 40} ${cy + 10} Q ${cx - 50} ${cy + 18} ${cx - 38} ${cy + 25}`}
            fill={fur} stroke="#1a1a1a" strokeWidth="3" strokeLinejoin="round" />
          <path d={`M ${cx + 40} ${cy + 10} Q ${cx + 50} ${cy + 18} ${cx + 38} ${cy + 25}`}
            fill={fur} stroke="#1a1a1a" strokeWidth="3" strokeLinejoin="round" />
        </>
      )}
      {/* Top fur highlight */}
      <path d={`M ${cx - 25} ${cy - 30} Q ${cx} ${cy - 38} ${cx + 25} ${cy - 30}`}
        stroke={furHi} strokeWidth="3" fill="none" opacity="0.4" strokeLinecap="round" />

      {/* Eyes */}
      <HeidiEye cx={cx - 16} cy={cy - 3} r={9} mood={mood} eyeColor="#FFD93D" look={look} />
      <HeidiEye cx={cx + 16} cy={cy - 3} r={9} mood={mood} eyeColor="#FFD93D" look={look} />

      {/* Nose */}
      <path d={`M ${cx - 4} ${cy + 12} L ${cx + 4} ${cy + 12} L ${cx} ${cy + 17} Z`}
        fill="#FFA8B8" stroke="#1a1a1a" strokeWidth="2" strokeLinejoin="round" />

      {/* Mouth */}
      <HeidiMouth cx={cx} cy={cy + 22} mood={mood} />

      {/* Whiskers */}
      <g stroke="#1a1a1a" strokeWidth="1.4" strokeLinecap="round" opacity="0.85">
        <line x1={cx - 18} y1={cy + 18} x2={cx - 40} y2={cy + 16} />
        <line x1={cx - 18} y1={cy + 22} x2={cx - 42} y2={cy + 24} />
        <line x1={cx + 18} y1={cy + 18} x2={cx + 40} y2={cy + 16} />
        <line x1={cx + 18} y1={cy + 22} x2={cx + 42} y2={cy + 24} />
      </g>
    </g>
  );
}

// Lay pose: heidi curled up in a ball
function HeidiLay({ style, fur, furHi, mood }) {
  return (
    <g>
      {/* curled body — big oval */}
      <ellipse cx="110" cy="180" rx="90" ry="55" fill={fur} stroke="#1a1a1a" strokeWidth="3.5" />
      {/* tail wrapping around */}
      <path d="M 175 175 Q 200 165 195 140 Q 188 120 165 130"
        fill={fur} stroke="#1a1a1a" strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M 165 130 Q 155 135 155 150" stroke="#1a1a1a" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      {/* belly highlight */}
      <ellipse cx="100" cy="195" rx="55" ry="25" fill={furHi} opacity="0.3" />
      {/* tucked paws hint */}
      <ellipse cx="60" cy="200" rx="10" ry="6" fill="#1a1a1a" />
      {/* head resting */}
      <HeidiHead style={style} fur={fur} furHi={furHi} mood={mood} cx={70} cy={150} />
    </g>
  );
}

// Crouch pose: hunting stance, low body
function HeidiCrouch({ style, fur, furHi, mood, look }) {
  return (
    <g>
      <path d="M 60 195 Q 50 200 50 215 L 175 215 Q 180 200 165 195 Q 165 165 130 158 Q 95 158 60 175 Z"
        fill={fur} stroke="#1a1a1a" strokeWidth="3.5" strokeLinejoin="round" />
      {/* tail straight back */}
      <path d="M 170 200 Q 215 198 220 180 Q 222 165 210 168"
        fill={fur} stroke="#1a1a1a" strokeWidth="3.2" strokeLinejoin="round" />
      {/* paws */}
      <ellipse cx="70" cy="218" rx="10" ry="5" fill={fur} stroke="#1a1a1a" strokeWidth="2.5" />
      <ellipse cx="155" cy="218" rx="10" ry="5" fill={fur} stroke="#1a1a1a" strokeWidth="2.5" />
      <HeidiHead style={style} fur={fur} furHi={furHi} mood={mood} cx={70} cy={140} look={look} />
    </g>
  );
}

// Jump pose: airborne, paws forward
function HeidiJump({ style, fur, furHi, mood }) {
  return (
    <g transform="rotate(-12 110 130)">
      <path d="M 55 130 Q 45 110 65 95 Q 100 80 145 90 Q 180 100 180 130 Q 180 160 145 165 Q 95 168 65 158 Q 50 150 55 130 Z"
        fill={fur} stroke="#1a1a1a" strokeWidth="3.5" strokeLinejoin="round" />
      {/* tail flying back */}
      <path d="M 175 130 Q 220 110 225 85 Q 220 70 200 80"
        fill={fur} stroke="#1a1a1a" strokeWidth="3.2" strokeLinejoin="round" />
      {/* paws forward */}
      <ellipse cx="55" cy="135" rx="14" ry="7" fill={fur} stroke="#1a1a1a" strokeWidth="3" transform="rotate(-30 55 135)" />
      <ellipse cx="60" cy="115" rx="13" ry="7" fill={fur} stroke="#1a1a1a" strokeWidth="3" transform="rotate(-45 60 115)" />
      <HeidiHead style={style} fur={fur} furHi={furHi} mood={mood} cx={75} cy={105} />
    </g>
  );
}

// Roll pose: belly up, playful
function HeidiRoll({ style, fur, furHi, mood }) {
  return (
    <g>
      <ellipse cx="110" cy="190" rx="85" ry="40" fill={fur} stroke="#1a1a1a" strokeWidth="3.5" />
      {/* exposed belly highlight */}
      <ellipse cx="110" cy="180" rx="55" ry="22" fill={furHi} opacity="0.4" />
      {/* paws up */}
      <ellipse cx="80" cy="155" rx="9" ry="14" fill={fur} stroke="#1a1a1a" strokeWidth="3" />
      <ellipse cx="100" cy="150" rx="9" ry="14" fill={fur} stroke="#1a1a1a" strokeWidth="3" />
      <ellipse cx="140" cy="155" rx="9" ry="14" fill={fur} stroke="#1a1a1a" strokeWidth="3" />
      <ellipse cx="160" cy="160" rx="9" ry="14" fill={fur} stroke="#1a1a1a" strokeWidth="3" />
      {/* paw pads */}
      <ellipse cx="80" cy="143" rx="3" ry="2" fill="#FFA8B8" />
      <ellipse cx="100" cy="138" rx="3" ry="2" fill="#FFA8B8" />
      <ellipse cx="140" cy="143" rx="3" ry="2" fill="#FFA8B8" />
      <ellipse cx="160" cy="148" rx="3" ry="2" fill="#FFA8B8" />
      {/* tail */}
      <path d="M 195 185 Q 225 170 220 145" fill={fur} stroke="#1a1a1a" strokeWidth="3.2" strokeLinejoin="round" />
      <HeidiHead style={style} fur={fur} furHi={furHi} mood={mood} cx={45} cy={185} />
    </g>
  );
}

function Heidi({ mood = 'neutral', pose = 'sit', style, look, scale = 1, breathing = true, ...rest }) {
  style = style || (typeof window !== 'undefined' && window.__heidiStyle) || 'realistic';

  // Realistic style: front-facing sit only (use cartoon for other poses)
  if (style === 'realistic' && (pose === 'sit' || pose === 'roll')) {
    return <HeidiRealistic mood={mood} look={look} scale={scale} breathing={breathing}
      tongueOut={mood === 'excited' || mood === 'love'} {...rest} />;
  }

  const fur = style === 'minimal' ? '#2C2C2C' : '#1a1a1a';
  const furHi = '#5a6a8a';
  const Pose = {
    sit: HeidiSit, lay: HeidiLay, crouch: HeidiCrouch, jump: HeidiJump, roll: HeidiRoll,
  }[pose] || HeidiSit;

  return (
    <svg viewBox="0 0 220 240" width={220 * scale} height={240 * scale}
      className={breathing ? 'heidi-breathing' : ''}
      style={{ overflow: 'visible' }}>
      {/* soft ground shadow */}
      <ellipse cx="110" cy="232" rx="80" ry="8" fill="rgba(0,0,0,0.18)" />
      <Pose style={style} fur={fur} furHi={furHi} mood={mood} look={look} />
    </svg>
  );
}

window.Heidi = Heidi;
window.HeidiHead = HeidiHead;
