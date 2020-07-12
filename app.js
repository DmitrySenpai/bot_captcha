const Discord = require('discord.js'),
  client = new Discord.Client(),
  Enmap = require("enmap"),
  fs = require("fs");
client.discord = Discord;
client.req = require('request');
client.fs = fs;
config = require("./config.json");
promise = require("./promise");
client.promise = promise;
captcha = require('./captcha');
client.captcha = captcha;


let con = require('mysql2').createConnection({host: config.mysql_host, user: config.mysql_user, password: config.mysql_password, database: config.mysql_database, port: config.mysql_port, charset: config.mysql_charset});
con.on('error', (err) => { 

  if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
    require('mysql2').createConnection({host: config.mysql_host, user: config.mysql_user, password: config.mysql_password, database: config.mysql_database, port: config.mysql_port, charset: config.mysql_charset});                         // lost due to either server restart, or a
  } else {                                      // connnection idle timeout (the wait_timeout
     throw err;                                 // server variable configures this)
  }

});
con.connect(() => {console.log(`{DB Connected} (ID:${con.threadId})`);});
require('mysql-utilities').upgrade(con);
require('mysql-utilities').introspection(con);

client.con = con;

fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  let counter = files.length;
  let counteris = 0;
  files.forEach(file => {
    counteris++;
    if (!file.endsWith(".js")) return;
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
    delete require.cache[require.resolve(`./events/${file}`)];
  });
  if (counter == counteris) console.log('Все ивенты загружены!\n');
});

client.commands = new Enmap();

fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  let counter = files.length;
  let counteris = 0;
  files.forEach(file => {
    counteris++;
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    client.commands.set(commandName, props);
  });
  if (counter == counteris) console.log('Все команды загружены!\n');
});

client.login(config.bot_token);