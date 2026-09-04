const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const http = require('http');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates // Ses kanalı durumları için şart
    ]
});

// Karışık radyo istasyonları listesi
const STATIONS = [
    'https://listen.powerapp.com.tr/powerfm/mpeg/icecast.audio',      // Power FM
    'https://listen.powerapp.com.tr/fenomenturk/mpeg/icecast.audio',  // Fenomen Türk
    'https://listen.karnaval.com/virginradio/mpeg/icecast.audio',     // Virgin Radio
    'https://listen.karnaval.com/metrofm/mpeg/icecast.audio'         // Metro FM
];

let currentStationIndex = 0;

function connectAndPlay() {
    const guildId = process.env.GUILD_ID;
    const channelId = process.env.CHANNEL_ID;

    if (!guildId || !channelId) {
        console.error('GUILD_ID veya CHANNEL_ID eksik!');
        return;
    }

    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;

    const connection = joinVoiceChannel({
        channelId: channelId,
        guildId: guildId,
        adapterCreator: guild.voiceAdapterCreator,
        selfDeaf: false
    });

    const player = createAudioPlayer();

    const playNextStation = () => {
        const streamUrl = STATIONS[currentStationIndex];
        console.log(`Çalınan istasyon [${currentStationIndex + 1}/${STATIONS.length}]: ${streamUrl}`);
        
        const resource = createAudioResource(streamUrl);
        player.play(resource);

        currentStationIndex = (currentStationIndex + 1) % STATIONS.length;
    };

    playNextStation();
    connection.subscribe(player);

    // Otomatik Yeniden Bağlanma (Sesten Düşerse)
    connection.on(VoiceConnectionStatus.Disconnected, () => {
        console.log('Bağlantı koptu, tekrar bağlanılıyor...');
        setTimeout(() => connectAndPlay(), 5000);
    });

    player.on(AudioPlayerStatus.Idle, () => {
        playNextStation();
    });

    player.on('error', error => {
        console.error('Oynatıcı hatası:', error.message);
        playNextStation();
    });
}

client.once('ready', () => {
    console.log(`${client.user.tag} aktif!`);
    connectAndPlay();
});

// Render'ın kapanmaması için mini HTTP sunucusu
http.createServer((req, res) => {
    res.write('Bot ve Karma Radyo Aktif!');
    res.end();
}).listen(process.env.PORT || 3000);

client.login(process.env.TOKEN);
