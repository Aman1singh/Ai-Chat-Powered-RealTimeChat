# TODO: Group Passkey + Collaborative Code Editor Feature

## Backend Tasks
- [x] 1. Create `models/group.model.js` - Group schema with name, hashed passkey, creator, members, codeContent
- [x] 2. Create `models/groupMessage.model.js` - Group message schema (groupId, senderId, text, image)
- [x] 3. Create `controllers/group.controller.js` - createGroup, joinGroup, getMyGroups, getGroupMessages, sendGroupMessage, leaveGroup, getGroupCode, updateGroupCode
- [x] 4. Create `routes/group.route.js` - Register all group endpoints
- [x] 5. Update `lib/socket.js` - Add group room logic, code-change, cursor-move, group-message events, auto-delete on empty
- [x] 6. Update `index.js` - Register `/api/groups` route

## Frontend Tasks
- [x] 7. Create `store/useGroupStore.js` - Zustand store for groups, selectedGroup, code sync, cursors
- [x] 8. Create `components/GroupModal.jsx` - Modal for creating/joining groups with passkey
- [x] 9. Create `components/CodeEditor.jsx` - Collaborative textarea with live cursor indicators
- [x] 10. Create `components/GroupChatContainer.jsx` - Layout: Code Editor + Group Chat
- [x] 11. Update `components/Conversations.jsx` - Add Groups section below AI Assistant
- [x] 12. Update `components/Sidebar.jsx` - Add +Group button to open modal
- [x] 13. Update `components/ChatHeader.jsx` - Handle group header with Leave button
- [x] 14. Update `pages/HomePage.jsx` - Conditional render for groups vs 1-on-1

## Status: COMPLETE

