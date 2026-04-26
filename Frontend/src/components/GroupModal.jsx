import { useState } from "react";
import { X, Users, Plus, LogIn, Copy, Check, HelpCircle } from "lucide-react";
import { useGroupStore } from "../store/useGroupStore";
import toast from "react-hot-toast";

const GroupModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("create");
  const [groupName, setGroupName] = useState("");
  const [passkey, setPasskey] = useState("");
  const [joinGroupId, setJoinGroupId] = useState("");
  const [joinPasskey, setJoinPasskey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [createdGroup, setCreatedGroup] = useState(null);
  const [copied, setCopied] = useState(false);

  const { createGroup, joinGroup, selectGroup } = useGroupStore();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || !passkey.trim()) return;
    setIsLoading(true);
    const group = await createGroup({ name: groupName.trim(), passkey: passkey.trim() });
    setIsLoading(false);
    if (group) {
      setCreatedGroup(group);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinGroupId.trim() || !joinPasskey.trim()) return;
    setIsLoading(true);
    const group = await joinGroup({ groupId: joinGroupId.trim(), passkey: joinPasskey.trim() });
    setIsLoading(false);
    if (group) {
      selectGroup(group);
      onClose();
    }
  };

  const copyCreatedId = () => {
    if (!createdGroup?._id) return;
    navigator.clipboard.writeText(createdGroup._id);
    setCopied(true);
    toast.success("Group ID copied! Share it with friends.");
    setTimeout(() => setCopied(false), 2000);
  };

  const enterCreatedGroup = () => {
    if (createdGroup) {
      selectGroup(createdGroup);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-base-100 rounded-xl shadow-xl w-full max-w-md p-6 m-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="size-6 text-primary" />
            <h2 className="text-xl font-bold">Groups</h2>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-circle btn-sm">
            <X className="size-5" />
          </button>
        </div>

        <div className="tabs tabs-boxed mb-6">
          <button
            className={`tab flex-1 gap-2 ${activeTab === "create" ? "tab-active" : ""}`}
            onClick={() => { setActiveTab("create"); setCreatedGroup(null); }}
          >
            <Plus className="size-4" /> Create
          </button>
          <button
            className={`tab flex-1 gap-2 ${activeTab === "join" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("join")}
          >
            <LogIn className="size-4" /> Join
          </button>
        </div>

        {activeTab === "create" ? (
          createdGroup ? (
            <div className="space-y-4">
              <div className="alert alert-success">
                <Check className="size-5" />
                <span>Group "{createdGroup.name}" created successfully!</span>
              </div>
              <div className="bg-base-200 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">Share this Group ID with others:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-base-300 px-3 py-2 rounded font-mono break-all">
                    {createdGroup._id}
                  </code>
                  <button
                    onClick={copyCreatedId}
                    className="btn btn-ghost btn-circle btn-sm"
                  >
                    {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                  </button>
                </div>
                <p className="text-xs text-base-content/50">
                  Others can join using this ID + the passkey you set.
                </p>
              </div>
              <button onClick={enterCreatedGroup} className="btn btn-primary w-full">
                Enter Group
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">
                  <span className="label-text">Group Name</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="e.g. Code Squad"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="label">
                  <span className="label-text">Passkey</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="Min 4 characters"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  minLength={4}
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/50">
                    Others will need this passkey to join your group
                  </span>
                </label>
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
                {isLoading ? <span className="loading loading-spinner" /> : "Create Group"}
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="bg-base-200/50 p-3 rounded-lg flex items-start gap-2">
              <HelpCircle className="size-4 mt-0.5 text-primary shrink-0" />
              <div className="text-xs text-base-content/70 space-y-1">
                <p><strong>What is a Group ID?</strong></p>
                <p>A Group ID is a unique code that identifies a group. Ask the group creator to share it with you. It looks like: <code className="bg-base-300 px-1 rounded">6879f2a1b3c4d5e6f7g8h9i0</code></p>
              </div>
            </div>
            <div>
              <label className="label">
                <span className="label-text">Group ID</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full font-mono"
                placeholder="Paste the Group ID here"
                value={joinGroupId}
                onChange={(e) => setJoinGroupId(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Passkey</span>
              </label>
              <input
                type="password"
                className="input input-bordered w-full"
                placeholder="Enter the group passkey"
                value={joinPasskey}
                onChange={(e) => setJoinPasskey(e.target.value)}
                required
              />
              <label className="label">
                <span className="label-text-alt text-base-content/50">
                  The creator set this passkey when making the group
                </span>
              </label>
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
              {isLoading ? <span className="loading loading-spinner" /> : "Join Group"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default GroupModal;

