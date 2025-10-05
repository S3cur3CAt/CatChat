import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import ImageCropper from "../components/ImageCropper";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, isDeletingAccount, deleteAccount } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tempImage, setTempImage] = useState(null); // Imagen temporal para el cropper
  const [showCropper, setShowCropper] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    console.log("📸 Archivo seleccionado:", file);
    alert("Archivo seleccionado: " + file?.name);
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
        console.log("📸 Imagen cargada, abriendo cropper");
        setTempImage(reader.result);
        setShowCropper(true);
        console.log("📸 showCropper establecido a true");
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

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold ">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}

          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
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
            <p className="text-sm text-zinc-400">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
            
            {/* Botón de prueba temporal */}
            <button
              onClick={() => {
                console.log("🔧 Prueba: abriendo cropper manualmente");
                setTempImage(authUser.profilePic || "/avatar.png");
                setShowCropper(true);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Test Cropper
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.fullName}</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </div>
              <p className="px-4 py-2.5 bg-base-200 rounded-lg border">{authUser?.email}</p>
            </div>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{authUser.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-6 bg-red-900/20 border border-red-500/20 rounded-xl p-6">
            <h2 className="text-lg font-medium text-red-400 mb-4">Danger Zone</h2>
            <p className="text-sm text-zinc-400 mb-4">
              Once you delete your account, there is no going back. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-base-200 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-red-400 mb-4">Delete Account</h3>
            <p className="text-zinc-300 mb-6">
              Are you absolutely sure you want to delete your account? This will permanently delete your account and all associated data including messages.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-zinc-600 hover:bg-zinc-700 rounded-lg transition-colors"
                disabled={isDeletingAccount}
              >
                Cancel
              </button>
              <button
                onClick={deleteAccount}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                disabled={isDeletingAccount}
              >
                {isDeletingAccount ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {showCropper && tempImage ? (
        <ImageCropper
          imageUrl={tempImage}
          onSave={handleSaveCroppedImage}
          onCancel={handleCancelCrop}
        />
      ) : null}
    </div>
  );
};
export default ProfilePage;
