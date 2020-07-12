//const captcha = require('/home/dmitryfiles/olga_bot/captcha');

exports.run = async (client, msg, args, captcha_get, attempts) => {

    if (!captcha_get) captcha_get = Math.random().toString().substr(2, 4); 

    cmd_args = {}
    cmd_args.captcha_get = captcha_get
    cmd_args.attempts = attempts

    //console.log(cmd_args)

    join_channel = "532207193286770701"
    role_auth_done = "342039027953827841"

    user_get_info = await client.channels.get(join_channel).guild.member(msg.author.id)

    if (user_get_info.roles.has(role_auth_done)) return

    client.con.query(`SELECT * FROM users WHERE id=${msg.author.id}`, async function (err, result) {

        var kick_or_ban = 0

        if (err) throw err;
        if(result.length == 0) {
            client.con.query(`INSERT INTO users (id) VALUES ('${msg.author.id}')`)
            var attempts = 0
            var warn = 0
        } else {
            var attempts = result[0][`attempts`]
            var warn = result[0][`warn`]
        }

        if (!attempts) var attempts = 0

        await_captcha = await client.captcha(client, msg.channel, msg.author, captcha_get, attempts)

        if (user_get_info.roles.has(role_auth_done)) return

        if (await_captcha == 0 || await_captcha == 4 || await_captcha == 2) {

            var attempts = attempts + 1

            if (await_captcha == 2) {
                var attempts = 3
                //var warn = warn + 1
            }

            //logtest = {}
            //logtest.attempts = attempts
            //logtest.warn = warn
            //logtest.kick_or_ban = kick_or_ban
            //logtest.captcha_get = captcha_get
            //console.log(logtest)

            if (attempts > 2) {
                var warn = warn + 1
                var attempts = 0
                var kick_or_ban = 1;
            }

            if (warn > 2) {
                kick_or_ban = 2
                var warn = 0
            }

        } else if (await_captcha == 1) {

            var attempts = 0
            var warn = 0

        }

        await client.promise(client.con, client.con.query, `UPDATE users set attempts = ${attempts}, warn = ${warn} WHERE id = ${msg.author.id}`);

        if (kick_or_ban == 1) {
            
            if (await_captcha == 2) {
                await msg.channel.send("Вы не прошли капчу!")
            } else {
                await msg.channel.send("Вы 3 раза не правильно написали капчу!")
            }
            //msg.author.kick("3 раза не правильно прошел капчу!")
            user_get_info.kick("Не правильно прошел капчу!")
            return
        } else if (kick_or_ban == 2) {
            msg.channel.send("Вы 3 раза не правильно написали капчу! На этот раз вы получили бан!")
            //msg.author.ban("Не прошел капчу!")
            user_get_info.ban("Не прошел капчу!")
            return
        }

        console.log(await_captcha)

        if (await_captcha == 0) {

            attempts = attempts + 1

            msg.channel.send('Не правильно ввели!')

            const cmd = client.commands.get('c');
        
            return cmd.run(client, msg, 'c', captcha_get, 1);
              
        } else if (await_captcha == 4) {
            return
            //attempts = attempts + 1

            //console.log("4")

            //const cmd = client.commands.get('c');
        
            //return cmd.run(client, msg, 'c', captcha_get, 1);

        }

        msg.channel.send("Капча пройдена!")
        user_get_info.addRole(role_auth_done);

        //WELCOME

        client.channels.get('534425885294723073').sendMessage("<@" + msg.author.id + "> , этот пользователь авторизовался!") //От Лены
        let embed = new client.discord.RichEmbed()
		  .setTitle("Новый пользователь!")
		  .setDescription(`Здравствуй <@${msg.author.id}>, добро пожаловать на сервер команды SovietSoft! Располагайся удобнее возле костра, и загляни в <#342048597002682369>, если есть дополнительные вопросы, обратись к главным.`)
		  .setColor('#2f3136')
		  .setThumbnail(msg.author.avatarURL)
		  .setImage(`https://sovietsoft.ru/wp-content/uploads/2020/01/welcome.gif`)
          .setFooter("Наш сайт: https://sovietsoft.ru", "https://sovietsoft.ru/wp-content/uploads/2018/06/cropped-icon.png");
        client.channels.get('429732772106600449').send({embed}).then(msg => {msg.delete(100000)});

    })
}