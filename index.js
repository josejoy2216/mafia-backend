require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socket = require('./socket/socket');
const cron = require('node-cron'); // Import the cron library
const Room = require('./models/Room'); // Import the Room model

const roomRoutes = require('./routes/roomRoutes');
//const gameRoutes = require('./routes/gameRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api', roomRoutes);
app.use('/api/vote', roomRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/endgame', roomRoutes);
app.use('/api/startgame', roomRoutes);
app.use('/api/night-action/mafia/', roomRoutes);
app.use('/api/night-action/police/', roomRoutes);
//app.use('/api/games', gameRoutes);

const server = http.createServer(app);
socket(server);

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB', err);
  });

// Function to check and delete expired rooms
const deleteExpiredRooms = async () => {
  try {
    const expirationTime = new Date(Date.now() - 50 * 60 * 1000); // 50 minutes ago
    const expiredRooms = await Room.find({ createdAt: { $lt: expirationTime } });

    for (const room of expiredRooms) {
      await Room.findByIdAndRemove(room._id);
      console.log(`Room ${room._id} deleted by cron job.`);
    }
  } catch (error) {
    console.error('Error deleting expired rooms:', error);
  }
};

// Schedule the cron job to run every minute
cron.schedule('* * * * *', () => {
  deleteExpiredRooms();
});

console.log('Cron job for deleting expired rooms has been set up.');
