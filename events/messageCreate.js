const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');
const {
	AudioPlayerStatus,
	StreamType,
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
} = require('@discordjs/voice');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(client, message, callback) {
		// console.info('message guild id:::', message.guild.voiceAdapterCreator, '\n')
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
		// const queue = client.player.createQueue(message.guild, {
		// 	metadata: {
		// 		channel: message.channel
		// 	}
		// });
		const connection = joinVoiceChannel({
			channelId: voiceChannel.id,
			guildId: message.guild.id,
			adapterCreator: message.guild.voiceAdapterCreator
		});
		const stream = ytdl(query, { filter: 'audioonly' });
		const resource = createAudioResource(stream);
		// resource.volume.setVolume(0.1)
		const player = createAudioPlayer();
		player.on(AudioPlayerStatus.Idle, (msg) => {
			console.log('player msg::', msg)
			connection.destroy()
		});
		
		player.on(AudioPlayerStatus.Playing, (msg) => {
			console.log('The audio player has started playing!', msg);
		});
		player.on('error', error => {
			console.error('Error:', error.message, 'with track', error.resource);
		});
		console.log(query)

		switch (command) {
			case 'join': {
				connection.rejoin();
			}
			case 'play': {
				// verify vc connection
				// try {
				// 	if (!queue.connection) await queue.connect(voiceChannel);
				// } catch {
				// 	queue.destroy();
				// 	return await message.reply({ content: "Could not join your voice channel!", ephemeral: true });
				// }
		
				// // await interaction.deferReply();
				// const track = await client.player.search(query, {
				// 	requestedBy: message.client.user
				// }).then(x => {
				// 	console.log(x)
				// 	return x.tracks[0]
				// });
				// if (!track) return await message.reply({ content: `❌ | Track **${query}** not found!` });
		
				// queue.play(track);
		
				// return await message.reply({ content: `⏱️ | Loading track **${track.title}**!` });
				
				player.play(resource);
				connection.subscribe(player);
				return ''
			}
			case 'stop': {
				console.log('stop');
				player.stop(true);
				connection.subscribe(player);
				connection.destroy();
				return ''
			}
			case 'setVolume': {
				message.reply('setVolume目前尚不可用...');
				// console.log('setetvolume')
				// player.set
				// resource.volume.setVolume(0.5);
				// connection.subscribe(player)
				// if (queue !== undefined) queue.setVolume(Number(args[0]));
				return ''
			}
			case 'pause': {
				console.log('暫停')
				player.pause();
				connection.subscribe(player);
				return ''
			}
			case 'resume': {
				console.log('取消暫停')
				player.pause(false)
				connection.subscribe(player);
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