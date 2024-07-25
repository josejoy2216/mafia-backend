require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socket = require('./socket/socket');


const roomRoutes = require('./routes/roomRoutes');
//const gameRoutes = require('./routes/gameRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
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

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error connecting to MongoDB', err);
  });

