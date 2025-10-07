const TypingIndicator = ({ userName }) => {
  console.log("TypingIndicator rendered for:", userName);

  return (
    <div className="flex items-center gap-1 text-xs text-zinc-500 px-2 py-1">
      <div className="flex space-x-0.5">
        <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce"></div>
        <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span className="text-xs">{userName} is typing...</span>
    </div>
  );
};

export default TypingIndicator;
