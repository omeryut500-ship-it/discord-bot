const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const http = require('http');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// Karışık radyo istasyonları listesi (Yabancı, Türkçe Pop, Rap, Trend)
const STATIONS = [
    'https://listen.powerapp.com.tr/powerfm/mpeg/icecast.audio',      // Power FM (Yabancı Pop/Hit)
    'https://listen.powerapp.com.tr/fenomenturk/mpeg/icecast.audio',  // Fenomen Türk (Türkçe Pop/Rap)
    'https://listen.karnaval.com/virginradio/mpeg/icecast.audio',     // Virgin Radio (Karma/Trend)
    'https://listen.karnaval.com/metrofm/mpeg/icecast.audio'         // Metro FM (Yabancı Karma)
];

let currentStationIndex = 0;

client.once('ready', () => {
    console.log(`${client.user.tag} aktif!`);

    const guildId = process.env.GUILD_ID;
    const channelId = process.env.CHANNEL_ID;

    if (!guildId || !channelId) {
        console.error('GUILD_ID veya CHANNEL_ID eksik!');
        return;
    }

    try {
        const connection = joinVoiceChannel({
            channelId: channelId,
            guildId: guildId,
            adapterCreator: client.guilds.cache.get(guildId).voiceAdapterCreator,
            selfDeaf: false
        });

        const player = createAudioPlayer();

        const playNextStation = () => {
            const streamUrl = STATIONS[currentStationIndex];
            console.log(`Çalınan istasyon [${currentStationIndex + 1}/${STATIONS.length}]: ${streamUrl}`);
            
            const resource = createAudioResource(streamUrl);
            player.play(resource);

            // Bir sonraki istasyona hazırlan
            currentStationIndex = (currentStationIndex + 1) % STATIONS.length;
        };

        // İlk yayını başlat
        playNextStation();
        connection.subscribe(player);

        // Yayın kesilirse veya durursa otomatik sıradaki radyoya geç
        player.on(AudioPlayerStatus.Idle, () => {
            console.log('Yayın kesildi, sıradaki radyoya geçiliyor...');
            playNextStation();
        });

        player.on('error', error => {
            console.error('Oynatıcı hatası:', error.message);
            playNextStation();
        });

        console.log('Ses kanalına bağlanıldı ve karma radyo döngüsü başlatıldı!');
    } catch (error) {
        console.error('Sese bağlanırken hata oluştu:', error);
    }
});

// Render'ın kapanmaması için mini HTTP sunucusu
http.createServer((req, res) => {
    res.write('Bot ve Karma Radyo Aktif!');
    res.end();
}).listen(process.env.PORT || 3000);

client.login(process.env.TOKEN);
