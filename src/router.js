const express = require('express'),
    path = require('path'),
    fs = require('fs'),
    matcher = require('./matcher'),
    router = express.Router();

const { participants } = require('./socket');
const DatabaseService = require('./services/databaseService');

/**
 * gamestate: status, gameEnd
 */
const statuses = {
    IN_PROGRESS: 'IN_PROGRESS',
    WAITING: 'WAITING',
};

const setupRouter = (middleware, io, adminSocket, participantSocket) => {
    const databaseService = new DatabaseService();

    router.get('/game/:gamepin/:uuid', (req, res) => {
        const uuid = req.params.uuid;
        const gamepin = req.params.gamepin;
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.write(databaseService.getParticipant(gamepin, uuid));
        res.end();
    });

    router.get('/game/:gamepin/matcher', async (req, res) => {
        const gamepin = req.params.gamepin;
        const gamestate = await databaseService.getGamestate(gamepin);

        Object.values(gamestate.participants).map(participant => {
            console.log(
                'Likhet: ',
                matcher.getMatchRate(
                    `http://localhost:9000/participant/${participant.uuid}`,
                    participant.uuid,
                    'http://localhost:9000/fagdag-okt-19/puljer'
                ),
                '%'
            );
        });

        res.status(200).send();
    });

    router.get('/games/:gameid', (req, res) => {
        client
            .fetch('*[_type == "game" && ]')
            .then((fetchedContent: IGame) => {
                setGames(fetchedContent);
            })
            .catch((error: Error) => {
                alert(error.message);
            });
    })

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

        const gamestate = await databaseService.setGameState(gamestatus, gamepin);
        console.log('Participants', participants);
        adminSocket.emit(`gamestate-${gamepin}`, gamestate.value);

        Object.values(participants[gamepin]).map(participant => {
            participantSocket.connected[participant.id].emit(
                `gamestate`,
                databaseService.getParticipant(gamepin, participant.uuid)
            );
        });

        res.status(200).send();
    });

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
