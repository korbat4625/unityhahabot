const {
	AudioPlayerStatus,
	StreamType,
	createAudioPlayer,
	createAudioResource,
	joinVoiceChannel,
} = require('@discordjs/voice');

const ytSearch = require('yt-search');
const ytdl = require('ytdl-core');
const { MessageEmbed } = require('discord.js');


module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(client, message) {
		console.log(message)
		const voiceChannel = message.member.voice.channel
		if (message.author.bot) return ''
		if (message.type === 'REPLY') return ''
		if (message.content[0] !== '$' && message.content[1] !== '$') return ''
		if (!voiceChannel) return message.reply('請進入語音頻道，才能輸入指令! (指令以$$開頭)');

		const permissions = voiceChannel.permissionsFor(message.client.user)
		if (!permissions.has('CONNECT')) return message.channel.send('你沒有權限執行此指令');
		if (!permissions.has('SPEAK')) return message.channel.send('你沒有權限執行此指令');
		
		
		const videoFinder = async (q) => {
			return await ytSearch(q);
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
			return message.reply(text);
		}

		const prefix = '$$'
		const args = message.content.slice(prefix.length).trim().split(/ +/g);
		const command = args.shift();
		const defaultVol = 80;
		const secretTime = 10;
		let guildQueue = client.player.getQueue(message.guild.id);
		
		// console.log('command:', command)
		console.log('args:', args)
		switch (command) {
			case 'play': {
				let queue = client.player.createQueue(message.guild.id);
				await queue.join(message.member.voice.channel);
				client.player.getQueue(message.guild.id).setVolume(defaultVol);
				let song = await queue.play(args.join(' ')).catch(_ => {
					if(!guildQueue)
					queue.stop();
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
				guildQueue.stop();
				break;
			}
			case 'setVolume': {
				guildQueue.setVolume(parseInt(args[0]));
				break;
			}
			case 'pause': {
				guildQueue.setPaused(true);
				break;
			}
			case 'resume': {
				guildQueue.setPaused(false);
				break;
			}
			case 'search': {
				console.log('進行搜尋')
				const videoResultLength = 5;
				let videoResult = null
				let keyWords = ''
				for (let i = 0; i < args.length; i++) {
					keyWords += args[i] + ' '
				}
				keyWords = keyWords.trim();
				console.log(keyWords)
				videoResult = await videoFinder(keyWords);
				const videos = videoResult.videos;
				const sortedVideos = videos.sort(function(a, b) {
					return b.views -a.views
				})

				const embeds = []

				for (let i = 0; i < videoResultLength; i++) {
					// inside a command, event listener, etc.
					const exampleEmbed = new MessageEmbed()
						.setColor('#0099ff')
						.setTitle(sortedVideos[i].title)
						.setURL(sortedVideos[i].url)
						.setAuthor(sortedVideos[i].author.name, sortedVideos[i].thumbnail, sortedVideos[i].url)
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
				console.log('不該連續出現');
				message.reply({embeds});
				break;
			}
			case 'secret': {
				for(let i = 0; i< secretTime; i++) {
					message.reply('天底下最強的人就是台南市長黃偉哲...')
				}
				return;
			}
			case '?': {
				return showCommand(command);
			}
			default:
				console.log('wrong')
				return showCommand(command);
		}
		return ''
		// 解析$$order
		// const excuteOrder = order[0].split('$$')[1];
		// const param = order[1];
		// const videoResultLength = 5;
		// let videoResult = null

		// switch (excuteOrder) {
		// 	case 'search':
		// 		videoResult = await videoFinder(param);
		// 		console.log(videoResult)
		// 		const videos = videoResult.videos
		// 		let text = '';
		// 		for (let i = 0; i < videoResultLength; i++) {
		// 			text += `
		// 				${i+1}. ${videos[i].title}\n
		// 				${videos[i].image}
		// 				描述: ${videos[i].description}\n
		// 				時長: ${videos[i].timestamp}\n
		// 				建立時間: ${videos[i].ago}\n
		// 				瀏覽次數: ${videos[i].views}\n\n\n
		// 			`
		// 		}
		// 		return message.reply(
		// 			'找到有關 "' + param + '"的影片:\n' +
		// 			text
		// 		)
		// 		break;
		// 	case 'play':
		// 		// async function play(connection, player, resource) {
		// 		// 	await player.play(resource);
		// 		// 	connection.subscribe(player);
		// 		// }

		// 		// const connection = joinVoiceChannel({
		// 		// 	channelId: message.member.voice.channel.id,
		// 		// 	guildId: message.guild.id,
		// 		// 	adapterCreator: message.guild.voiceAdapterCreator,
		// 		// });
		// 		// console.log('connnnection:', connection)
		// 		// console.log('paramparam', param)
		// 		// const videoInfo = ytdl.getInfo(param);
		// 		// const stream = ytdl.downloadFromInfo(videoInfo)
		// 		// // const stream = ytdl(param, {
		// 		// // 	filter: "audioonly"
		// 		// // });
		// 		// const player = createAudioPlayer();
		// 		// const resource = createAudioResource(stream, {
		// 		// 	inputType: StreamType.Arbitrary,
		// 		// 	inlineVolume: true
		// 		// });
		// 		// player.play(resource)
		// 		// entersState(player, AudioPlayerStatus.Playing, 5e3)
		// 		// connection.subscribe(player)
		// 		// player.on('subscribe', async () => {
		// 		// 	return message.reply(`:thumbsup: Now Playing ***${video.title}***`);
		// 		// })
		// 		// play(connection, player, resource);
				
				
		// 		// ...
				
		// 		const connection = joinVoiceChannel({
		// 			channelId: message.member.voice.channel.id,
		// 			guildId: message.guild.id,
		// 			adapterCreator: message.guild.voiceAdapterCreator,
		// 		});
				
		// 		const stream = ytdl(param, { filter: 'audioonly' });
		// 		const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });
		// 		const player = createAudioPlayer();
				
		// 		player.play(resource);
		// 		connection.subscribe(player);
				
		// 		player.on(AudioPlayerStatus.Idle, () => connection.destroy());
		// 		break;
		// 	default: break;
		// }
	
		// console.log('channelchannelchannel::', channel)
		// console.log(`members :: ${channel.guild.members}\nchannels:: ${channel.guild.channels}\nvoiceStates:: ${channel.guild.voiceStates}\nroles:: ${channel.guild.roles}\ncommands:: ${channel.guild.commands}`)
		// if (message.type !== 'REPLY') {
		// 	// message.reply(`members :: ${channel.guild.members}\nchannels:: ${channel.guild.channels}\nvoiceStates:: ${channel.guild.voiceStates}\nroles:: ${channel.guild.roles}\ncommands:: ${channel.guild.commands}`)
		// 	message.reply(
		// 		'message sender:' + message.author.username + '\n' + 
		// 		'message content:' + message.content + '\n'
		// 	)
		// 	message.channel.send(`第一段指令:$$${excuteOrder}\n第二段參數:${order[1]}`);
		// }
	}
};