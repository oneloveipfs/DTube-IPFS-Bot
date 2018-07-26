const Discord = require('discord.js');
const WGET = require('node-wget');
const IPFSAPI = require('ipfs-api');

const Auth = require('./auth.json');

const bot = new Discord.Client();
const ipfs = IPFSAPI();

bot.login(Auth.token);

bot.on('message', (message) => {
    if (message.content.startsWith('!ping')) {
        message.channel.send('Pong!');
    } else if (message.content.startsWith('!wget')) {

        WGET('https://video.dtube.top/ipfs/Qme4Ag5LjwNgGb2siGgmR1DCDAwqccpJpYXF1SX6QXe2PZ', function() {
            message.reply('Download success!');
        });

    }
});

