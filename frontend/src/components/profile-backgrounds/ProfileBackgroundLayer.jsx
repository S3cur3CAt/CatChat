import { useMemo } from "react";

const mergeClasses = (base, extra) => (extra ? `${base} ${extra}` : base);

const NoneBackground = ({ className = "" }) => (
  <div className={mergeClasses("absolute inset-0 bg-base-200", className)} />
);

const FirefliesBackground = ({ className = "" }) => {
  const particles = useMemo(
    () =>
      [...Array(12)].map((_, i) => {
        const size = 2 + Math.random() * 4;
        return {
          key: i,
          style: {
            left: `${10 + i * 7.5}%`,
            top: `${20 + Math.sin(i) * 30}%`,
            width: `${size}px`,
            height: `${size}px`,
            background: `radial-gradient(circle, rgba(255, ${180 + i * 5}, 0, 0.9) 0%, rgba(255, ${200 + i * 3}, 50, 0) 60%)`,
            boxShadow: `0 0 ${10 + size * 2}px rgba(255, ${180 + i * 5}, 0, 0.6)`,
            animationName: "floatFirefly",
            animationDuration: `${3 + i * 0.3}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDelay: `${i * 0.2}s`,
          },
        };
      }),
    []
  );

  return (
    <div
      className={mergeClasses(
        "absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-b from-amber-950/10 to-orange-950/20",
        className
      )}
    >
      {particles.map(({ key, style }) => (
        <div key={key} className="absolute rounded-full" style={style} />
      ))}
    </div>
  );
};

const NebulaBackground = ({ className = "" }) => {
  const particles = useMemo(() => {
    const colors = ["purple", "pink", "blue", "cyan", "violet"];
    return [...Array(20)].map((_, i) => {
      const color = colors[i % colors.length];
      const size = 1 + Math.random() * 3;
      const colorMap = {
        purple: "rgba(147, 51, 234, 0.8)",
        pink: "rgba(236, 72, 153, 0.8)",
        blue: "rgba(59, 130, 246, 0.8)",
        cyan: "rgba(6, 182, 212, 0.8)",
        violet: "rgba(139, 92, 246, 0.8)",
      };
      const glowMap = {
        purple: "rgba(147, 51, 234, 0.6)",
        pink: "rgba(236, 72, 153, 0.6)",
        blue: "rgba(59, 130, 246, 0.6)",
        cyan: "rgba(6, 182, 212, 0.6)",
        violet: "rgba(139, 92, 246, 0.6)",
      };

      return {
        key: i,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${size}px`,
          height: `${size}px`,
          background: colorMap[color],
          boxShadow: `0 0 ${8 + size * 3}px ${glowMap[color]}`,
          animationName: "nebulaFloat",
          animationDuration: `${8 + i * 0.5}s`,
          animationTimingFunction: "linear",
          animationIterationCount: "infinite",
          animationDelay: `${i * 0.15}s`,
        },
      };
    });
  }, []);

  return (
    <div
      className={mergeClasses(
        "absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-br from-purple-950/20 via-pink-950/20 to-blue-950/20",
        className
      )}
    >
      {particles.map(({ key, style }) => (
        <div key={key} className="absolute rounded-full" style={style} />
      ))}
    </div>
  );
};

const MatrixBackground = ({ className = "" }) => (
  <div
    className={mergeClasses("absolute inset-0 overflow-hidden rounded-xl bg-black", className)}
  >
    {[0, 20, 40, 60, 80].map((left, columnIndex) => (
      <div
        key={left}
        className="absolute top-0 w-1"
        style={{ left: `${left}%`, height: "100%" }}
      >
        {[0, 25, 50].map((topOffset, rowIndex) => (
          <div
            key={topOffset}
            className="absolute w-1 h-2 bg-green-400"
            style={{
              top: `${columnIndex % 2 === 0 ? topOffset : topOffset + 10}%`,
              opacity: 0.5 + (rowIndex % 3) * 0.2,
              animationName: "slideDown",
              animationDuration: `${1.8 + columnIndex * 0.2}s`,
              animationTimingFunction: "linear",
              animationDelay: `${0.3 * rowIndex + columnIndex * 0.2}s`,
              animationIterationCount: "infinite",
              boxShadow: "rgba(34, 197, 94, 0.8) 0px 0px 4px",
            }}
          />
        ))}
      </div>
    ))}
  </div>
);

const SnowBackground = ({ className = "" }) => {
  const flakes = useMemo(
    () =>
      [...Array(20)].map((_, i) => {
        const size = 2 + Math.random() * 3;
        return {
          key: i,
          style: {
            left: `${Math.random() * 100}%`,
            top: "-10px",
            width: `${size}px`,
            height: `${size}px`,
            opacity: 0.4 + Math.random() * 0.4,
            boxShadow: `0 0 ${size * 2}px rgba(255, 255, 255, 0.5)`,
            animationName: "snowFall",
            animationDuration: `${4 + Math.random() * 4}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationDelay: `${Math.random() * 4}s`,
          },
        };
      }),
    []
  );

  return (
    <div
      className={mergeClasses(
        "absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-b from-slate-700/30 to-slate-800/40",
        className
      )}
    >
      {flakes.map(({ key, style }) => (
        <div key={key} className="absolute rounded-full bg-white" style={style} />
      ))}
    </div>
  );
};

const EmberBackground = ({ className = "" }) => {
  const embers = useMemo(
    () =>
      [...Array(18)].map((_, i) => {
        const size = 1 + Math.random() * 3;
        const colorShift = 100 + Math.random() * 55;
        return {
          key: i,
          style: {
            left: `${10 + Math.random() * 80}%`,
            bottom: "0px",
            width: `${size}px`,
            height: `${size * 2}px`,
            background: `radial-gradient(ellipse, rgba(255, ${colorShift}, 0, 0.9), rgba(255, 0, 0, 0))`,
            boxShadow: `0 0 ${6 + size * 2}px rgba(255, ${colorShift}, 0, 0.7)`,
            animationName: "emberRise",
            animationDuration: `${3 + Math.random() * 2}s`,
            animationTimingFunction: "ease-out",
            animationIterationCount: "infinite",
            animationDelay: `${Math.random() * 3}s`,
          },
        };
      }),
    []
  );

  return (
    <div
      className={mergeClasses(
        "absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-t from-red-950/20 to-transparent",
        className
      )}
    >
      {embers.map(({ key, style }) => (
        <div key={key} className="absolute rounded-full" style={style} />
      ))}
    </div>
  );
};

const GalaxyBackground = ({ className = "" }) => {
  const particles = useMemo(() => {
    const colors = [
      "rgba(99, 102, 241, 0.9)",
      "rgba(168, 85, 247, 0.9)",
      "rgba(236, 72, 153, 0.9)",
      "rgba(59, 130, 246, 0.9)",
      "rgba(147, 197, 253, 0.9)",
    ];

    return [...Array(30)].map((_, i) => {
      const size = 0.5 + Math.random() * 2;
      const color = colors[i % colors.length];
      return {
        key: i,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          width: `${size}px`,
          height: `${size}px`,
          background: color,
          boxShadow: `0 0 ${4 + size * 2}px ${color}`,
          animationName: "galaxyDrift",
          animationDuration: `${10 + Math.random() * 10}s`,
          animationTimingFunction: "ease-in-out",
          animationIterationCount: "infinite",
          animationDelay: `${i * 0.1}s`,
        },
      };
    });
  }, []);

  return (
    <div
      className={mergeClasses(
        "absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-950/20 via-purple-950/20 to-pink-950/20",
        className
      )}
    >
      {particles.map(({ key, style }) => (
        <div key={key} className="absolute rounded-full" style={style} />
      ))}
    </div>
  );
};

const QuantumBackground = ({ className = "" }) => {
  const dots = useMemo(() => {
    const coords = [];
    for (let x = 0; x < 4; x += 1) {
      for (let y = 0; y < 4; y += 1) {
        coords.push({ x: x * 25 + 12.5, y: y * 25 + 12.5, idx: coords.length });
      }
    }
    return coords.map(({ x, y, idx }) => {
      const isFlare = idx % 3 === 0;
      return {
        key: idx,
        layers: [
          {
            key: "primary",
            style: {
              background: "rgba(0, 255, 255, 0.8)",
              boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
              animationName: "quantumBlink",
              animationDuration: `${1 + Math.random()}s`,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDelay: `${idx * 0.1}s`,
            },
          },
          ...(isFlare
            ? [
                {
                  key: "flare",
                  style: {
                    background: "rgba(255, 0, 255, 0.6)",
                    boxShadow: "0 0 15px rgba(255, 0, 255, 0.6)",
                    animationName: "quantumJump",
                    animationDuration: `${2 + Math.random()}s`,
                    animationTimingFunction: "ease-in-out",
                    animationIterationCount: "infinite",
                    animationDelay: `${idx * 0.15}s`,
                  },
                },
              ]
            : []),
        ],
        position: { left: `${x}%`, top: `${y}%` },
      };
    });
  }, []);

  return (
    <div
      className={mergeClasses("absolute inset-0 overflow-hidden rounded-xl bg-slate-950/20", className)}
    >
      {dots.map(({ key, layers, position }) => (
        <div
          key={key}
          className="absolute"
          style={{ ...position, transform: "translate(-50%, -50%)", width: "3px", height: "3px" }}
        >
          {layers.map(({ key: layerKey, style }) => (
            <div key={layerKey} className="absolute w-full h-full rounded-full" style={style} />
          ))}
        </div>
      ))}
    </div>
  );
};

const CrystalBackground = ({ className = "" }) => {
  const shards = useMemo(
    () =>
      [...Array(14)].map((_, i) => {
        const size = 3 + Math.random() * 5;
        return {
          key: i,
          style: {
            left: `${10 + i * 6}%`,
            top: `${20 + Math.sin(i * 0.5) * 30}%`,
            width: `${size}px`,
            height: `${size * 1.5}px`,
            transform: `rotate(${Math.random() * 360}deg)`,
            background:
              "linear-gradient(135deg, rgba(6, 182, 212, 0.9), rgba(59, 130, 246, 0.6), rgba(147, 197, 253, 0.9))",
            clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
            boxShadow: `0 0 ${10 + size}px rgba(6, 182, 212, 0.5)`,
            animationName: "crystalFloat",
            animationDuration: `${4 + i * 0.2}s`,
            animationTimingFunction: "ease-in-out",
            animationIterationCount: "infinite",
            animationDelay: `${i * 0.2}s`,
          },
        };
      }),
    []
  );

  return (
    <div
      className={mergeClasses(
        "absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-br from-blue-950/10 via-cyan-950/10 to-teal-950/10",
        className
      )}
    >
      {shards.map(({ key, style }) => (
        <div key={key} className="absolute" style={style} />
      ))}
    </div>
  );
};

const PROFILE_BACKGROUND_COMPONENTS = {
  none: NoneBackground,
  fireflies: FirefliesBackground,
  nebula: NebulaBackground,
  matrix: MatrixBackground,
  snow: SnowBackground,
  ember: EmberBackground,
  galaxy: GalaxyBackground,
  quantum: QuantumBackground,
  crystal: CrystalBackground,
};

export const ProfileBackgroundLayer = ({ backgroundId, className = "" }) => {
  const BackgroundComponent = PROFILE_BACKGROUND_COMPONENTS[backgroundId] || NoneBackground;
  return <BackgroundComponent className={className} />;
};

export const PROFILE_BACKGROUNDS = Object.keys(PROFILE_BACKGROUND_COMPONENTS);
