const jimp = require("jimp");

module.exports = async (client, msgchan, msgauth, captcha_get, attempts, captchaType = 'image') => {

	//let captcha = Math.random().toString().substr(2, 4);

	let captcha = captcha_get;

	if (captchaType == "image" && attempts == 0) {

		let _image = await jimp.read("captcha.png");
		_image.resize(375, 100); // make bigger
		_image.print(await jimp.loadFont(jimp.FONT_SANS_64_BLACK), Math.random() * 160, Math.random() * 53, captcha); // print captcha on image
		
		_image.getBuffer(jimp.MIME_PNG, (err, buff) => msgchan.send('Введите код с картинки', new client.discord.Attachment(buff, "captcha.png")) );
		//.then(captmsg => captmsg.delete(60000).catch(() => {}))

	} else if (captchaType == "text") { msgchan.send(`Напишите код ниже в этот канал \n \`\`${captcha}\`\``);}

	let flag = await msgchan.awaitMessages(message => message.author == msgauth, {max: 1, time: 60 * 1000, errors: ["time"]}).catch(() => 2);
	if (flag) {

		//Не написал
		if (flag == 2) return 2

		const args = flag.first().content.toLowerCase().slice(2).trim().split(/ +/g);

		if (flag.first().content == captcha) { flag = 1; } else if (args[0] == "c") { return 4; } else { flag = 0; }
	}

	//console.log(flag)

	return flag
}