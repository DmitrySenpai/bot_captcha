module.exports = (client, msg) => {

	if (msg.channel.type !== "dm") return;

	if (msg.author.bot) return;

	if (!msg.content.toLowerCase().startsWith('o!')) return;

  		const args = msg.content.toLowerCase().slice(2).trim().split(/ +/g);
		
  		const cmd = client.commands.get(args[0]);
  		if (!cmd) return;
		
  		cmd.run(client, msg, args);

};
