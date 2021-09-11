const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Collection } = require('discord.js');
module.exports = async function (clientId , guildId, client) {
	const commands = [];
	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
	client.commands = new Collection();

	console.info('clientId:::', clientId)
	console.info('guildId:::', guildId)
	console.info('token:::', client.token)
	
	for (const file of commandFiles) {
		const command = require(`./commands/${file}`);
		commands.push(command.data.toJSON());
		client.commands.set(command.data.name, command);
	}
	const rest = new REST({ version: '9' }).setToken(client.token);
	
	try {
		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);
		console.log('成功註冊指令');
	} catch (error) {
		console.error(error);
	}
}