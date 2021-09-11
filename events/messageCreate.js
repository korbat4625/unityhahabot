const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');
const { MessageEmbed } = require('discord.js');
const register = require('../deploy-command');

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(client, message) {
		console.info('message:::', message, '\n')
		const voiceChannel = message.member.voice.channel
		if (message.author.bot) {
			console.warn('這是機器人說話!!!');
			if (message.type === 'GUILD_MEMBER_JOIN') {
				const clientId = message.author.id
				const guildId = message.guildId
				await register(clientId, guildId, client);
			}
			return ''
		}
		if (message.type === 'REPLY') return ''
		if (message.content[0] !== '$' && message.content[1] !== '$') return ''
		if (!voiceChannel) return message.reply('請進入語音頻道，才能輸入指令! (指令以$$開頭)');

		const permissions = voiceChannel.permissionsFor(message.client.user)
		if (!permissions.has('CONNECT')) return message.channel.send('你沒有權限執行此指令');
		if (!permissions.has('SPEAK')) return message.channel.send('你沒有權限執行此指令');
		
		
		const videoFinder = async (keywords) => {
			return await ytSearch(keywords);
		}

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
			return message.reply({ content: text, ephemeral: true });
		}

		const prefix = '$$'
		const args = message.content.slice(prefix.length).trim().split(/ +/g);
		const command = args.shift();
		let guildQueue = client.player.getQueue(message.guild.id);

		const secretTime = 10;

		console.info('guildQueue:', guildQueue);
		console.info('guildQueue:', guildQueue);
		console.info('guildQueue:', guildQueue, '\n');
		
		console.info('command:', command);
		console.info('command:', command);
		console.info('args:', args);
		console.info('args:', args, '\n');

		switch (command) {
			case 'getGuildQueue': {
				console.info('guildQueue:', guildQueue);
				break;
			}
			case 'play': {
				let queue = client.player.createQueue(message.guild.id);
				await queue.join(message.member.voice.channel);
				let song = await queue.play(args.join(' ')).catch(_ => {
					console.error('error:', _)
					if(!guildQueue) queue.stop();
					console.log('結束了撥放')
					console.log('結束了撥放')
					console.log('結束了撥放')
				});
				break;
			}
			case 'playlist': {
				let queue = client.player.createQueue(message.guild.id);
				await queue.join(message.member.voice.channel);
				let song = await queue.playlist(args.join(' ')).catch(_ => {
					if(!guildQueue) queue.stop();
				});
				break;
			}
			case 'stop': {
				console.log(guildQueue)
				if (guildQueue !== undefined) guildQueue.stop();
				break;
			}
			case 'setVolume': {
				if (guildQueue !== undefined) guildQueue.setVolume(parseInt(args[0]));
				break;
			}
			case 'pause': {
				if (guildQueue !== undefined) guildQueue.setPaused(true);
				break;
			}
			case 'resume': {
				if (guildQueue !== undefined) guildQueue.setPaused(false);
				break;
			}
			case 'search': {
				// console.info('進行搜尋');
				// console.info('進行搜尋');
				// console.info('進行搜尋');

				const videoResultLength = 5;
				let videoResult = null
				let keyWords = ''
				for (let i = 0; i < args.length; i++) {
					keyWords += args[i] + ' '
				}
				keyWords = keyWords.trim();
				videoResult = await videoFinder(keyWords);
				const videos = videoResult.videos;
				const sortedVideos = videos.sort(function(a, b) {
					return b.views -a.views
				})
				const embeds = []

				for (let i = 0; i < videoResultLength; i++) {
					// inside a command, event listener, etc.
					const exampleEmbed = new MessageEmbed()
						.setAuthor(sortedVideos[i].author.name, sortedVideos[i].thumbnail, sortedVideos[i].url)
						.setColor('#0099ff')
						.setTitle(sortedVideos[i].title)
						.setURL(sortedVideos[i].url)
						.setDescription(sortedVideos[i].description)
						.setThumbnail(sortedVideos[i].thumbnail)
						.addFields(
							{ name: 'Audio Url:', value: sortedVideos[i].url },
							{ name: 'Views', value: sortedVideos[i].views.toString(), inline: true },
							{ name: 'Time', value: sortedVideos[i].timestamp, inline: true },
						)
						.setImage(sortedVideos[i].image)
						.setTimestamp(sortedVideos[i].timestamp);
					embeds.push(exampleEmbed)
				}
				// console.log('不該連續出現');
				message.reply({embeds});
				break;
			}
			case 'secret': {
				for(let i = 0; i< secretTime; i++) {
					message.reply('天底下最強的人就是台南市長黃偉哲...')
				}
				return;
			}
			default:
				return message.reply('指令有誤，請使用 /checkcmd 查看指令。')
		}
		return ''
	}
};