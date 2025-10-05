import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { useCustomThemeStore } from "../store/useCustomThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Zap, Sparkles, Plus, Palette, User, Bell, Lock, Info, Camera, Mail, Paintbrush, LogOut, X } from "lucide-react";
import CustomThemeEditor from "../components/CustomThemeEditor";
import AccountPage from "./AccountPage";
import AppearancePage from "./AppearancePage";
import ImageCropper from "../components/ImageCropper";
import toast from "react-hot-toast";

// Configuración de secciones
const SETTINGS_SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Paintbrush },
  { id: 'themes', label: 'Themes', icon: Palette },
  { id: 'account', label: 'Account', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy & Safety', icon: Lock },
  { id: 'about', label: 'About', icon: Info },
];

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false, user: "You", avatar: "/avatar.png" },
  { id: 3, content: "That sounds awesome! What are you building?", isSent: false, user: "User", avatar: "/avatar.png" },
];

const SettingsPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeStore();
  const { customThemes } = useCustomThemeStore();
  const { authUser, isUpdatingProfile, updateProfile, logout } = useAuthStore();
  const [showCustomEditor, setShowCustomEditor] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [selectedImg, setSelectedImg] = useState(null);
  const [tempImage, setTempImage] = useState(null); // Para el ImageCropper
  const [showCropper, setShowCropper] = useState(false);

  const isNeonTheme = (themeName) => {
    return ['neon', 'synthwave', 'cyberpunk'].includes(themeName);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Validar tamaño del archivo (máximo 10MB para perfiles)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    try {
      // Convertir archivo a base64 para mostrar en el cropper
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImage(reader.result);
        setShowCropper(true);
      };
      reader.onerror = (error) => {
        console.error("Error leyendo archivo:", error);
        toast.error("Failed to read image file");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image");
    }
  };

  const handleSaveCroppedImage = async (croppedImage) => {
    try {
      setSelectedImg(croppedImage);
      setShowCropper(false);
      setTempImage(null);
      
      // Actualizar perfil con la imagen recortada
      await updateProfile({ profilePic: croppedImage });
      toast.success("Profile picture updated successfully");
      
      // Limpiar el input de archivo
      const fileInput = document.getElementById("avatar-upload");
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error("Failed to save image");
    }
  };

  const handleCancelCrop = () => {
    setShowCropper(false);
    setTempImage(null);
    
    // Limpiar el input de archivo
    const fileInput = document.getElementById("avatar-upload");
    if (fileInput) fileInput.value = "";
  };

  // Renderizar contenido según sección activa
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'appearance':
        return <AppearancePage />;
      case 'themes':
        return renderThemesSection();
      case 'account':
        return <AccountPage />;
      case 'notifications':
        return <div className="p-6"><h2 className="text-2xl font-bold">Notifications</h2><p className="text-base-content/70 mt-2">Coming soon...</p></div>;
      case 'privacy':
        return <div className="p-6"><h2 className="text-2xl font-bold">Privacy & Safety</h2><p className="text-base-content/70 mt-2">Coming soon...</p></div>;
      case 'about':
        return <div className="p-6"><h2 className="text-2xl font-bold">About</h2><p className="text-base-content/70 mt-2">CatChat v1.0.0</p></div>;
      default:
        return null;
    }
  };

  const renderProfileSection = () => (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Profile</h2>
          <p className="text-base-content/70">Manage your profile and account settings</p>
        </div>

        {/* Main Grid - 2 columns layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Avatar & Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avatar Card */}
            <div className="bg-base-200/50 rounded-xl p-6 border border-base-300">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <img
                    src={selectedImg || authUser?.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="size-32 rounded-full object-cover border-4 border-base-300"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className={`
                      absolute bottom-0 right-0 
                      bg-primary hover:bg-primary/90
                      p-2.5 rounded-full cursor-pointer 
                      transition-all duration-200 shadow-lg
                      ${isUpdatingProfile ? "animate-pulse pointer-events-none" : "hover:scale-110"}
                    `}
                  >
                    <Camera className="w-5 h-5 text-primary-content" />
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUpdatingProfile}
                    />
                  </label>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{authUser?.fullName}</h3>
                  <p className="text-sm text-base-content/60">
                    {isUpdatingProfile ? "Uploading..." : "Click camera to change"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details & Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-base-200/50 rounded-xl p-6 border border-base-300">
              <h3 className="font-semibold text-lg mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-base-content/70">
                    <User className="w-4 h-4" />
                    Full Name
                  </label>
                  <div className="px-4 py-3 bg-base-100 rounded-lg border border-base-300">
                    {authUser?.fullName}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2 text-base-content/70">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  <div className="px-4 py-3 bg-base-100 rounded-lg border border-base-300">
                    {authUser?.email}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );

  const renderThemesSection = () => (
    <div className="h-full overflow-y-auto p-6">
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Themes
            </h2>
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="text-base-content/70">Choose a theme for your chat interface</p>
        </div>

        {/* Sección de temas personalizados */}
        {Object.keys(customThemes).length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-secondary" />
                <h3 className="text-lg font-semibold text-secondary">Custom Themes</h3>
              </div>
              <button
                onClick={() => setShowCustomEditor(true)}
                className="btn btn-sm btn-outline btn-secondary"
              >
                <Plus size={16} />
                Create New
              </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {Object.entries(customThemes).map(([themeId, customTheme]) => (
                <button
                  key={themeId}
                  className={`
                    group relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300
                    ${theme === themeId 
                      ? "bg-gradient-to-br from-secondary/20 to-primary/20 border-2 border-secondary shadow-lg shadow-secondary/25" 
                      : "bg-base-200/50 hover:bg-base-200 hover:scale-105 border border-base-300"
                    }
                  `}
                  onClick={() => setTheme(themeId)}
                >
                  {/* Efecto de brillo para tema activo */}
                  {theme === themeId && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-secondary/10 to-primary/10 animate-pulse"></div>
                  )}
                  
                  <div className="relative h-10 w-full rounded-lg overflow-hidden shadow-md">
                    <div className="absolute inset-0 grid grid-cols-4 gap-px p-1.5">
                      <div className="rounded shadow-sm" style={{ backgroundColor: customTheme.colors.primary }}></div>
                      <div className="rounded shadow-sm" style={{ backgroundColor: customTheme.colors.secondary }}></div>
                      <div className="rounded shadow-sm" style={{ backgroundColor: customTheme.colors.accent }}></div>
                      <div className="rounded shadow-sm" style={{ backgroundColor: customTheme.colors.base200 }}></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold truncate text-center">
                      {customTheme.name}
                    </span>
                    <Sparkles className="w-3 h-3 text-secondary animate-pulse" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Botón para crear tema personalizado si no hay ninguno */}
        {Object.keys(customThemes).length === 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-secondary" />
                <h3 className="text-lg font-semibold text-secondary">Custom Themes</h3>
              </div>
            </div>
            <div className="text-center py-8 bg-gradient-to-br from-base-200/50 to-base-300/30 rounded-xl border-2 border-dashed border-base-300">
              <Palette className="w-12 h-12 mx-auto mb-3 text-base-content/40" />
              <h4 className="font-semibold mb-2">Create your first custom theme!</h4>
              <p className="text-sm text-base-content/70 mb-4">
                Design a unique theme with your favorite colors
              </p>
              <button
                onClick={() => setShowCustomEditor(true)}
                className="btn btn-primary btn-lg"
              >
                <Plus size={20} />
                Create Custom Theme
              </button>
            </div>
          </div>
        )}

        {/* Sección especial para temas neón */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold text-accent">Neon Collection</h3>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {THEMES.filter(isNeonTheme).map((t) => (
              <button
                key={t}
                className={`
                  group relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-300
                  ${theme === t 
                    ? "bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary shadow-lg shadow-primary/25" 
                    : "bg-base-200/50 hover:bg-base-200 hover:scale-105 border border-base-300"
                  }
                `}
                onClick={() => setTheme(t)}
              >
                {/* Efecto de brillo para tema activo */}
                {theme === t && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 animate-pulse"></div>
                )}
                
                <div className="relative h-10 w-full rounded-lg overflow-hidden shadow-md" data-theme={t}>
                  <div className="absolute inset-0 grid grid-cols-4 gap-px p-1.5">
                    <div className="rounded bg-primary shadow-sm"></div>
                    <div className="rounded bg-secondary shadow-sm"></div>
                    <div className="rounded bg-accent shadow-sm"></div>
                    <div className="rounded bg-neutral shadow-sm"></div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold truncate text-center">
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </span>
                  {t === 'neon' && <Sparkles className="w-3 h-3 text-accent animate-pulse" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Otros temas */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">All Themes</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {THEMES.filter(t => !isNeonTheme(t)).map((t) => (
              <button
                key={t}
                className={`
                  group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all duration-200
                  ${theme === t 
                    ? "bg-base-200 border border-primary/50 shadow-md" 
                    : "hover:bg-base-200/50 hover:scale-105"
                  }
                `}
                onClick={() => setTheme(t)}
              >
                <div className="relative h-8 w-full rounded-md overflow-hidden" data-theme={t}>
                  <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                    <div className="rounded bg-primary"></div>
                    <div className="rounded bg-secondary"></div>
                    <div className="rounded bg-accent"></div>
                    <div className="rounded bg-neutral"></div>
                  </div>
                </div>
                <span className="text-[11px] font-medium truncate w-full text-center">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Live Preview</h3>
            {isNeonTheme(theme) && (
              <div className="px-2 py-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full border border-primary/30">
                <span className="text-xs font-medium text-primary">NEON MODE</span>
              </div>
            )}
          </div>
          
          <div className={`
            rounded-xl border overflow-hidden shadow-lg transition-all duration-300 h-full
            ${isNeonTheme(theme) 
              ? "border-primary/30 shadow-primary/10 bg-gradient-to-br from-base-100 to-base-200/50" 
              : "border-base-300 bg-base-100"
            }
          `}>
            <div className="h-full flex flex-col">
                {/* Mock Chat UI */}
                <div className="flex-1 flex flex-col overflow-hidden">
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
                  {PREVIEW_MESSAGES.map((message) => (
                    <div
                      key={message.id}
                      className="group relative flex items-start gap-3 px-4 py-2 transition-all duration-150"
                    >
                      {/* Avatar - solo para mensajes recibidos */}
                      <div className="flex-shrink-0 w-10 h-10">
                        {!message.isSent && (
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-base-300">
                            <img
                              src="/avatar.png"
                              alt="User avatar"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>

                      {/* Message Content */}
                      <div className="flex-1 min-w-0">
                        {!message.isSent && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-base-content text-sm">{message.user || "User"}</span>
                            <time className="text-xs text-base-content/50">12:00 PM</time>
                          </div>
                        )}
                        
                        <div className={`flex ${message.isSent ? 'justify-end' : 'justify-start'}`}>
                          <div className={`leading-relaxed break-words rounded-xl p-3 shadow-sm inline-block max-w-md ${
                            message.isSent ? "bg-primary text-primary-content" : "bg-base-200"
                          }`}>
                            <p className="text-sm">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="w-full px-4 py-3 bg-transparent border-t border-base-300">
                  <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                      <div className="flex items-center bg-transparent rounded-lg border border-base-300 focus-within:border-primary transition-colors">
                        <button
                          type="button"
                          className="ml-2 mr-1 rounded-lg hover:bg-base-200 transition-colors p-1"
                          aria-label="Más opciones"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="currentColor"
                              d="M13 3a1 1 0 1 0-2 0v8H3a1 1 0 1 0 0 2h8v8a1 1 0 0 0 2 0v-8h8a1 1 0 0 0 0-2h-8V3Z"
                            />
                          </svg>
                        </button>
                        <input
                          type="text"
                          className="flex-1 px-4 py-3 bg-transparent border-none outline-none text-base placeholder:text-base-content/50"
                          placeholder="Type a message..."
                          value=""
                          readOnly
                        />
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-primary hover:bg-base-200 mx-1"
                        >
                          <Image size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 flex overflow-hidden ${window.electronAPI ? 'top-[88px]' : 'top-14'}`}>
      {/* Close Button - Floating top-right */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-28 right-4 z-50 w-10 h-10 rounded-full bg-base-200 hover:bg-base-300 border border-base-300 hover:border-base-400 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
        aria-label="Close Settings"
      >
        <X className="w-5 h-5 text-base-content" />
      </button>

      {/* Sidebar - Panel izquierdo */}
      <aside className="w-64 bg-base-200 border-r border-base-300 p-4 flex flex-col space-y-2 flex-shrink-0 h-full">
        <div className="mb-6">
          <h2 className="text-xl font-bold px-2">Settings</h2>
        </div>

        {/* Navigation buttons */}
        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
          {SETTINGS_SECTIONS.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200
                  ${activeSection === section.id
                    ? 'bg-primary text-primary-content font-medium'
                    : 'hover:bg-base-300 text-base-content'
                  }
                `}
              >
                <Icon className="size-5" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-2 border-t border-base-300 -mx-4 px-4 flex justify-end">
          <button
            onClick={logout}
            className="flex gap-2 items-center px-3 py-2 rounded-lg text-error hover:bg-error/10 transition-colors"
          >
            <LogOut className="size-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </aside>

      {/* Content Area - Área de contenido principal */}
      <main className="flex-1 h-full">
        {renderSectionContent()}
      </main>

      {/* Editor de temas personalizados */}
      <CustomThemeEditor 
        isOpen={showCustomEditor} 
        onClose={() => setShowCustomEditor(false)} 
      />
      
      {/* Image Cropper Modal */}
      {showCropper && tempImage && (
        <ImageCropper
          imageUrl={tempImage}
          onSave={handleSaveCroppedImage}
          onCancel={handleCancelCrop}
        />
      )}
    </div>
  );
};
export default SettingsPage;
