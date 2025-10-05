const AuthImagePattern = ({ title, subtitle }) => {
  // Diferentes SVGs de gatos para cada cuadrado
  const catSvgs = [
    // Gato durmiendo (posición 0)
    <svg key="cat-0" className="w-full h-full p-4" viewBox="0 0 100 100" fill="none">
      <ellipse cx="50" cy="60" rx="25" ry="20" className="fill-primary/30"/>
      <circle cx="40" cy="55" r="8" className="fill-primary/40"/>
      <path d="M 35 50 Q 40 45, 45 50" stroke="currentColor" strokeWidth="1.5" className="stroke-primary/60" fill="none"/>
      <path d="M 38 55 L 35 52 M 42 55 L 45 52" stroke="currentColor" strokeWidth="1" className="stroke-primary/50"/>
      <path d="M 55 60 Q 60 62, 65 60" stroke="currentColor" strokeWidth="1.5" className="stroke-primary/50" fill="none"/>
      <text x="50" y="85" textAnchor="middle" className="fill-primary/40 text-xs">zzz</text>
    </svg>,
    
    // Gato jugando con bola (posición 1)
    <svg key="cat-1" className="w-full h-full p-4" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="45" r="12" className="fill-primary/30"/>
      <path d="M 38 40 L 38 35 L 42 38 Z M 62 40 L 62 35 L 58 38 Z" className="fill-primary/40"/>
      <circle cx="45" cy="45" r="2" className="fill-primary/60"/>
      <circle cx="55" cy="45" r="2" className="fill-primary/60"/>
      <path d="M 45 52 Q 50 55, 55 52" stroke="currentColor" strokeWidth="1.5" className="stroke-primary/50" fill="none"/>
      <circle cx="50" cy="70" r="5" className="fill-primary/20 animate-bounce"/>
      <path d="M 35 60 Q 30 65, 35 70" stroke="currentColor" strokeWidth="2" className="stroke-primary/40" fill="none"/>
    </svg>,
    
    // Gato con corazón (posición 2)
    <svg key="cat-2" className="w-full h-full p-4" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="15" className="fill-primary/30"/>
      <path d="M 35 45 L 35 38 L 40 42 Z M 65 45 L 65 38 L 60 42 Z" className="fill-primary/40"/>
      <path d="M 42 48 L 44 50 L 42 52 Z M 58 48 L 56 50 L 58 52 Z" className="fill-primary/60"/>
      <path d="M 45 55 Q 50 58, 55 55" stroke="currentColor" strokeWidth="1.5" className="stroke-primary/50" fill="none"/>
      <path d="M 70 40 C 70 35, 80 35, 80 45 C 80 35, 90 35, 90 40 C 90 50, 80 60, 80 60 C 80 60, 70 50, 70 40 Z" className="fill-primary/20 animate-pulse"/>
    </svg>,
    
    // Gato mirando mariposa (posición 3)
    <svg key="cat-3" className="w-full h-full p-4" viewBox="0 0 100 100" fill="none">
      <ellipse cx="50" cy="60" rx="18" ry="15" className="fill-primary/30"/>
      <path d="M 35 55 L 35 48 L 40 52 Z M 65 55 L 65 48 L 60 52 Z" className="fill-primary/40"/>
      <circle cx="45" cy="55" r="3" className="fill-primary/60"/>
      <circle cx="55" cy="55" r="3" className="fill-primary/60"/>
      <circle cx="47" cy="54" r="1.5" className="fill-primary/80"/>
      <circle cx="57" cy="54" r="1.5" className="fill-primary/80"/>
      <path d="M 70 30 Q 65 25, 70 20 Q 75 25, 70 30 M 70 30 Q 75 35, 70 40 Q 65 35, 70 30" 
            className="stroke-primary/40" strokeWidth="1" fill="none"
            style={{animation: 'float 3s ease-in-out infinite'}}/>
    </svg>,
    
    // Gato pescando (posición 4)
    <svg key="cat-4" className="w-full h-full p-4" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="45" r="12" className="fill-primary/30"/>
      <path d="M 38 40 L 38 33 L 43 37 Z M 62 40 L 62 33 L 57 37 Z" className="fill-primary/40"/>
      <path d="M 45 43 Q 47 45, 45 47 M 55 43 Q 53 45, 55 47" stroke="currentColor" strokeWidth="1.5" className="stroke-primary/60" fill="none"/>
      <path d="M 48 50 Q 50 52, 52 50" stroke="currentColor" strokeWidth="1.5" className="stroke-primary/50" fill="none"/>
      <path d="M 50 57 L 50 75" stroke="currentColor" strokeWidth="1" className="stroke-primary/40"/>
      <path d="M 45 75 Q 50 70, 55 75 Q 50 80, 45 75" className="fill-primary/20" style={{animation: 'wiggle 2s ease-in-out infinite'}}/>
    </svg>,
    
    // Gato con pata arriba (posición 5)
    <svg key="cat-5" className="w-full h-full p-4" viewBox="0 0 100 100" fill="none">
      <ellipse cx="50" cy="55" rx="20" ry="18" className="fill-primary/30"/>
      <path d="M 35 50 L 35 43 L 40 47 Z M 65 50 L 65 43 L 60 47 Z" className="fill-primary/40"/>
      <circle cx="43" cy="53" r="2" className="fill-primary/60"/>
      <circle cx="57" cy="53" r="2" className="fill-primary/60"/>
      <path d="M 48 58 Q 50 60, 52 58" stroke="currentColor" strokeWidth="1.5" className="stroke-primary/50" fill="none"/>
      <circle cx="30" cy="40" r="5" className="fill-primary/40" style={{animation: 'wave 1.5s ease-in-out infinite'}}/>
      <circle cx="28" cy="38" r="1" className="fill-primary/20"/>
      <circle cx="32" cy="38" r="1" className="fill-primary/20"/>
      <circle cx="30" cy="42" r="1" className="fill-primary/20"/>
    </svg>,
    
    // Gato con cola moviéndose (posición 6)
    <svg key="cat-6" className="w-full h-full p-4" viewBox="0 0 100 100" fill="none">
      <circle cx="45" cy="50" r="13" className="fill-primary/30"/>
      <path d="M 33 45 L 33 38 L 38 42 Z M 57 45 L 57 38 L 52 42 Z" className="fill-primary/40"/>
      <circle cx="40" cy="48" r="2" className="fill-primary/60"/>
      <circle cx="50" cy="48" r="2" className="fill-primary/60"/>
      <path d="M 42 54 Q 45 56, 48 54" stroke="currentColor" strokeWidth="1.5" className="stroke-primary/50" fill="none"/>
      <path d="M 58 55 Q 65 50, 70 55 Q 65 60, 60 55" 
            className="stroke-primary/40" strokeWidth="6" fill="none" strokeLinecap="round"
            style={{animation: 'tailWag 2s ease-in-out infinite'}}/>
    </svg>,
    
    // Gato con ratón (posición 7)
    <svg key="cat-7" className="w-full h-full p-4" viewBox="0 0 100 100" fill="none">
      <ellipse cx="45" cy="50" rx="15" ry="13" className="fill-primary/30"/>
      <path d="M 32 45 L 32 38 L 37 42 Z M 58 45 L 58 38 L 53 42 Z" className="fill-primary/40"/>
      <circle cx="40" cy="48" r="2" className="fill-primary/60"/>
      <circle cx="50" cy="48" r="2" className="fill-primary/60"/>
      <path d="M 43 53 Q 45 55, 47 53" stroke="currentColor" strokeWidth="1.5" className="stroke-primary/50" fill="none"/>
      <ellipse cx="70" cy="60" rx="6" ry="4" className="fill-primary/20" style={{animation: 'scurry 3s ease-in-out infinite'}}/>
      <circle cx="67" cy="59" r="1" className="fill-primary/40"/>
      <path d="M 76 60 Q 80 60, 82 62" stroke="currentColor" strokeWidth="1" className="stroke-primary/30" fill="none"/>
    </svg>,
    
    // Gato con estrellas (posición 8)
    <svg key="cat-8" className="w-full h-full p-4" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="14" className="fill-primary/30"/>
      <path d="M 37 45 L 37 38 L 42 42 Z M 63 45 L 63 38 L 58 42 Z" className="fill-primary/40"/>
      <path d="M 43 48 Q 45 50, 43 52 M 57 48 Q 55 50, 57 52" stroke="currentColor" strokeWidth="2" className="stroke-primary/60" fill="none"/>
      <path d="M 48 55 Q 50 57, 52 55" stroke="currentColor" strokeWidth="1.5" className="stroke-primary/50" fill="none"/>
      <path d="M 25 30 L 27 35 L 32 35 L 28 38 L 30 43 L 25 40 L 20 43 L 22 38 L 18 35 L 23 35 Z" 
            className="fill-primary/20" style={{animation: 'twinkle 2s ease-in-out infinite'}}/>
      <path d="M 70 25 L 71 28 L 74 28 L 71.5 30 L 72.5 33 L 70 31 L 67.5 33 L 68.5 30 L 66 28 L 69 28 Z" 
            className="fill-primary/20" style={{animation: 'twinkle 2s ease-in-out infinite 0.5s'}}/>
      <path d="M 75 55 L 76 58 L 79 58 L 76.5 60 L 77.5 63 L 75 61 L 72.5 63 L 73.5 60 L 71 58 L 74 58 Z" 
            className="fill-primary/20" style={{animation: 'twinkle 2s ease-in-out infinite 1s'}}/>
    </svg>
  ];

  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
      <div className="max-w-md text-center">
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes wiggle {
            0%, 100% { transform: rotate(-5deg); }
            50% { transform: rotate(5deg); }
          }
          @keyframes wave {
            0%, 100% { transform: rotate(-10deg); }
            50% { transform: rotate(20deg); }
          }
          @keyframes tailWag {
            0%, 100% { transform: translateX(0) rotate(0); }
            25% { transform: translateX(-5px) rotate(-10deg); }
            75% { transform: translateX(5px) rotate(10deg); }
          }
          @keyframes scurry {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
        <div className="grid grid-cols-3 gap-3 mb-8">
          {catSvgs.map((svg, i) => (
            <div
              key={i}
              className={`aspect-square rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center overflow-hidden
                ${i % 2 === 0 ? "animate-pulse" : ""} 
                hover:scale-105 transition-transform duration-300 cursor-pointer
                shadow-lg hover:shadow-xl`}
            >
              {svg}
            </div>
          ))}
        </div>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;
