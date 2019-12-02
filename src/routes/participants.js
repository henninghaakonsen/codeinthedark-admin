const express = require('express');
const DatabaseService = require('../services/databaseService');
const service = new DatabaseService();

const participants = express.Router();

participants.post('/create', async (req, res, next) => {
    const {
        body: { uuid, gamepin },
    } = req;
    const participantState = await service.getParticipantState(gamepin, uuid);
    if (participantState.length > 0) {
        res.json({ data: participantState[0] });
    } else {
        res.status(404).json({
            message: `Gamestate for spill med game-pin ${gamepin} finnes ikke.`,
        });
    }
});

module.exports = participants;
