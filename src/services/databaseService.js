const db = require('./database/db');

class DatabaseService {
    GAMES_COLLECTION = 'games';

    async setGameState(state, gamePin) {}

    async updateParticipant(participant, gamePin) {}

    async getGamestate(gamepin) {}

    async deleteParticipant(participant, gamePin) {}

    async toggleWinner(participant, gamePin) {
        // await db.collection(GAMES_COLLECTION).update({
        // })
    }

    async updateGamestate(participantData) {
        db.get().collection(GAMES_COLLECTION);
    }

    updateWinners(dirtyWinner) {
        db.get()
            .collection(GAMES_COLLECTION)
            .insertOne(dirtyWinner, function(err, result) {
                if (err) {
                    console.log('Det var en feil ved oppdatering av vinnere til basen', err);
                }

                console.log(`${result.result.n} vinnere ble lagt til`);
            });
    }

    async getParticipant(uuid) {
        const participant = await db
            .get()
            .collection(GAMES_COLLECTION)
            .find({ uuid })
            .toArray();

        return participant;
    }

    async getWinners() {
        const winners = await db
            .get()
            .collection(GAMES_COLLECTION)
            .find({})
            .toArray();
        return winners;
    }
}

module.export = DatabaseService;
