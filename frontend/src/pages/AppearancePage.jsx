import MessageStyleCustomizer from "../components/MessageStyleCustomizer";
import { useProfileBackgroundStore } from "../store/useProfileBackgroundStore";
import { useMessageHoverBackgroundStore } from "../store/useMessageHoverBackgroundStore";
import { useChatBackgroundStore } from "../store/useChatBackgroundStore";
import { useAuthStore } from "../store/useAuthStore";

const backgrounds = [
  { id: "none", name: "None" },
  { id: "fireflies", name: "Fireflies" },
  { id: "nebula", name: "Nebula Particles" },
  { id: "matrix", name: "Matrix Rain" },
  { id: "snow", name: "Snow Fall" },
  { id: "ember", name: "Ember Sparks" },
  { id: "galaxy", name: "Galaxy Dust" },
  { id: "quantum", name: "Quantum Dots" },
  { id: "crystal", name: "Crystal Shards" },
];

const AppearancePage = () => {
  const { selectedBackground, setSelectedBackground, isUpdating } = useProfileBackgroundStore();
  const { selectedHoverBackground, setSelectedHoverBackground, isUpdating: isHoverUpdating } = useMessageHoverBackgroundStore();
  const { selectedChatBackground, setSelectedChatBackground, isLoading: isChatBgLoading } = useChatBackgroundStore();
  const { authUser } = useAuthStore();

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Appearance</h2>
        </div>

        {/* Profile Background Selector */}
        <div className="bg-base-200/50 rounded-2xl p-6 border border-base-300 overflow-y-auto max-h-[calc(100vh-200px)]">
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">Profile Background</h3>
              {isUpdating && (
                <div className="flex items-center gap-2 text-sm text-base-content/60">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              )}
            </div>
            <p className="text-base-content/70">Choose an animated background for your profile card</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 justify-items-center">
            {backgrounds.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setSelectedBackground(bg.id)}
                  className={`
                    relative rounded-xl overflow-hidden border-2 transition-all duration-200
                    ${selectedBackground === bg.id 
                      ? 'border-primary ring-2 ring-primary/50 scale-105' 
                      : 'border-base-300 hover:border-primary/50'
                    }
                  `}
                  style={{width: '302px', height: '66px'}}
                >
                  {bg.id === "none" ? (
                    <div className="absolute inset-0 bg-base-200 flex items-center justify-center">
                      <span className="text-sm font-medium">No Background</span>
                    </div>
                  ) : bg.id === "snow" ? (
                    <>
                      {/* Snow Fall particles */}
                      <div className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-b from-slate-700/30 to-slate-800/40">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="absolute rounded-full bg-white" style={{
                            left: `${15 + (i * 11)}%`,
                            top: '-5px',
                            width: `${2 + Math.random() * 3}px`,
                            height: `${2 + Math.random() * 3}px`,
                            opacity: 0.5 + Math.random() * 0.3,
                            boxShadow: `0 0 ${4 + Math.random() * 4}px rgba(255, 255, 255, 0.6)`,
                            animationName: 'snowFall',
                            animationDuration: `${4 + Math.random() * 3}s`,
                            animationTimingFunction: 'linear',
                            animationIterationCount: 'infinite',
                            animationDelay: `${Math.random() * 4}s`
                          }}/>
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-between px-3 py-2 z-10">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg backdrop-blur-sm border border-white/20">
                          <div className="relative flex-shrink-0">
                            <img src={authUser?.profilePic || "/avatar.png"} alt={authUser?.fullName} className="size-9 object-cover rounded-full ring-2 ring-white/30 shadow-lg" />
                          </div>
                          <div className="flex flex-col">
                            <div className="font-medium text-[13px] text-white drop-shadow-lg whitespace-nowrap">{authUser?.fullName || "User"}</div>
                            <div className="text-[11px] text-green-400 drop-shadow-lg font-medium whitespace-nowrap">En línea</div>
                          </div>
                        </div>
                        <div 
                          className="flex items-center justify-center size-7 rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Aquí puedes agregar lógica para configurar el background específico
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-lg">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : bg.id === "ember" ? (
                    <>
                      {/* Ember Sparks - Fire particles */}
                      <div className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-t from-red-950/30 to-transparent">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="absolute rounded-full" style={{
                            left: `${10 + Math.random() * 80}%`,
                            bottom: '0px',
                            width: `${2 + Math.random() * 2}px`,
                            height: `${3 + Math.random() * 2}px`,
                            background: `radial-gradient(ellipse, rgba(255, ${100 + Math.random() * 55}, 0, 0.9), rgba(255, 0, 0, 0))`,
                            boxShadow: `0 0 ${6 + Math.random() * 4}px rgba(255, ${100 + Math.random() * 55}, 0, 0.7)`,
                            animationName: 'emberRise',
                            animationDuration: `${3 + Math.random() * 2}s`,
                            animationTimingFunction: 'ease-out',
                            animationIterationCount: 'infinite',
                            animationDelay: `${Math.random() * 3}s`
                          }}/>
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-between px-3 py-2 z-10">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg backdrop-blur-sm border border-white/20">
                          <div className="relative flex-shrink-0">
                            <img src={authUser?.profilePic || "/avatar.png"} alt={authUser?.fullName} className="size-9 object-cover rounded-full ring-2 ring-white/30 shadow-lg" />
                          </div>
                          <div className="flex flex-col">
                            <div className="font-medium text-[13px] text-white drop-shadow-lg whitespace-nowrap">{authUser?.fullName || "User"}</div>
                            <div className="text-[11px] text-green-400 drop-shadow-lg font-medium whitespace-nowrap">En línea</div>
                          </div>
                        </div>
                        <div 
                          className="flex items-center justify-center size-7 rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-lg">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l-.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : bg.id === "galaxy" ? (
                    <>
                      {/* Galaxy Dust - Space particles */}
                      <div className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-950/20 via-purple-950/20 to-pink-950/20">
                        {[...Array(10)].map((_, i) => {
                          const size = 1 + Math.random() * 2;
                          const colors = [
                            'rgba(99, 102, 241, 0.9)',
                            'rgba(168, 85, 247, 0.9)',
                            'rgba(236, 72, 153, 0.9)'
                          ];
                          const color = colors[i % colors.length];
                          return (
                            <div key={i} className="absolute rounded-full" style={{
                              left: `${Math.random() * 95}%`,
                              top: `${Math.random() * 90}%`,
                              width: `${size}px`,
                              height: `${size}px`,
                              background: color,
                              boxShadow: `0 0 ${4 + size * 2}px ${color}`,
                              animationName: 'galaxyDrift',
                              animationDuration: `${10 + Math.random() * 5}s`,
                              animationTimingFunction: 'ease-in-out',
                              animationIterationCount: 'infinite',
                              animationDelay: `${i * 0.2}s`
                            }}/>
                          );
                        })}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-between px-3 py-2 z-10">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg backdrop-blur-sm border border-white/20">
                          <div className="relative flex-shrink-0">
                            <img src={authUser?.profilePic || "/avatar.png"} alt={authUser?.fullName} className="size-9 object-cover rounded-full ring-2 ring-white/30 shadow-lg" />
                          </div>
                          <div className="flex flex-col">
                            <div className="font-medium text-[13px] text-white drop-shadow-lg whitespace-nowrap">{authUser?.fullName || "User"}</div>
                            <div className="text-[11px] text-green-400 drop-shadow-lg font-medium whitespace-nowrap">En línea</div>
                          </div>
                        </div>
                        <div 
                          className="flex items-center justify-center size-7 rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-lg">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l-.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : bg.id === "quantum" ? (
                    <>
                      {/* Quantum Dots - Grid pattern */}
                      <div className="absolute inset-0 overflow-hidden rounded-xl bg-slate-950/20">
                        {[...Array(6)].map((_, i) => {
                          const x = (i % 3) * 33 + 16;
                          const y = Math.floor(i / 3) * 40 + 20;
                          return (
                            <div key={i} className="absolute" style={{
                              left: `${x}%`,
                              top: `${y}%`,
                              width: '3px',
                              height: '3px',
                              transform: 'translate(-50%, -50%)'
                            }}>
                              <div className="absolute w-full h-full rounded-full" style={{
                                background: 'rgba(0, 255, 255, 0.9)',
                                boxShadow: '0 0 8px rgba(0, 255, 255, 0.7)',
                                animationName: 'quantumBlink',
                                animationDuration: `${1 + Math.random() * 0.5}s`,
                                animationTimingFunction: 'ease-in-out',
                                animationIterationCount: 'infinite',
                                animationDelay: `${i * 0.15}s`
                              }}/>
                              {i % 2 === 0 && (
                                <div className="absolute w-full h-full rounded-full" style={{
                                  background: 'rgba(255, 0, 255, 0.7)',
                                  boxShadow: '0 0 12px rgba(255, 0, 255, 0.6)',
                                  animationName: 'quantumJump',
                                  animationDuration: `${2 + Math.random() * 0.5}s`,
                                  animationTimingFunction: 'ease-in-out',
                                  animationIterationCount: 'infinite',
                                  animationDelay: `${i * 0.2}s`
                                }}/>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-between px-3 py-2 z-10">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg backdrop-blur-sm border border-white/20">
                          <div className="relative flex-shrink-0">
                            <img src={authUser?.profilePic || "/avatar.png"} alt={authUser?.fullName} className="size-9 object-cover rounded-full ring-2 ring-white/30 shadow-lg" />
                          </div>
                          <div className="flex flex-col">
                            <div className="font-medium text-[13px] text-white drop-shadow-lg whitespace-nowrap">{authUser?.fullName || "User"}</div>
                            <div className="text-[11px] text-green-400 drop-shadow-lg font-medium whitespace-nowrap">En línea</div>
                          </div>
                        </div>
                        <div 
                          className="flex items-center justify-center size-7 rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-lg">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l-.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : bg.id === "crystal" ? (
                    <>
                      {/* Crystal Shards - Geometric shapes */}
                      <div className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-br from-blue-950/10 via-cyan-950/10 to-teal-950/10">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="absolute" style={{
                            left: `${20 + i * 15}%`,
                            top: `${25 + Math.cos(i * 0.8) * 15}%`,
                            width: '5px',
                            height: '8px',
                            transform: `rotate(${i * 72}deg)`,
                            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.9), rgba(59, 130, 246, 0.6))',
                            clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                            boxShadow: '0 0 10px rgba(6, 182, 212, 0.5)',
                            animationName: 'crystalFloat',
                            animationDuration: `${4 + i * 0.3}s`,
                            animationTimingFunction: 'ease-in-out',
                            animationIterationCount: 'infinite',
                            animationDelay: `${i * 0.2}s`
                          }}/>
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-between px-3 py-2 z-10">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg backdrop-blur-sm border border-white/20">
                          <div className="relative flex-shrink-0">
                            <img src={authUser?.profilePic || "/avatar.png"} alt={authUser?.fullName} className="size-9 object-cover rounded-full ring-2 ring-white/30 shadow-lg" />
                          </div>
                          <div className="flex flex-col">
                            <div className="font-medium text-[13px] text-white drop-shadow-lg whitespace-nowrap">{authUser?.fullName || "User"}</div>
                            <div className="text-[11px] text-green-400 drop-shadow-lg font-medium whitespace-nowrap">En línea</div>
                          </div>
                        </div>
                        <div 
                          className="flex items-center justify-center size-7 rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-lg">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l-.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : bg.id === "matrix" ? (
                    <>
                      {/* Enhanced matrix rain design */}
                      <div className="absolute inset-0 overflow-hidden rounded-xl bg-black">
                        {/* Matrix rain columns - scaled for h-12 */}
                        <div className="absolute top-0 w-1" style={{left: '0%', height: '100%'}}>
                          <div className="absolute w-1 h-2 bg-green-400" style={{top: '0%', opacity: 1, animationName: 'slideDown', animationDuration: '2s', animationTimingFunction: 'linear', animationDelay: '1s', animationIterationCount: 'infinite', boxShadow: 'rgba(34, 197, 94, 0.8) 0px 0px 4px'}}></div>
                          <div className="absolute w-1 h-2 bg-green-400" style={{top: '25%', opacity: 0.8, animationName: 'slideDown', animationDuration: '2s', animationTimingFunction: 'linear', animationDelay: '1.2s', animationIterationCount: 'infinite', boxShadow: 'rgba(34, 197, 94, 0.8) 0px 0px 4px'}}></div>
                          <div className="absolute w-1 h-2 bg-green-400" style={{top: '50%', opacity: 0.6, animationName: 'slideDown', animationDuration: '2s', animationTimingFunction: 'linear', animationDelay: '1.4s', animationIterationCount: 'infinite', boxShadow: 'rgba(34, 197, 94, 0.8) 0px 0px 4px'}}></div>
                        </div>
                        <div className="absolute top-0 w-1" style={{left: '20%', height: '100%'}}>
                          <div className="absolute w-1 h-2 bg-green-400" style={{top: '10%', opacity: 1, animationName: 'slideDown', animationDuration: '2.3s', animationTimingFunction: 'linear', animationDelay: '0.5s', animationIterationCount: 'infinite', boxShadow: 'rgba(34, 197, 94, 0.8) 0px 0px 4px'}}></div>
                          <div className="absolute w-1 h-2 bg-green-400" style={{top: '35%', opacity: 0.7, animationName: 'slideDown', animationDuration: '2.3s', animationTimingFunction: 'linear', animationDelay: '0.8s', animationIterationCount: 'infinite', boxShadow: 'rgba(34, 197, 94, 0.8) 0px 0px 4px'}}></div>
                        </div>
                        <div className="absolute top-0 w-1" style={{left: '40%', height: '100%'}}>
                          <div className="absolute w-1 h-2 bg-green-400" style={{top: '20%', opacity: 1, animationName: 'slideDown', animationDuration: '1.8s', animationTimingFunction: 'linear', animationDelay: '0.2s', animationIterationCount: 'infinite', boxShadow: 'rgba(34, 197, 94, 0.8) 0px 0px 4px'}}></div>
                          <div className="absolute w-1 h-2 bg-green-400" style={{top: '60%', opacity: 0.5, animationName: 'slideDown', animationDuration: '1.8s', animationTimingFunction: 'linear', animationDelay: '0.6s', animationIterationCount: 'infinite', boxShadow: 'rgba(34, 197, 94, 0.8) 0px 0px 4px'}}></div>
                        </div>
                        <div className="absolute top-0 w-1" style={{left: '60%', height: '100%'}}>
                          <div className="absolute w-1 h-2 bg-green-400" style={{top: '5%', opacity: 1, animationName: 'slideDown', animationDuration: '2.1s', animationTimingFunction: 'linear', animationDelay: '0.8s', animationIterationCount: 'infinite', boxShadow: 'rgba(34, 197, 94, 0.8) 0px 0px 4px'}}></div>
                          <div className="absolute w-1 h-2 bg-green-400" style={{top: '45%', opacity: 0.6, animationName: 'slideDown', animationDuration: '2.1s', animationTimingFunction: 'linear', animationDelay: '1.1s', animationIterationCount: 'infinite', boxShadow: 'rgba(34, 197, 94, 0.8) 0px 0px 4px'}}></div>
                        </div>
                        <div className="absolute top-0 w-1" style={{left: '80%', height: '100%'}}>
                          <div className="absolute w-1 h-2 bg-green-400" style={{top: '15%', opacity: 1, animationName: 'slideDown', animationDuration: '1.9s', animationTimingFunction: 'linear', animationDelay: '0.3s', animationIterationCount: 'infinite', boxShadow: 'rgba(34, 197, 94, 0.8) 0px 0px 4px'}}></div>
                          <div className="absolute w-1 h-2 bg-green-400" style={{top: '55%', opacity: 0.7, animationName: 'slideDown', animationDuration: '1.9s', animationTimingFunction: 'linear', animationDelay: '0.7s', animationIterationCount: 'infinite', boxShadow: 'rgba(34, 197, 94, 0.8) 0px 0px 4px'}}></div>
                        </div>
                      </div>
                      
                      {/* User profile section overlay - scaled for 302x66 container */}
                      <div className="absolute inset-0 flex items-center justify-between px-3 py-2 z-10">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg backdrop-blur-sm border border-white/20">
                          <div className="relative flex-shrink-0">
                            <img src={authUser?.profilePic || "/avatar.png"} alt={authUser?.fullName} className="size-9 object-cover rounded-full ring-2 ring-white/30 shadow-lg" />
                          </div>
                          <div className="flex flex-col">
                            <div className="font-medium text-[13px] text-white drop-shadow-lg whitespace-nowrap">{authUser?.fullName || "User"}</div>
                            <div className="text-[11px] text-green-400 drop-shadow-lg font-medium whitespace-nowrap">En línea</div>
                          </div>
                        </div>
                        <div 
                          className="flex items-center justify-center size-7 rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Aquí puedes agregar lógica para configurar el background específico
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-lg">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : bg.id === "fireflies" ? (
                    <>
                      <div className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-b from-amber-950/10 to-orange-950/20">
                        {[...Array(6)].map((_, i) => (
                          <div key={i} className="absolute rounded-full" style={{
                            left: `${15 + i * 15}%`,
                            top: `${20 + Math.sin(i) * 20}%`,
                            width: '4px',
                            height: '4px',
                            background: `radial-gradient(circle, rgba(255, ${180 + i * 5}, 0, 0.9) 0%, transparent 60%)`,
                            boxShadow: `0 0 12px rgba(255, ${180 + i * 5}, 0, 0.7)`,
                            animationName: 'floatFirefly',
                            animationDuration: `${3 + i * 0.3}s`,
                            animationTimingFunction: 'ease-in-out',
                            animationIterationCount: 'infinite',
                            animationDelay: `${i * 0.2}s`
                          }}/>
                        ))}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-between px-3 py-2 z-10">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg backdrop-blur-sm border border-white/20">
                          <div className="relative flex-shrink-0">
                            <img src={authUser?.profilePic || "/avatar.png"} alt={authUser?.fullName} className="size-9 object-cover rounded-full ring-2 ring-white/30 shadow-lg" />
                          </div>
                          <div className="flex flex-col">
                            <div className="font-medium text-[13px] text-white drop-shadow-lg whitespace-nowrap">{authUser?.fullName || "User"}</div>
                            <div className="text-[11px] text-green-400 drop-shadow-lg font-medium whitespace-nowrap">En línea</div>
                          </div>
                        </div>
                        <div 
                          className="flex items-center justify-center size-7 rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-lg">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : bg.id === "nebula" ? (
                    <>
                      {/* Nebula Particles - Cosmic colorful dust */}
                      <div className="absolute inset-0 overflow-hidden rounded-xl bg-gradient-to-br from-purple-950/20 via-pink-950/20 to-blue-950/20">
                        {[...Array(8)].map((_, i) => {
                          const colors = ['purple', 'pink', 'blue', 'cyan'];
                          const color = colors[i % colors.length];
                          return (
                            <div key={i} className="absolute rounded-full" style={{
                              left: `${12 + (i * 11)}%`,
                              top: `${15 + Math.sin(i * 0.8) * 25}%`,
                              width: '3px',
                              height: '3px',
                              background: color === 'purple' ? 'rgba(147, 51, 234, 0.9)' :
                                         color === 'pink' ? 'rgba(236, 72, 153, 0.9)' :
                                         color === 'blue' ? 'rgba(59, 130, 246, 0.9)' :
                                         'rgba(6, 182, 212, 0.9)',
                              boxShadow: `0 0 10px ${
                                color === 'purple' ? 'rgba(147, 51, 234, 0.6)' :
                                color === 'pink' ? 'rgba(236, 72, 153, 0.6)' :
                                color === 'blue' ? 'rgba(59, 130, 246, 0.6)' :
                                'rgba(6, 182, 212, 0.6)'
                              }`,
                              animationName: 'nebulaFloat',
                              animationDuration: `${8 + i * 0.5}s`,
                              animationTimingFunction: 'linear',
                              animationIterationCount: 'infinite',
                              animationDelay: `${i * 0.15}s`
                            }}/>
                          );
                        })}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-between px-3 py-2 z-10">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg backdrop-blur-sm border border-white/20">
                          <div className="relative flex-shrink-0">
                            <img src={authUser?.profilePic || "/avatar.png"} alt={authUser?.fullName} className="size-9 object-cover rounded-full ring-2 ring-white/30 shadow-lg" />
                          </div>
                          <div className="flex flex-col">
                            <div className="font-medium text-[13px] text-white drop-shadow-lg whitespace-nowrap">{authUser?.fullName || "User"}</div>
                            <div className="text-[11px] text-green-400 drop-shadow-lg font-medium whitespace-nowrap">En línea</div>
                          </div>
                        </div>
                        <div 
                          className="flex items-center justify-center size-7 rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Aquí puedes agregar lógica para configurar el background específico
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-lg">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : bg.id === "neon" ? (
                    <>
                      <div className="absolute inset-0 overflow-hidden rounded-xl bg-slate-950/50">
                        <div className="absolute w-12 h-12 rounded-full" style={{
                          left: '20%', top: '40%',
                          background: 'radial-gradient(circle, rgba(0, 255, 255, 0.8) 0%, rgba(0, 255, 255, 0) 70%)',
                          filter: 'blur(1px)',
                          animationName: 'floatOrb',
                          animationDuration: '6s',
                          animationTimingFunction: 'ease-in-out',
                          animationIterationCount: 'infinite'
                        }}/>
                        <div className="absolute w-10 h-10 rounded-full" style={{
                          left: '70%', top: '30%',
                          background: 'radial-gradient(circle, rgba(255, 0, 255, 0.8) 0%, rgba(255, 0, 255, 0) 70%)',
                          filter: 'blur(1px)',
                          animationName: 'floatOrb',
                          animationDuration: '5s',
                          animationTimingFunction: 'ease-in-out',
                          animationIterationCount: 'infinite',
                          animationDirection: 'reverse'
                        }}/>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-between px-3 py-2 z-10">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg backdrop-blur-sm border border-white/20">
                          <div className="relative flex-shrink-0">
                            <img src={authUser?.profilePic || "/avatar.png"} alt={authUser?.fullName} className="size-9 object-cover rounded-full ring-2 ring-white/30 shadow-lg" />
                          </div>
                          <div className="flex flex-col">
                            <div className="font-medium text-[13px] text-white drop-shadow-lg whitespace-nowrap">{authUser?.fullName || "User"}</div>
                            <div className="text-[11px] text-green-400 drop-shadow-lg font-medium whitespace-nowrap">En línea</div>
                          </div>
                        </div>
                        <div 
                          className="flex items-center justify-center size-7 rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-lg">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Default fallback - show base background */}
                      <div className="absolute inset-0 bg-base-200"></div>
                      <div className="absolute inset-0 flex items-center justify-between px-3 py-2 z-10">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg backdrop-blur-sm border border-white/20">
                          <div className="relative flex-shrink-0">
                            <img src={authUser?.profilePic || "/avatar.png"} alt={authUser?.fullName} className="size-9 object-cover rounded-full ring-2 ring-white/30 shadow-lg" />
                          </div>
                          <div className="flex flex-col">
                            <div className="font-medium text-[13px] text-white drop-shadow-lg whitespace-nowrap">{authUser?.fullName || "User"}</div>
                            <div className="text-[11px] text-green-400 drop-shadow-lg font-medium whitespace-nowrap">En línea</div>
                          </div>
                        </div>
                        <div 
                          className="flex items-center justify-center size-7 rounded-lg hover:bg-white/20 transition-all duration-200 backdrop-blur-sm border border-white/20 hover:border-white/40 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow-lg">
                            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </div>
                      </div>
                    </>
                  )}
                  {selectedBackground === bg.id && (
                    <div className="absolute top-1 right-1 bg-primary rounded-full p-1">
                      <svg className="w-3 h-3 text-primary-content" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
            ))}
          </div>
        </div>

        {/* Message Hover Background Selector */}
        <div className="bg-base-200/50 rounded-2xl p-6 border border-base-300">
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">Message Hover Background</h3>
              {isHoverUpdating && (
                <div className="flex items-center gap-2 text-sm text-base-content/60">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              )}
            </div>
            <p className="text-base-content/70">Choose an animated background that appears when you hover over messages</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {backgrounds.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setSelectedHoverBackground(bg.id)}
                className={`
                  relative rounded-lg overflow-hidden border-2 transition-all duration-200 h-20
                  ${selectedHoverBackground === bg.id 
                    ? 'border-primary ring-2 ring-primary/50 scale-105' 
                    : 'border-base-300 hover:border-primary/50'
                  }
                `}
              >
                {bg.id === "none" ? (
                  <div className="absolute inset-0 bg-base-300 flex items-center justify-center">
                    <span className="text-sm font-medium">No Background</span>
                  </div>
                ) : bg.id === "fireflies" ? (
                  <div className="absolute inset-0 overflow-hidden rounded-lg bg-gradient-to-b from-amber-950/5 to-orange-950/10">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="absolute rounded-full" style={{
                        left: `${15 + i * 15}%`,
                        top: `${20 + Math.sin(i) * 20}%`,
                        width: '3px',
                        height: '3px',
                        background: `radial-gradient(circle, rgba(255, ${180 + i * 5}, 0, 0.9) 0%, transparent 60%)`,
                        boxShadow: `0 0 8px rgba(255, ${180 + i * 5}, 0, 0.6)`,
                        animationName: 'floatFirefly',
                        animationDuration: `${3 + i * 0.3}s`,
                        animationTimingFunction: 'ease-in-out',
                        animationIterationCount: 'infinite',
                        animationDelay: `${i * 0.2}s`
                      }}/>
                    ))}
                  </div>
                ) : bg.id === "nebula" ? (
                  <div className="absolute inset-0 overflow-hidden rounded-lg bg-gradient-to-br from-purple-950/5 via-pink-950/5 to-blue-950/5">
                    {[...Array(8)].map((_, i) => {
                      const colors = ['purple', 'pink', 'blue', 'cyan'];
                      const color = colors[i % colors.length];
                      return (
                        <div key={i} className="absolute rounded-full" style={{
                          left: `${10 + i * 11}%`,
                          top: `${15 + Math.cos(i) * 25}%`,
                          width: '2px',
                          height: '2px',
                          background: color === 'purple' ? 'rgba(147, 51, 234, 0.9)' :
                                     color === 'pink' ? 'rgba(236, 72, 153, 0.9)' :
                                     color === 'blue' ? 'rgba(59, 130, 246, 0.9)' :
                                     'rgba(6, 182, 212, 0.9)',
                          boxShadow: `0 0 6px ${
                            color === 'purple' ? 'rgba(147, 51, 234, 0.5)' :
                            color === 'pink' ? 'rgba(236, 72, 153, 0.5)' :
                            color === 'blue' ? 'rgba(59, 130, 246, 0.5)' :
                            'rgba(6, 182, 212, 0.5)'
                          }`,
                          animationName: 'nebulaFloat',
                          animationDuration: `${8 + i * 0.5}s`,
                          animationTimingFunction: 'linear',
                          animationIterationCount: 'infinite',
                          animationDelay: `${i * 0.15}s`
                        }}/>
                      );
                    })}
                  </div>
                ) : bg.id === "matrix" ? (
                  <div className="absolute inset-0 overflow-hidden rounded-lg bg-black/20">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="absolute" style={{
                        left: `${10 + i * 12}%`,
                        width: '1px',
                        height: '100%'
                      }}>
                        <div className="absolute w-full h-2 bg-green-400" style={{
                          top: '0%',
                          opacity: 0.7 + Math.random() * 0.3,
                          boxShadow: '0 0 4px rgba(0, 255, 0, 0.6)',
                          animationName: 'matrixFall',
                          animationDuration: `${2 + Math.random()}s`,
                          animationTimingFunction: 'linear',
                          animationIterationCount: 'infinite',
                          animationDelay: `${i * 0.2}s`
                        }}/>
                      </div>
                    ))}
                  </div>
                ) : bg.id === "snow" ? (
                  <div className="absolute inset-0 overflow-hidden rounded-lg">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="absolute rounded-full bg-white" style={{
                        left: `${25 + i * 20}%`,
                        top: `${30 + (i % 2) * 30}%`,
                        width: '2px',
                        height: '2px',
                        boxShadow: '0 0 8px 1px rgba(255, 255, 255, 0.8)',
                        animationName: 'twinkle',
                        animationDuration: `${2 + i * 0.5}s`,
                        animationTimingFunction: 'ease-in-out',
                        animationIterationCount: 'infinite',
                        animationDelay: `${i * 0.3}s`
                      }}/>
                    ))}
                  </div>
                ) : bg.id === "ember" ? (
                  <div className="absolute inset-0 overflow-hidden rounded-lg bg-gradient-to-t from-red-950/10 to-transparent">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="absolute rounded-full" style={{
                        left: `${10 + i * 11}%`,
                        bottom: `${10 + Math.sin(i) * 10}%`,
                        width: '2px',
                        height: '3px',
                        background: `radial-gradient(ellipse, rgba(255, ${100 + i * 10}, 0, 0.9), transparent)`,
                        boxShadow: `0 0 6px rgba(255, ${100 + i * 10}, 0, 0.6)`,
                        animationName: 'emberRise',
                        animationDuration: `${3 + Math.random()}s`,
                        animationTimingFunction: 'ease-out',
                        animationIterationCount: 'infinite',
                        animationDelay: `${i * 0.3}s`
                      }}/>
                    ))}
                  </div>
                ) : bg.id === "galaxy" ? (
                  <div className="absolute inset-0 overflow-hidden rounded-lg bg-gradient-to-br from-indigo-950/5 via-purple-950/5 to-pink-950/5">
                    {[...Array(12)].map((_, i) => {
                      const size = 0.5 + Math.random() * 1.5;
                      const colors = [
                        'rgba(99, 102, 241, 0.9)',
                        'rgba(168, 85, 247, 0.9)',
                        'rgba(236, 72, 153, 0.9)'
                      ];
                      const color = colors[i % colors.length];
                      return (
                        <div key={i} className="absolute rounded-full" style={{
                          left: `${5 + (i * 8)}%`,
                          top: `${10 + Math.sin(i * 0.8) * 30}%`,
                          width: `${size}px`,
                          height: `${size}px`,
                          background: color,
                          boxShadow: `0 0 ${3 + size * 2}px ${color}`,
                          animationName: 'galaxyDrift',
                          animationDuration: `${10 + i}s`,
                          animationTimingFunction: 'ease-in-out',
                          animationIterationCount: 'infinite',
                          animationDelay: `${i * 0.2}s`
                        }}/>
                      );
                    })}
                  </div>
                ) : bg.id === "quantum" ? (
                  <div className="absolute inset-0 overflow-hidden rounded-lg bg-slate-950/5">
                    {[...Array(9)].map((_, i) => {
                      const x = (i % 3) * 33 + 16;
                      const y = Math.floor(i / 3) * 33 + 16;
                      return (
                        <div key={i} className="absolute" style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          width: '2px',
                          height: '2px',
                          transform: 'translate(-50%, -50%)'
                        }}>
                          <div className="absolute w-full h-full rounded-full" style={{
                            background: 'rgba(0, 255, 255, 0.9)',
                            boxShadow: '0 0 6px rgba(0, 255, 255, 0.7)',
                            animationName: 'quantumBlink',
                            animationDuration: `${1 + Math.random() * 0.5}s`,
                            animationTimingFunction: 'ease-in-out',
                            animationIterationCount: 'infinite',
                            animationDelay: `${i * 0.1}s`
                          }}/>
                        </div>
                      );
                    })}
                  </div>
                ) : bg.id === "crystal" ? (
                  <div className="absolute inset-0 overflow-hidden rounded-lg bg-gradient-to-br from-blue-950/5 via-cyan-950/5 to-teal-950/5">
                    {[...Array(7)].map((_, i) => (
                      <div key={i} className="absolute" style={{
                        left: `${14 + i * 12}%`,
                        top: `${25 + Math.cos(i * 0.8) * 20}%`,
                        width: '4px',
                        height: '6px',
                        transform: `rotate(${i * 51}deg)`,
                        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.9), rgba(59, 130, 246, 0.6))',
                        clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                        boxShadow: '0 0 8px rgba(6, 182, 212, 0.5)',
                        animationName: 'crystalFloat',
                        animationDuration: `${4 + i * 0.3}s`,
                        animationTimingFunction: 'ease-in-out',
                        animationIterationCount: 'infinite',
                        animationDelay: `${i * 0.2}s`
                      }}/>
                    ))}
                  </div>
                ) : (
                  <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-base-300/20 to-base-200/20 flex items-center justify-center">
                    <span className="text-xs font-medium text-base-content/60">{bg.name}</span>
                  </div>
                )}
                
                {/* Label overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <span className="text-xs text-white font-medium drop-shadow">{bg.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Background Selector */}
        <div className="bg-base-200/50 rounded-2xl p-6 border border-base-300">
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold">Chat Background</h3>
              {isChatBgLoading && (
                <div className="flex items-center gap-2 text-sm text-base-content/60">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </div>
              )}
            </div>
            <p className="text-sm text-base-content/70">
              Choose an animated background for your chat window
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {backgrounds.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setSelectedChatBackground(bg.id)}
                className={`relative group rounded-xl overflow-hidden transition-all ${
                  selectedChatBackground === bg.id
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100'
                    : 'hover:scale-105'
                } ${isChatBgLoading ? 'pointer-events-none opacity-50' : ''}`}
                style={{ aspectRatio: '16/9' }}
              >
                {/* Background preview */}
                <div className="absolute inset-0">
                  {bg.id === 'none' ? (
                    <div className="w-full h-full bg-base-100" />
                  ) : bg.id === 'fireflies' ? (
                    <div className="w-full h-full bg-gradient-to-b from-amber-950/10 to-orange-950/20">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="absolute rounded-full" style={{
                          left: `${25 + i * 25}%`,
                          top: `${30 + Math.sin(i) * 20}%`,
                          width: '4px',
                          height: '4px',
                          background: `radial-gradient(circle, rgba(255, ${180 + i * 10}, 0, 0.9) 0%, transparent 60%)`,
                          boxShadow: `0 0 12px rgba(255, ${180 + i * 10}, 0, 0.7)`,
                          animationName: 'floatFirefly',
                          animationDuration: `${3 + i * 0.5}s`,
                          animationTimingFunction: 'ease-in-out',
                          animationIterationCount: 'infinite',
                          animationDelay: `${i * 0.2}s`
                        }}/>
                      ))}
                    </div>
                  ) : bg.id === 'matrix' ? (
                    <div className="w-full h-full bg-black/90">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="absolute" style={{
                          left: `${20 + i * 20}%`,
                          width: '2px',
                          height: '100%'
                        }}>
                          <div className="absolute w-full" style={{
                            height: '8px',
                            top: '0%',
                            background: 'linear-gradient(to bottom, transparent, rgba(0, 255, 0, 0.8), transparent)',
                            boxShadow: '0 0 8px rgba(0, 255, 0, 0.6)',
                            animationName: 'matrixFall',
                            animationDuration: `${2 + Math.random()}s`,
                            animationTimingFunction: 'linear',
                            animationIterationCount: 'infinite',
                            animationDelay: `${i * 0.3}s`
                          }}/>
                        </div>
                      ))}
                    </div>
                  ) : bg.id === 'nebula' ? (
                    <div className="w-full h-full bg-gradient-to-br from-purple-950/20 via-pink-950/20 to-blue-950/20">
                      {[...Array(5)].map((_, i) => {
                        const colors = ['purple', 'pink', 'blue', 'cyan'];
                        const color = colors[i % colors.length];
                        const colorMap = {
                          purple: '168, 85, 247',
                          pink: '236, 72, 153',
                          blue: '59, 130, 246',
                          cyan: '34, 211, 238'
                        };
                        return (
                          <div key={i} className="absolute rounded-full" style={{
                            left: `${20 + i * 15}%`,
                            top: `${25 + Math.sin(i * 0.5) * 30}%`,
                            width: '3px',
                            height: '3px',
                            background: `radial-gradient(circle, rgba(${colorMap[color]}, 0.8), transparent)`,
                            boxShadow: `0 0 10px rgba(${colorMap[color]}, 0.6)`,
                            animationName: 'nebulaFloat',
                            animationDuration: `${4 + Math.random() * 2}s`,
                            animationTimingFunction: 'ease-in-out',
                            animationIterationCount: 'infinite',
                            animationDelay: `${Math.random() * 2}s`
                          }}/>
                        );
                      })}
                    </div>
                  ) : bg.id === 'snow' ? (
                    <div className="w-full h-full bg-gradient-to-b from-slate-700/30 to-slate-800/40">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="absolute rounded-full bg-white" style={{
                          left: `${20 + (i * 20)}%`,
                          top: '-5px',
                          width: '3px',
                          height: '3px',
                          opacity: 0.6,
                          boxShadow: '0 0 4px rgba(255, 255, 255, 0.6)',
                          animationName: 'snowFall',
                          animationDuration: `${3 + Math.random() * 2}s`,
                          animationTimingFunction: 'linear',
                          animationIterationCount: 'infinite',
                          animationDelay: `${Math.random() * 3}s`
                        }}/>
                      ))}
                    </div>
                  ) : bg.id === 'ember' ? (
                    <div className="w-full h-full bg-gradient-to-t from-red-950/30 to-transparent">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="absolute rounded-full" style={{
                          left: `${30 + i * 20}%`,
                          bottom: '0px',
                          width: '2px',
                          height: '3px',
                          background: 'radial-gradient(ellipse, rgba(255, 120, 0, 0.9), rgba(255, 0, 0, 0))',
                          boxShadow: '0 0 6px rgba(255, 120, 0, 0.7)',
                          animationName: 'emberRise',
                          animationDuration: `${2 + Math.random()}s`,
                          animationTimingFunction: 'ease-out',
                          animationIterationCount: 'infinite',
                          animationDelay: `${Math.random() * 2}s`
                        }}/>
                      ))}
                    </div>
                  ) : bg.id === 'galaxy' ? (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-950/20 via-purple-950/20 to-pink-950/20">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="absolute rounded-full" style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          width: '2px',
                          height: '2px',
                          background: i % 2 === 0 ? 'white' : '#a78bfa',
                          boxShadow: `0 0 3px ${i % 2 === 0 ? 'white' : '#a78bfa'}`,
                          animationName: 'twinkle',
                          animationDuration: `${2 + Math.random() * 2}s`,
                          animationTimingFunction: 'ease-in-out',
                          animationIterationCount: 'infinite',
                          animationDelay: `${Math.random()}s`
                        }}/>
                      ))}
                    </div>
                  ) : bg.id === 'quantum' ? (
                    <div className="w-full h-full bg-slate-950/20">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="absolute rounded-full" style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          width: '2px',
                          height: '2px',
                          background: 'rgba(100, 150, 255, 0.8)',
                          boxShadow: '0 0 4px rgba(100, 150, 255, 0.6)',
                          animationName: 'quantumPulse',
                          animationDuration: `${1 + Math.random()}s`,
                          animationTimingFunction: 'ease-in-out',
                          animationIterationCount: 'infinite',
                          animationDelay: `${Math.random() * 0.5}s`
                        }}/>
                      ))}
                    </div>
                  ) : bg.id === 'crystal' ? (
                    <div className="w-full h-full bg-gradient-to-br from-blue-950/10 via-cyan-950/10 to-teal-950/10">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="absolute" style={{
                          left: `${30 + i * 20}%`,
                          top: `${40}%`,
                          width: '0',
                          height: '0',
                          borderLeft: '3px solid transparent',
                          borderRight: '3px solid transparent',
                          borderBottom: '6px solid rgba(34, 211, 238, 0.6)',
                          filter: 'drop-shadow(0 0 4px rgba(34, 211, 238, 0.8))',
                          animationName: 'crystalRotate',
                          animationDuration: `${3 + i * 0.5}s`,
                          animationTimingFunction: 'linear',
                          animationIterationCount: 'infinite',
                          animationDelay: `${i * 0.3}s`
                        }}/>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full h-full bg-base-100" />
                  )}
                </div>

                {/* Selection indicator */}
                {selectedChatBackground === bg.id && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-content rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                )}

                {/* Label overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <span className="text-xs text-white font-medium drop-shadow">{bg.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message Style Customizer */}
        <MessageStyleCustomizer />
      </div>
    </div>
  );
};

export default AppearancePage;
