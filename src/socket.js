const DatabaseService = require('./services/databaseService');

let admins = [];
let participants = {};

const addAdmin = clientId => {
    if (!admins.find(client => client.id === clientId)) {
        admins.push({
            id: clientId,
        });
    }
    console.log('Admins after register: ', admins);
};

const removeAdmin = clientId => {
    const updatedAdmins = admins.filter(client => client.id !== clientId);
    admins = updatedAdmins;
    console.log('Admins after unregister: ', admins);
};

const addParticipant = (clientId, gamepin) => {
    if (participants[gamepin] === undefined) {
        participants[gamepin] = [];
    }

    if (!participants[gamepin].find(client => client.id === clientId)) {
        participants[gamepin].push({
            id: clientId,
        });
    }
    console.log('Participants after register: ', participants[gamepin]);
};

const removeParticipant = (clientId, gamepin) => {
    if (participants[gamepin] === undefined) {
        console.log(`Game PIN '${gamepin}' does not exist. Could not remove client '${clientId}'`);
    } else {
        const updatedParticipants = participants[gamepin].filter(client => client.id !== clientId);
        participants[gamepin] = updatedParticipants;
        console.log('Participants after unregister: ', participants[gamepin]);
    }
};

const setupSocket = io => {
    const databaseService = new DatabaseService();
    const adminSocket = io.of('/admin');
    const participantSocket = io.of('/participant');

    adminSocket.on('connection', client => {
        console.log(`admin connected => ${client.id}`);
        const gamepin = client.handshake.query.gamepin;
        addAdmin(client.id);

        adminSocket.emit(`gamestate-${gamepin}`, databaseService.getGamestate(gamepin));

        //adminSocket.emit('participants-data', cache);
        //adminSocket.emit('participants-winners', cache.getWinners());

        client.on('disconnect', () => {
            console.log(`admin disconnected => clientID: ${client.id}`);

            removeAdmin(client.id);
        });
    });

    participantSocket.on('connection', client => {
        console.log(client.id);
        const gamepin = client.handshake.query.gamepin;
        addParticipant(client.id, gamepin);

        //participantSocket.connected[client.id].emit('gamestate', cache.getGameState(gamepin));

        client.on('disconnect', () => {
            console.log(`participant disconnected => clientID: ${client.id}`);

            removeParticipant(client.id, gamepin);
        });
    });

    return [adminSocket, participantSocket];
};

exports.setupSocket = setupSocket;
