// Main app — routes scenes, owns TweaksPanel.

const PALETTES = {
  cozy: { name: 'Cozy', bgWarm: '#FFE5B4', bgCool: '#F5D2A8', cushion: '#FFA8B8', window: '#A8D8EA', accent: '#FFD93D' },
  twilight: { name: 'Twilight', bgWarm: '#3A2E4D', bgCool: '#1F1A30', cushion: '#7A5A8E', window: '#5E7BB6', accent: '#FFD93D' },
  ghibli: { name: 'Ghibli', bgWarm: '#D9E8C4', bgCool: '#A8C9A8', cushion: '#F5B5A0', window: '#B5DDF0', accent: '#FFD93D' },
  candy: { name: 'Candy', bgWarm: '#FFD9F0', bgCool: '#E0C8F0', cushion: '#FFA8B8', window: '#B8E0F5', accent: '#FFB8E0' },
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "cozy",
  "heidiStyle": "realistic",
  "fastDecay": false
}/*EDITMODE-END*/;

function App() {
  const game = useGameState();
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [scene, setScene] = React.useState('hub'); // hub | apartment | overlay actions
  const [overlay, setOverlay] = React.useState(null); // pet | wash | brush | treat
  const [message, setMessage] = React.useState('');

  const palette = PALETTES[tweaks.palette] || PALETTES.cozy;

  const showMessage = React.useCallback((m) => {
    setMessage(m);
    setTimeout(() => setMessage(''), 2500);
  }, []);

  const handleAction = (id) => {
    if (id === 'play') { setScene('apartment'); return; }
    if (game.isOnCooldown(id)) {
      showMessage('Pas tout de suite ! ⏳');
      return;
    }
    setOverlay(id);
  };

  // Style override based on tweak (cel-shading vs minimal etc.)
  React.useEffect(() => {
    document.documentElement.style.setProperty('--accent', palette.accent);
    document.documentElement.style.setProperty('--cushion', palette.cushion);
  }, [palette]);

  // Heidi style: set global flag synchronously so all Heidi descendants pick it up this render
  window.__heidiStyle = tweaks.heidiStyle;
  window.__fastDecay = tweaks.fastDecay;

  const closeOverlay = () => setOverlay(null);

  return (
    <div className="app">
      {scene === 'hub' && (
        <HubScene state={game.state} onAction={handleAction} message={message} palette={palette} />
      )}
      {scene === 'apartment' && (
        <ApartmentMap
          gauges={game.state.gauges}
          onPick={(id) => setScene(id)}
          onBack={() => setScene('hub')}
        />
      )}
      {scene === 'laser' && (
        <LaserGame onEnd={() => { setScene('hub'); showMessage('Bien joué !'); }} adjust={game.adjust} />
      )}
      {scene === 'hideseek' && (
        <HideSeekGame onEnd={() => { setScene('hub'); showMessage('Cache-cache terminé !'); }} adjust={game.adjust} />
      )}
      {scene === 'feather' && (
        <FeatherGame onEnd={() => { setScene('hub'); showMessage('Plume attrapée !'); }} adjust={game.adjust} />
      )}

      {/* Action overlays (only over hub) */}
      {overlay === 'pet' && <PetAction onClose={closeOverlay} adjust={game.adjust} setCooldown={game.setCooldown} setMessage={showMessage} />}
      {overlay === 'wash' && <WashAction onClose={closeOverlay} adjust={game.adjust} setCooldown={game.setCooldown} setMessage={showMessage} />}
      {overlay === 'brush' && <BrushAction onClose={closeOverlay} adjust={game.adjust} setCooldown={game.setCooldown} setMessage={showMessage} affection={game.state.gauges.affection} />}
      {overlay === 'treat' && <TreatAction onClose={closeOverlay} adjust={game.adjust} setCooldown={game.setCooldown} setMessage={showMessage} hunger={game.state.gauges.hunger} />}
      {overlay === 'sleep' && <SleepAction onClose={closeOverlay} adjust={game.adjust} setMessage={showMessage} energy={game.state.gauges.energy} />}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Ambiance" />
        <TweakColor label="Palette" value={palette.accent}
          options={[
            ['#FFE5B4', '#FFA8B8', '#A8D8EA', '#FFD93D'],
            ['#3A2E4D', '#7A5A8E', '#5E7BB6', '#FFD93D'],
            ['#D9E8C4', '#F5B5A0', '#B5DDF0', '#A8C9A8'],
            ['#FFD9F0', '#FFA8B8', '#B8E0F5', '#FFB8E0'],
          ]}
          onChange={(arr) => {
            const key = arr[0] === '#3A2E4D' ? 'twilight' :
                        arr[0] === '#D9E8C4' ? 'ghibli' :
                        arr[0] === '#FFD9F0' ? 'candy' : 'cozy';
            setTweak('palette', key);
          }} />
        <TweakSection label="Style d'Heidi" />
        <TweakRadio label="Style" value={tweaks.heidiStyle}
          options={['realistic', 'detailed', 'minimal']}
          onChange={(v) => setTweak('heidiStyle', v)} />
        <TweakSection label="Démo" />
        <TweakToggle label="Décroissance rapide" value={tweaks.fastDecay}
          onChange={(v) => setTweak('fastDecay', v)} />
        <TweakButton label="↺ Reset Heidi" onClick={() => { game.resetGame(); showMessage('Partie réinitialisée'); }} />
      </TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
