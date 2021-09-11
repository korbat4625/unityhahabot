require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Require the necessary discord.js classes
const register = require('./deploy-command');
const { Player } = require("discord-music-player");
const { Client, Collection, Intents } = require('discord.js');
const token = process.env.HAHA_TOKEN;

// express
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

const startRobot = function (token) {
	// await register()
	const isEventExist = (eventsArray = [], eventName) => {
		if (eventsArray.includes(eventName)) return true;
		return false;
	}
	const eventsNameArr = [];
	const intents = new Intents([
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.GUILD_VOICE_STATES
	]);
	
	// Create a new client instance
	const client = new Client({ intents, partials: ['CHANNEL'] });
	// client.commands = new Collection();

	// const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
	const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
	const player = new Player(client, {
		leaveOnEmpty: false, // This options are optional.
		volume: 80
	});

	client.player = player;
	for (const file of eventFiles) {
		const event = require(`./events/${file}`);
		if (event.once) {
			if (!isEventExist(eventsNameArr, event.name)) {
				client.once(event.name, (...args) => {
					event.execute(...args);
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
				client.on(event.name, (message) => event.execute(client, message));
				eventsNameArr.push(event.name)
			}
		} else {
			if (!isEventExist(eventsNameArr, event.name)) {
				client.on(event.name, (...args) => event.execute(...args));
				eventsNameArr.push(event.name)
			}
		}
	}
	console.info('event name:::', eventsNameArr)
	console.info('client._events::', client._events)

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
		botInviteUrl: 'https://discord.com/api/oauth2/authorize?client_id=882966434878201857&permissions=8&scope=bot',
		test: '測試字串'
	});
});

app.get('/restartbot', async (req, res) => {
	try {
		await startRobot(token);
		res.status(200)
		res.render('successRes');
	} catch (err) {
		res.status(500);
		res.render('err', {err});
	}
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
	startRobot(token);
} catch (err) {
	console.error(err);
	console.info('嘗試重啟機器人');
	console.info('嘗試重啟機器人');
	console.info('嘗試重啟機器人');
	startRobot(token);
}


