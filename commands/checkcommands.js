const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('checkcommands')
		.setDescription('檢視機器人可用指令'),
	async execute(interaction) {
		const showCommand = (command) => {
			const wrong = command === '?' ? '' : '請輸入正確的指令...\n'
			const text =
				wrong +
				'$$? => 看指令\n' +
				'$$play Youtube網址 => 撥放YT音樂\n' +
				'$$playlist Youtube網址 => 撥放YT音樂清單\n' +
				'$$stop => 結束撥放\n' +
				'$$pause => 暫停撥放\n' +
				'$$resume => 恢復撥放\n' +
				'$$setVolume 0~100 => 設置撥放中音量\n' + 
				'$$search 關鍵字 => 搜尋YT關鍵字前5名撥放量，可自行用於複製URL並使用$$play撥放\n' +
				'$$secret => 不建議嘗試';
			return text;
		}

		await interaction.reply({ content: showCommand() });
	},
};