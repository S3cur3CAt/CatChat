import { useRef, useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useRealtimeStore } from "../store/useRealtimeStore";
import { Image, X } from "lucide-react";
import toast from "react-hot-toast";
import TypingIndicator from "./TypingIndicator";
import { compressImage } from "../lib/imageUtils";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { sendMessage, selectedUser } = useChatStore();
  const authUser = useAuthStore((state) => state.authUser);
  const typingUsers = useRealtimeStore((state) => state.typingUsers);
  const sendTypingEvent = useRealtimeStore((state) => state.sendTypingEvent);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validar tamaño (máximo 5MB para mensajes antes de compresión)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    try {
      // Comprimir imagen antes de mostrar preview
      const compressedBase64 = await compressImage(file, 800, 0.8);
      setImagePreview(compressedBase64);
      toast.success("Image compressed and ready to send");
    } catch (error) {
      console.error("Error compressing image:", error);
      toast.error("Failed to process image");
    }
  };
  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    const startTime = Date.now();
    console.log('Starting message send process...');
    try {
      console.log('Calling sendMessage...');
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
      });

      console.log('Cleaning up form...');
      // Stop typing when message is sent
      if (authUser && selectedUser) {
        console.log("Stopping typing on message send for user:", selectedUser._id);
        await sendTypingEvent(authUser.id, selectedUser._id || selectedUser.id, false);
      }

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      const endTime = Date.now();
      console.log(`Message send process completed in ${endTime - startTime}ms`);

    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  useEffect(() => {
    if (!authUser || !selectedUser) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      return;
    }

    if (!text.trim()) {
      // Clear timeout if text is empty
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      sendTypingEvent(authUser.id, selectedUser._id || selectedUser.id, false);
      return;
    }

    // Emit typing event
    console.log("Emitting typing event via Supabase for user:", selectedUser._id || selectedUser.id);
    sendTypingEvent(authUser.id, selectedUser._id || selectedUser.id, true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      console.log("Stopping typing due to timeout for user:", selectedUser._id || selectedUser.id);
      sendTypingEvent(authUser.id, selectedUser._id || selectedUser.id, false);
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [text, selectedUser, authUser, sendTypingEvent]);

  useEffect(() => {
    if (!authUser || !selectedUser) return;

    return () => {
      sendTypingEvent(authUser.id, selectedUser._id || selectedUser.id, false);
    };
  }, [authUser, selectedUser, sendTypingEvent]);

  return (
    <div className="w-full px-4 py-3 bg-transparent">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-end gap-2">
        <div className="flex-1 relative">
          <div className="flex items-center bg-transparent rounded-lg border border-base-300 focus-within:border-primary transition-colors">
            <button
              type="button"
              className="attachButton__0923f attachButton__74017 button__24af7 ml-2 mr-1 rounded-lg hover:bg-base-200 transition-colors p-1"
              aria-label="Más opciones de mensaje"
              aria-expanded="false"
              aria-haspopup="menu"
              aria-disabled="false"
              tabIndex={0}
            >
              <div className="buttonWrapper__24af7 attachButtonInner__0923f" style={{ opacity: 1, transform: "none" }}>
                <svg
                  aria-hidden="true"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M13 3a1 1 0 1 0-2 0v8H3a1 1 0 1 0 0 2h8v8a1 1 0 0 0 2 0v-8h8a1 1 0 0 0 0-2h-8V3Z"
                    className="attachButtonPlus__0923f"
                  />
                </svg>
              </div>
            </button>
            <input
              type="text"
              className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-base placeholder:text-base-content/50"
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            {/* Image upload button */}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />

            <button
              type="button"
              className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-primary hover:bg-base-200 mx-1"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image size={20} />
            </button>
          </div>

          {/* Typing indicator - show when other user is typing */}
          {selectedUser && typingUsers?.size > 0 && typingUsers.has(selectedUser._id || selectedUser.id) && (
            <div className="absolute -bottom-4 left-0">
              <TypingIndicator userName={selectedUser.fullName} />
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
