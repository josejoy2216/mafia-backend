# Mafia Game Backend

This is the backend for the **Mafia Game**, a real-time multiplayer game using **Node.js**, **Express**, **MongoDB**, and **Socket.IO**.

## Features
- **Real-time Gameplay** using WebSockets
- **Role-based Game Logic** (Mafia, Police, Civilian)
- **Automated Room Deletion** for inactive games
- **Chat System** inside game rooms
- **Game Phases** (Night, Day, Voting, Elimination)
- **Database Storage** with MongoDB

---

## Installation

### Prerequisites
Ensure you have the following installed:
- **Node.js** (v16+ recommended)
- **MongoDB** (Atlas or Local Instance)

### 1. Clone the Repository
```sh
git clone https://github.com/josejoy2216/mafia-backend.git
cd mafia-backend
```

### 2. Install Dependencies
```sh
npm install
```

### 3. Configure Environment Variables
Create a **.env** file in the root directory and add your MongoDB connection string:
```env
MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<database>?retryWrites=true&w=majority
PORT=5000
```
📌 **Note:** If using MongoDB Atlas, ensure your cluster is active and accessible. Atlas **closes clusters** if not used for a long time. Check your database connection before running the server.

### 4. Start the Server
Run the server using **nodemon**:
```sh
nodemon start
```
Or without nodemon:
```sh
node index.js
```

---

## API Endpoints

### **Room Management**
| Method | Endpoint             | Description              |
|--------|----------------------|--------------------------|
| POST   | `/api/rooms/create`  | Create a new room       |
| DELETE | `/api/rooms/:roomId` | Delete a specific room  |
| GET    | `/api/rooms/:roomId` | Fetch room details      |

### **Game Actions**
| Method | Endpoint               | Description               |
|--------|------------------------|---------------------------|
| POST   | `/api/rooms/start`     | Start the game           |
| POST   | `/api/rooms/vote`      | Submit a vote            |
| POST   | `/api/rooms/action`    | Perform night actions    |

---

## WebSocket Events
| Event Name       | Triggered By        | Description |
|------------------|--------------------|-------------|
| `createRoom`    | Host                | Creates a new room |
| `deleteRoom`    | Admin               | Deletes a room |
| `startGame`     | Host                | Starts the game |
| `playerVote`    | Players             | Submits a vote |
| `gameUpdate`    | Server              | Sends game state updates |

---

## Scheduled Tasks (Cron Job)
A **cron job** runs every **10 minutes** to delete inactive rooms that haven't been used for **50 minutes**.

---

## Notes
- Ensure your MongoDB **Atlas cluster is active** before starting the backend.
- If the MongoDB URL is incorrect, the server **will not start**.
- The server uses **WebSockets** for real-time interaction, so ensure your frontend correctly connects to the socket server.

---

## License
This project is licensed under the MIT License.

---

### 📌 Need Help?
If you encounter any issues, feel free to open an issue on the repository or contact the project maintainers!

---

Happy Coding! 🚀
