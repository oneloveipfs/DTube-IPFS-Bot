const Discord = require('discord.js');
const WGET = require('wget-improved');
const Steem = require('steem');
const Auth = require('./auth.json');
const Config = require('./config.json');
const fs = require('fs');

const bot = new Discord.Client();

Steem.api.setOptions({url: Config.steemAPIURL});

if (Config.commandPrefix == "") {
    // Terminate bot if no command prefix provided
    console.log(Config.ERROR_PREFIX404)
    process.exit(1);
}

bot.login(Auth.token);

console.log('IPFS Bot started!\n');

bot.on('message', (message) => {
    if (message.content.startsWith(Config.commandPrefix + 'ping')) {
        // Pong!
        message.channel.send(Config.PING_REPLY);
    } else if (message.content.startsWith(Config.commandPrefix + 'ipfs ')) {
        // Source video
        if (Config.sdOnlyMode == true) {
            sendMessage(message,Config.ERROR_SD_ONLY_MODE);
            return;
        }

        if (Config.hdwhitelistEnabled == true) {
            if (fs.existsSync('HDWhitelist.txt')) {
                var readList = fs.readFileSync('HDWhitelist.txt', 'utf8');
                if (readList.includes(message.author.id) != true) {
                    // Do not proceed if user is not in whitelist
                    sendMessage(message,Config.ERROR_NO_PIN_PERMISSION);
                    return;
                }
            } else {
                sendMessage(message,Config.WHITELIST_FILE404);
                return;
            }
        }

        var command = message.content;
        var steemitAuthorPermlink = command.split('/').slice(-2);
        var author = steemitAuthorPermlink[0];

        if (author.startsWith('@')) {
            // Remove @ symbol if it is a steemit/busy link
            author = steemitAuthorPermlink[0].slice(1,steemitAuthorPermlink[0].length);
        }
        
        Steem.api.getContent(author, steemitAuthorPermlink[1], function(err, result) {
            
            if (err != null) {
                sendMessage(message,Config.ERROR_STEEM_GETCONTENT + err);
                return;
            }
            
            // Get JSON metadata of post
            var jsonmeta = JSON.parse(result.json_metadata);

            // Get IPFS hash of source video file
            var ipfshash = jsonmeta.video.content.videohash;

            if (fs.existsSync('./Pinned/AllPinned.txt')) {
                var readPinnedList = fs.readFileSync('./Pinned/AllPinned.txt', 'utf8');
                if (readPinnedList.includes(ipfshash)) {
                    // File already pinned
                    sendMessage(message,Config.ERROR_FILE_ALREADY_PINNED);
                    return;
                }
            }

            var ipfslink = 'https://video.dtube.top/ipfs/' + ipfshash;

            // Download file to server!
            let download = WGET.download(ipfslink,'./' + ipfshash);

            download.on('error',function(err) {
                // Download error
                sendMessage(message,Config.ERROR_DOWNLOAD + err);
            });

            download.on('start',function(filesize) {
                // Get file size in MB
                var humanreadableFS = (filesize / 1048576).toFixed(2);
                sendMessage(message,Config.VIDEO_DOWNLOAD_MESSAGE_SOURCE + '\nAuthor: ' + author + '\nPermlink: ' + steemitAuthorPermlink[1] + '\nVideo file size: ' + humanreadableFS + 'MB\n');
            });

            download.on('end',function() {
                // Adds ipfs hash to user database and pinning queue
                addDTubeHashToDatabase(message,ipfshash);
                message.channel.send(Config.VIDEO_DOWNLOAD_COMPLETE);
            });
        });
    } else if (message.content.startsWith(Config.commandPrefix + 'ipfs240 ')) {
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
                sendMessage(message,Config.ERROR_STEEM_GETCONTENT + err);
                return;
            }
            
            // Get JSON metadata of post
            var jsonmeta = JSON.parse(result.json_metadata);

            var ipfs240hash = jsonmeta.video.content.video240hash;

            if (fs.existsSync('./Pinned/AllPinned.txt')) {
                var readPinnedList = fs.readFileSync('./Pinned/AllPinned.txt', 'utf8');
                if (readPinnedList.includes(ipfs240hash)) {
                    // File already pinned
                    sendMessage(message,Config.ERROR_FILE_ALREADY_PINNED);
                    return;
                }
            }

            var ipfslink = 'https://video.dtube.top/ipfs/' + ipfs240hash;

            // Download file to server!
            let download = WGET.download(ipfslink,'./' + ipfs240hash);

            download.on('error',function(err) {
                // Download error
                sendMessage(message,Config.ERROR_DOWNLOAD + err);
            });

            download.on('start',function(filesize) {
                // Get file size in MB
                var humanreadableFS = (filesize / 1048576).toFixed(2);
                sendMessage(message,Config.VIDEO_DOWNLOAD_MESSAGE_240P + '\nAuthor: ' + author + '\nPermlink: ' + steemitAuthorPermlink[1] + '\nVideo file size: ' + humanreadableFS + 'MB\n');
            });

            download.on('end',function() {
                // Adds ipfs hash to user database and pinning queue
                addDTubeHashToDatabase(message,ipfs240hash);
                message.channel.send(Config.VIDEO_DOWNLOAD_COMPLETE);
            });
            
        });
    } else if (message.content.startsWith(Config.commandPrefix + 'ipfs480 ')) {
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
                sendMessage(message,Config.ERROR_STEEM_GETCONTENT + err);
                return;
            }
            
            // Get JSON metadata of post
            var jsonmeta = JSON.parse(result.json_metadata);

            var ipfs480hash = jsonmeta.video.content.video480hash;

            if (fs.existsSync('./Pinned/AllPinned.txt')) {
                var readPinnedList = fs.readFileSync('./Pinned/AllPinned.txt', 'utf8');
                if (readPinnedList.includes(ipfs480hash)) {
                    // File already pinned
                    sendMessage(message,Config.ERROR_FILE_ALREADY_PINNED);
                    return;
                }
            }

            var ipfslink = 'https://video.dtube.top/ipfs/' + ipfs480hash;

            // Download file to server!
            let download = WGET.download(ipfslink,'./' + ipfs480hash);

            download.on('error',function(err) {
                // Download error
                sendMessage(message,Config.ERROR_DOWNLOAD + err);
            });

            download.on('start',function(filesize) {
                // Get file size in MB
                var humanreadableFS = (filesize / 1048576).toFixed(2);
                sendMessage(message,Config.VIDEO_DOWNLOAD_MESSAGE_480P + '\nAuthor: ' + author + '\nPermlink: ' + steemitAuthorPermlink[1] + '\nVideo file size: ' + humanreadableFS + 'MB\n');
            });

            download.on('end',function() {
                // Adds ipfs hash to user database and pinning queue
                addDTubeHashToDatabase(message,ipfs480hash);
                message.channel.send(Config.VIDEO_DOWNLOAD_COMPLETE);
            });
        });
    } else if (message.content.startsWith(Config.commandPrefix + 'ipfs720 ')) {
        // 720p video
        if (Config.sdOnlyMode == true) {
            sendMessage(message,Config.ERROR_SD_ONLY_MODE);
            return;
        }

        if (Config.hdwhitelistEnabled == true) {
            if (fs.existsSync('HDWhitelist.txt')) {
                var readList = fs.readFileSync('HDWhitelist.txt', 'utf8');
                if (readList.includes(message.author.id) != true) {
                    // Do not proceed if user is not in whitelist
                    sendMessage(message,Config.ERROR_NO_PIN_PERMISSION);
                    return;
                }
            } else {
                sendMessage(message,Config.WHITELIST_FILE404);
                return;
            }
        }

        var command = message.content;
        var steemitAuthorPermlink = command.split('/').slice(-2);
        var author = steemitAuthorPermlink[0];

        if (author.startsWith('@')) {
            // Remove @ symbol if it is a steemit/busy link
            author = steemitAuthorPermlink[0].slice(1,steemitAuthorPermlink[0].length);
        }
        
        Steem.api.getContent(author, steemitAuthorPermlink[1], function(err, result) {
            
            if (err != null) {
                sendMessage(message,Config.ERROR_STEEM_GETCONTENT + err);
                return;
            }
            
            // Get JSON metadata of post
            var jsonmeta = JSON.parse(result.json_metadata);

            var ipfs720hash = jsonmeta.video.content.video720hash;

            if (fs.existsSync('./Pinned/AllPinned.txt')) {
                var readPinnedList = fs.readFileSync('./Pinned/AllPinned.txt', 'utf8');
                if (readPinnedList.includes(ipfs720hash)) {
                    // File already pinned
                    sendMessage(message,Config.ERROR_FILE_ALREADY_PINNED);
                    return;
                }
            }

            var ipfslink = 'https://video.dtube.top/ipfs/' + ipfs720hash;

            // Download file to server!
            let download = WGET.download(ipfslink,'./' + ipfs720hash);

            download.on('error',function(err) {
                // Download error
                sendMessage(message,Config.ERROR_DOWNLOAD + err);
            });

            download.on('start',function(filesize) {
                // Get file size in MB
                var humanreadableFS = (filesize / 1048576).toFixed(2);
                sendMessage(message,Config.VIDEO_DOWNLOAD_MESSAGE_720P + '\nAuthor: ' + author + '\nPermlink: ' + steemitAuthorPermlink[1] + '\nVideo file size: ' + humanreadableFS + 'MB\n');
            });

            download.on('end',function() {
                // Adds ipfs hash to user database and pinning queue
                addDTubeHashToDatabase(message,ipfs720hash);
                message.channel.send(Config.VIDEO_DOWNLOAD_COMPLETE);
            });
        });
    } else if (message.content.startsWith(Config.commandPrefix + 'ipfs1080 ')) {
        // 1080p video
        if (Config.sdOnlyMode == true) {
            sendMessage(message,ERROR_SD_ONLY_MODE);
            return;
        }
        
        if (Config.hdwhitelistEnabled == true) {
            if (fs.existsSync('HDWhitelist.txt')) {
                var readList = fs.readFileSync('HDWhitelist.txt', 'utf8');
                if (readList.includes(message.author.id) != true) {
                    // Do not proceed if user is not in whitelist
                    sendMessage(message,Config.ERROR_NO_PIN_PERMISSION);
                    return;
                }
            } else {
                sendMessage(message,Config.WHITELIST_FILE404);
                return;
            }
        }

        var command = message.content;
        var steemitAuthorPermlink = command.split('/').slice(-2);
        var author = steemitAuthorPermlink[0];

        if (author.startsWith('@')) {
            // Remove @ symbol if it is a steemit/busy link
            author = steemitAuthorPermlink[0].slice(1,steemitAuthorPermlink[0].length);
        }
        
        Steem.api.getContent(author, steemitAuthorPermlink[1], function(err, result) {
            
            if (err != null) {
                sendMessage(message,Config.ERROR_STEEM_GETCONTENT + err);
                return;
            }
            
            // Get JSON metadata of post
            var jsonmeta = JSON.parse(result.json_metadata);

            var ipfs1080hash = jsonmeta.video.content.video1080hash;

            if (fs.existsSync('./Pinned/AllPinned.txt')) {
                var readPinnedList = fs.readFileSync('./Pinned/AllPinned.txt', 'utf8');
                if (readPinnedList.includes(ipfs1080hash)) {
                    // File already pinned
                    sendMessage(message,Config.ERROR_FILE_ALREADY_PINNED);
                    return;
                }
            }

            var ipfslink = 'https://video.dtube.top/ipfs/' + ipfs1080hash;

            // Download file to server!
            let download = WGET.download(ipfslink,'./' + ipfs1080hash);

            download.on('error',function(err) {
                // Download error
                sendMessage(message,Config.ERROR_DOWNLOAD + err);
            });

            download.on('start',function(filesize) {
                // Get file size in MB
                var humanreadableFS = (filesize / 1048576).toFixed(2);
                sendMessage(message,Config.VIDEO_DOWNLOAD_MESSAGE_1080P + '\nAuthor: ' + author + '\nPermlink: ' + steemitAuthorPermlink[1] + '\nVideo file size: ' + humanreadableFS + 'MB\n');
            });

            download.on('end',function() {
                addDTubeHashToDatabase(message,ipfs1080hash);
                message.channel.send(Config.VIDEO_DOWNLOAD_COMPLETE);
            });
        });
    } else if (message.content.startsWith(Config.commandPrefix + 'ipfssound ')) {
        // DSound audio
        var command = message.content;
        var steemitAuthorPermlink = command.split('/').slice(-2);
        var author = steemitAuthorPermlink[0];

        if (author.startsWith('@')) {
            // Remove @ symbol if it is a steemit/busy link
            author = steemitAuthorPermlink[0].slice(1,steemitAuthorPermlink[0].length);
        }

        Steem.api.getContent(author,steemitAuthorPermlink[1],function(err,result) {
            if (err != null) {
                sendMessage(message,Config.ERROR_STEEM_GETCONTENT + err);
                return;
            }

            // Get JSON metadata of post
            var jsonmeta = JSON.parse(result.json_metadata);

            var dsoundhash = jsonmeta.audio.files.sound;

            if (fs.existsSync('./Pinned/AllPinned.txt')) {
                var readPinnedList = fs.readFileSync('./Pinned/AllPinned.txt', 'utf8');
                if (readPinnedList.includes(dsoundhash)) {
                    // File already pinned
                    sendMessage(message,Config.ERROR_FILE_ALREADY_PINNED);
                    return;
                }
            }

            var dsoundipfslink = 'https://ipfs.io/ipfs/' + dsoundhash;

            // Download video to server!
            let download = WGET.download(dsoundipfslink,'./' + dsoundhash);

            download.on('error',function(err) {
                // Download error
                sendMessage(message,Config.ERROR_DOWNLOAD + err);
            });

            download.on('start',function(filesize) {
                // Get filesize in MB
                var humanreadableFS = (filesize / 1048576).toFixed(2);
                sendMessage(message,Config.AUDIO_DOWNLOAD_MESSAGE + '\nAuthor: ' + author + '\nPermlink: ' + steemitAuthorPermlink[1] + '\nAudio file size: ' + humanreadableFS + 'MB\n');
            });

            download.on('end',function() {
                // Adds ipfs hash to user database and pinning queue
                if (fs.existsSync('dsoundhashvalues.txt')) {
                    var readQueue = fs.readFileSync('dsoundhashvalues.txt', 'utf8');
                    fs.writeFileSync('dsoundhashvalues.txt', readQueue + dsoundhash + '\n');
                } else {
                    fs.writeFileSync('dsoundhashvalues.txt', dsoundhash + '\n');
                }

                let uid = message.member.id;
                if (fs.existsSync('./Pinned/' + uid + '.txt')) {
                    var readData = fs.readFileSync('./Pinned/' + uid + '.txt');
                    fs.writeFileSync('./Pinned/' + uid + '.txt', readData + dsoundhash + '\n');
                } else {
                    fs.writeFileSync('./Pinned/' + uid + '.txt', dsoundhash + '\n')
                }
                
                replyMessage(message,Config.AUDIO_DOWNLOAD_COMPLETE);
            });
        });
    } else if (message.content == (Config.commandPrefix + 'botintro')) {
        if (Config.silentModeEnabled != true) {
            message.channel.send('__***Find out more about DTube IPFS Bot:***__ \nhttps://steemit.com/utopian-io/@techcoderx/new-discord-bot-to-pin-dtube-videos-to-ipfs-node');
        }
    } else if (message.content == (Config.commandPrefix + 'botsource')) {
        sendMessage(message,Config.BOT_SOURCE);
    } else if (message.content.startsWith(Config.commandPrefix + 'ipfsdonate ')) {
        if (Config.silentModeEnabled != true && Config.donationsAccepted == true) {
            // Generates SteemConnect donate link to community account (e.g. to cover server costs etc)
            var account = Config.communityAccount;

            if (account == "") {
                message.channel.send(Config.ERROR_COMMUNITYACCOUNT_NOTSET);
                return;
            }

            Steem.api.getAccounts([account],function(err,result) {
                if (err != null) {
                    // Error handling
                    message.channel.send('Error checking account: ' + err);
                    return;
                } else if (isEmptyObject(result)) {
                    // Community Steem account entered in config.json doesn't exist
                    message.channel.send(Config.ERROR_COMMUNITYACCOUNT404);
                    return;
                }

                // Generates SteemConnect donate link to community account
                var crypto = message.content.split(' ').slice(-2);
                var currency = crypto[0];
                var amount = crypto[1];

                if (isNaN(amount) == false) {
                    switch (currency) {
                    case 'steem':
                            var donatelink = 'https://steemconnect.com/sign/transfer?to=' + account + '&amount=' + amount + '%20STEEM&memo=IPFS%20Bot%20Donation';
                            message.channel.send('__***Support the community for hosting the bot and IPFS files with STEEM donations by clicking on the link below:***__ \n' + donatelink);
                        break;
                        case 'sbd':
                            var donatelink = 'https://steemconnect.com/sign/transfer?to=' + account + '&amount=' + amount + '%20SBD&memo=IPFS%20Bot%20Donation';
                            message.channel.send('__***Support the community for hosting the bot and IPFS files with SBD donations by clicking on the link below:***__ \n' + donatelink);
                            break;
                        default:
                            message.channel.send(Config.ERROR_INVALID_CURRENCY);
                            break;
                    }
                } else {
                    message.channel.send(Config.ERROR_INVALID_AMOUNT);
                }
            });
        }
    } else if (message.content.startsWith(Config.commandPrefix + 'ipfsdevdonate ')) {
        if (Config.silentModeEnabled != true && Config.donationsAccepted == true) {
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
                        message.channel.send(Config.ERROR_INVALID_CURRENCY);
                        break;
                }
            } else {
                message.channel.send(Config.ERROR_INVALID_CURRENCY);
            }
        }
    } else if (message.content == (Config.commandPrefix + 'hdwhitelist check')) {
        // Check if user is in whitelist
        if (fs.existsSync('HDWhitelist.txt')) {
            var readList = fs.readFileSync('HDWhitelist.txt', 'utf8');
            if (readList.includes(message.author.id) == true) {
                replyMessage(message,Config.WHITELIST_TRUE);
            } else {
                replyMessage(message,Config.WHITELIST_FALSE);
            }
        } else {
            message.channel.send(Config.WHITELIST_FILE404);
        }
    } else if (message.content.startsWith(Config.commandPrefix + 'hdwhitelist add ')) {
        // Add user to whitelist
        if (message.member.hasPermission('ADMINISTRATOR') == true) {
            let uidToWhitelist = message.mentions.members.first().user.id;

            if (fs.existsSync('HDWhitelist.txt')) {
                var readList = fs.readFileSync('HDWhitelist.txt', 'utf8');
                if (readList.includes(uidToWhitelist) == true) {
                    sendMessage(message,Config.WHITELIST_ALREADY_IN);
                    return;
                }
                fs.writeFileSync('HDWhitelist.txt', readList + uidToWhitelist + '\n');
            } else {
                fs.writeFileSync('HDWhitelist.txt', uidToWhitelist + '\n');
            }

            sendMessage(message,'<@' + uidToWhitelist + '> ' + Config.WHITELIST_ADD_SUCCESS);
        } else {
            sendMessage(message,Config.ERROR_NO_PERMISSION);
        }
    } else if (message.content.startsWith(Config.commandPrefix + 'hdwhitelist rm ')) {
        // Remove user from whitelist
        if (message.member.hasPermission('ADMINISTRATOR') == true) {
            let uidToRemove = message.mentions.members.first().user.id;

            if (fs.existsSync('HDWhitelist.txt')) {
                var readList = fs.readFileSync('HDWhitelist.txt', 'utf8');
                if (readList.includes(uidToRemove) == true) {
                    var newList = readList.replace(uidToRemove + '\n', '');
                    fs.writeFileSync('HDWhitelist.txt', newList);
                    sendMessage(message,'<@' + uidToRemove + '> ' + Config.WHITELIST_RM_SUCCESS);
                } else {
                    sendMessage(message,Config.WHITELIST_RM_UID404);
                }
            } else {
                sendMessage(message,Config.WHITELIST_FILE404);
            }
        } else {
            sendMessage(message,Config.ERROR_NO_PERMISSION);
        }
    } else if (message.content == (Config.commandPrefix + 'hdwhitelist ls')) {
        // List all users in whitelist in DM
        if (message.member.hasPermission('ADMINISTRATOR') == true && Config.silentModeEnabled != true) {
            if (fs.existsSync('HDWhitelist.txt')) {
                var readList = fs.readFileSync('HDWhiteList.txt', 'utf8');
                var uidListArray = readList.split('\n');
    
                for (var i = 0; i < uidListArray.length; i++) {
                    uidListArray[i] = '<@' + uidListArray[i] + '>';
                }
    
                var uidList = uidListArray.toString();
                var finalListToDM = uidList.replace(',', '\n');
                finalListToDM = finalListToDM.slice(0,-4);
                if (Config.silentModeEnabled != true) {
                    message.member.send(finalListToDM);
                }
            } else {
                sendMessage(message,Config.WHITELIST_FILE404);
            }
        } else {
            sendMessage(message,Config.ERROR_NO_PERMISSION);
        }
    } else if (message.content == (Config.commandPrefix + 'ipfshelp')) {
        if (Config.silentModeEnabled != true) {
            // Bot command list
            var embed = new Discord.RichEmbed();
            embed.setTitle('DTube IPFS Bot Command Cheatsheet');
            embed.addField(Config.commandPrefix + 'ipfs <link>', Config.HELP_IPFS);
            embed.addField(Config.commandPrefix + 'ipfs240 <link>', Config.HELP_IPFS240);
            embed.addField(Config.commandPrefix + 'ipfs480 <link>', Config.HELP_IPFS480);

            if (Config.sdOnlyMode != true) {
                embed.addField(Config.commandPrefix + 'ipfs720 <link>', Config.HELP_IPFS720);
                embed.addField(Config.commandPrefix + 'ipfs1080 <link>', Config.HELP_IPFS1080);
            }
            
            embed.addField(Config.commandPrefix + 'ipfssound <link>', Config.HELP_IPFSSOUND);
            embed.addField(Config.commandPrefix + 'botintro', Config.HELP_BOTINTRO);

            if (Config.donationsAccepted == true) {
                embed.addField(Config.commandPrefix + 'ipfsdonate <currency> <amount>', Config.HELP_IPFSDONATE);
                embed.addField(Config.commandPrefix + 'ipfsdevdonate <currency> <amount>', Config.HELP_IPFSDEVDONATE);
            }

            if (Config.hdwhitelistEnabled == true) {
                embed.addField(Config.commandPrefix + 'hdwhitelist check', Config.HELP_WHITELIST_CHECK);
            }

            embed.addField(Config.commandPrefix + 'ipfshelp', Config.HELP_IPFSHELP);
            embed.addField(Config.commandPrefix + 'ping', Config.HELP_PING);
            embed.setColor(0x499293);
            message.channel.send(embed);
        }
    } else if (message.content == (Config.commandPrefix + 'ipfsadminhelp')) {
        // Bot command list for admins only
        if (message.member.hasPermission('ADMINISTRATOR') == true && Config.hdwhitelistEnabled == true && Config.silentModeEnabled != true) {
            var adminEmbed = new Discord.RichEmbed();
            adminEmbed.setTitle('DTube IPFS Bot Command Cheatsheet for admins');
            adminEmbed.addField(Config.commandPrefix + 'hdwhitelist add <user>', Config.ADMIN_HELP_WHITELIST_ADD);
            adminEmbed.addField(Config.commandPrefix + 'hdwhitelist rm <user>', Config.ADMIN_HELP_WHITELIST_RM);
            adminEmbed.addField(Config.commandPrefix + 'hdwhitelist ls <user>', Config.ADMIN_HELP_WHITELIST_LS);
            adminEmbed.addField(Config.commandPrefix + 'ipfsadminhelp', Config.ADMIN_HELP_LIST);
            adminEmbed.setColor(0x499293);
            message.member.send(adminEmbed);
        } else {
            message.member.send(Config.ADMIN_HELP_WHITELIST_FALSE);
        }
    }
});

function sendMessage(msg,content) {
    if (Config.silentModeEnabled == true) {
        console.log(content);
    } else {
        msg.channel.send(content);
    }
}

function replyMessage(msg,content) {
    if (Config.silentModeEnabled == true) {
        console.log(content);
    } else {
        msg.reply(content);
    }
}

function addDTubeHashToDatabase(msg,hash) {
    if (fs.existsSync('dtubehashvalues.txt')) {
        var readQueue = fs.readFileSync('dtubehashvalues.txt', 'utf8');
        fs.writeFileSync('dtubehashvalues.txt', readQueue + hash + '\n');  
    } else {
        fs.writeFileSync('dtubehashvalues.txt', hash + '\n');
    }

    let uid = msg.member.id;
    if (fs.existsSync('./Pinned/' + uid + '.txt')) {
        var readData = fs.readFileSync('./Pinned/' + uid + '.txt');
        fs.writeFileSync('./Pinned/' + uid + '.txt', readData + hash + '\n');
    } else {
        fs.writeFileSync('./Pinned/' + uid+ '.txt', hash + '\n')
    }
}

function isEmptyObject(obj) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
}