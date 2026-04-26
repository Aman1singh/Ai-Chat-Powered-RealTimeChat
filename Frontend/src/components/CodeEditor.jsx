import { useRef, useEffect, useState, useCallback } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";

const USER_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#d946ef",
];

const getUserColor = (userId) => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
};

const CodeEditor = () => {
  const { groupCode, selectedGroup, setGroupCode, updateGroupCode, remoteCursors } = useGroupStore();
  const { authUser, socket } = useAuthStore();
  const textareaRef = useRef(null);
  const mirrorRef = useRef(null);
  const [cursorPixels, setCursorPixels] = useState({});

  // Calculate pixel positions for remote cursors
  useEffect(() => {
    if (!mirrorRef.current || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const mirror = mirrorRef.current;
    const style = window.getComputedStyle(textarea);

    // Sync styles to mirror
    mirror.style.fontFamily = style.fontFamily;
    mirror.style.fontSize = style.fontSize;
    mirror.style.lineHeight = style.lineHeight;
    mirror.style.padding = style.padding;
    mirror.style.borderWidth = style.borderWidth;
    mirror.style.width = textarea.clientWidth + "px";

    const newPixels = {};

    Object.entries(remoteCursors).forEach(([userId, cursor]) => {
      const pos = cursor.position || 0;
      const text = groupCode || "";
      const beforeCursor = text.slice(0, pos);
      const afterCursor = text.slice(pos);

      // Escape HTML
      const escapeHtml = (str) =>
        str
          .replace(/&/g, "&amp;")
          .replace(/</g, "<")
          .replace(/>/g, ">")
          .replace(/\n/g, "<br>");

      mirror.innerHTML =
        escapeHtml(beforeCursor) +
        `<span id="cursor-marker-${userId}" style="display:inline-block;width:2px;">|</span>` +
        escapeHtml(afterCursor);

      const marker = document.getElementById(`cursor-marker-${userId}`);
      if (marker) {
        const rect = marker.getBoundingClientRect();
        const mirrorRect = mirror.getBoundingClientRect();
        newPixels[userId] = {
          left: rect.left - mirrorRect.left,
          top: rect.top - mirrorRect.top,
          username: cursor.username || "User",
          color: cursor.color || getUserColor(userId),
        };
      }
    });

    setCursorPixels(newPixels);
  }, [remoteCursors, groupCode]);

  // Debounced save to backend and socket emit
  const debounceTimer = useRef(null);
  const emitCodeChange = useCallback(
    (code, cursorPos) => {
      if (socket && selectedGroup) {
        socket.emit("code-change", {
          groupId: selectedGroup._id,
          codeContent: code,
          cursorPosition: cursorPos,
        });
      }
    },
    [socket, selectedGroup]
  );

  const emitCursorMove = useCallback(
    (cursorPos) => {
      if (socket && selectedGroup) {
        socket.emit("cursor-move", {
          groupId: selectedGroup._id,
          cursorPosition: cursorPos,
          username: authUser?.fullName || "User",
          color: getUserColor(authUser?._id || ""),
        });
      }
    },
    [socket, selectedGroup, authUser]
  );

  const handleChange = (e) => {
    const newCode = e.target.value;
    const cursorPos = e.target.selectionStart;
    setGroupCode(newCode);
    emitCodeChange(newCode, cursorPos);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      updateGroupCode(selectedGroup._id, newCode);
    }, 1000);
  };

  const handleSelect = (e) => {
    const cursorPos = e.target.selectionStart;
    emitCursorMove(cursorPos);
  };

  const handleKeyUp = (e) => {
    const cursorPos = e.target.selectionStart;
    emitCursorMove(cursorPos);
  };

  const handleClick = (e) => {
    const cursorPos = e.target.selectionStart;
    emitCursorMove(cursorPos);
  };

  // Sync remote code updates while preserving local cursor
  useEffect(() => {
    if (textareaRef.current && groupCode !== textareaRef.current.value) {
      const textarea = textareaRef.current;
      const prevSelection = textarea.selectionStart;
      textarea.value = groupCode;
      textarea.selectionStart = textarea.selectionEnd = prevSelection;
    }
  }, [groupCode]);

  const lines = (groupCode || "").split("\n");

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-base-300 rounded-lg">
      {/* Language indicator */}
      <div className="flex items-center justify-between px-3 py-1 bg-base-200 border-b border-base-300">
        <span className="text-xs font-mono text-base-content/70">Code Editor</span>
        <span className="text-xs badge badge-sm">Collaborative</span>
      </div>

      <div className="relative flex-1 flex overflow-hidden">
        {/* Line numbers */}
        <div className="w-10 flex-shrink-0 bg-base-200 border-r border-base-300 py-2 text-right pr-2 select-none overflow-hidden">
          {lines.map((_, i) => (
            <div key={i} className="text-xs text-base-content/50 font-mono leading-6">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Editor area */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            className="absolute inset-0 w-full h-full resize-none bg-transparent p-2 font-mono text-sm text-base-content outline-none z-10"
            value={groupCode || ""}
            onChange={handleChange}
            onKeyUp={handleKeyUp}
            onClick={handleClick}
            onSelect={handleSelect}
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
          />

          {/* Hidden mirror for cursor calculation */}
          <pre
            ref={mirrorRef}
            aria-hidden="true"
            className="absolute top-0 left-0 invisible pointer-events-none whitespace-pre-wrap break-words overflow-hidden p-2 font-mono text-sm"
            style={{ wordWrap: "break-word" }}
          />

          {/* Remote cursor indicators */}
          {Object.entries(cursorPixels).map(([userId, pixel]) => (
            <div
              key={userId}
              className="absolute pointer-events-none z-20 flex flex-col items-start"
              style={{
                left: pixel.left + 8,
                top: pixel.top + 8,
              }}
            >
              <div
                className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white mb-0.5 shadow-sm"
                style={{ backgroundColor: pixel.color }}
              >
                {pixel.username}
              </div>
              <div
                className="w-0.5 h-5"
                style={{ backgroundColor: pixel.color }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;

