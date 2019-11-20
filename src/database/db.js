const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
let db;

// Connection URL
const user = process.env.MONGODB_USER;
const password = process.env.MONGODB_PWD;
const url = `mongodb://${user}:${password}@ds061928.mlab.com:61928/heroku_rqjv6zp9`;

// Database Name
const dbName = "heroku_rqjv6zp9";

function connect(callback) {
  // Use connect method to connect to the server
  MongoClient.connect(url, function(err, client) {
    assert.equal(null, err);
    console.log("Connected successfully to database server");

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
  close
};
