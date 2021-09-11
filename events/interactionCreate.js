module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction, client) {
		console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);
		if (!interaction.isCommand()) return;
		console.log('互動產生::', interaction)
		console.log(interaction.commandName)

		const command = client.commands.get(interaction.commandName);

		if (!command) return;
		
		console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);

		console.log('commandcommandcommand', command)
		console.log('interactioninteraction', interaction)

		try {
			await command.execute(interaction);
		} catch (error) {
			console.log('errerrerrerr')
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	},
};