const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const http = require('http');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const RADIO_URL = 'https://listen.powerapp.com.tr/powerfm/mpeg/icecast.audio';

client.once('ready', async () => {
    console.log(`[LOG] Bot aktif: ${client.user.tag}`);

    const guildId = process.env.GUILD_ID;
    const channelId = process.env.CHANNEL_ID;

    if (!guildId || !channelId) {
        console.error('[HATA] GUILD_ID veya CHANNEL_ID eksik!');
        return;
    }

    try {
        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(channelId);

        console.log(`[LOG] Sunucu: ${guild.name}, Kanal: ${channel.name} bulundu.`);

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false
        });

        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log('[LOG] Bağlantı başarılı! Ses oynatılıyor...');
            const player = createAudioPlayer();
            const resource = createAudioResource(RADIO_URL);
            
            player.play(resource);
            connection.subscribe(player);
        });

        connection.on('error', err => {
            console.error('[HATA] VoiceConnection hatası:', err);
        });

    } catch (err) {
        console.error('[HATA] Genel bağlantı hatası:', err);
    }
});

http.createServer((req, res) => {
    res.write('OK');
    res.end();
}).listen(process.env.PORT || 3000);

client.login(process.env.TOKEN);
