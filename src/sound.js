// Original, synthesized archive cues. No recordings, music beds or network requests.
const SILENCE = 0.0001;

function envelope(context, destination, at, attack, duration, level) {
  const gain = context.createGain();
  gain.gain.setValueAtTime(SILENCE, at);
  gain.gain.exponentialRampToValueAtTime(level, at + attack);
  gain.gain.exponentialRampToValueAtTime(SILENCE, at + duration);
  gain.connect(destination);
  return gain;
}

/** Also accepts OfflineAudioContext so the actual cues can be rendered and checked. */
export function renderCue(context, destination, type = 'travel', pan = 0, noiseBuffer) {
  const at = context.currentTime + 0.004;
  const output = context.createGain();
  const panner = context.createStereoPanner?.();
  if (panner) {
    panner.pan.value = Math.max(-0.5, Math.min(0.5, pan));
    output.connect(panner); panner.connect(destination);
  } else output.connect(destination);
  const sources = [], nodes = [output, ...(panner ? [panner] : [])];
  let duration = 0.2;
  function tone(frequency, delay, length, volume, endFrequency = frequency, wave = 'sine') {
    const start = at + delay, oscillator = context.createOscillator();
    const gain = envelope(context, output, start, 0.008, length, volume);
    oscillator.type = wave;
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + length);
    oscillator.connect(gain); oscillator.start(start); oscillator.stop(start + length + 0.015);
    sources.push(oscillator); nodes.push(gain); duration = Math.max(duration, delay + length + 0.02);
  }
  function air(length, volume, from, to) {
    if (!noiseBuffer) return;
    const source = context.createBufferSource(), filter = context.createBiquadFilter();
    const gain = envelope(context, output, at, length * 0.2, length, volume);
    source.buffer = noiseBuffer; filter.type = 'bandpass'; filter.Q.value = 0.65;
    filter.frequency.setValueAtTime(from, at);
    filter.frequency.exponentialRampToValueAtTime(to, at + length);
    source.connect(filter); filter.connect(gain); source.start(at); source.stop(at + length);
    sources.push(source); nodes.push(filter, gain); duration = Math.max(duration, length + 0.02);
  }
  if (type === 'hover') {
    tone(1120, 0, 0.075, 0.014, 860);
    tone(320, 0, 0.085, 0.009, 240);
  } else if (type === 'open') {
    air(0.46, 0.075, 650, 2100);
    tone(196, 0, 0.42, 0.038, 202);
    tone(392, 0.045, 0.5, 0.027);
    tone(587.33, 0.095, 0.6, 0.018);
    tone(1174.66, 0.11, 0.44, 0.006);
  } else if (type === 'close') {
    air(0.28, 0.055, 1800, 420);
    tone(392, 0, 0.24, 0.024, 196);
    tone(147, 0.035, 0.29, 0.027, 130.81);
  } else if (type === 'confirm') {
    tone(523.25, 0, 0.14, 0.027);
    tone(783.99, 0.065, 0.24, 0.022);
  } else {
    air(0.34, 0.105, 540, 1700);
    tone(164.81, 0, 0.32, 0.032, 130.81);
    tone(329.63, 0.025, 0.24, 0.012, 261.63);
  }
  let stopped = false;
  return {
    duration,
    stop() {
      if (stopped) return; stopped = true;
      sources.forEach(source => { try { source.stop(); } catch {} source.disconnect(); });
      nodes.forEach(node => node.disconnect());
    },
  };
}

export function makeAirBuffer(context) {
  const buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
  const data = buffer.getChannelData(0);
  let seed = 93471, previous = 0;
  for (let i = 0; i < data.length; i++) {
    seed = (seed * 16807) % 2147483647;
    previous = (previous + 0.035 * (seed / 1073741823.5 - 1)) / 1.035;
    data[i] = previous * 7;
  }
  return buffer;
}

export function createSoundscape({ onCue, onError } = {}) {
  let enabled = false, context, master, noise, destroyed = false, lastHover = 0, lastTravel = 0;
  const voices = new Set(), timers = new Set();
  const mediaPlaying = () => [...document.querySelectorAll('audio,video')].some(el => !el.paused && !el.ended);
  function silence() {
    timers.forEach(clearTimeout); timers.clear();
    voices.forEach(voice => voice.stop()); voices.clear();
  }
  function initialize() {
    if (context) return;
    context = new (window.AudioContext || window.webkitAudioContext)();
    master = context.createGain(); master.gain.value = 0.72;
    const limiter = context.createDynamicsCompressor();
    limiter.threshold.value = -18; limiter.knee.value = 10; limiter.ratio.value = 5;
    limiter.attack.value = 0.004; limiter.release.value = 0.16;
    master.connect(limiter); limiter.connect(context.destination);
    noise = makeAirBuffer(context);
  }
  function play(type = 'travel', pan = 0) {
    if (!enabled || destroyed || document.hidden || mediaPlaying()) return false;
    const now = performance.now();
    if (type === 'hover' && now - lastHover < 210 || type === 'travel' && now - lastTravel < 130) return false;
    if (type === 'hover') lastHover = now;
    if (type === 'travel') lastTravel = now;
    try {
      initialize();
      if (context.state === 'suspended') context.resume().catch(() => {});
      if (voices.size >= 6) { const first = voices.values().next().value; first.stop(); voices.delete(first); }
      const voice = renderCue(context, master, type, pan, noise); voices.add(voice);
      const timer = setTimeout(() => { voice.stop(); voices.delete(voice); timers.delete(timer); }, (voice.duration + 0.08) * 1000);
      timers.add(timer); onCue?.(type);
      return true;
    } catch { enabled = false; silence(); onError?.(); return false; }
  }
  function visibility() { if (document.hidden) { silence(); context?.suspend().catch(() => {}); } }
  function mediaStart(event) { if (event.target.matches?.('audio,video')) silence(); }
  document.addEventListener('visibilitychange', visibility);
  document.addEventListener('play', mediaStart, true);
  return {
    play,
    setEnabled(value) { enabled = Boolean(value); if (!enabled) { silence(); context?.suspend().catch(() => {}); } },
    destroy() {
      destroyed = true; silence();
      document.removeEventListener('visibilitychange', visibility);
      document.removeEventListener('play', mediaStart, true);
      context?.close().catch(() => {});
    },
  };
}
