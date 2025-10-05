import { useState, useEffect } from "react";
import { useCustomThemeStore } from "../store/useCustomThemeStore";
import { useThemeStore } from "../store/useThemeStore";
import { Palette, Save, Eye, X, Trash2, Edit3, Sparkles } from "lucide-react";

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

const CustomThemeEditor = ({ isOpen, onClose }) => {
  const { setTheme } = useThemeStore();
  const {
    currentCustomTheme,
    customThemes,
    updateThemeColor,
    updateThemeName,
    saveCustomTheme,
    deleteCustomTheme,
    loadThemeForEdit,
    resetCurrentTheme,
    previewTheme
  } = useCustomThemeStore();

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    if (isPreviewMode) {
      previewTheme();
    }
  }, [currentCustomTheme.colors, isPreviewMode, previewTheme]);

  const handleSave = async () => {
    try {
      setSaveError("");
      const themeId = saveCustomTheme();
      setSaveSuccess(`Theme "${currentCustomTheme.name}" saved successfully!`);
      setTimeout(() => setSaveSuccess(""), 3000);
      
      // Aplicar el tema guardado
      setTheme(themeId);
    } catch (error) {
      setSaveError(error.message);
    }
  };

  const handlePreviewToggle = () => {
    setIsPreviewMode(!isPreviewMode);
    if (isPreviewMode) {
      // Restaurar tema original al salir del preview
      const currentTheme = localStorage.getItem("chat-theme") || "coffee";
      setTheme(currentTheme);
    }
  };

  const handleClose = () => {
    if (isPreviewMode) {
      // Restaurar tema original al cerrar
      const currentTheme = localStorage.getItem("chat-theme") || "coffee";
      setTheme(currentTheme);
      setIsPreviewMode(false);
    }
    onClose();
  };

  const colorGroups = [
    {
      title: "Primary Colors",
      colors: [
        { key: "primary", label: "Primary", description: "Main interface color" },
        { key: "primaryContent", label: "Primary Text", description: "Text on primary color" },
        { key: "secondary", label: "Secondary", description: "Secondary color" },
        { key: "secondaryContent", label: "Secondary Text", description: "Text on secondary color" },
        { key: "accent", label: "Accent", description: "Accent color for highlights" },
        { key: "accentContent", label: "Accent Text", description: "Text on accent color" },
      ]
    },
    {
      title: "Background Colors",
      colors: [
        { key: "base100", label: "Main Background", description: "Main application background" },
        { key: "base200", label: "Secondary Background", description: "Secondary elements background" },
        { key: "base300", label: "Tertiary Background", description: "Borders and dividers" },
        { key: "baseContent", label: "Main Text", description: "Main text color" },
        { key: "neutral", label: "Neutral", description: "Neutral color for elements" },
        { key: "neutralContent", label: "Neutral Text", description: "Text on neutral color" },
      ]
    },
    {
      title: "State Colors",
      colors: [
        { key: "info", label: "Info", description: "Color for information" },
        { key: "success", label: "Success", description: "Color for success states" },
        { key: "warning", label: "Warning", description: "Color for warnings" },
        { key: "error", label: "Error", description: "Color for errors" },
      ]
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm">
      <div className="bg-base-100 w-full h-full overflow-hidden relative">
        {/* Close button floating */}
        <button
          onClick={handleClose}
          className="fixed top-28 right-4 z-[110] w-10 h-10 rounded-full bg-base-200 hover:bg-base-300 border border-base-300 hover:border-base-400 flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl"
          aria-label="Close Custom Theme Editor"
        >
          <X className="w-5 h-5 text-base-content" />
        </button>

        <div className="h-full overflow-y-auto">
          <div className="p-6 pt-16 space-y-8">
            {/* Editor Section */}
            <section className="bg-base-200/50 rounded-xl border border-base-300 p-6 space-y-6">
              {/* Theme Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Theme Name</label>
                <input
                  type="text"
                  value={currentCustomTheme.name}
                  onChange={(e) => updateThemeName(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="My Custom Theme"
                />
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handlePreviewToggle}
                  className={`btn btn-sm ${isPreviewMode ? 'btn-warning' : 'btn-outline'}`}
                >
                  <Eye size={16} />
                  {isPreviewMode ? 'Exit Preview' : 'Preview'}
                </button>
                <button
                  onClick={handleSave}
                  className="btn btn-primary btn-sm"
                  disabled={!currentCustomTheme.name.trim()}
                >
                  <Save size={16} />
                  Save Theme
                </button>
                <button
                  onClick={resetCurrentTheme}
                  className="btn btn-ghost btn-sm"
                >
                  Reset
                </button>
              </div>

              {/* Alerts */}
              <div className="space-y-3">
                {saveError && (
                  <div className="alert alert-error">
                    <span>{saveError}</span>
                  </div>
                )}
                {saveSuccess && (
                  <div className="alert alert-success">
                    <Sparkles size={16} />
                    <span>{saveSuccess}</span>
                  </div>
                )}
              </div>

              {/* Color Editor */}
              <div className="space-y-6">
                {colorGroups.map((group) => (
                  <div key={group.title} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-primary">{group.title}</h3>
                      <span className="text-xs uppercase tracking-wide text-base-content/50">
                        {group.colors.length} colors
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.colors.map((color) => (
                        <ColorInput
                          key={color.key}
                          label={color.label}
                          value={currentCustomTheme.colors[color.key]}
                          onChange={(value) => updateThemeColor(color.key, value)}
                          description={color.description}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Saved Themes Section */}
            <section className="bg-base-200/50 rounded-xl border border-base-300 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Saved Themes</h3>
                <span className="text-xs uppercase tracking-wider text-base-content/60">
                  {Object.keys(customThemes).length} total
                </span>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {Object.entries(customThemes).map(([themeId, theme]) => (
                  <div
                    key={themeId}
                    className="p-4 bg-base-100 rounded-lg border border-base-300 hover:border-primary/50 transition-colors space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="font-medium truncate">{theme.name}</h4>
                        <p className="text-xs text-base-content/50 mt-1">
                          {new Date(theme.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1 justify-end">
                        <button
                          onClick={() => loadThemeForEdit(themeId)}
                          className="btn btn-ghost btn-xs"
                          title="Edit"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          onClick={() => setTheme(themeId)}
                          className="btn btn-primary btn-xs"
                          title="Apply"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          onClick={() => deleteCustomTheme(themeId)}
                          className="btn btn-error btn-xs"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1 h-7">
                      <div className="rounded-sm" style={{ backgroundColor: theme.colors.primary }}></div>
                      <div className="rounded-sm" style={{ backgroundColor: theme.colors.secondary }}></div>
                      <div className="rounded-sm" style={{ backgroundColor: theme.colors.accent }}></div>
                      <div className="rounded-sm" style={{ backgroundColor: theme.colors.base200 }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {Object.keys(customThemes).length === 0 && (
                <div className="text-center py-10 text-base-content/60">
                  <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No saved themes yet</p>
                  <p className="text-xs">Use the editor above to create your first theme</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomThemeEditor;
