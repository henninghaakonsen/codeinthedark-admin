const express = require('express');
const DatabaseService = require('../services/databaseService');
const service = new DatabaseService();
const participants = express.Router();

const setupParticipantRoutes = adminSocket => {
    participants.post('/create', async (req, res) => {
        const {
            body: { uuid, gamepin, name },
        } = req;
        let gamestate = await service.getGamestate(gamepin);

        if (gamestate) {
            const newParticipant = {
                name,
                uuid,
                gamepin,
                content: `<html>
        <style>
    
        </style>
        <body>
    
        </body>
    </html>`,
            };

            gamestate.participants = {
                ...gamestate.participants,
                [uuid]: newParticipant,
            };

            await service.updateGamestate(gamestate);
            const updatedGamestate = await service.getGamestate(gamepin);

            console.log('updatedGamestate: ', updatedGamestate);
            adminSocket.emit(`gamestate-${gamepin}`, updatedGamestate);
            res.status(200).json(newParticipant);
        } else {
            res.status(404).json({
                message: `Gamestate for spill med game-pin ${gamepin} finnes ikke.`,
            });
        }
    });

    return participants;
};

module.exports = setupParticipantRoutes;
