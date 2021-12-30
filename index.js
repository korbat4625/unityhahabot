require('dotenv').config();
const fs = require('fs');
const path = require('path');
const nodeCron = require("node-cron");
// Require the necessary discord.js classes

const register = require('./deploy-command');
// const { Player } = require("discord-music-player");
// const register = require('./deploy-command');
// const { Player } = require("discord-player");

// discord.js
const { Client, Collection, Intents } = require('discord.js');


const token = process.env.HAHA_TOKEN;
const clientId = process.env.CLIENT_ID;
const eventsNameArr = [];
let bigClient = null;
let guildsId = [];
let clientRecord = []
clientRecord[clientId] = {
	login: false
}

// express
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

let playlistTasks = [];
const startRobot = async (restart) => {
	if (restart) {
		console.log('處理完畢重啟');
		startRobot(false);
		return ''
	}
	console.log('程序以重啟...')
	console.log('開始start流程')
	// await register();
	const isEventExist = (eventsArray = [], eventName) => {
		if (eventsArray.includes(eventName)) return true;
		return false;
	}
	
	const intents = new Intents([
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.GUILD_VOICE_STATES
		// Intents.FLAGS.GUILD_MEMBERS,
		// Intents.FLAGS.GUILD_PRESENCES
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

	

	const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

	client.token = token;
	client.clientId = clientId;
	client.guildsId = guildsId;
	client.startRobot = startRobot;

	for (const file of eventFiles) {
		const event = require(`./events/${file}`);
		if (event.once) {
			if (!isEventExist(eventsNameArr, event.name)) {
				client.once(event.name, (...args) => {
					event.execute(...args, (needToRegisteredInfo) => {
						// console.log(needToRegisteredInfo)
						guildsId = needToRegisteredInfo.guildsId;
						client.guildsId = guildsId;
						console.log('登入後的ID們');
						console.log('clientId:::', needToRegisteredInfo.clientId, ', guildsId:::',  guildsId);
						if (clientId === needToRegisteredInfo.clientId) {
							clientRecord[clientId] = {
								login: true
							}
						}
						
					});
				});
				eventsNameArr.push(event.name);
			}
		} else if (event.name === 'interactionCreate') {
			if (!isEventExist(eventsNameArr, event.name)) {
				client.on(event.name, (interaction) => {
					event.execute(interaction, client);
				});
				eventsNameArr.push(event.name);
			}
		} else if (event.name === 'messageCreate') {
			if (!isEventExist(eventsNameArr, event.name)) {
				client.on(event.name, (message) => {
					event.execute(client, message, function (guildsPlayerTasks) {
						playlistTasks = guildsPlayerTasks;
						console.log('查看現有task:::');
						console.log(`有${guildsPlayerTasks.length}個task`);
						console.log(guildsPlayerTasks);
					});
				});
				eventsNameArr.push(event.name);
			}
		} else {
			if (!isEventExist(eventsNameArr, event.name)) {
				// console.log('註冊了', event.name)
				client.on(event.name, (...args) => event.execute(...args));
				eventsNameArr.push(event.name);
			}
		}
	}

	client.on('guildCreate', (guild) => {
		client.currentNewGuildId = guild.id
		if (guild.client.user.bot) {
			console.log('新加入的是一個機器人')
			if (!guildsId.includes(guild.id)) {
				guildsId.push(guild.id);
				console.log('有推guildsId:', guildsId);
			}
			client.guildsId = guildsId;
			bigClient = client;
			console.log('執行註冊');
			register(client, true);
		}
	})

	// Login to Discord with your client's token
	if (!clientRecord[clientId].login) {
		console.log('開始嘗試登入')
		await client.login(token).then(response => {
			console.log('response:', response)
		});
		bigClient = client;
	} else {
		console.log('已登入.不須再登入')
	}
	// console.log(client.guilds.cache)
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
		startRobot();
		res.status(200);
		res.render('successRes');
	} catch (err) {
		res.status(500);
		res.render('err', {err});
	}
})

app.get('/deployCmd', async (req, res) => {
	try {
		register(bigClient, false);
		res.status(200);
		res.render('successRes');
	} catch (err) {
		res.status(500);
		res.render('err', {err});
	}
})

app.get('*', function(req, res) {
	res.render('404');
});

// err handling
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};
	console.log('發發發發發生了錯誤!');
	console.log('發發發發發生了錯誤!');
	console.log('發發發發發生了錯誤!');
	console.error(err);
	// render the error page
	res.status(err.status || 500);
	res.render('err', {
		err
	});
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});

process.on('uncaughtException', function(err) {
	console.log('uncaughtException:', err);
	process.exit(1);
});


process.on('unhandledRejection', error => {
	console.error('unhandledRejection:::');
	console.error(error);
	process.exit(1); // To exit with a 'failure' code
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

// cron.schedule('5 * * * * *', () => {
// 	console.log('每分鐘在第 5 秒執行一個任務')
//   })

let count = 1;
const task = nodeCron.schedule('0 */10 * * * *', () => {
	console.log('查看events arr', eventsNameArr);
	if (playlistTasks.length !== 0) {
		console.log('偵測到還有播放任務，因此不重啟');
		count++;
	} else {
		console.log('沒有播放任務，正常重啟');
		startRobot(false);
	}
}, true)

// console.log(task)
task.start()
