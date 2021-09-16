const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
module.exports = async function (client, single = false) {
	const commands = [];
	const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
	const regis = async (guildId) => {
		console.log('開始註冊:', guildId)
		const response = await rest.put(
			Routes.applicationGuildCommands(client.clientId, guildId),
			{ body: commands },
		)
		console.log(guildId + '...完成\n\n')
		return response
	}
	
	console.info('clientId:::', client.clientId)
	console.info('guildsId:::', client.guildsId)
	console.info('token:::', client.token)
	console.info('currentNewGuildId:::', client.currentNewGuildId)
	console.log('\n\n')

	for (const file of commandFiles) {
		const command = require(`./commands/${file}`);
		commands.push(command.data.toJSON());
	}

	const rest = new REST({ version: '9' }).setToken(client.token);

	return (async () => {
		try {
			if (single) {
				console.log('註冊單一guild id:', client.currentNewGuildId)
				await regis(client.currentNewGuildId);
				return ''
			} else {
				console.log('註冊多個guild id:')
				for (let guildId of client.guildsId) {
					console.log('送' + guildId + '進去')
					await regis(guildId);
				}
				return ''
			}
		} catch (error) {
			console.error(error);
		}
	})();
}