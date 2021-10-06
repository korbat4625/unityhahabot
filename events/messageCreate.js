const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');
const {
	AudioPlayerStatus,
	StreamType,
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
	getVoiceConnection
} = require('@discordjs/voice');
const { MessageEmbed } = require('discord.js');

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(client, message, callback) {
		console.log('抓到訊息')
		const prefix = '$$'
		const onePrefix = '$'
		// console.info('message guild id:::', message.guild.voiceAdapterCreator, '\n')
		const voiceChannel = message.member.voice.channel
		if (message.author.bot) {
			console.warn('這是機器人觸發訊息!!!');
			return ''
		}
		if (message.type === 'REPLY') return ''
		if (message.content[0] !== onePrefix && message.content[1] !== onePrefix) return ''
		if (!voiceChannel) return message.reply('請進入語音頻道，才能輸入指令! (指令以$$開頭)');

		const permissions = voiceChannel.permissionsFor(message.client.user)
		if (!permissions.has('CONNECT')) return message.channel.send('你沒有權限執行此指令');
		if (!permissions.has('SPEAK')) return message.channel.send('你沒有權限執行此指令');

		const commandErrorMsg = '指令有誤，請在對話框輸入 /checkcmd 查看可用指令和格式 (注意空白)。'
		
		const videoFinder = async (keywords) => {
			return await ytSearch(keywords);
		}

		const analysis = (dialogText, prefix, commandsAssembly) => {
			const commandErrorMsg = '指令有誤，請在對話框輸入 /checkcmd 查看可用指令和格式 (注意空白)。'
			const dialogFragment = dialogText.split(' ');

			// 輸入 $$ play afjkdjfld 這種有 $$ + 空白的錯誤指令格式
			// ['$$', 'play', 'value', 'value2', 'value3']
			if (dialogFragment[0] === prefix) {
				message.reply(commandErrorMsg);
				return false;
			}

			// 以下進入合法格式，開始檢查指令正確性
			// ['$$xxx', 'fasdfasd', 'fasdf']
			const prefixAndCommand = dialogFragment[0];
			if (prefixAndCommand.indexOf(prefix) < 0) {
				message.reply('請檢察指令是否以 $$ 開頭。');
				return false;
			}
			
			// 檢查指令是否於指令集內
			const currentCmd = prefixAndCommand.split(prefix)[1];
			if (commandsAssembly.indexOf(currentCmd) < 0) {
				message.reply(commandErrorMsg);
				return false;
			}

			dialogFragment.shift()
			const queryValue = dialogFragment.join(' ');
			return {
				command: currentCmd,
				queryValue
			}
		}

		
		const secretTime   = 10;
		const commands = ['play', 'stop', 'pause', 'resume', 'setVolume', 'join', 'search', 'secret']
		const dialogText = message.content
		
		const result = analysis(dialogText, prefix, commands);
		if (!result) return false;
		const { command, queryValue } = result;

		console.log({ command, queryValue })

		/*
		這裡是 discord-player 版本
		const queue = client.player.createQueue(message.guild, {
			metadata: {
				channel: message.channel
			}
		});
		*/

		const stream = ytdl(queryValue, { 
			filter: 'audioonly',
			quality: 'highestaudio',
			highWaterMark: 1 << 25
		});

		const resource = createAudioResource(stream);

		switch (command) {
			case 'join': {
				connection.rejoin();
			}
			case 'play': {
				const connection = joinVoiceChannel({
					channelId: voiceChannel.id,
					guildId: message.guild.id,
					adapterCreator: message.guild.voiceAdapterCreator
				});
				var player = createAudioPlayer();
				client.player = player;
				client.connection = connection;
				/*
				// 這裡是 discord-player 版本
				// verify vc connection
				// try {
				// 	if (!queue.connection) await queue.connect(voiceChannel);
				// } catch {
				// 	queue.destroy();
				// 	return await message.reply({ content: "Could not join your voice channel!", ephemeral: true });
				// }
		
				// // await interaction.deferReply();
				// const track = await client.player.search(queryValue, {
				// 	requestedBy: message.client.user
				// }).then(x => {
				// 	console.log(x)
				// 	return x.tracks[0]
				// });
				// if (!track) return await message.reply({ content: `❌ | Track **${query}** not found!` });
				// queue.play(track);
				// return await message.reply({ content: `⏱️ | Loading track **${track.title}**!` });
				*/
				try {
					console.log('嘗試撥放音樂...')
					player.play(resource);
					var sub = connection.subscribe(player);
					client.subscribe = sub;
				} catch (err) {
					console.error('嘗試撥放過程發生錯誤:', err)
				}
				return ''
			}
			case 'stop': {
				const connection = getVoiceConnection(voiceChannel.guild.id);
				if (client.subscribe) {
					console.log('有訂閱執行取消')
					setTimeout(() => client.subscribe.unsubscribe(), 1);
				}
				try {
					connection.destroy();
				} catch (err) {
					console.log(err);
				}
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
				console.log('暫停');
				if (client.player) client.player.pause();
				return ''
			}
			case 'resume': {
				console.log('取消暫停');
				if (client.player) client.player.unpause();
				return ''
			}
			case 'search': {
				// console.info('進行搜尋');
				// console.info('進行搜尋');
				// console.info('進行搜尋');

				const videoResultLength = 5;
				let videoResult = null
				let keyWords = queryValue
				keyWords = keyWords.trim();
				videoResult = await videoFinder(keyWords);
				const videos = videoResult.videos;
				const sortedVideos = videos.sort((a, b) => {
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
				return message.reply(commandErrorMsg)
		}
		return ''
	}
};