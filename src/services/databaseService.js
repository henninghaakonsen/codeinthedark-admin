const assert = require('assert');

const db = require('../database/db');

class DatabaseService {
    GAMES_COLLECTION = 'games';

    // GENERATE GAME
    createGame = (gameId, cb) => {
        // TODO Kan vi garantere at det blir unik gamepin hver gang?
        // Må vi sjekke gamepin som finnes fra før?
        const gamepin = Math.floor(1000 + Math.random() * 9000).toString();
        db.get()
            .collection(this.GAMES_COLLECTION)
            .insertOne(
                {
                    created: new Date().toISOString(),
                    gameId,
                    gamepin,
                    status: 'NOT_STARTED',
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

    // GAME  STATE
    async setGameState(status, gamepin) {
        return await db
            .get()
            .collection(this.GAMES_COLLECTION)
            .findOneAndUpdate(
                { gamepin: parseInt(gamepin) },
                {
                    $set: {
                        status: status,
                    },
                },
                {
                    returnOriginal: false,
                }
            );
    }

    async getGamestate(gamepin, cb) {
        return await db
            .get()
            .collection(this.GAMES_COLLECTION)
            .findOne({ gamepin: gamepin });
    }

    async updateGamestate(gamestate) {
        const updatedGameState = await db
            .get()
            .collection(this.GAMES_COLLECTION)
            .updateOne(
                { gamepin: gamestate.gamepin },
                { $set: { participants: gamestate.participants } }
            );

        return updatedGameState;
    }

    // PARTICIPANTS
    async updateParticipant(participant, gamepin) {}

    async deleteParticipant(participant, gamepin) {
        return await db.get().collection(this.GAMES_COLLECTION);
    }

    async getParticipant(uuid) {
        const participant = await db
            .get()
            .collection(this.GAMES_COLLECTION)
            .find({ uuid })
            .toArray();

        return participant;
    }

    // WINNERS

    async toggleWinner(uuid) {
        return await db
            .get()
            .collection(this.GAMES_COLLECTION)
            .findOneAndUpdate(
                { uuid },
                {
                    $set: {
                        winner: true,
                    },
                },
                { returnOriginal: false }
            );
    }

    updateWinners(dirtyWinner) {
        db.get()
            .collection(this.GAMES_COLLECTION)
            .insertOne(dirtyWinner, function(err, result) {
                if (err) {
                    console.log('Det var en feil ved oppdatering av vinnere til basen', err);
                }

                console.log(`${result.result.n} vinnere ble lagt til`);
            });
    }

    async getWinners() {
        const winners = await db
            .get()
            .collection(this.GAMES_COLLECTION)
            .find({})
            .toArray();
        return winners;
    }
}

module.exports = DatabaseService;
