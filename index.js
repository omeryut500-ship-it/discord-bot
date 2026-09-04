const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const http = require('http');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const STATIONS = [
    'https://listen.powerapp.com.tr/powerfm/mpeg/icecast.audio',
    'https://listen.powerapp.com.tr/fenomenturk/mpeg/icecast.audio',
    'https://listen.karnaval.com/virginradio/mpeg/icecast.audio',
    'https://listen.karnaval.com/metrofm/mpeg/icecast.audio'
];

let currentStationIndex = 0;

async function startBot() {
    const guildId = process.env.GUILD_ID;
    const channelId = process.env.CHANNEL_ID;

    if (!guildId || !channelId) {
        console.error('HATA: GUILD_ID veya CHANNEL_ID eksik!');
        return;
    }

    try {
        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(channelId);

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false
        });

        const player = createAudioPlayer();

        const playNext = () => {
            const url = STATIONS[currentStationIndex];
            console.log(`Çalınıyor: ${url}`);
            const resource = createAudioResource(url);
            player.play(resource);
            currentStationIndex = (currentStationIndex + 1) % STATIONS.length;
        };

        playNext();
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => playNext());
        player.on('error', err => {
            console.error('Oynatıcı hatası:', err.message);
            playNext();
        });

        console.log('Ses kanalına başarıyla bağlandı!');
    } catch (err) {
        console.error('Bağlantı hatası:', err);
    }
}

client.once('ready', () => {
    console.log(`${client.user.tag} online!`);
    startBot();
});

http.createServer((req, res) => {
    res.write('OK');
    res.end();
}).listen(process.env.PORT || 3000);

client.login(process.env.TOKEN);
