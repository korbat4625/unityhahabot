const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(client, message, callback) {
		// console.info('message:::', message.channel, '\n')
		const voiceChannel = message.member.voice.channel
		if (message.author.bot) {
			console.warn('這是機器人觸發訊息!!!');
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

		const prefix = '$$'
		const args = message.content.slice(prefix.length).trim().split(/ +/g);
		const command = args.shift();
		// let guildQueue = client.player.getQueue(message.guild.id);

		const secretTime = 10;

		// console.info('guildQueue:', guildQueue);
		// console.info('guildQueue:', guildQueue, '\n');
		
		console.info('command:', command);
		console.info('command:', command);

		console.info('args:', args);
		console.info('args:', args, '\n')
		const query = args[0];
		const queue = client.player.createQueue(message.guild, {
			metadata: {
				channel: message.channel
			}
		});
		switch (command) {
			case 'play': {
				// verify vc connection
				try {
					if (!queue.connection) await queue.connect(voiceChannel);
				} catch {
					queue.destroy();
					return await message.reply({ content: "Could not join your voice channel!", ephemeral: true });
				}
		
				// await interaction.deferReply();
				const track = await client.player.search(query, {
					requestedBy: message.client.user
				}).then(x => {
					console.log(x)
					return x.tracks[0]
				});
				if (!track) return await message.reply({ content: `❌ | Track **${query}** not found!` });
		
				queue.play(track);
		
				return await message.reply({ content: `⏱️ | Loading track **${track.title}**!` });
			}
			case 'stop': {
				if (queue !== undefined) queue.stop();
				return ''
			}
			case 'setVolume': {
				if (queue !== undefined) queue.setVolume(Number(args[0]));
				return ''
			}
			case 'pause': {
				if (queue !== undefined) queue.setPaused(true);
				return ''
			}
			case 'resume': {
				if (queue !== undefined) queue.setPaused(false);
				return ''
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