const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const playerController = require('../controllers/playerController');
const gameController = require('../controllers/gameController');
const chatController = require('../controllers/chatController');

// Route to create a new room
router.post('/create', roomController.createRoom);

// Route to join an existing room
router.post('/join', (req, res, next) => {
    console.log(`Received room code: ${req.body.roomCode}, player name: ${req.body.name}`);
    next();
  }, playerController.createPlayer);

// Route to get room details by code
router.get('/lobby/:roomId/:id', playerController.getAllPlayers);

// GET room by roomId and userId
router.get('/room/:roomId/:userId', roomController.getRoomDetails)

// Delete a room by id 
router.delete('/endgame/:roomId',   roomController.deleteRoomById)

// Delete player from the room using its id 
router.delete('/exitgame/:roomId/:playerId', roomController.removePlayerFromRoom);

// Route to start the game
router.post('/startgame/:roomId/:playerId',  roomController.startGame);

//Route to set a target set by mafia 
router.post('/night-action/mafia/:roomId/:userId', gameController.handleNightActionMafia);

//Route to get the guess of the police 
router.post('/night-action/police/:roomId/:userId', gameController.handleNightActionPolice);

// New routes for nomination and voting
router.post('/nominate/:roomId', gameController.handleNomination);

//host make the finall voting here 
router.post('/vote/:roomId',  gameController.handleVote);

//send the chat 
router.post('/chat', chatController.saveChatMessage);

//load the chat from the backend
router.get('/getchat/:roomId', chatController.getChatMessages);

module.exports = router;
