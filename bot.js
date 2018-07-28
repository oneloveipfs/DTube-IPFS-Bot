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
        // Source video
        var command = message.content;
        var steemitAuthorPermlink = command.split('/').slice(-2);
        var author = steemitAuthorPermlink[0];

        if ((command.startsWith('!ipfs https://steemit.com/')) || (command.startsWith('!ipfs https://busy.org/'))) {
            // Remove @ symbol if it is a steemit/busy link
            author = steemitAuthorPermlink[0].slice(1,steemitAuthorPermlink[0].length);
        }
        
        Steem.api.getContent(author, steemitAuthorPermlink[1], function(err, result) {
            
            if (err != null) {
                message.reply('Error:' + err);
                return;
            }
            
            // Get JSON metadata of post
            var jsonmeta = JSON.parse(result.json_metadata);

            // Get IPFS hash of source video file
            var ipfshash = jsonmeta.video.content.videohash;
            message.channel.send('IPFS hash obtained. Fetching video...');
            var ipfslink = 'https://video.dtube.top/ipfs/' + ipfshash;
            WGET(ipfslink, function(err) {
                if (err != null) {
                    message.reply('WGET Error: ' + err);
                    return;
                }

                // Adds ipfs hash to queue for manual pinning
                if (fs.existsSync('hashvalues.txt')) {
                    var readQueue = fs.readFileSync('hashvalues.txt', 'utf8');
                    fs.writeFileSync('hashvalues.txt', readQueue + ipfshash + '\n');  
                } else {
                    fs.writeFileSync('hashvalues.txt', ipfshash + '\n');
                }
                  
                message.reply('Video downloaded successfully, and added to IPFS manual pinning queue.');
            });
        });
        
    } else if (message.content.startsWith('!ipfs240 ')) {
        // 240p video
        var command = message.content;
        var steemitAuthorPermlink = command.split('/').slice(-2);
        var author = steemitAuthorPermlink[0];

        if ((command.startsWith('!ipfs240 https://steemit.com/')) || (command.startsWith('!ipfs240 https://busy.org/'))) {
            // Remove @ symbol if it is a steemit/busy link
            author = steemitAuthorPermlink[0].slice(1,steemitAuthorPermlink[0].length);
        }
        
        Steem.api.getContent(author, steemitAuthorPermlink[1], function(err, result) {
            
            if (err != null) {
                message.reply('Error:' + err);
                return;
            }
            
            // Get JSON metadata of post
            var jsonmeta = JSON.parse(result.json_metadata);

            var ipfs240hash = jsonmeta.video.content.video240hash;
            message.channel.send('240p IPFS hash obtained. Fetching video...');
            var ipfslink = 'https://video.dtube.top/ipfs/' + ipfs240hash;
            WGET(ipfslink, function(err) {
                if (err != null) {
                    message.reply('WGET Error: ' + err);
                    return;
                }

                // Adds ipfs hash to queue for manual pinning
                if (fs.existsSync('hashvalues.txt')) {
                    var readQueue = fs.readFileSync('hashvalues.txt', 'utf8');
                    fs.writeFileSync('hashvalues.txt', readQueue + ipfs240hash + '\n');  
                } else {
                    fs.writeFileSync('hashvalues.txt', ipfs240hash + '\n');
                }
                  
                message.reply('Video downloaded successfully, and added to IPFS manual pinning queue.');
            });
        });
    } else if (message.content.startsWith('!ipfs480 ')) {
        // 480p video
        var command = message.content;
        var steemitAuthorPermlink = command.split('/').slice(-2);
        var author = steemitAuthorPermlink[0];

        if ((command.startsWith('!ipfs480 https://steemit.com/')) || (command.startsWith('!ipfs480 https://busy.org/'))) {
            // Remove @ symbol if it is a steemit/busy link
            author = steemitAuthorPermlink[0].slice(1,steemitAuthorPermlink[0].length);
        }
        
        Steem.api.getContent(author, steemitAuthorPermlink[1], function(err, result) {
            
            if (err != null) {
                message.reply('Error:' + err);
                return;
            }
            
            // Get JSON metadata of post
            var jsonmeta = JSON.parse(result.json_metadata);

            var ipfs480hash = jsonmeta.video.content.video480hash;
            message.channel.send('480p IPFS hash obtained. Fetching video...');
            var ipfslink = 'https://video.dtube.top/ipfs/' + ipfs480hash;
            WGET(ipfslink, function(err) {
                if (err != null) {
                    message.reply('WGET Error: ' + err);
                    return;
                }

                // Adds ipfs hash to queue for manual pinning
                if (fs.existsSync('hashvalues.txt')) {
                    var readQueue = fs.readFileSync('hashvalues.txt', 'utf8');
                    fs.writeFileSync('hashvalues.txt', readQueue + ipfs480hash + '\n');  
                } else {
                    fs.writeFileSync('hashvalues.txt', ipfs480hash + '\n');
                }
                
                message.reply('Video downloaded successfully, and added to IPFS manual pinning queue.');
            });
        });
    } else if (message.content == '!ipfshelp') {
        var embed = new Discord.RichEmbed();
        embed.setTitle('DTube IPFS Bot Command Cheatsheet')
        embed.addField('!ipfs <link>', 'Fetches DTube video at source resolution from video.dtube.top and adds to IPFS file pinning queue. This command only supports DTube videos!');
        embed.addField('!ipfs240 <link>', 'Fetches DTube video at 240p resolution from video.dtube.top and adds to IPFS file pinning queue. This command only supports DTube videos!');
        embed.addField('!ipfs480 <link>', 'Fetches DTube video at 480p resolution from video.dtube.top and adds to IPFS file pinning queue. This command only supports DTube videos!');
        embed.addField('!ipfshelp', 'Shows this cheatsheet with all available commands for this bot');
        embed.addField('!ping', 'Gets the bot to reply with "Pong!"');
        embed.setColor(0x499293);
        message.channel.send(embed);
    }
});