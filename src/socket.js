const { cache } = require("./router");

let admins = [];
let participants = [];

const setupSocket = io => {
    const adminSocket = io.of("/admin");
    const participantSocket = io.of("/participant");

    const adminOnConnect = client => {
        console.log("admin connected =>", client.id);
        adminSocket.emit("participants-data", cache.getCache());
        adminSocket.emit("participants-winners", cache.getWinners());
    };

    const participantOnConnect = client => {
        console.log("participant connected =>", client.id);
        participantSocket.emit("gamestate", cache.getGameState());
    };

    const unregisterAdmin = client => {
        if (admins.find(client_find => client_find.id === client.id)) {
            const updatedOnlineUsers = admins.filter(
                user => user.id !== client.id
            );
            admins = updatedOnlineUsers;

            console.log(`clients after unregister: ${admins}`);
        }
    };

    const unregisterParticipant = client => {
        if (participants.find(client_find => client_find.id === client.id)) {
            const updatedOnlineUsers = participants.filter(
                user => user.id !== client.id
            );
            participants = updatedOnlineUsers;

            console.log(`participants after unregister: ${participants}`);
        }
    };

    adminSocket.on("connection", client => {
        adminOnConnect(client);

        client.on("disconnect", () => {
            console.log(`admin disconnected => clientID: ${client.id}`);

            unregisterAdmin(client);
        });
    });

    participantSocket.on("connection", client => {
        participantOnConnect(client);

        client.on("disconnect", () => {
            console.log(`participant disconnected => clientID: ${client.id}`);

            unregisterParticipant(client);
        });
    });
};

exports.setupSocket = setupSocket;
