import { useMessageStyleStore } from "../store/useMessageStyleStore";
import { MessageCircle, Send, Palette, RotateCcw } from "lucide-react";

const ColorInput = ({ label, value, onChange, description }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-base-300 cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input input-bordered input-sm w-20 text-xs font-mono"
          placeholder="#000000"
        />
      </div>
    </div>
    {description && (
      <p className="text-xs text-base-content/60">{description}</p>
    )}
  </div>
);

const MessageStyleCustomizer = () => {
  const {
    messageColors,
    messageStyles,
    messageGlow,
    updateSentMessageColor,
    updateReceivedMessageColor,
    updateMessageStyle,
    updateMessageGlow,
    resetMessageStyles,
    getMessageStyle
  } = useMessageStyleStore();

  const handleReset = () => {
    resetMessageStyles();
  };

  const previewMessages = [
    { id: 2, text: "I'm doing great! Thanks for asking 😊", type: "sent", user: { name: "You", avatar: "/avatar.png" } },
    { id: 3, text: "That's awesome! Want to grab coffee later?", type: "received", user: { name: "User", avatar: "/avatar.png" } },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Message Appearance</h3>
            <p className="text-sm text-base-content/70">Customize how your messages look</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="btn btn-ghost btn-sm"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sent Messages Customization */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-primary">Sent Messages</h4>
          </div>
          
          <div className="bg-base-100 p-4 rounded-lg border border-base-300 space-y-4">
            <ColorInput
              label="Background Color"
              value={messageColors.sent.background}
              onChange={(value) => updateSentMessageColor('background', value)}
              description="Background color of your sent messages"
            />
            <ColorInput
              label="Text Color"
              value={messageColors.sent.text}
              onChange={(value) => updateSentMessageColor('text', value)}
              description="Text color of your sent messages"
            />
            <ColorInput
              label="Border Color"
              value={messageColors.sent.border}
              onChange={(value) => updateSentMessageColor('border', value)}
              description="Border color (use 'transparent' for no border)"
            />
          </div>
        </div>

        {/* Received Messages Customization */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-secondary" />
            <h4 className="font-semibold text-secondary">Received Messages</h4>
          </div>
          
          <div className="bg-base-100 p-4 rounded-lg border border-base-300 space-y-4">
            <ColorInput
              label="Background Color"
              value={messageColors.received.background}
              onChange={(value) => updateReceivedMessageColor('background', value)}
              description="Background color of received messages"
            />
            <ColorInput
              label="Text Color"
              value={messageColors.received.text}
              onChange={(value) => updateReceivedMessageColor('text', value)}
              description="Text color of received messages"
            />
            <ColorInput
              label="Border Color"
              value={messageColors.received.border}
              onChange={(value) => updateReceivedMessageColor('border', value)}
            />
          </div>
        </div>
      </div>

      {/* Additional Styles */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-accent" />
          <h4 className="font-semibold text-accent">Message Styling</h4>
        </div>
        
        <div className="bg-base-100 p-4 rounded-lg border border-base-300">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Enable Message Background</label>
              <p className="text-xs text-base-content/60 mt-1">
                Toggle message background colors on/off
              </p>
            </div>
            <input
              type="checkbox"
              checked={messageStyles.enableBackground}
              onChange={(e) => updateMessageStyle('enableBackground', e.target.checked)}
              className="toggle toggle-primary"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Border Radius</label>
            <select
              value={messageStyles.borderRadius}
              onChange={(e) => updateMessageStyle('borderRadius', e.target.value)}
              className="select select-bordered select-sm w-full"
            >
              <option value="4px">Small (4px)</option>
              <option value="8px">Medium (8px)</option>
              <option value="12px">Large (12px)</option>
              <option value="16px">Extra Large (16px)</option>
              <option value="24px">Rounded (24px)</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Font Size</label>
            <select
              value={messageStyles.fontSize}
              onChange={(e) => updateMessageStyle('fontSize', e.target.value)}
              className="select select-bordered select-sm w-full"
            >
              <option value="12px">Small (12px)</option>
              <option value="14px">Medium (14px)</option>
              <option value="16px">Large (16px)</option>
              <option value="18px">Extra Large (18px)</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Font Weight</label>
            <select
              value={messageStyles.fontWeight}
              onChange={(e) => updateMessageStyle('fontWeight', e.target.value)}
              className="select select-bordered select-sm w-full"
            >
              <option value="300">Light</option>
              <option value="400">Normal</option>
              <option value="500">Medium</option>
              <option value="600">Semi Bold</option>
              <option value="700">Bold</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Padding</label>
            <select
              value={messageStyles.padding}
              onChange={(e) => updateMessageStyle('padding', e.target.value)}
              className="select select-bordered select-sm w-full"
            >
              <option value="8px">Compact (8px)</option>
              <option value="12px">Normal (12px)</option>
              <option value="16px">Comfortable (16px)</option>
              <option value="20px">Spacious (20px)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Text Glow Effects */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-warning">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <h4 className="font-semibold text-warning">Text Glow Effects</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sent Messages Glow */}
          <div className="bg-base-100 p-4 rounded-lg border border-base-300">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Send className="w-4 h-4 text-primary" />
                  Sent Messages Glow
                </label>
                <p className="text-xs text-base-content/60 mt-1">
                  Add a glowing effect to sent message text
                </p>
              </div>
              <input
                type="checkbox"
                checked={messageGlow.sent}
                onChange={(e) => updateMessageGlow('sent', e.target.checked)}
                className="toggle toggle-primary"
              />
            </div>
          </div>

          {/* Received Messages Glow */}
          <div className="bg-base-100 p-4 rounded-lg border border-base-300">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-secondary" />
                  Received Messages Glow
                </label>
                <p className="text-xs text-base-content/60 mt-1">
                  Add a glowing effect to received message text
                </p>
              </div>
              <input
                type="checkbox"
                checked={messageGlow.received}
                onChange={(e) => updateMessageGlow('received', e.target.checked)}
                className="toggle toggle-secondary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="space-y-4">
        <h4 className="font-semibold">Live Preview</h4>
        <div className="rounded-xl border border-base-300 bg-base-100 overflow-hidden shadow-lg h-[400px]">
          <div className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="px-2.5 py-2 border-b border-base-300 flex-shrink-0 bg-base-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="avatar">
                    <div className="relative inline-block">
                      <div className="size-10 rounded-full overflow-hidden">
                        <img src="/avatar.png" alt="User" />
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-base-100 bg-green-500"></span>
                    </div>
                  </div>

                  {/* User info */}
                  <div>
                    <h3 className="font-medium">User</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 space-y-2 overflow-y-auto bg-base-100">
              {previewMessages.map((message, index) => {
                const showAvatar = index === 0 || previewMessages[index - 1].user.name !== message.user.name;
                const currentStyle = getMessageStyle(message.type);

                return (
                  <div
                    key={message.id}
                    className={`group relative flex items-start gap-3 px-4 py-2 transition-all duration-150 ${showAvatar ? 'mt-4' : 'mt-1'}`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-10 h-10">
                      {showAvatar ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-base-300">
                          <img src="/avatar.png" alt="User avatar" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <time className="text-xs text-base-content/50">12:00</time>
                        </div>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      {showAvatar && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-base-content text-sm">{message.user.name}</span>
                          <time className="text-xs text-base-content/50">12:00 PM</time>
                        </div>
                      )}
                      
                      <div className="flex justify-start">
                        <div
                          className="leading-relaxed break-words rounded-xl shadow-sm inline-block max-w-md transition-all duration-200"
                          style={currentStyle}
                        >
                          <p>{message.text}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat Input */}
            <div className="w-full px-4 py-3 bg-transparent border-t border-base-300">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <div className="flex items-center bg-transparent rounded-lg border border-base-300 focus-within:border-primary transition-colors">
                    <button type="button" className="ml-2 mr-1 rounded-lg hover:bg-base-200 transition-colors p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M13 3a1 1 0 1 0-2 0v8H3a1 1 0 1 0 0 2h8v8a1 1 0 0 0 2 0v-8h8a1 1 0 0 0 0-2h-8V3Z"/>
                      </svg>
                    </button>
                    <input type="text" className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-base placeholder:text-base-content/50" placeholder="Type a message..." value="" readOnly />
                    <button type="button" className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-primary hover:bg-base-200 mx-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                        <circle cx="9" cy="9" r="2"></circle>
                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default MessageStyleCustomizer;
