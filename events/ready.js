const register = require('../deploy-command');
module.exports = {
	name: 'ready',
	once: true,
	async execute(client, callback) {
		console.log(`成功登入! Logged in as ${client.user.tag}\n`);
		const clientId = client.application.id
		const guildsId = [];
		for(var attr of client.guilds.cache) {
			const guildId = client.guilds.cache.get(attr[0]).id
			guildsId.push(guildId);
		}
		console.log('登入後的ID們')
		console.log({
			clientId,
			guildsId
		})
		callback({
			clientId,
			guildsId
		})
	}
};