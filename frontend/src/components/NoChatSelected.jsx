import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header placeholder para mantener estructura igual que ChatContainer */}
      <div className="px-2.5 py-2 border-b border-base-300 flex-shrink-0 bg-base-100">
        <div className="h-10 flex items-center">
          <span className="text-base-content/40">Select a conversation</span>
        </div>
      </div>
      
      {/* Contenido principal que ocupa todo el espacio restante */}
      <div className="flex-1 flex items-center justify-center px-16 py-14">
        <div className="max-w-md text-center space-y-6">
          {/* Icon Display */}
          <div className="flex justify-center gap-4 mb-4">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center
               justify-center animate-bounce"
              >
                <MessageSquare className="w-8 h-8 text-primary " />
              </div>
            </div>
          </div>

          {/* Welcome Text */}
          <h2 className="text-2xl font-bold">Welcome to CatChat!</h2>
          <p className="text-base-content/60">
            Select a conversation from the sidebar to start chatting
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
