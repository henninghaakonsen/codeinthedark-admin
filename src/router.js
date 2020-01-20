const DatabaseService = require('./services/databaseService');
const express = require('express'),
    nodeCron = require('node-cron'),
    path = require('path'),
    moment = require('moment'),
    router = express.Router();

/**
 * gamestate: status, gameEnd
 */
const statuses = {
    IN_PROGRESS: 'IN_PROGRESS',
    WAITING: 'WAITING',
    FINISHED: 'FINISHED',
};

const setupRouter = (middleware, io, adminSocket, participantSocket) => {
    const databaseService = new DatabaseService();

    router.post('/games/create-game', async (req, res) => {
        await databaseService.createGame(req.body.gameId, game => {
            res.status(200).json(game);
            adminSocket.emit(`gamestate-${game.gamepin}`, game);
        });
    });

    router.post('/participant-data', (req, res) => {
        const body = req.body;

        // cache.updateCache({
        //     ...cache.getCache(),
        //     [body.uuid]: body,
        // });
        res.status(200).send();

        io.emit('participant-data', body);
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

        if (gamestatus === statuses.IN_PROGRESS) {
            const cron = nodeCron.schedule(dateToCron(gamestate.value.endTime), async () => {
                await databaseService.setGameStateAndUpdateClients(
                    statuses.FINISHED,
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

    const dateToCron = date => {
        return moment(date).format('S m H D M d');
    };

    // router.get('/participant-data', (req, res) => {
    //     res.status(200).send(cache);
    // });

    router.delete('/participant-data', (req, res) => {
        // cache.updateCache({});
        // cache.setGameState();

        res.status(200).send();
        // io.emit('status', cache.getGameState());
        // io.emit('reset', cache.getCache());
    });

    router.delete('/participant-data/:uuid', (req, res) => {
        // cache.deleteElement(req.params.uuid);

        res.status(200).send();
        // io.emit('participants-data', cache.getCache());
    });

    router.post('/new-winner', (req, res) => {
        const body = req.body;

        databaseService.updateWinners(body);

        res.status(200).send();
        // io.emit('participants-winners', cache.getWinners());
    });

    router.delete('/winners/:uuid', (req, res) => {
        // cache.deleteWinner(req.params.uuid);

        res.status(200).send();
        // io.emit('participants-winners', cache.getWinners());
    });

    router.put('/winners/:uuid/toggle/', async (req, res) => {
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
