const db = require('../database/db');

class DatabaseService {
    GAMES_COLLECTION = 'games';

    // GENERELT GAME
    async createGame(resultatId, cb) {
        // TODO Kan vi garantere at det blir unik gamepin hver gang?
        // Må vi sjekke gamepin som finnes fra før?
        const gamePin = Math.floor(1000 + Math.random() * 9000);
        db.get()
            .collection(this.GAMES_COLLECTION)
            .insertOne(
                {
                    gamePin,
                    status: 'UNINITIALIZED',
                    endTime: undefined,
                    startTime: undefined,
                    participants: [],
                },
                (error, response) => {
                    if (error) {
                        console.log('Klarte ikke opprette et nytt spill', error);
                    }
                    cb(response.ops);
                }
            );
    }

    // GAME  STATE
    async setGameState(status, gamePin) {
        return await db
            .get()
            .collection(this.GAMES_COLLECTION)
            .findOneAndUpdate(
                { gamePin: parseInt(gamePin) },
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
    async getGamestate(gamepin) {}
    async updateGamestate(participantData) {
        db.get().collection(this.GAMES_COLLECTION);
    }

    // PARTICIPANTS
    async updateParticipant(participant, gamePin) {}

    async deleteParticipant(participant, gamePin) {
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
