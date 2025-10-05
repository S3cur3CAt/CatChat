import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Trash2 } from "lucide-react";

const AccountPage = () => {
  const { authUser, isDeletingAccount, deleteAccount } = useAuthStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Account Settings</h2>
          <p className="text-base-content/70">Manage your account preferences and security</p>
        </div>

        {/* Account Information */}
        <div className="bg-base-200/50 rounded-xl p-6 border border-base-300">
          <h3 className="font-semibold text-lg mb-4">Account Details</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-base-300">
              <div>
                <p className="font-medium">Account Status</p>
                <p className="text-sm text-base-content/60">Your account is active and in good standing</p>
              </div>
              <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
                Active
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-base-300">
              <div>
                <p className="font-medium">Member Since</p>
                <p className="text-sm text-base-content/60">Account creation date</p>
              </div>
              <span className="font-medium">{authUser?.createdAt?.split("T")[0]}</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Account ID</p>
                <p className="text-sm text-base-content/60">Your unique identifier</p>
              </div>
              <span className="font-mono text-sm text-base-content/70">{authUser?._id?.slice(0, 12)}...</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-900/10 border-2 border-red-500/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-500/10 rounded-lg">
              <Trash2 className="w-8 h-8 text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-xl text-red-400 mb-2">Danger Zone</h3>
              <p className="text-base-content/70 mb-4">
                Once you delete your account, there is no going back. This action will permanently delete your account and all associated data including:
              </p>
              <ul className="list-disc list-inside text-sm text-base-content/70 mb-6 space-y-1">
                <li>Your profile information</li>
                <li>All your messages and conversations</li>
                <li>Your uploaded files and media</li>
                <li>Your account settings and preferences</li>
              </ul>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn btn-error"
              >
                <Trash2 className="w-4 h-4" />
                Delete My Account Permanently
              </button>
            </div>
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
    </div>
  );
};

export default AccountPage;
