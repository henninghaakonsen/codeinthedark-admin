const DatabaseService = require('./services/databaseService');
const express = require('express'),
    path = require('path'),
    fs = require('fs'),
    gamesConfig = require('./assets/gamesConfig'),
    router = express.Router();

/**
 * gamestate: status, gameEnd
 */
const statuses = {
    IN_PROGRESS: 'IN_PROGRESS',
    WAITING: 'WAITING',
};

class Cache {
    constructor() {
        this.gameState = {};
        this.cache = {};
        this.winners = {};
    }

    setGameState(state, gamepin) {
        this.gameState[gamepin] = state;
    }

    updateCache(dirtyCache) {
        this.cache = dirtyCache;
    }

    updateWinners(dirtyWinners) {
        this.winners = dirtyWinners;
    }

    getGameState(gamepin) {
        return this.gameState[gamepin];
    }

    getCache() {
        return this.cache;
    }

    getParticipant(uuid) {
        return this.cache[uuid];
    }

    getWinners() {
        return this.winners;
    }

    deleteElement(uuid) {
        delete this.cache[uuid];
    }

    deleteWinner(uuid) {
        delete this.winners[uuid];
    }
}

const cache = new Cache();

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

        cache.updateCache({
            ...cache.getCache(),
            [body.uuid]: body,
        });
        res.status(200).send();

        io.emit('participant-data', body);
    });

    router.put('/setState/:gamepin', async (req, res) => {
        const { gamepin } = req.params;

        const gamestate = await databaseService.setGameState(statuses.IN_PROGRESS, gamepin);
        participantSocket.emit('gamestate', gamestate);
        res.status(200).json(gamestate);
    });

    router.get('/participant-data', (req, res) => {
        res.status(200).send(cache);
    });

    router.delete('/participant-data', (req, res) => {
        cache.updateCache({});
        cache.setGameState();

        res.status(200).send();
        io.emit('status', cache.getGameState());
        io.emit('reset', cache.getCache());
    });

    router.delete('/participant-data/:uuid', (req, res) => {
        cache.deleteElement(req.params.uuid);

        res.status(200).send();
        io.emit('participants-data', cache.getCache());
    });

    router.post('/new-winner', (req, res) => {
        const body = req.body;

        databaseService.updateWinners(body);

        res.status(200).send();
        io.emit('participants-winners', cache.getWinners());
    });

    router.delete('/winners/:uuid', (req, res) => {
        cache.deleteWinner(req.params.uuid);

        res.status(200).send();
        io.emit('participants-winners', cache.getWinners());
    });

    router.put('/winners/:uuid/toggle/', async (req, res) => {
        const toggledWinner = await databaseService.toggleWinner(req.params.uuid);
        res.status(200).json(toggledWinner);
    });

    router.get('/games/:game', (req, res) => {
        res.status(200).send(
            fs.readFileSync(path.join(__dirname, `./assets/games/${req.params.game}.html`), 'UTF-8')
        );
    });

    router.get('/ressurshjelp/:game', (req, res) => {
        res.status(200).send(
            fs.readFileSync(path.join(__dirname, `./assets/games/${req.params.game}.json`), 'UTF-8')
        );
    });

    // Games
    router.get('/games', (req, res) => {
        res.status(200).send(gamesConfig);
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
