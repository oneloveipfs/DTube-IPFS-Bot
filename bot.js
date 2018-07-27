const Discord = require('discord.js');
const WGET = require('node-wget');
const IPFSAPI = require('ipfs-api');
const Steem = require('steem');

const Auth = require('./auth.json');

const bot = new Discord.Client();
const ipfs = IPFSAPI();

Steem.api.setOptions({url: 'https://api.steemit.com'});

bot.login(Auth.token);

bot.on('message', (message) => {
    if (message.content.startsWith('!ping')) {
        message.channel.send('Pong!');
    } else if (message.content.startsWith('!wget')) {

        WGET('https://video.dtube.top/ipfs/Qme4Ag5LjwNgGb2siGgmR1DCDAwqccpJpYXF1SX6QXe2PZ', function() {
            message.reply('Download success!');
        });

    } else if (message.content.startsWith('!ipfs ')) {

        var command = message.content;
        var steemitAuthorPermlink = command.split('/').slice(-2);
        var author = steemitAuthorPermlink[0];

        if (message.content.startsWith('!ipfs https://steemit.com/')) {
            // Remove @ symbol if it is a steemit link
            author = steemitAuthorPermlink[0].slice(1,steemitAuthorPermlink[0].length);
        }
        
        Steem.api.getContent(author, steemitAuthorPermlink[1], function(err, result) {
            
            if (err != null) {
                message.reply('Error:' + err);
                return;
            }
            
            var jsonmeta = JSON.parse(result.json_metadata);
            var appversion = jsonmeta.app.split('/');
            var appname = appversion[0];
            
            if (appname = 'dtube') {
                var ipfshash = jsonmeta.video.content.videohash;
                message.reply('IPFS hash of DTube video obtained. Downloading file...');
                var ipfslink = 'https://video.dtube.top/ipfs/' + ipfshash;
                WGET(ipfslink, function() {
                    message.reply('Download success!');
                })
            } else {
                message.reply('Sorry, this command only supports DTube videos!');
            }
        })
        
    }
});

