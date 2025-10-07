import { Trash2 } from "lucide-react";

const ContextMenu = ({ isVisible, position, onClose, onDelete, userName }) => {
  if (!isVisible) return null;

  return (
    <div
      className="fixed bg-base-200 border border-base-300 rounded-lg shadow-lg z-50 min-w-32"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="p-2">
        <div className="px-3 py-1 text-xs text-zinc-400 mb-1">
          {userName}
        </div>
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-md transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Friend
        </button>
      </div>
    </div>
  );
};

export default ContextMenu;
