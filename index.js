const fs = require('fs');
const path = require('path')
require('dotenv').config();
// Require the necessary discord.js classes
const { Client, Collection, Intents } = require('discord.js');
const token = process.env.HAHA_TOKEN;
const test = process.env.TEST;
const register = require('./deploy-command');
const { Player } = require("discord-music-player");

// express
const {errHandling}  = require('./errHandling');
const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

app.get('/getInvite', (req, res) => {
	console.log(req);
	res.render('index', {
		title: '歡迎你，我是unityhahabot',
		botInviteUrl: 'https://discord.com/api/oauth2/authorize?client_id=882966434878201857&permissions=8&scope=bot',
		test
	});
});

app.get('/restartbot', async (req, res) => {
	try {
		await start()
		res.render('successRes')
	} catch (error) {
		res.render('err')
	}
})

app.get('*', function(req, res){
	res.render('404')
});

// err handling
app.use(errHandling);

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})

async function start () {
	await register()

	const intents = new Intents([
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES,
		Intents.FLAGS.DIRECT_MESSAGES,
		Intents.FLAGS.GUILD_VOICE_STATES
	]);
	
	// Create a new client instance
	const client = new Client({ intents, partials: ['CHANNEL'] });
	client.commands = new Collection();

	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
	const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
	const player = new Player(client, {
		leaveOnEmpty: false, // This options are optional.
	});
	client.player = player;
	
	for (const file of commandFiles) {
		const command = require(`./commands/${file}`);
		// Set a new item in the Collection
		// With the key as the command name and the value as the exported module
		client.commands.set(command.data.name, command);
	}
	
	for (const file of eventFiles) {
		const event = require(`./events/${file}`);
		console.log('eventName:::', event)
		if (event.once) {
			console.log(event.name)
			client.once(event.name, (...args) => {
				event.execute(...args)
			});
		} else if (event.name === 'interactionCreate') {
			// console.log('註冊聲音頻道更新')
			// client.on('voiceStateUpdate', (oldState, newState) => {
			// 	console.log(oldState.member.voice)
			// 	console.log(newState.member.voice)
			// })
			client.on(event.name, (interaction) => event.execute(interaction, client));
		} else if (event.name === 'messageCreate') {
			client.on(event.name, (message) => event.execute(client, message));
		} else {
			console.log(event.name)
			client.on(event.name, (...args) => event.execute(...args));
		}
	}

	// When the client is ready, run this code (only once)
	// client.once('ready', (client) => {
	// 	console.log('Ready!');
	// 	console.log(`Ready! Logged in as ${client.user.tag}`);
	// });

	// client.on('interactionCreate', async interaction => {
	// 	if (!interaction.isCommand()) return;
	// 	console.log('互動產生::', interaction)

	// 	const command = client.commands.get(interaction.commandName);

	// 	if (!command) return;
		
	// 	console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

	// 	try {
	// 		await command.execute(interaction);
	// 	} catch (error) {
	// 		console.error(error);
	// 		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	// 	}
	// });

	// Login to Discord with your client's token
	client.login(token);
	return ''
}