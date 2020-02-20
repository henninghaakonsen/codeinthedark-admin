const express = require('express'),
    nodeCron = require('node-cron'),
    path = require('path'),
    matcher = require('./matcher'),
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

        const gamestate = await databaseService.setGameStatusAndUpdateClients(
            gamestatus,
            gamepin,
            adminSocket,
            participantSocket
        );

        if (gamestatus === GameStates.IN_PROGRESS) {
            const cron = nodeCron.schedule(dateToCron(gamestate.value.endTime), async () => {
                await databaseService.setGameStatusAndUpdateClients(
                    GameStates.FINISHED,
                    gamepin,
                    adminSocket,
                    participantSocket
                );

                const gamestate = await databaseService.getGamestate(gamepin);

                Promise.all(
                    Object.values(gamestate.participants).map(async participant => {
                        return matcher
                            .getMatchRate(
                                participant.content,
                                participant.uuid,
                                `sanity/games/${gamestate.gameId}`
                            )
                            .then(likhet => {
                                gamestate.participants[participant.uuid].prosentLikhet = likhet;
                                console.log('Likhet', likhet);
                            });
                    })
                ).then(async r => {
                    await databaseService.setGameStateAndUpdateClients(
                        gamestate,
                        gamepin,
                        adminSocket,
                        participantSocket
                    );
                });
            });

            setTimeout(() => {
                cron.destroy();
            }, (15 + 5) * 60 * 1000);
        }

        res.status(200).send();
    });

    router.get('/test/:gamepin', async (req, res) => {
        const { gamepin } = req.params;
        const gamestate = await databaseService.getGamestate(gamepin);

        Promise.all(
            Object.values(gamestate.participants).map(async participant => {
                return matcher
                    .getMatchRate(
                        participant.content,
                        participant.uuid,
                        `http://localhost:9000/sanity/games/${gamestate.gameId}`
                    )
                    .then(likhet => {
                        gamestate.participants[participant.uuid].prosentLikhet = likhet;
                        console.log('Likhet', likhet);
                    });
            })
        ).then(async r => {
            await databaseService.setGameStateAndUpdateClients(
                gamestate,
                gamepin,
                adminSocket,
                participantSocket
            );

            res.status(200).send();
        });
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

    router.post('/new-winner', (req, res) => {
        const body = req.body;

        databaseService.updateWinners(body);

        res.status(200).send();
        // TODO Emit vinnere fra databasen

        // io.emit('participants-winners', cache.getWinners());
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
