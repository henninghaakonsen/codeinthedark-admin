const { cache } = require("./router");

let clients = [];

const setupSocket = io => {
    const onConnect = client => {
        console.log("client connected =>", client.id);
        io.emit("participants-data", cache.getCache());
    };

    const registerClient = client => {
        client.on("register", () => {
            if (!clients.find(client => client.id === client.id)) {
                clients.push({
                    id: client.id
                });
            }

            console.log(`clients after register: ${clients}`);
            io.emit("participants-data", cache);
        });
    };

    const unregisterClient = client => {
        if (clients.find(client_find => client_find.id === client.id)) {
            const updatedOnlineUsers = clients.filter(
                user => user.id !== client.id
            );
            clients = updatedOnlineUsers;

            console.log(`clients after unregister: ${clients}`);
        }
    };

    io.on("connection", client => {
        onConnect(client);
        registerClient(client);

        client.on("disconnect", function() {
            console.log(`client disconnected => clientID: ${client.id}`);

            unregisterClient(client);
        });
    });
};

exports.setupSocket = setupSocket;
