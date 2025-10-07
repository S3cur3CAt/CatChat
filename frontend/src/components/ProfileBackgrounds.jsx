// 1. Floating Particles - Partículas flotantes
export const FloatingParticlesBackground = () => {
  // Usar posiciones determinísticas para evitar cambios bruscos
  const particles = Array.from({ length: 50 }, (_, i) => {
    // Usar índice fijo para generar posiciones consistentes
    const seed = i * 0.618033988749; // Constante áurea para buena distribución
    const size = (Math.sin(seed * 7.7) * 0.5 + 0.5) * 5 + 2;
    const left = (Math.sin(seed * 3.1) * 0.5 + 0.5) * 100;
    const top = (Math.cos(seed * 4.2) * 0.5 + 0.5) * 100;
    const duration = (Math.sin(seed * 5.3) * 0.5 + 0.5) * 8 + 12;
    const delay = (Math.cos(seed * 2.1) * 0.5 + 0.5) * 8;
    const opacity = (Math.sin(seed * 6.4) * 0.5 + 0.5) * 0.5 + 0.4;

    return { size, left, top, duration, delay, opacity };
  });

  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-cyan-400"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            opacity: p.opacity,
            animation: `floatSmooth ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            boxShadow: '0 0 15px rgba(34, 211, 238, 0.8), 0 0 30px rgba(34, 211, 238, 0.4)',
            filter: 'blur(0.5px)',
          }}
        />
      ))}
    </div>
  );
};

// 2. Matrix Rain - Lluvia Matrix
export const MatrixRainBackground = () => {
  const columns = 12;
  const drops = Array.from({ length: columns }, (_, i) => ({
    left: (i / columns) * 100,
    duration: (Math.sin(i * 0.618) * 0.5 + 0.5) * 2 + 3,
    delay: (Math.cos(i * 0.618) * 0.5 + 0.5) * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl bg-black">
      {drops.map((d, i) => (
        <div
          key={i}
          className="absolute top-0 w-1"
          style={{
            left: `${d.left}%`,
            height: '100%',
          }}
        >
          {Array.from({ length: 8 }, (_, j) => (
            <div
              key={j}
              className="absolute w-1 h-3 bg-green-400"
              style={{
                top: `${j * 15}%`,
                opacity: 1 - j * 0.12,
                animation: `slideDown ${d.duration}s linear infinite`,
                animationDelay: `${j * 0.3 + d.delay}s`,
                boxShadow: '0 0 8px rgba(34, 197, 94, 0.8)',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// 3. Fireflies - Luciérnagas
export const FirefliesBackground = () => {
  const fireflies = Array.from({ length: 35 }, (_, i) => {
    const seed = i * 0.618033988749;
    return {
      size: (Math.sin(seed * 7.7) * 0.5 + 0.5) * 4 + 2,
      left: (Math.sin(seed * 3.1) * 0.5 + 0.5) * 100,
      top: (Math.cos(seed * 4.2) * 0.5 + 0.5) * 100,
      duration: (Math.sin(seed * 5.3) * 0.5 + 0.5) * 2 + 2,
      driftDuration: (Math.cos(seed * 2.1) * 0.5 + 0.5) * 15 + 20,
      delay: (Math.sin(seed * 6.4) * 0.5 + 0.5) * 4,
    };
  });

  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-b from-indigo-950 via-purple-950 to-indigo-950">
      {fireflies.map((f, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            animation: `drift ${f.driftDuration}s ease-in-out infinite`,
            animationDelay: `${f.delay}s`,
          }}
        >
          <div
            className="rounded-full bg-yellow-300"
            style={{
              width: `${f.size}px`,
              height: `${f.size}px`,
              animation: `gentlePulse ${f.duration}s ease-in-out infinite`,
              boxShadow: '0 0 20px rgba(253, 224, 71, 1), 0 0 40px rgba(253, 224, 71, 0.6)',
            }}
          />
        </div>
      ))}
    </div>
  );
};

// 4. Snow Particles - Partículas de nieve
export const SnowParticlesBackground = () => {
  const snowflakes = Array.from({ length: 60 }, (_, i) => {
    const seed = i * 0.618033988749;
    return {
      size: (Math.sin(seed * 7.7) * 0.5 + 0.5) * 5 + 2,
      left: (Math.sin(seed * 3.1) * 0.5 + 0.5) * 100,
      duration: (Math.sin(seed * 5.3) * 0.5 + 0.5) * 8 + 12,
      delay: (Math.cos(seed * 2.1) * 0.5 + 0.5) * 10,
      blur: (Math.sin(seed * 4.2) * 0.5 + 0.5) * 2,
    };
  });

  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {snowflakes.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: `${s.size}px`,
            height: `${s.size}px`,
            left: `${s.left}%`,
            top: '-10%',
            animation: `fall ${s.duration}s ease-in infinite`,
            animationDelay: `${s.delay}s`,
            opacity: 0.9,
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)',
            filter: `blur(${s.blur}px)`,
          }}
        />
      ))}
    </div>
  );
};

// 5. Bubbles Rising - Burbujas ascendentes
export const BubblesRisingBackground = () => {
  const bubbles = Array.from({ length: 30 }, (_, i) => {
    const seed = i * 0.618033988749;
    return {
      size: (Math.sin(seed * 7.7) * 0.5 + 0.5) * 25 + 10,
      left: (Math.sin(seed * 3.1) * 0.5 + 0.5) * 100,
      duration: (Math.sin(seed * 5.3) * 0.5 + 0.5) * 8 + 12,
      delay: (Math.cos(seed * 2.1) * 0.5 + 0.5) * 5,
    };
  });

  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl bg-blue-950">
      {bubbles.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full border-2 border-cyan-300/40"
          style={{
            width: `${b.size}px`,
            height: `${b.size}px`,
            left: `${b.left}%`,
            bottom: '-10%',
            animation: `rise ${b.duration}s ease-in infinite`,
            animationDelay: `${b.delay}s`,
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), transparent)',
          }}
        />
      ))}
    </div>
  );
};

// 6. Digital Rain - Lluvia digital
export const DigitalRainBackground = () => {
  const drops = Array.from({ length: 15 }, (_, i) => ({
    left: (i / 15) * 100,
    duration: (Math.sin(i * 0.618) * 0.5 + 0.5) * 2 + 3,
    delay: (Math.cos(i * 0.618) * 0.5 + 0.5) * 2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl bg-black">
      {drops.map((d, i) => (
        <div
          key={i}
          className="absolute w-0.5"
          style={{
            left: `${d.left}%`,
            height: '100%',
          }}
        >
          <div
            className="w-full h-20 bg-gradient-to-b from-transparent via-blue-400 to-transparent"
            style={{
              animation: `slideDown ${d.duration}s linear infinite`,
              animationDelay: `${d.delay}s`,
              boxShadow: '0 0 10px rgba(96, 165, 250, 0.8)',
            }}
          />
        </div>
      ))}
    </div>
  );
};

// 7. Constellation - Constelación conectada
export const ConstellationBackground = () => {
  const stars = Array.from({ length: 20 }, (_, i) => ({
    size: (Math.sin(i * 0.618) * 0.5 + 0.5) * 3 + 1,
    left: (Math.sin(i * 3.1) * 0.5 + 0.5) * 100,
    top: (Math.cos(i * 4.2) * 0.5 + 0.5) * 100,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl bg-slate-950">
      <svg className="absolute inset-0 w-full h-full">
        {stars.map((star, i) => {
          if (i < stars.length - 1) {
            return (
              <line
                key={`line-${i}`}
                x1={`${star.left}%`}
                y1={`${star.top}%`}
                x2={`${stars[i + 1].left}%`}
                y2={`${stars[i + 1].top}%`}
                stroke="rgba(147, 197, 253, 0.2)"
                strokeWidth="1"
              />
            );
          }
          return null;
        })}
      </svg>
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-blue-300"
          style={{
            width: `${s.size}px`,
            height: `${s.size}px`,
            left: `${s.left}%`,
            top: `${s.top}%`,
            boxShadow: '0 0 10px rgba(147, 197, 253, 0.8)',
            animation: `twinkle ${(Math.sin(i * 0.618) * 0.5 + 0.5) * 3 + 2}s ease-in-out infinite`,
            animationDelay: `${(Math.cos(i * 0.618) * 0.5 + 0.5) * 2}s`,
          }}
        />
      ))}
    </div>
  );
};

// 8. Energy Particles - Partículas de energía
export const EnergyParticlesBackground = () => {
  const particles = Array.from({ length: 45 }, (_, i) => {
    const colors = [
      { name: 'cyan', rgb: '34, 211, 238', class: 'bg-cyan-400' },
      { name: 'purple', rgb: '168, 85, 247', class: 'bg-purple-400' },
      { name: 'pink', rgb: '236, 72, 153', class: 'bg-pink-400' },
      { name: 'blue', rgb: '59, 130, 246', class: 'bg-blue-400' },
    ];
    const color = colors[i % colors.length];

    const seed = i * 0.618033988749;
    return {
      size: (Math.sin(seed * 7.7) * 0.5 + 0.5) * 6 + 3,
      left: (Math.sin(seed * 3.1) * 0.5 + 0.5) * 100,
      top: (Math.cos(seed * 4.2) * 0.5 + 0.5) * 100,
      color,
      pulseDuration: (Math.sin(seed * 5.3) * 0.5 + 0.5) * 2 + 2,
      floatDuration: (Math.cos(seed * 2.1) * 0.5 + 0.5) * 12 + 15,
      delay: (Math.sin(seed * 6.4) * 0.5 + 0.5) * 5,
    };
  });

  return (
    <div className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            animation: `floatSmooth ${p.floatDuration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
          }}
        >
          <div
            className={`rounded-full ${p.color.class}`}
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              animation: `gentlePulse ${p.pulseDuration}s ease-in-out infinite`,
              boxShadow: `0 0 20px rgba(${p.color.rgb}, 1), 0 0 40px rgba(${p.color.rgb}, 0.6)`,
              filter: 'blur(0.5px)',
            }}
          />
        </div>
      ))}
    </div>
  );
};
