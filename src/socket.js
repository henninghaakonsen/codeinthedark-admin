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

const addParticipant = (clientId, clientUuid, gamepin) => {
    if (participants[gamepin] === undefined) {
        participants[gamepin] = [];
    }

    if (!participants[gamepin].find(client => client.uuid === clientUuid)) {
        participants[gamepin].push({
            id: clientId,
            uuid: clientUuid,
        });
    }
    console.log('Participants after register: ', participants[gamepin]);
};

const removeParticipant = (clientUuid, gamepin) => {
    if (participants[gamepin] === undefined) {
        console.log(
            `Game PIN '${gamepin}' does not exist. Could not remove client '${clientUuid}'`
        );
    } else {
        const updatedParticipants = participants[gamepin].filter(
            client => client.uuid !== clientUuid
        );
        participants[gamepin] = updatedParticipants;
        console.log('Participants after unregister: ', participants[gamepin]);
    }
};

const setupSocket = (io, databaseService) => {
    const adminSocket = io.of('/admin');
    const participantSocket = io.of('/participant');

    adminSocket.on('connection', async client => {
        const gamepin = client.handshake.query.gamepin;
        console.log(`admin connected to gamepin ${gamepin} => ${client.id}`);
        addAdmin(client.id);

        const gamestate = await databaseService.getGamestate(gamepin);
        adminSocket.emit(`gamestate-${gamepin}`, gamestate);

        client.on('disconnect', () => {
            console.log(`admin disconnected => clientID: ${client.id}`);

            removeAdmin(client.id);
        });
    });

    participantSocket.on('connection', async client => {
        console.log('Client', client);
        const gamepin = client.handshake.query.gamepin;
        const uuid = client.handshake.query.uuid;
        addParticipant(client.id, uuid, gamepin);
        console.log('Gamepin on connection', gamepin);

        participantSocket.connected[client.id].emit(
            `gamestate`,
            await databaseService.getParticipant(gamepin, uuid)
        );

        client.on('disconnect', () => {
            console.log(`participant disconnected => uuid: ${uuid}`);

            removeParticipant(uuid, gamepin);
        });
    });

    return [adminSocket, participantSocket];
};

exports.setupSocket = setupSocket;
exports.participants = participants;
