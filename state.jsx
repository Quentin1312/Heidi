// Global game state: gauges, mood derivation, persistence, cooldowns.
// Stored in localStorage; ticks every second.

const GAUGE_DEFS = [
  { key: 'energy',    label: 'Énergie',    icon: '🌙', color: '#FFD93D', decay: 0.5 / 60 },
  { key: 'hunger',    label: 'Faim',       icon: '🍽️', color: '#FF8A6B', decay: 0.3 / 60 },
  { key: 'boredom',   label: 'Ennui',      icon: '🎮', color: '#95E1D3', decay: 0.4 / 60 },
  { key: 'affection', label: 'Affection',  icon: '💕', color: '#FFA8B8', decay: 0.2 / 60 },
  { key: 'curiosity', label: 'Curiosité',  icon: '👁️', color: '#A8D8EA', decay: 0.3 / 60 },
];

const STORAGE_KEY = 'heidi-sim-v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    // apply offline decay
    const now = Date.now();
    const elapsedSec = Math.min((now - (s.lastSeen || now)) / 1000, 60 * 60 * 24);
    for (const g of GAUGE_DEFS) {
      s.gauges[g.key] = Math.max(0, (s.gauges[g.key] ?? 80) - g.decay * elapsedSec);
    }
    s.lastSeen = now;
    return s;
  } catch (e) { return null; }
}

function defaultState() {
  return {
    gauges: { energy: 85, hunger: 75, boredom: 70, affection: 80, curiosity: 65 },
    cooldowns: {},
    achievements: [],
    visits: 1,
    lastSeen: Date.now(),
  };
}

function useGameState() {
  const [state, setState] = React.useState(() => loadState() || defaultState());
  const stateRef = React.useRef(state);
  stateRef.current = state;

  // tick every second
  React.useEffect(() => {
    const id = setInterval(() => {
      setState((s) => {
        const next = { ...s, gauges: { ...s.gauges }, lastSeen: Date.now() };
        const mult = window.__fastDecay ? 30 : 1;
        for (const g of GAUGE_DEFS) {
          next.gauges[g.key] = Math.max(0, s.gauges[g.key] - g.decay * mult);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // persist
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const adjust = React.useCallback((delta) => {
    setState((s) => {
      const g = { ...s.gauges };
      for (const k in delta) g[k] = Math.max(0, Math.min(100, (g[k] || 0) + delta[k]));
      return { ...s, gauges: g };
    });
  }, []);

  const setCooldown = React.useCallback((action, durationMs) => {
    setState((s) => ({ ...s, cooldowns: { ...s.cooldowns, [action]: Date.now() + durationMs } }));
  }, []);

  const isOnCooldown = React.useCallback((action) => {
    return (stateRef.current.cooldowns[action] || 0) > Date.now();
  }, []);

  const resetGame = React.useCallback(() => setState(defaultState()), []);

  return { state, adjust, setCooldown, isOnCooldown, resetGame };
}

// Derive Heidi's mood from gauges
function deriveMood(gauges) {
  const vals = Object.values(gauges);
  const min = Math.min(...vals);
  if (min < 10) return 'sad';
  if (gauges.energy < 20) return 'sleepy';
  if (min < 30) return 'grumpy';
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  if (avg > 80 && gauges.affection > 70) return 'love';
  if (avg > 75) return 'happy';
  if (gauges.boredom > 80 && gauges.curiosity > 75) return 'excited';
  return 'neutral';
}

window.GAUGE_DEFS = GAUGE_DEFS;
window.useGameState = useGameState;
window.deriveMood = deriveMood;
