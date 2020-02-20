const express = require('express');
const participants = express.Router();

const setupParticipantRoutes = (adminSocket, databaseService) => {
    participants.post('/create', async (req, res) => {
        const {
            body: { uuid, gamepin, name },
        } = req;
        let gamestate = await databaseService.getGamestate(gamepin);

        if (gamestate) {
            const newParticipant = {
                name,
                uuid,
                gamepin,
                prosentLikhet: undefined,
                content: `<html>
        <style>
    
        </style>
        <body>
    
        </body>
    </html>`,
            };

            const updatedGamestate = await databaseService.updateGamestate({
                ...gamestate,
                participants: {
                    ...gamestate.participants,
                    [uuid]: newParticipant,
                },
            });

            adminSocket.emit(`gamestate-${gamepin}`, updatedGamestate);
            res.status(200).json(newParticipant);
        } else {
            res.status(404).json({
                message: `Gamestate for spill med game-pin ${gamepin} finnes ikke.`,
            });
        }
    });

    participants.post('/html', async (req, res) => {
        const body = req.body;

        const updatedGamestate = await databaseService.updateContentForParticipant(body);
        adminSocket.emit(`gamestate-${body.gamepin}`, updatedGamestate);

        res.status(200).send();
    });

    return participants;
};

module.exports = setupParticipantRoutes;
