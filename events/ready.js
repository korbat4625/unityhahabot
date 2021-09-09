module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`成功登入! Logged in as ${client.user.tag}`);
	},
};