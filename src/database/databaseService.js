const participants = require('../socket').participants;
const db = require('./db');
const moment = require('moment');
const GameStates = require('../types').GameStatus;

class DatabaseService {
    GAMES_COLLECTION = 'games';

    getCreatedOrOngoingGames = async limit => {
        return await db
            .get()
            .collection(this.GAMES_COLLECTION)
            .find({
                status: { $in: [GameStates.CREATED, GameStates.IN_PROGRESS, GameStates.FINISHED] },
            })
            .sort({ created: 1 })
            .limit(limit)
            .toArray();
    };

    // GENERATE GAME
    createGame = async (gameId, cb) => {
        let gamepin;
        while (true) {
            gamepin = Math.floor(1000 + Math.random() * 9000).toString();
            const result = await db
                .get()
                .collection(this.GAMES_COLLECTION)
                .find({ gamepin: gamepin })
                .limit(1);

            if (result.cursorState.documents == 0) {
                break;
            }
        }

        db.get()
            .collection(this.GAMES_COLLECTION)
            .insertOne(
                {
                    created: moment()
                        .utc()
                        .toISOString(),
                    gameId,
                    gamepin,
                    status: GameStates.CREATED,
                    endTime: undefined,
                    startTime: undefined,
                    participants: {},
                },
                (error, response) => {
                    if (error) {
                        console.log('Klarte ikke opprette et nytt spill', error);
                    }
                    cb(response.ops[0]);
                }
            );
    };

    getParticipantState = async (gamepin, uuid) => {
        const gamestate = await db
            .get()
            .collection(this.GAMES_COLLECTION)
            .findOne({ gamepin: { $in: [gamepin] } });

        if (gamestate) {
            const participantState = gamestate.participants.filter(p => (p.uuid = uuid));

            if (participantState) {
                return [participantState];
            }
        }

        return [];
    };

    async setGameStateAndUpdateClients(gamestatus, gamepin, adminSocket, participantSocket) {
        const gamestate = await this.setGameState(gamestatus, gamepin);
        adminSocket.emit(`gamestate-${gamepin}`, gamestate.value);

        const emitParticipants = participants[gamepin];
        if (emitParticipants) {
            Object.values(emitParticipants).map(async participant => {
                const participantData = await this.getParticipant(gamepin, participant.uuid);

                participantSocket.connected[participant.id].emit(`gamestate`, participantData);
            });
        }

        return gamestate;
    }

    // GAME  STATE
    async setGameState(status, gamepin) {
        const updatedGameState = {
            status,
            startTime:
                status === 'IN_PROGRESS'
                    ? moment()
                          .utc()
                          .toISOString()
                    : undefined,
            endTime:
                status === 'IN_PROGRESS'
                    ? moment()
                          .add(15, 'minutes')
                          .utc()
                          .toISOString()
                    : undefined,
        };

        return await db
            .get()
            .collection(this.GAMES_COLLECTION)
            .findOneAndUpdate(
                { gamepin: gamepin },
                {
                    $set: updatedGameState,
                },
                {
                    returnOriginal: false,
                }
            );
    }

    async getGamestate(gamepin) {
        return await db
            .get()
            .collection(this.GAMES_COLLECTION)
            .findOne({ gamepin: gamepin });
    }

    async updateContentForParticipant(body) {
        const { gamepin, content, uuid } = body;
        const gamestate = await this.getGamestate(gamepin);

        return this.updateGamestate({
            ...gamestate,
            participants: {
                ...gamestate.participants,
                [uuid]: {
                    ...gamestate.participants[uuid],
                    content,
                },
            },
        });
    }

    async updateGamestate(gamestate) {
        const updatedGameState = await db
            .get()
            .collection(this.GAMES_COLLECTION)
            .findOneAndUpdate(
                { gamepin: gamestate.gamepin },
                { $set: { participants: gamestate.participants } },
                {
                    returnOriginal: false,
                }
            );

        return updatedGameState.value;
    }

    // PARTICIPANTS
    async getParticipant(gamepin, uuid) {
        const game = await db
            .get()
            .collection(this.GAMES_COLLECTION)
            .findOne({ gamepin });

        if (game && game.participants[uuid]) {
            return {
                ...game.participants[uuid],
                endTime: game.endTime,
                gameId: game.gameId,
                startTime: game.startTime,
                status: game.status,
            };
        } else {
            return null;
        }
    }

    async deleteParticipant(gamepin, uuid, participantSocket) {
        const gamestate = await this.getGamestate(gamepin);

        delete gamestate.participants[uuid];

        const { id = '' } = participants[gamepin].find(client => client.uuid === uuid);
        participantSocket.connected[id].disconnect();
        return this.updateGamestate({
            ...gamestate,
            participants: gamestate.participants,
        });
    }

    // WINNERS
    async toggleWinner(gamepin, uuid) {
        const game = await this.getGamestate(gamepin);

        const updatedGame = {
            ...game,
            participants: {
                ...game.participants,
                [uuid]: {
                    ...game.participants[uuid],
                    winner: !game.participants[uuid].winner,
                },
            },
        };

        const updatedGamestate = await this.updateGamestate(updatedGame);

        return updatedGamestate;
    }

    async getWinners() {
        return await db
            .get()
            .collection(this.GAMES_COLLECTION)
            .find({})
            .toArray();
    }
}

module.exports = DatabaseService;
