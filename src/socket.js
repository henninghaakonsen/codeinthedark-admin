const { cache } = require('./router');

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

const addParticipant = (clientId, gamePin) => {
    if (participants[gamePin] === undefined) {
        participants[gamePin] = [];
    }

    if (!participants[gamePin].find(client => client.id === clientId)) {
        participants[gamePin].push({
            id: clientId,
        });
    }
    console.log('Participants after register: ', participants[gamePin]);
};

const removeParticipant = (clientId, gamePin) => {
    if (participants[gamePin] === undefined) {
        console.log(`Game PIN '${gamePin}' does not exist. Could not remove client '${clientId}'`);
    } else {
        const updatedParticipants = participants[gamePin].filter(client => client.id !== clientId);
        participants[gamePin] = updatedParticipants;
        console.log('Participants after unregister: ', participants[gamePin]);
    }
};

const setupSocket = io => {
    const adminSocket = io.of('/admin');
    const participantSocket = io.of('/participant');

    adminSocket.on('connection', client => {
        console.log(`admin connected => ${client.id}`);
        addAdmin(client.id);

        adminSocket.emit('participants-data', cache);
        adminSocket.emit('participants-winners', cache.getWinners());

        client.on('disconnect', () => {
            console.log(`admin disconnected => clientID: ${client.id}`);

            removeAdmin(client.id);
        });
    });

    participantSocket.on('connection', client => {
        console.log(client.id);
        const gamePin = client.handshake.query.gamePin;
        addParticipant(client.id, gamePin);

        participantSocket.connected[client.id].emit('gamestate', cache.getGameState(gamePin));

        client.on('disconnect', () => {
            console.log(`participant disconnected => clientID: ${client.id}`);

            removeParticipant(client.id, gamePin);
        });
    });

    return [adminSocket, participantSocket];
};

exports.setupSocket = setupSocket;
