require('dotenv').config();
const fs = require('fs');
const path = require('path');
const register = require('./deploy-command');
// Require the necessary discord.js classes

const { Player } = require("discord-music-player");
const { Client, Collection, Intents } = require('discord.js');

bigClient = null;
const token = process.env.HAHA_TOKEN;
const clientId = process.env.CLIENT_ID;
let guildsId = []
let currentNewGuildId = null;
const eventsNameArr = [];

// express
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

const startRobot = async function (restart) {
	if (restart) {
		// console.log('restartrestart')
		// console.log(bigClient.guildsId)
		// console.log(bigClient.clientId)
		await register(bigClient, false);
		console.log('處理完畢重啟')
		startRobot(false);
		return ''
	}
	// await register();
	const isEventExist = (eventsArray = [], eventName) => {
		if (eventsArray.includes(eventName)) return true;
		return false;
	}
	
	const intents = new Intents([
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.GUILD_VOICE_STATES,
		Intents.FLAGS.GUILD_MEMBERS,
		Intents.FLAGS.GUILD_PRESENCES
	]);
	
	// Create a new client instance
	const client = new Client({ intents, partials: ['CHANNEL'] });
	client.commands = new Collection();
	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const command = require(`./commands/${file}`);
		// Set a new item in the Collection
		// With the key as the command name and the value as the exported module
		client.commands.set(command.data.name, command);
	}
	bigClient = client;

	const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
	const player = new Player(client, {
		leaveOnEmpty: false, // This options are optional.
		volume: 80
	});

	client.player = player;
	client.token = token;
	client.clientId = clientId
	client.guildsId = guildsId;
	bigClient = client;

	for (const file of eventFiles) {
		const event = require(`./events/${file}`);
		if (event.once) {
			if (!isEventExist(eventsNameArr, event.name)) {
				client.once(event.name, (...args) => {
					event.execute(...args, (needToRegisteredInfo) => {
						console.log(needToRegisteredInfo)
						guildsId = needToRegisteredInfo.guildsId
						client.guildsId = guildsId;
						bigClient = client;
					});
				});
				eventsNameArr.push(event.name)
			}
		} else if (event.name === 'interactionCreate') {
			if (!isEventExist(eventsNameArr, event.name)) {
				client.on(event.name, (interaction) => {
					event.execute(interaction, client);
				});
				eventsNameArr.push(event.name)
			}
		} else if (event.name === 'messageCreate') {
			if (!isEventExist(eventsNameArr, event.name)) {
				client.on(event.name, (message) => {
					event.execute(client, message, ({ newGuildIdToRegister }) => {
						if (!guildsId.includes(currentNewGuildId)) guildsId.push(currentNewGuildId);
						currentNewGuildId = newGuildIdToRegister;
						client.currentNewGuildId = currentNewGuildId;
						bigClient = client;
						register(client, true)
					})
				});
				eventsNameArr.push(event.name)
			}
		} else {
			if (!isEventExist(eventsNameArr, event.name)) {
				console.log('註冊了', event.name)
				client.on(event.name, (...args) => event.execute(...args));
				eventsNameArr.push(event.name)
			}
		}
	}

	// Login to Discord with your client's token
	client.login(token);
}


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

app.get('/getInvite', (req, res) => {
	res.status(200);
	res.render('index', {
		title: '歡迎你，我是unityhahabot',
		botInviteUrl: process.env.HAHA_INVITE_URL,
		test: '測試字串'
	});
});

app.get('/restartbot', async (req, res) => {
	try {
		await startRobot(true);
		res.status(200)
		res.render('successRes');
	} catch (err) {
		res.status(500);
		res.render('err', {err});
	}
})

app.get('/registerSlashCmd', async (req, res) => {
	register();
})

app.get('*', function(req, res) {
	res.render('404')
});

// err handling
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	console.info('發發發發發生了錯誤!');
	console.info('發發發發發生了錯誤!');
	console.info('發發發發發生了錯誤!');
	console.error(err);
	// render the error page
	res.status(err.status || 500)
	res.render('err', {
		err
	});
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
});


try {
	startRobot(false);
} catch (err) {
	console.error(err);
	console.info('嘗試重啟機器人');
	console.info('嘗試重啟機器人');
	console.info('嘗試重啟機器人');
	startRobot(false);
}


