const register = require('../deploy-command');
module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		console.log(`成功登入! Logged in as ${client.user.tag}\n`, client);
		const clientId = client.application.id
		for(var attr of client.guilds.cache) {
			// console.log(client.guilds.cache.get(attr[0]))
			const guildId = client.guilds.cache.get(attr[0]).id
			await register(clientId , guildId, client)
		}
	}
};