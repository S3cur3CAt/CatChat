import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser } = useChatStore();
     
  // Forzar que no haya scroll en esta página
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
     
  return (
    <div className="h-screen bg-base-200 overflow-hidden">
      {/* Contenido principal con posición fija */}
      <div 
        className="fixed inset-0 flex overflow-hidden z-30"
        style={{ 
          top: window.electronAPI ? '88px' : '56px',
          bottom: '0',
          left: '0',
          right: '0'
        }}
      >
        <div className="flex-shrink-0 ml-0.5 h-full">
          <Sidebar />
        </div>
        <div className="flex-1 bg-base-100 rounded-lg ml-0.5 mr-0.5 flex flex-col overflow-hidden h-full">
          {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;