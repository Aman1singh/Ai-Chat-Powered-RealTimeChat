# Together code+chat

<div align="center">
  <img src="https://github.com/user-attachments/assets/0f97d9c8-bda6-4513-8f59-297283bc7600" alt="Home Page Screenshot" width="800"/>
</div>

<p align="center">
  <em>A seamless, intelligent real-time chat application powered by the Gemini API, enabling intelligent conversations between users and collaborative group coding sessions.</em>
</p>

<p align="center">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg"/>
  <img alt="React" src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"/>
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img alt="Socket.IO" src="https://img.shields.io/badge/Socket.io-010101?&style=for-the-badge&logo=socket.io&logoColor=white"/>
</p>

---

## ✨ Features

-   ⚡ **Real-Time Messaging:** Instantly send and receive messages with live updates via WebSockets.
-   🤖 **AI Integration:** Smart replies and message enhancements using the Google Gemini API.
-   🔐 **User Authentication:** Secure sign-up and login functionality with JWT.
-   📱 **Modern UI:** Sleek, responsive design built with React.js for a seamless experience on desktop and mobile.
-   🚀 **Scalable Backend:** Built with Node.js/Express.js to support multiple users and conversations concurrently.
-   👥 **Group Collaboration:** Create or join collaborative coding groups using a unique Group ID and Passkey
-   💻 **Real-Time Code Editing:** Multiple users can edit code simultaneously with live updates
-   🎯 **Live Cursor Tracking:** See other users' cursor positions in real-time
-   💬 **Group Chat:** Dedicated chat for group members during collaborative sessions

## 🛠️ Tech Stack

| Category                | Technology                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------- |
| **Frontend** | React.js, CSS, Tailwind CSS                                                                       |
| **Backend** | Node.js, Express.js                                                                 |
| **Database** | MongoDB                                                                             |
| **AI Services** | Gemini API                                                                          |
| **Real-Time Engine** | Socket.IO, WebSockets                                                               |
| **Authentication** | JSON Web Tokens (JWT)                                                               |
| **State Management** | Zustand                                                                             |

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18.x or later)
-   `npm` or `yarn` package manager
-   A running [MongoDB](https://www.mongodb.com/) instance (local or cloud)
-   A [Gemini API Key](https://ai.google.dev/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Aman1singh/Ai-Chat-Powered-RealTimeChat.git
    cd Ai-Chat-Powered-RealTimeChat
    ```

2.  **Install server dependencies:**
    ```bash
    cd Backend
    npm install
    ```

3.  **Install client dependencies:**
    ```bash
    cd ../Frontend
    npm install
    ```

### Environment Configuration

1.  Navigate to the `Backend` directory.
2.  Create a `.env` file by copying the example file:
    ```bash
    cp .env.example .env
    ```
3.  Open the `.env` file and add your credentials:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    GEMINI_API_KEY=your_gemini_api_key
    NODE_ENV=development
    ```

### Running the Application

You can run the frontend and backend servers concurrently from the root directory.

1.  **Start both servers (from the root project folder):**
    ```bash
    npm run dev
    ```
    This will start the backend server (typically on `http://localhost:5000`) and the frontend React app (typically on `http://localhost:3000`).

2.  **Alternatively, run them in separate terminals:**
    ```bash
    # In one terminal, start the backend server
    cd Backend
    npm run dev

    # In another terminal, start the frontend client
    cd Frontend
    npm run dev
    ```

3.  **Open your browser** and navigate to `http://localhost:3000`.

## 📁 Project Structure

```
/
├── Backend/                # Backend Node.js/Express application
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Mongoose database models (User, Message, Group, GroupMessage)
│   │   ├── routes/         # Express API routes
│   │   ├── lib/            # Socket.IO configuration
│   │   └── index.js        # Main server entry point
│   └── package.json
├── Frontend/               # Frontend React application
│   ├── public/
│   ├── src/
│   │   ├── components/     # React components (Sidebar, Conversations, CodeEditor, GroupModal)
│   │   ├── pages/          # Pages (HomePage, LoginPage, SignupPage)
│   │   ├── store/          # Zustand stores (useAuthStore, useGroupStore)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## 👥 Group Collaboration Feature

### Creating a Group

1. Click the **"+Group"** button in the sidebar
2. Choose **"Create New Group"**
3. Enter a group name and set a passkey (password for group access)
4. Share the **Group ID** and **Passkey** with team members

### Joining a Group

1. Click the **"+Group"** button in the sidebar
2. Choose **"Join Existing Group"**
3. Enter the **Group ID** and **Passkey** provided by the group creator
4. Click join to start collaborating

### Collaborative Code Editing

- **Real-Time Updates:** Code changes are synchronized across all members instantly
- **Live Cursor Tracking:** See other members' cursor positions highlighted in real-time
- **Group Chat:** Communicate with team members in the dedicated group chat window
- **Persistent Storage:** Code is saved in the database for future reference

### How It Works

```
Group Flow:
User A (Creator) → Creates Group with ID & Passkey
                ↓
User B, C (Members) → Join with ID & Passkey
                    ↓
                Real-Time WebSocket Connection (Socket.IO)
                    ↓
        Code Updates + Cursor Positions + Chat Messages
        synchronized across all connected members
```

## 📸 Screenshots

<details>
<summary>Click to view screenshots</summary>

| Login Page                                                                                                   | Signup Page                                                                       |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------|
| <img src="https://github.com/user-attachments/assets/3802cf5f-a90c-4e56-a20b-a8590524ef54" alt="Login Page" /> | <img src="https://github.com/user-attachments/assets/0519d267-4f1e-4065-9c1f-7ba..." alt="Signup Page" /> |

| AI Chat Interface                                                                                            | Chat in Action                                                                    |
| ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------|
| <img src="https://github.com/user-attachments/assets/3cd21228-73ff-4f3f-a8c3-3cab3ebb0ef4" alt="AI Chat" />     | <img src="https://github.com/user-attachments/assets/8c93fbf6-6f8a-44ee-8020-7e..." alt="Chat" /> |

</details>

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is distributed under the MIT License. See `LICENSE` for more information.

## 📬 Contact

Aman Singh - [GitHub](https://github.com/Aman1singh)

Project Link: [(https://github.com/Aman1singh/Together-Code-Chat)](https://github.com/Aman1singh/Together-Code-Chat)
