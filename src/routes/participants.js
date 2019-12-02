const express = require('express');
const DatabaseService = require('../services/databaseService');
const service = new DatabaseService();

const participants = express.Router();

participants.post('/create', async (req, res) => {
    const {
        body: { uuid, gamepin, name },
    } = req;
    let gamestate = await service.getGamestate(gamepin);

    if (gamestate) {
        const newParticipant = {
            name: name,
            uuid: uuid,
            gamepin: gamepin,
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

        console.log('Gamestate før update', gamestate);

        service.updateGamestate(gamestate);

        res.status(200).json(newParticipant);
    } else {
        res.status(404).json({
            message: `Gamestate for spill med game-pin ${gamepin} finnes ikke.`,
        });
    }
});

module.exports = participants;
