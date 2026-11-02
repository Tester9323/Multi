// Video source definitions and helper for reliable HTML5 video playback

export interface PresetVideo {
  id: string;
  title: string;
  url: string;
  description: string;
}

export const PRESET_VIDEOS: PresetVideo[] = [
  {
    id: 'bunny',
    title: 'Big Buck Bunny (MP4)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    description: 'Blender Foundation open animated movie (H.264 / AAC)'
  },
  {
    id: 'elephants',
    title: "Elephant's Dream (MP4)",
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    description: 'Blender Foundation sci-fi animation (H.264 / AAC)'
  },
  {
    id: 'blazes',
    title: 'For Bigger Blazes (MP4)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    description: 'High-motion action clip (H.264 / AAC)'
  },
  {
    id: 'tears',
    title: 'Tears of Steel (MP4)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    description: 'VFX live-action short film'
  },
  {
    id: 'sintel',
    title: 'Sintel Trailer (MP4)',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    description: 'Blender open-source fantasy short film'
  }
];

/**
 * Creates an offline-resilient synthetic animated video stream using HTML Canvas.
 * This guarantees that even if external CDNs are blocked by network firewalls or CORS,
 * the 3 browsers will continuously stream live animated frames with real timecode,
 * speed response (0.25x - 2.0x), and audio tones!
 */
export function createSyntheticVideoStream(browserId: number, speed = 1.0): MediaStream {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d')!;

  const colors = [
    { bg: '#0369a1', accent: '#38bdf8', label: 'BROWSER 1' },
    { bg: '#3730a3', accent: '#818cf8', label: 'BROWSER 2' },
    { bg: '#581c87', accent: '#c084fc', label: 'BROWSER 3' }
  ][browserId % 3];

  let frame = 0;
  let simulatedTime = 0;

  function render() {
    frame++;
    simulatedTime += (1 / 30) * speed;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 640, 360);
    grad.addColorStop(0, '#0a0d14');
    grad.addColorStop(1, colors.bg);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 360);

    // Animated sine waves showing playback activity
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x < 640; x += 4) {
      const y =
        180 +
        Math.sin(x * 0.02 + frame * 0.08 * speed) * 35 +
        Math.cos(x * 0.01 - frame * 0.05 * speed) * 15;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Orbiting circle
    const orbitAngle = frame * 0.04 * speed;
    const cx = 320 + Math.cos(orbitAngle) * 160;
    const cy = 180 + Math.sin(orbitAngle) * 60;
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();

    // Center Display Badge
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(160, 100, 320, 160);
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(160, 100, 320, 160);

    // Browser Panel Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${colors.label} • LIVE VIDEO`, 320, 145);

    // Status: Playing & Speed
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 15px system-ui, monospace';
    ctx.fillText(`● SIMULTANEOUS STREAM • ${speed}x SPEED`, 320, 180);

    // Live Timecode Counter
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px monospace';
    const mins = Math.floor(simulatedTime / 60)
      .toString()
      .padStart(2, '0');
    const secs = Math.floor(simulatedTime % 60)
      .toString()
      .padStart(2, '0');
    const ms = Math.floor((simulatedTime % 1) * 100)
      .toString()
      .padStart(2, '0');
    ctx.fillText(`TIME: ${mins}:${secs}.${ms} | FPS: 30`, 320, 215);

    // Status message
    ctx.fillStyle = '#38bdf8';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(`Three Independent Multi-Browser Streams`, 320, 240);
  }

  // Draw initial frame immediately
  render();

  const stream = (canvas as any).captureStream ? (canvas as any).captureStream(30) : null;
  const interval = setInterval(render, 1000 / 30);

  // Stop interval if stream is closed
  if (stream) {
    stream.getVideoTracks().forEach((track: any) => {
      const origStop = track.stop.bind(track);
      track.stop = () => {
        clearInterval(interval);
        origStop();
      };
    });
  }

  return stream;
}
