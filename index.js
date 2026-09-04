const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.on('ready', () => {
    console.log(`${client.user.tag} aktif ve seste!`);
    
    const guild = client.guilds.cache.get('1370731634743050390');
    const channel = guild.channels.cache.get('1404502754340376647');

    if (guild && channel) {
        joinVoiceChannel({
            channelId: channel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: true
        });
    }
});

client.login('MTU0NTM0MzY0MzQwNDA3OTE5NQ.G6zGys.KU-cY-fPjZ1PaokRF2i3jRRr2YS4UT2MukwAlY');
