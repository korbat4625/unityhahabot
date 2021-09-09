const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	name: 'play',
	description: 'Play a video.',
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('play a song'),
	async execute(interaction, args) {
		// console.log('plat mmmmmmea:', message)
		// console.log('argsargsargsargs:', args)
		// const voiceChannel = message.member.voice.channel;
		// if (!voiceChannel) return message.channel.send('請進入語音頻道，才能輸入指令!');
		// const permissions = voiceChannel.permissionsFor(message.client.user);
		// if (!permissions.has('CONNECT')) return message.channel.send('你沒有權限執行此指令');
		// if (!permissions.has('SPEAK')) return message.channel.send('你沒有權限執行此指令');
		// if (!args.length) message.channel.send('請輸入第二段指令');
		await interaction.reply({ content: '開發中...請先使用$$指令，請使用$$?以查看指令...' });
	},
};