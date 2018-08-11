const Discord = require('discord.js');
const WGET = require('wget-improved');
const Steem = require('steem');
const Auth = require('./auth.json');
const Config = require('./config.json');
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

        if (author.startsWith('@')) {
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

            // Download file to server!
            let download = WGET.download(ipfslink,'./' + ipfshash);

            download.on('error',function(err) {
                // Download error
                message.channel.send('Error downloading file: ' + err);
            });

            download.on('start',function(filesize) {
                // Get file size in MB
                var humanreadableFS = (filesize / 1048576).toFixed(2);
                message.channel.send('Video file size: ' + humanreadableFS + 'MB');
            });

            download.on('end',function() {
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

        if (author.startsWith('@')) {
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

            // Download file to server!
            let download = WGET.download(ipfslink,'./' + ipfs240hash);

            download.on('error',function(err) {
                // Download error
                message.channel.send('Error downloading file: ' + err);
            });

            download.on('start',function(filesize) {
                // Get file size in MB
                var humanreadableFS = (filesize / 1048576).toFixed(2);
                message.channel.send('Video file size: ' + humanreadableFS + 'MB');
            });

            download.on('end',function() {
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

        if (author.startsWith('@')) {
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

            // Download file to server!
            let download = WGET.download(ipfslink,'./' + ipfs480hash);

            download.on('error',function(err) {
                // Download error
                message.channel.send('Error downloading file: ' + err);
            });

            download.on('start',function(filesize) {
                // Get file size in MB
                var humanreadableFS = (filesize / 1048576).toFixed(2);
                message.channel.send('Video file size: ' + humanreadableFS + 'MB');
            });

            download.on('end',function() {
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
    } else if (message.content == '!botintro') {
        message.channel.send('__***Find out more about DTube IPFS Bot:***__ \nhttps://steemit.com/utopian-io/@techcoderx/new-discord-bot-to-pin-dtube-videos-to-ipfs-node');
    } else if (message.content.startsWith('!donate ')) {
        // Generates SteemConnect donate link to community account (e.g. to cover server costs etc)
        var account = Config.communityAccount;

        if (account == "") {
            message.channel.send('Discord community account not set yet!');
            return;
        }

        Steem.api.getAccounts([account],function(err,result) {
            if (err != null) {
                // Error handling
                message.channel.send('Error checking account: ' + err);
                return;
            } else if (isEmptyObject(result)) {
                // Community Steem account entered in config.json doesn't exist
                message.channel.send("Community account entered in config doesn't exist!");
                return;
            }

            // Generates SteemConnect donate link to community account
            var crypto = message.content.split(' ').slice(-2);
            var currency = crypto[0];
            var amount = crypto[1];

            if (isNaN(amount) == false) {
                switch (currency) {
                  case 'steem':
                        var donatelink = 'https://steemconnect.com/sign/transfer?to=' + account + '&amount=' + amount + '%20STEEM&memo=IPFS%%20Bot%20Donation';
                        message.channel.send('__***Support the community for hosting the bot and IPFS files with STEEM donations by clicking on the link below:***__ \n' + donatelink);
                      break;
                    case 'sbd':
                        var donatelink = 'https://steemconnect.com/sign/transfer?to=' + account + '&amount=' + amount + '%20SBD&memo=IPFS%20Bot%20Donation';
                        message.channel.send('__***Support the community for hosting the bot and IPFS files with SBD donations by clicking on the link below:***__ \n' + donatelink);
                        break;
                    default:
                        message.channel.send('Invalid currency entered!');
                        break;
                }
            } else {
                message.channel.send('Invalid amount entered!');
            }
        });
        
    } else if (message.content.startsWith('!devdonate ')) {
        // Generates SteemConnect donate link to developer
        var crypto = message.content.split(' ').slice(-2);
        var currency = crypto[0];
        var amount = crypto[1];

        if (isNaN(amount) == false) {
            switch (currency) {
                case 'steem':
                    var donatelink = 'https://steemconnect.com/sign/transfer?to=techcoderx&amount=' + amount + '%20STEEM&memo=IPFS%20Discord%20Bot%20Dev%20Donation';
                    message.channel.send('__***Support the development of the bot with STEEM donations by clicking on the link below:***__ \n' + donatelink);
                    break;
                case 'sbd':
                    var donatelink = 'https://steemconnect.com/sign/transfer?to=techcoderx&amount=' + amount + '%20SBD&memo=IPFS%20Discord%20Bot%20Dev%20Donation';
                    message.channel.send('__***Support the development of the bot with SBD donations by clicking on the link below:***__ \n' + donatelink);
                    break;
                default:
                    message.channel.send('Invalid currency entered!');
                    break;
            }
        } else {
            message.channel.send('Invalid amount entered!');
        }
        
    } else if (message.content == '!ipfshelp') {
        // Bot command list
        var embed = new Discord.RichEmbed();
        embed.setTitle('DTube IPFS Bot Command Cheatsheet');
        embed.addField('!ipfs <link>', 'Fetches DTube video at source resolution from video.dtube.top and adds to IPFS file pinning queue. This command only supports DTube videos!');
        embed.addField('!ipfs240 <link>', 'Fetches DTube video at 240p resolution from video.dtube.top and adds to IPFS file pinning queue. This command only supports DTube videos!');
        embed.addField('!ipfs480 <link>', 'Fetches DTube video at 480p resolution from video.dtube.top and adds to IPFS file pinning queue. This command only supports DTube videos!');
        embed.addField('!botintro','Posts a link to the introtroduceyourself Steemit post about the bot.');
        embed.addField('!donate <currency> <amount>','Support the community for hosting the bot and IPFS files by donating STEEM/SBD to community Steem account!');
        embed.addField('!devdonate <currency> <amount>','Support the development of the bot by donating STEEM/SBD to developer!');
        embed.addField('!ipfshelp', 'Shows this cheatsheet with all available commands for this bot');
        embed.addField('!ping', 'Gets the bot to reply with "Pong!"');
        embed.setColor(0x499293);
        message.channel.send(embed);
    }
});

function isEmptyObject(obj) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
  }