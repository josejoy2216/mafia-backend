const Room = require('../models/Room');

const chatController = {
    
    saveChatMessage : async (req, res) => {
        console.log('Saving chat message:', req.body);
        const { roomId, sender, message } = req.body;

        try {
            const room = await Room.findById(roomId);

            if (!room) {
                return res.status(404).json({ message: 'Room not found' });
            }

            const chatMessage = { roomId, sender, message };

            room.chatMessages.push(chatMessage);
            await room.save();

            res.status(201).json(chatMessage);
        } catch (error) {
            res.status(500).json({ message: 'Error saving chat message', error });
        }
    },

    getChatMessages : async (req, res) => {
        const { roomId } = req.params;

        try {
            const room = await Room.findById(roomId);

            if (!room) {
                return res.status(404).json({ message: 'Room not found' });
            }

            res.status(200).json(room.chatMessages);
        } catch (error) {
            res.status(500).json({ message: 'Error fetching chat messages', error });
        }
    },
};

module.exports = chatController;
