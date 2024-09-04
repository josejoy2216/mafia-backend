const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ['Mafia', 'Police', 'Civilian'], default: 'Civilian' },
  status: { type: String, enum: ['Alive', 'Dead', 'Spectator'], default: 'Alive' },
  isAlive: { type: Boolean, default: true },
  canVote: { type: Boolean, default: true },
  hasVoted: { type: Boolean, default: false },
  votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }] // IDs of players who voted for this player
});

const gameSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  phase: { type: String, enum: ['Night', 'Day'], default: 'Night' },
  nightActions: {
    mafiaTarget: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' , default: null },
    policeGuess: { type: mongoose.Schema.Types.ObjectId, ref: 'Player',  default: null }
  },
  dayActions: {
    votes: [{ voter: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }, target: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' } }]
  }
});

const chatMessageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  sender: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const roomSchema = new mongoose.Schema({
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  code: { type: String, required: true, unique: true },
  winner: { type: String, enum: ['Mafia', 'Police', 'Civilian','Nowinner'], default: 'Nowinner' },
  players: [playerSchema], // Embedding playerSchema here
  gameStarted: { type: Boolean, default: false },
  phase: { type: String, enum: ['Waiting', 'Night', 'Day', 'GameOver'], default: 'Waiting' },
  nominations: [{
    round: { type: Number, required: true },
    player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    votes: { type: Number, required: true }
  }],
  game: gameSchema, // Embedding gameSchema here
  chatMessages: [chatMessageSchema] 

});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;

