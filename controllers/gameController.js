// Import necessary models and utilities
const Room = require('../models/Room');

const gameController = {
  // Start the game (only host can start)
  startGame: async (req, res) => {
    const { roomCode } = req.body;

    try {
      // Find the room by room code
      const room = await Room.findOne({ code: roomCode }).populate('players');
      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      // Check if the current user is the host
      // For simplicity, assuming the host can start the game by making a request
      // In a real scenario, you would validate the host identity and permissions
      // For now, we assume the host can start the game
      const host = room.players.find(player => player.role === 'host');
      if (!host) {
        return res.status(403).json({ error: 'Only the host can start the game' });
      }

      // Assign roles to players
      const totalPlayers = room.players.length;
      const mafiaCount = Math.floor(totalPlayers / 6); // 1 mafia per 6 players

      let roles = ['mafia'];
      for (let i = 1; i < totalPlayers; i++) {
        roles.push('civilian');
      }

      // Shuffle roles array to randomize role assignments
      roles = roles.sort(() => Math.random() - 0.5);

      // Update players with assigned roles
      for (let i = 0; i < totalPlayers; i++) {
        const player = room.players[i];
        player.role = roles[i];
        await player.save();
      }

      // Initialize game state
      const game = new Game({
        room: room._id
      });
      await game.save();

      // Update room state to indicate game started
      room.gameStarted = true;
      await room.save();

      res.status(200).json({ message: 'Game started successfully', room, game });
    } catch (err) {
      console.error('Error starting game:', err);
      res.status(500).json({ error: 'Failed to start game' });
    }
  },

  // Mafia night action
  handleNightActionMafia: async (req, res) => {
    const { roomId, userId } = req.params;
    const { mafiaTarget } = req.body;

    try {
      const room = await Room.findById(roomId).populate('players');
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      const player = room.players.find(player => player._id.toString() === userId);
      if (!player || player.role !== 'Mafia') {
        return res.status(403).json({ message: 'Not authorized to perform this action' });
      }

      const targetPlayer = room.players.id(mafiaTarget);
      if (targetPlayer) {
        targetPlayer.isAlive = false;
        targetPlayer.status = 'Dead';
        room.game.nightActions.mafiaTarget = mafiaTarget;
      }

      await room.save();
      res.json({ room });
    } catch (error) {
      console.error('Error handling mafia night action:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  //police night action
  handleNightActionPolice: async (req, res) => {
    const { roomId, userId } = req.params;
    const { policeGuess } = req.body;

    try {
      const room = await Room.findById(roomId).populate('players');
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      const player = room.players.find(player => player._id.toString() === userId);

      if (!player || player.role !== 'Police') {
        return res.status(403).json({ message: 'Not authorized to perform this action' });
      }

      room.game.nightActions.policeGuess = policeGuess;

      // Move to day phase if both actions are complete
      if (room.game.nightActions.mafiaTarget && room.game.nightActions.policeGuess) {
        room.phase = 'Day';
        room.game.phase = 'Day';

        const mafiaKilledPlayer = room.players.find(player => player._id.toString() === room.game.nightActions.mafiaTarget);
        if (mafiaKilledPlayer) {
          mafiaKilledPlayer.isAlive = false;
          mafiaKilledPlayer.status = 'Dead';
        }

        const mafiaPlayer = room.players.find(player => player.role === 'Mafia');
        if (policeGuess === mafiaPlayer._id.toString()) {
          const message = `Police won! The mafia player ${mafiaPlayer.name} was correctly identified.`;
          room.winner = 'Police';
        }

        await room.save();
        // const io = req.app.get('io');
        // io.to(roomId).emit('gameStateUpdate', room);
      } else {
        await room.save();
      }

      res.json({ room });
    } catch (error) {
      console.error('Error handling police night action:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },

  // Nomination of players
  handleNomination: async (req, res) => {
    const { roomId } = req.params;
    const { nominatedPlayerId, voterId } = req.body;

    try {
      const room = await Room.findById(roomId);

      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      // Remove voter's ID from any previous nominations
      room.players.forEach(player => {
        const voteIndex = player.votes.indexOf(voterId);
        if (voteIndex !== -1) {
          player.votes.splice(voteIndex, 1);
        }
        // Set hasVoted to false for all players
        if (player._id.toString() === voterId) {
          player.hasVoted = false;  // Reset the voter's status
        }
      });

      // Add voter's ID to the nominated player
      const nominatedPlayer = room.players.find(player => player._id.toString() === nominatedPlayerId);
      const voterPlayer = room.players.find(player => player._id.toString() === voterId);

      if (nominatedPlayer && voterPlayer) {
        nominatedPlayer.votes.push(voterId);
        voterPlayer.hasVoted = true;  // Set hasVoted to true for the voter
      }

      await room.save();
      res.json({ room });
    } catch (error) {
      console.error('Error handling nomination:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },


  // Voting of players
  handleVote: async (req, res) => {
    const { roomId } = req.params;

    try {
      const room = await Room.findById(roomId);

      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      // Check if all alive players have voted
      const allPlayersVoted = room.players.every(player =>
        (player.status === 'Dead' || player.hasVoted)  // Dead players are ignored, alive players must have voted
      );

      if (!allPlayersVoted) {
        return res.status(400).json({ message: 'Not all players have voted' });
      }

      // Calculate the player with the most votes
      let mostVotedPlayer = null;
      let maxVotes = 0;

      room.players.forEach(player => {
        if (player.votes.length > maxVotes) {
          maxVotes = player.votes.length;
          mostVotedPlayer = player;
        }
      });

      if (mostVotedPlayer) {
        // Update nominations with the player who has the most votes
        room.nominations.push({
          round: room.nominations.length + 1, // Increment the round number
          player: mostVotedPlayer._id,
          votes: maxVotes
        });

        // Check if the voted-out player is a Mafia member
        if (mostVotedPlayer.role === 'Mafia') {
          room.winner = 'Civilian';
          room.phase = 'GameOver'; // End the game if Mafia is eliminated
        } else {
          // Continue the game to the next phase
          room.winner = 'Mafia';
          room.phase = 'GameOver'; // End the game if Mafia is not eliminated

          // Continue the game to the next phase
          // room.phase = 'night'; // Or 'day' depending on your game logic
          // room.game.nightActions.mafiaTarget = null;
          // room.game.nightActions.policeGuess = null;
        }

        // Reset votes for the next round
        room.players.forEach(player => {
          player.votes = [];
          player.hasVoted = false; // Reset hasVoted for all players
        });

        await room.save();

        res.json(room);
      } else {
        res.status(400).json({ message: 'No player received votes' });
      }
    } catch (error) {
      console.error('Error handling voting:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },




};

module.exports = gameController;
