const mongodb = require('mongodb');
const assert = require('assert');
let db;

// Connection URL
const user = process.env.MONGODB_USER;
const password = process.env.MONGODB_PWD;
const url = `mongodb+srv://${user}:${password}@code-in-the-dark.fiiz0.mongodb.net/<dbname>?retryWrites=true&w=majority`

const MongoClient = new mongodb.MongoClient(url, {
    useUnifiedTopology: true,
});
// Database Name
const dbName = 'heroku_rqjv6zp9';

function connect(callback) {
    // Use connect method to connect to the server
    MongoClient.connect((err, client) => {
        assert.equal(null, err);
        console.log('Connected successfully to database server');

        db = client.db(dbName);
        callback();
    });
}

function get() {
    return db;
}

function close() {
    db.close();
}

module.exports = {
    connect,
    get,
    close,
};
