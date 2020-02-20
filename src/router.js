const express = require('express'),
    nodeCron = require('node-cron'),
    path = require('path'),
    moment = require('moment'),
    router = express.Router(),
    GameStates = require('./types').GameStatus;

const setupRouter = (middleware, io, adminSocket, participantSocket, databaseService) => {
    router.post('/games/create-game', async (req, res) => {
        await databaseService.createGame(req.body.gameId, game => {
            res.status(200).json(game);
            adminSocket.emit(`gamestate-${game.gamepin}`, game);
        });
    });

    router.put('/game/:gamepin/update-state', async (req, res) => {
        const { gamepin } = req.params;
        const { gamestatus } = req.body;

        const gamestate = await databaseService.setGameStateAndUpdateClients(
            gamestatus,
            gamepin,
            adminSocket,
            participantSocket
        );

        if (gamestatus === GameStates.IN_PROGRESS) {
            const cron = nodeCron.schedule(dateToCron(gamestate.value.endTime), async () => {
                await databaseService.setGameStateAndUpdateClients(
                    GameStates.FINISHED,
                    gamepin,
                    adminSocket,
                    participantSocket
                );
            });

            setTimeout(() => {
                cron.destroy();
            }, (15 + 5) * 60 * 1000);
        }

        res.status(200).send();
    });

    router.delete('/game/:gamepin/:uuid', async (req, res) => {
        const { gamepin, uuid } = req.params;

        const game = await databaseService.deleteParticipant(gamepin, uuid, participantSocket);
        adminSocket.emit(`gamestate-${game.gamepin}`, game);
    });

    router.get('/game/:gamepin/:uuid', async (req, res) => {
        const { gamepin, uuid } = req.params;

        const participant = await databaseService.getParticipant(gamepin, uuid);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.write(participant.content);
        res.end();
    });

    router.get('/ongoing-or-created-games', async (req, res) => {
        const ongoingOrCreatedGames = await databaseService.getCreatedOrOngoingGames();

        res.status(200).json(ongoingOrCreatedGames);
    });

    const dateToCron = date => {
        return moment(date).format('S m H D M d');
    };

    router.post('/toggle-winner', async (req, res) => {
        const body = req.body;

        const updatedGamestate = await databaseService.toggleWinner(body.gamepin, body.uuid);

        res.status(200).send(updatedGamestate);

        adminSocket.emit(`gamestate-${body.gamepin}`, updatedGamestate);
    });

    router.delete('/winners/:uuid', (req, res) => {
        // cache.deleteWinner(req.params.uuid);

        res.status(200).send();
        // io.emit('participants-winners', cache.getWinners());
    });

    router.put('/winners/:uuid/toggle', async (req, res) => {
        const toggledWinner = await databaseService.toggleWinner(req.params.uuid);
        res.status(200).json(toggledWinner);
    });

    if (process.env.NODE_ENV === 'development') {
        router.get('*', (req, res) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(
                middleware.fileSystem.readFileSync(
                    path.join(__dirname, `../development/index.html`)
                )
            );
            res.end();
        });
    } else {
        router.get('*', (req, res) => {
            res.sendFile('index.html', {
                root: path.join(__dirname, '../production'),
            });
        });
    }

    return router;
};

exports.setupRouter = setupRouter;
