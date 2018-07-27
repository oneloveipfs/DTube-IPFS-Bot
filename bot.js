const Discord = require('discord.js');
const WGET = require('node-wget');
const Steem = require('steem');
const Auth = require('./auth.json');
const fs = require('fs');

const bot = new Discord.Client();

Steem.api.setOptions({url: 'https://api.steemit.com'});

bot.login(Auth.token);

bot.on('message', (message) => {
    if (message.content.startsWith('!ping')) {
        message.channel.send('Pong!');
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
            
            // Get JSON metadata of post
            var jsonmeta = JSON.parse(result.json_metadata);
            var appversion = jsonmeta.app.split('/');
            var appname = appversion[0];
            
            if (appname = 'dtube') {
                // Get IPFS hash of source video file
                var ipfshash = jsonmeta.video.content.videohash;
                message.channel.send('IPFS hash obtained. Downloading video...');
                var ipfslink = 'https://video.dtube.top/ipfs/' + ipfshash;
                WGET(ipfslink, function() {
                    // Adds ipfs hash to queue for manual pinning
                    var readQueue = fs.readFileSync('hashvalues.txt', 'utf8');
                    fs.writeFileSync('hashvalues.txt', readQueue + ipfshash + '\n');   
                    message.reply('Video downloaded successfully, and added to IPFS manual pinning queue.');
                })
            } else {
                message.reply('Sorry, this command only supports DTube videos!');
            }
        })
        
    } else if (message.content == '!ipfshelp') {

    }
});