const { participants } = require('./socket');
const DatabaseService = require('./services/databaseService');
const express = require('express'),
    path = require('path'),
    router = express.Router();

/**
 * gamestate: status, gameEnd
 */
const statuses = {
    IN_PROGRESS: 'IN_PROGRESS',
    WAITING: 'WAITING',
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
        console.log(body);

        // cache.updateCache({
        //     ...cache.getCache(),
        //     [body.uuid]: body,
        // });

        // TODO Oppdater gamestate i db
        databaseService.updateGamestate(body);

        res.status(200).send();

        io.emit('participant-data', body);
        // Emit til admin-socket med oppdatert data
    });

    router.put('/game/:gamepin/update-state', async (req, res) => {
        const { gamepin } = req.params;
        const { gamestatus } = req.body;

        const gamestate = await databaseService.setGameState(gamestatus, gamepin);
        console.log('Participants', participants);
        adminSocket.emit(`gamestate-${gamepin}`, gamestate.value);

        const emitParticipants = participants[gamepin];
        if (emitParticipants) {
            Object.values(emitParticipants).map(async participant => {
                const participantData = await databaseService.getParticipant(
                    gamepin,
                    participant.uuid
                );
                participantSocket.connected[participant.id].emit(`gamestate`, participantData);
            });
        }

        res.status(200).send();
    });

    router.delete('/participant-data', (req, res) => {
        // TODO Slett fra databasen

        res.status(200).send();

        // TODO Emit status og reset
        // io.emit('status', cache.getGameState());
        // io.emit('reset', cache.getCache());
    });

    router.delete('/participant-data/:uuid', (req, res) => {
        // TODO Slett participant data i db

        // cache.deleteElement(req.params.uuid);

        res.status(200).send();
        // TODO Emit participants-data fra db

        // io.emit('participants-data', cache.getCache());
    });

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
