import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  UserPlus,
  Mail,
  Shield,
  ShieldCheck,
  MoreVertical,
  Trash2,
} from "lucide-react";

const initialCollaborators = [
  {
    id: 1,
    name: "Alex Johnson",
    email: "alex@example.com",
    role: "Owner",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  },
  {
    id: 2,
    name: "Sarah Miller",
    email: "sarah@example.com",
    role: "Editor",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  },
  {
    id: 3,
    name: "David Chen",
    email: "david@example.com",
    role: "Viewer",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
  },
];

export const CollaboratorsTab = () => {
  const [collaborators, setCollaborators] = useState(initialCollaborators);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Editor");

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newCollaborator = {
      id: Date.now(),
      name: inviteEmail.split("@")[0], // placeholder name
      email: inviteEmail,
      role: inviteRole,
      avatar: `https://i.pravatar.cc/150?u=${inviteEmail}`,
    };

    setCollaborators([...collaborators, newCollaborator]);
    setInviteEmail("");
    setIsInviting(false);

    // Attempt to trigger the global toast notification
    if (typeof window !== "undefined" && window.showToast) {
      window.showToast(`Invitation sent to ${inviteEmail}`, "success");
    }
  };

  const removeUser = (id) => {
    setCollaborators(collaborators.filter((c) => c.id !== id));
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header and Invite Action */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-xl text-gray-900 dark:text-white">
            Team Members
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage who has access to this project workspace.
          </p>
        </div>
        <button
          onClick={() => setIsInviting(!isInviting)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Invite
        </button>
      </div>

      {/* Invite Form */}
      {isInviting && (
        <form
          onSubmit={handleInvite}
          className="p-4 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-xl flex flex-col sm:flex-row gap-3 animate-fade-in relative"
        >
          <div className="flex-1 relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Email address"
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none"
              required
            />
          </div>
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="w-full sm:w-32 px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-primary outline-none cursor-pointer"
          >
            <option value="Editor">Editor</option>
            <option value="Viewer">Viewer</option>
            <option value="Admin">Admin</option>
          </select>
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Send Invite
          </button>
        </form>
      )}

      {/* Collaborators List */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-800">
        <ul className="divide-y divide-gray-100 dark:divide-slate-700/50">
          {collaborators.map((user) => (
            <li
              key={user.id}
              className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border border-gray-100 dark:border-slate-600 object-cover bg-gray-100 dark:bg-slate-700"
                />
                <div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    {user.name}
                    {user.role === "Owner" && (
                      <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    )}
                  </p>
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 text-xs font-bold rounded-md border ${
                    user.role === "Owner"
                      ? "bg-primary-50 text-primary-700 border-primary-100 dark:bg-primary-900/20 dark:text-primary-400 dark:border-primary-800/30"
                      : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:border-slate-600"
                  }`}
                >
                  {user.role}
                </span>

                {user.role !== "Owner" && (
                  <button
                    onClick={() => removeUser(user.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors focus:outline-none"
                    title="Remove user"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

let root = null;
export function renderCollaborators() {
  const container = document.getElementById("project-collaborators-root");
  if (container) {
    if (!root) {
      root = createRoot(container);
    }
    setTimeout(() => {
      root.render(<CollaboratorsTab />);
    }, 50);
  }
}
