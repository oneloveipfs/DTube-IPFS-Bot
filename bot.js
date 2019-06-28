const Config = require('./config.json');
const Discord = require('discord.js');
const WGET = require('wget-improved');
const IPFS = require('ipfs-http-client')('localhost',Config.IPFS_API_Port,{protocol: 'http'})
const isIPFS = require('is-ipfs')
const Steem = require('steem');
const jAvalon = require('javalon')
const async = require('async')
const Auth = require('./auth.json');
const fs = require('fs');

const bot = new Discord.Client();

let whitelist = fs.readFileSync('HDWhitelist.txt','utf8')
let usageData = JSON.parse(fs.readFileSync('usage.json','utf8'))
let ipfsid;

Steem.api.setOptions({url: Config.steemAPIURL});

IPFS.id((err,id) => {
    if (err != null) {
        console.log('IPFS error: ' + err)
        process.exit(1)
    }
    ipfsid = id.id
})

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
        if (Config.sdOnlyMode == true)
            return sendMessage(message,Config.ERROR_SD_ONLY_MODE)

        if (Config.hdwhitelistEnabled && !whitelist.includes(message.author.id)) {
            // Do not proceed if user is not in whitelist
            if (Config.restrictedMode)
                return sendMessage(message,Config.ERROR_NO_PIN_PERMISSION_RESTRICTED)
            else
                return sendMessage(message,Config.ERROR_NO_PIN_PERMISSION)
        }

        let link = message.content.split(' ')[1]
        let authorPermlink = link.split('/').splice(-2)
        if (authorPermlink[0].startsWith('@')) {
            // Remove @ symbol if it is a steemit/busy link
            authorPermlink[0] = authorPermlink[0].slice(1,authorPermlink[0].length)
        }
        
        getVideoHash(link,'Source',(err,hash) => {
            if (err != null) return sendMessage(message,err)

            IPFS.pin.ls(hash,{ type: 'recursive' },(err,pinset) => {
                if (err == null && pinset[0].hash === hash) {
                    message.channel.send(Config.ERROR_FILE_ALREADY_PINNED)
                } else if (err == 'Error: path \'' + hash + '\' is not pinned') {
                    var ipfslink = 'https://video.dtube.top/ipfs/' + hash;

                    // Download file to server!
                    let download = WGET.download(ipfslink,'./' + hash);

                    download.on('error',function(err) {
                        // Download error
                        sendMessage(message,Config.ERROR_DOWNLOAD + err);
                    });

                    download.on('start',function(filesize) {
                        // Get file size in MB
                        let humanreadableFS = (filesize / 1048576).toFixed(2)
                        sendMessage(message,Config.VIDEO_DOWNLOAD_MESSAGE_SOURCE + '\nAuthor: ' + authorPermlink[0] + '\nPermlink: ' + authorPermlink[1] + '\nVideo file size: ' + humanreadableFS + 'MB\n');
                        countUsage(message.author.id,filesize)
                    });

                    download.on('end',function() {
                        // Adds ipfs hash to user database and pins file to IPFS node
                        addHashToDatabase(message,hash);
                        addDTubeVideoToIPFS(message,hash,Config.trickledag,Config.VIDEO_DOWNLOAD_COMPLETE,authorPermlink[0],authorPermlink[1],'Source');
                    });
                } else {
                    message.channel.send(Config.IPFS_PIN_LS_ERROR + err)
                }
            })
        })
    } else if (message.content.startsWith(Config.commandPrefix + 'ipfs240 ')) {
        if (Config.hdwhitelistEnabled && !whitelist.includes(message.author.id) && Config.restrictedMode)
            // Do not proceed if user is not in whitelist
            return sendMessage(message,Config.ERROR_NO_PIN_PERMISSION_RESTRICTED)

        // 240p video
        let link = message.content.split(' ')[1]
        let authorPermlink = link.split('/').splice(-2)
        if (authorPermlink[0].startsWith('@')) {
            // Remove @ symbol if it is a steemit/busy link
            authorPermlink[0] = authorPermlink[0].slice(1,authorPermlink[0].length)
        }
        
        getVideoHash(link,'240p',(err,hash) => {
            if (err != null) return sendMessage(message,err)

            IPFS.pin.ls(hash,{ type: 'recursive' },(err,pinset) => {
                if (err == null && pinset[0].hash === hash) {
                    message.channel.send(Config.ERROR_FILE_ALREADY_PINNED)
                } else if (err == 'Error: path \'' + hash + '\' is not pinned') {
                    var ipfslink = 'https://video.dtube.top/ipfs/' + hash;

                    // Download file to server!
                    let download = WGET.download(ipfslink,'./' + hash);

                    download.on('error',function(err) {
                        // Download error
                        sendMessage(message,Config.ERROR_DOWNLOAD + err);
                    });

                    download.on('start',function(filesize) {
                        // Get file size in MB
                        let humanreadableFS = (filesize / 1048576).toFixed(2)
                        sendMessage(message,Config.VIDEO_DOWNLOAD_MESSAGE_240P + '\nAuthor: ' + authorPermlink[0] + '\nPermlink: ' + authorPermlink[1] + '\nVideo file size: ' + humanreadableFS + 'MB\n');
                        countUsage(message.author.id,filesize)
                    });

                    download.on('end',function() {
                        // Adds ipfs hash to user database and pins file to IPFS node
                        addHashToDatabase(message,hash);
                        addDTubeVideoToIPFS(message,hash,Config.trickledag,Config.VIDEO_DOWNLOAD_COMPLETE,authorPermlink[0],authorPermlink[1],'240p');
                    });
                } else {
                    message.channel.send(Config.IPFS_PIN_LS_ERROR + err)
                }
            })            
        });
    } else if (message.content.startsWith(Config.commandPrefix + 'ipfs480 ')) {
        if (Config.hdwhitelistEnabled && !whitelist.includes(message.author.id) && Config.restrictedMode)
            // Do not proceed if user is not in whitelist
            return sendMessage(message,Config.ERROR_NO_PIN_PERMISSION_RESTRICTED)

        // 480p video
        let link = message.content.split(' ')[1]
        let authorPermlink = link.split('/').splice(-2)
        if (authorPermlink[0].startsWith('@')) {
            // Remove @ symbol if it is a steemit/busy link
            authorPermlink[0] = authorPermlink[0].slice(1,authorPermlink[0].length)
        }
        
        getVideoHash(link,'480p',(err,hash) => {
            if (err != null) return sendMessage(message,err)

            IPFS.pin.ls(hash,{ type: 'recursive' },(err,pinset) => {
                if (err == null && pinset[0].hash === hash) {
                    message.channel.send(Config.ERROR_FILE_ALREADY_PINNED)
                } else if (err == 'Error: path \'' + hash + '\' is not pinned') {
                    var ipfslink = 'https://video.dtube.top/ipfs/' + hash;

                    // Download file to server!
                    let download = WGET.download(ipfslink,'./' + hash);

                    download.on('error',function(err) {
                        // Download error
                        sendMessage(message,Config.ERROR_DOWNLOAD + err);
                    });

                    download.on('start',function(filesize) {
                        // Get file size in MB
                        let humanreadableFS = (filesize / 1048576).toFixed(2)
                        sendMessage(message,Config.VIDEO_DOWNLOAD_MESSAGE_480P + '\nAuthor: ' + authorPermlink[0] + '\nPermlink: ' + authorPermlink[1] + '\nVideo file size: ' + humanreadableFS + 'MB\n');
                        countUsage(message.author.id,filesize)
                    });

                    download.on('end',function() {
                        // Adds ipfs hash to user database and pins file to IPFS node
                        addHashToDatabase(message,hash);
                        addDTubeVideoToIPFS(message,hash,Config.trickledag,Config.VIDEO_DOWNLOAD_COMPLETE,authorPermlink[0],authorPermlink[1],'480p');
                    });
                } else {
                    message.channel.send(Config.IPFS_PIN_LS_ERROR + err)
                }
            })
        });
    } else if (message.content.startsWith(Config.commandPrefix + 'ipfs720 ')) {
        // 720p video
        if (Config.sdOnlyMode == true)
            return sendMessage(message,Config.ERROR_SD_ONLY_MODE)

        if (Config.hdwhitelistEnabled && !whitelist.includes(message.author.id)) {
            // Do not proceed if user is not in whitelist
            if (Config.restrictedMode)
                return sendMessage(message,Config.ERROR_NO_PIN_PERMISSION_RESTRICTED)
            else
                return sendMessage(message,Config.ERROR_NO_PIN_PERMISSION)
        }

        let link = message.content.split(' ')[1]
        let authorPermlink = link.split('/').splice(-2)
        if (authorPermlink[0].startsWith('@')) {
            // Remove @ symbol if it is a steemit/busy link
            authorPermlink[0] = authorPermlink[0].slice(1,authorPermlink[0].length)
        }
    
        getVideoHash(link,'720p',(err,hash) => {
            if (err != null) return sendMessage(message,err)

            IPFS.pin.ls(hash,{ type: 'recursive' },(err,pinset) => {
                if (err == null && pinset[0].hash === hash) {
                    message.channel.send(Config.ERROR_FILE_ALREADY_PINNED)
                } else if (err == 'Error: path \'' + hash + '\' is not pinned') {
                    var ipfslink = 'https://video.dtube.top/ipfs/' + hash;

                    // Download file to server!
                    let download = WGET.download(ipfslink,'./' + hash);

                    download.on('error',function(err) {
                        // Download error
                        sendMessage(message,Config.ERROR_DOWNLOAD + err);
                    });

                    download.on('start',function(filesize) {
                        // Get file size in MB
                        let humanreadableFS = (filesize / 1048576).toFixed(2)
                        sendMessage(message,Config.VIDEO_DOWNLOAD_MESSAGE_720P + '\nAuthor: ' + authorPermlink[0] + '\nPermlink: ' + authorPermlink[1] + '\nVideo file size: ' + humanreadableFS + 'MB\n');
                        countUsage(message.author.id,filesize)
                    });

                    download.on('end',function() {
                        // Adds ipfs hash to user database and pins file to IPFS node
                        addHashToDatabase(message,hash);
                        addDTubeVideoToIPFS(message,hash,Config.trickledag,Config.VIDEO_DOWNLOAD_COMPLETE,authorPermlink[0],authorPermlink[1],'720p');
                    });
                } else {
                    message.channel.send(Config.IPFS_PIN_LS_ERROR + err)
                }
            })
        });
    } else if (message.content.startsWith(Config.commandPrefix + 'ipfs1080 ')) {
        // 1080p video
        if (Config.sdOnlyMode == true)
            return sendMessage(message,Config.ERROR_SD_ONLY_MODE)

        if (Config.hdwhitelistEnabled && !whitelist.includes(message.author.id)) {
            // Do not proceed if user is not in whitelist
            if (Config.restrictedMode)
                return sendMessage(message,Config.ERROR_NO_PIN_PERMISSION_RESTRICTED)
            else
                return sendMessage(message,Config.ERROR_NO_PIN_PERMISSION)
        }

        let link = message.content.split(' ')[1]
        let authorPermlink = link.split('/').splice(-2)
        if (authorPermlink[0].startsWith('@')) {
            // Remove @ symbol if it is a steemit/busy link
            authorPermlink[0] = authorPermlink[0].slice(1,authorPermlink[0].length)
        }
    
        getVideoHash(link,'1080p',(err,hash) => {
            if (err != null) return sendMessage(message,err)

            IPFS.pin.ls(hash,{ type: 'recursive' },(err,pinset) => {
                if (err == null && pinset[0].hash === hash) {
                    message.channel.send(Config.ERROR_FILE_ALREADY_PINNED)
                } else if (err == 'Error: path \'' + hash + '\' is not pinned') {
                    var ipfslink = 'https://video.dtube.top/ipfs/' + hash;

                    // Download file to server!
                    let download = WGET.download(ipfslink,'./' + hash);

                    download.on('error',function(err) {
                        // Download error
                        sendMessage(message,Config.ERROR_DOWNLOAD + err);
                    });

                    download.on('start',function(filesize) {
                        // Get file size in MB
                        let humanreadableFS = (filesize / 1048576).toFixed(2)
                        sendMessage(message,Config.VIDEO_DOWNLOAD_MESSAGE_1080P + '\nAuthor: ' + authorPermlink[0] + '\nPermlink: ' + authorPermlink[1] + '\nVideo file size: ' + humanreadableFS + 'MB\n');
                        countUsage(message.author.id,filesize)
                    });

                    download.on('end',function() {
                        // Adds ipfs hash to user database and pins file to IPFS node
                        addHashToDatabase(message,hash);
                        addDTubeVideoToIPFS(message,hash,Config.trickledag,Config.VIDEO_DOWNLOAD_COMPLETE,authorPermlink[0],authorPermlink[1],'1080p');
                    });
                } else {
                    message.channel.send(Config.IPFS_PIN_LS_ERROR + err)
                }
            })
        });
    } else if (message.content.startsWith(Config.commandPrefix + 'ipfssound ')) {
        // DSound audio
        if (Config.hdwhitelistEnabled && !whitelist.includes(message.author.id)) {
            // Do not proceed if user is not in whitelist
            if (Config.restrictedMode)
                return sendMessage(message,Config.ERROR_NO_PIN_PERMISSION_RESTRICTED)
            else
                return sendMessage(message,Config.ERROR_NO_PIN_PERMISSION)
        }

        let command = message.content
        let steemitAuthorPermlink = command.split('/').slice(-2)
        let author = steemitAuthorPermlink[0]

        if (author.startsWith('@')) {
            // Remove @ symbol if it is a steemit/busy link
            author = steemitAuthorPermlink[0].slice(1,steemitAuthorPermlink[0].length);
        }

        Steem.api.getContent(author,steemitAuthorPermlink[1],function(err,result) {
            if (err != null)
                return sendMessage(message,Config.ERROR_STEEM_GETCONTENT + err)

            // Get JSON metadata of post
            let jsonmeta = JSON.parse(result.json_metadata)
            let dsoundhash = jsonmeta.audio.files.sound

            IPFS.pin.ls(dsoundhash,{ type: 'recursive' },(err,pinset) => {
                if (err == null && pinset[0].hash === dsoundhash) {
                    message.channel.send(Config.ERROR_FILE_ALREADY_PINNED)
                } else if (err == 'Error: path \'' + dsoundhash + '\' is not pinned') {
                    let dsoundipfslink = 'https://cloudflare-ipfs.com/ipfs/' + dsoundhash;

                    // Download video to server!
                    let download = WGET.download(dsoundipfslink,'./' + dsoundhash);

                    download.on('error',function(err) {
                        // Download error
                        sendMessage(message,Config.ERROR_DOWNLOAD + err);
                    });

                    download.on('start',function(filesize) {
                        // Get filesize in MB
                        let humanreadableFS = (filesize / 1048576).toFixed(2)
                        sendMessage(message,Config.AUDIO_DOWNLOAD_MESSAGE + '\nAuthor: ' + author + '\nPermlink: ' + steemitAuthorPermlink[1] + '\nAudio file size: ' + humanreadableFS + 'MB\n');
                        countUsage(message.author.id,filesize)
                    });

                    download.on('end',function() {
                        // Adds ipfs hash to user database and pins file to IPFS node
                        addHashToDatabase(message,dsoundhash)
                        addDTubeVideoToIPFS(message,dsoundhash,false,Config.AUDIO_DOWNLOAD_COMPLETE,author,steemitAuthorPermlink[1],'Audio file')
                    });
                } else {
                    message.channel.send(Config.IPFS_PIN_LS_ERROR + err)
                }
            })
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
        if (whitelist.includes(message.author.id)) {
            replyMessage(message,Config.WHITELIST_TRUE);
        } else {
            replyMessage(message,Config.WHITELIST_FALSE);
        }
    } else if (message.content.startsWith(Config.commandPrefix + 'hdwhitelist add ')) {
        // Add user to whitelist
        if (message.member.hasPermission('ADMINISTRATOR') == true) {
            let uidToWhitelist = message.mentions.members.first().user.id;

            if (whitelist.includes(uidToWhitelist))
                return sendMessage(message,Config.WHITELIST_ALREADY_IN)

            whitelist = whitelist + uidToWhitelist + '\n'
            fs.writeFileSync('HDWhitelist.txt',whitelist)
            sendMessage(message,'<@' + uidToWhitelist + '> ' + Config.WHITELIST_ADD_SUCCESS)
        } else {
            sendMessage(message,Config.ERROR_NO_PERMISSION);
        }
    } else if (message.content.startsWith(Config.commandPrefix + 'hdwhitelist rm ')) {
        // Remove user from whitelist
        if (message.member.hasPermission('ADMINISTRATOR') == true) {
            let uidToRemove = message.mentions.members.first().user.id;

            if (whitelist.includes(uidToRemove)) {
                let newList = whitelist.replace(uidToRemove + '\n', '')
                whitelist = newList
                fs.writeFileSync('HDWhitelist.txt',whitelist)
                sendMessage(message,'<@' + uidToRemove + '> ' + Config.WHITELIST_RM_SUCCESS)
            } else {
                sendMessage(message,Config.WHITELIST_RM_UID404)
            }
        } else {
            sendMessage(message,Config.ERROR_NO_PERMISSION);
        }
    } else if (message.content == (Config.commandPrefix + 'hdwhitelist ls')) {
        // List all users in whitelist in DM
        if (message.member.hasPermission('ADMINISTRATOR') == true && Config.silentModeEnabled != true) {
            let uidListArray = whitelist.split('\n')

            for (var i = 0; i < uidListArray.length; i++) {
                uidListArray[i] = '<@' + uidListArray[i] + '>'
            }

            let uidList = uidListArray.toString()
            let finalListToDM = uidList.replace(/,/g, '\n')
            finalListToDM = finalListToDM.slice(0,-4)
            finalListToDM = 'Whitelisted users: \n' + finalListToDM
            if (Config.silentModeEnabled != true) {
                message.react('📬')
                message.member.send(finalListToDM)
            }
        } else {
            sendMessage(message,Config.ERROR_NO_PERMISSION);
        }
    } else if (message.content == (Config.commandPrefix + 'myid')) {
        let idEmbed = new Discord.RichEmbed()
        idEmbed.setDescription(Config.IPFS_ID_MESSAGE_PREFIX + ipfsid)
        idEmbed.setColor(0x45ff42)
        message.channel.send(idEmbed)
    } else if (message.content.startsWith(Config.commandPrefix + 'stats')) {
        if (message.content.split(' ').length > 1) {
            let specifiedID = message.content.slice(Config.commandPrefix.length + 6,message.content.length)
            if (specifiedID != Config.nodeID && specifiedID != ipfsid) return
        }
        let statops = {
            bw: (cb) => {
                IPFS.stats.bw((err,stat) => {
                    if (err != null) {
                        console.log(err)
                        cb(err,null)
                        return
                    }
                    let incomingbw = Math.floor(stat.rateIn / 10.24) / 100 + ' KB/s'
                    let outgoingbw = Math.floor(stat.rateOut / 10.24) / 100 + ' KB/s'

                    if (stat.rateIn > 1000000) 
                        incomingbw = Math.floor(stat.rateIn / 10485.76) / 100 + ' MB/s'
                    
                    if (stat.rateOut > 1000000)
                        outgoingbw = Math.floor(stat.rateOut / 10485.76) / 100 + ' MB/s'
                    cb(null,{
                        in: incomingbw,
                        out: outgoingbw
                    })
                })
            },
            storage: (cb) => {
                IPFS.stats.repo({human: true},(err,stat) => {
                    if (err != null) {
                        console.log(err)
                        cb(err,null)
                        return
                    }
                    let size = Math.floor(stat.repoSize / 10485.76) / 100 + ' MB'
                    if (stat.repoSize > 1000000000)
                        size = Math.floor(stat.repoSize / 10737418.24) / 100 + ' GB'
                    cb(null,size)
                })
            },
            pincount: (cb) => {
                IPFS.pin.ls({type: 'recursive'},(err,pinset) => {
                    if (err != null) {
                        console.log(err)
                        cb(err,null)
                        return
                    }
                    cb(null,pinset.length)
                })
            },
            peercount: (cb) => {
                IPFS.swarm.peers((err,peers) => {
                    if (err != null) {
                        console.log(err)
                        cb(err,null)
                        return
                    }
                    cb(null,peers.length)
                })
            }
        }
        async.parallel(statops,(err,results) => {
            if (err != null) {
                message.channel.send(Config.IPFS_STAT_ERROR)
            } else {
                let embed = new Discord.RichEmbed()
                embed.setTitle(Config.IPFS_STAT_EMBED_TITLE)
                embed.setDescription('Bandwidth In: ' + results.bw.in + '\nBandwidth Out: ' + results.bw.out + '\nPeers connected: ' + results.peercount + '\nNo. of pins: ' + results.pincount + '\nUsed storage: ' + results.storage)
                embed.setColor(0x499293);
                message.channel.send(embed)
            }
        })
    } else if (message.content == (Config.commandPrefix + 'usage')) {
        let usage = usageData[message.author.id]
        if (usage > 1000000000) {
            usage = Math.floor(usage / 10737418.24) / 100 + ' GB'
        } else if (usage > 1000000) {
            usage = Math.floor(usage / 10485.76) / 100 + ' MB'
        } else if (usage == undefined) {
            usage = '0 KB'
        } else {
            usage = Math.floor(usage / 10.24) / 100 + ' KB'
        }
        replyMessage(message,'Your current usage is ' + usage)
    } else if (message.content == (Config.commandPrefix + 'usagels')) {
        if (message.member.hasPermission('ADMINISTRATOR') == true) {
            message.react('📬')
            if (Config.silentModeEnabled != true) {
                message.member.send({files: [{
                    attachment: 'usage.json',
                    name: 'usage.json'
                }]})
            }
        } else {
            message.channel.send(Config.ERROR_NO_PERMISSION)
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
            embed.addField(Config.commandPrefix + 'botsource', Config.HELP_BOTSOURCE);

            if (Config.donationsAccepted == true) {
                embed.addField(Config.commandPrefix + 'ipfsdonate <currency> <amount>', Config.HELP_IPFSDONATE);
                embed.addField(Config.commandPrefix + 'ipfsdevdonate <currency> <amount>', Config.HELP_IPFSDEVDONATE);
            }

            if (Config.hdwhitelistEnabled == true) {
                embed.addField(Config.commandPrefix + 'hdwhitelist check', Config.HELP_WHITELIST_CHECK);
            }

            embed.addField(Config.commandPrefix + 'myid', Config.HELP_IPFS_ID)
            embed.addField(Config.commandPrefix + 'stats [node ID]', Config.HELP_STATS)
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
            adminEmbed.addField(Config.commandPrefix + 'usagels', Config.ADMIN_HELP_USAGE_LS)
            adminEmbed.addField(Config.commandPrefix + 'ipfsadminhelp', Config.ADMIN_HELP_LIST);
            adminEmbed.setColor(0x499293);
            message.react('📬')
            message.member.send(adminEmbed);
        } else if (Config.silentModeEnabled != true && message.member.hasPermission('ADMINISTRATOR') == true) {
            message.member.send(Config.ADMIN_HELP_WHITELIST_FALSE);
        } else {
            sendMessage(message,Config.ERROR_NO_PERMISSION);
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

function getVideoHash(link,resolution,cb) {
    let authorPermlink = link.split('/').splice(-2)
    if (authorPermlink[0].startsWith('@')) {
        // Remove @ symbol if it is a steemit/busy link
        authorPermlink[0] = authorPermlink[0].slice(1,authorPermlink[0].length)
    }

    if (link.startsWith('https://d.tube/') && isIPFS.cid(authorPermlink[1])) {
        // DTube link provided
        jAvalon.getContent(authorPermlink[0],authorPermlink[1],(err,res) => {
            if (err) return cb(err)
            if (res.json.providerName != 'IPFS') return cb(Config.ERROR_NON_IPFS_VIDEO)
            switch (resolution) {
                case "Source":
                    if (res.json.ipfs.videohash != undefined || null)
                        cb(null,res.json.ipfs.videohash)
                    else
                        cb(Config.HASH_NOT_FOUND_ON_STEEM_BLOCKCHAIN)
                    break
                case "240p":
                    if (res.json.ipfs.video240hash != undefined || null)
                        cb(null,res.json.ipfs.video240hash)
                    else
                        cb(Config.HASH_NOT_FOUND_ON_STEEM_BLOCKCHAIN)
                    break
                case "480p":
                    if (res.json.ipfs.video480hash != undefined || null)
                        cb(null,res.json.ipfs.video480hash)
                    else
                        cb(Config.HASH_NOT_FOUND_ON_STEEM_BLOCKCHAIN)
                    break
                case "720p":
                    if (res.json.ipfs.video720hash != undefined || null)
                        cb(null,res.json.ipfs.video720hash)
                    else
                        cb(Config.HASH_NOT_FOUND_ON_STEEM_BLOCKCHAIN)
                    break
                case "1080p":
                    if (res.json.ipfs.video1080hash != undefined || null)
                        cb(null,res.json.ipfs.video1080hash)
                    else
                        cb(Config.HASH_NOT_FOUND_ON_STEEM_BLOCKCHAIN)
                    break
                default:
                    cb(Config.ERROR_INVALID_RESOLUTION)
                    break
            }
        })
    } else if (link.startsWith('https://d.tube/') && !isIPFS.cid(authorPermlink[1])) {
        cb(Config.ERROR_NON_IPFS_VIDEO)
    } else {
        // Other Steem link provided
        Steem.api.getContent(authorPermlink[0],authorPermlink[1],(err,res) => {
            if (err) return cb(err)
            let jsonmeta = JSON.parse(result.json_metadata)
            if (jsonmeta.video.providerName != 'IPFS') return cb(Config.ERROR_NON_IPFS_VIDEO)
            switch (resolution) {
                case "Source":
                    if (jsonmeta.video.ipfs.videohash != undefined || null)
                        cb(null,jsonmeta.video.ipfs.videohash)
                    else
                        cb(Config.HASH_NOT_FOUND_ON_STEEM_BLOCKCHAIN)
                    break
                case "240p":
                    if (jsonmeta.video.ipfs.video240hash != undefined || null)
                        cb(null,jsonmeta.video.ipfs.video240hash)
                    else
                        cb(Config.HASH_NOT_FOUND_ON_STEEM_BLOCKCHAIN)
                    break
                case "480p":
                    if (jsonmeta.video.ipfs.video480hash != undefined || null)
                        cb(null,jsonmeta.video.ipfs.video480hash)
                    else
                        cb(Config.HASH_NOT_FOUND_ON_STEEM_BLOCKCHAIN)
                    break
                case "720p":
                    if (jsonmeta.video.ipfs.video720hash != undefined || null)
                        cb(null,jsonmeta.video.ipfs.video720hash)
                    else
                        cb(Config.HASH_NOT_FOUND_ON_STEEM_BLOCKCHAIN)
                    break
                case "1080p":
                    if (jsonmeta.video.ipfs.video1080hash != undefined || null)
                        cb(null,jsonmeta.video.ipfs.video1080hash)
                    else
                        cb(Config.HASH_NOT_FOUND_ON_STEEM_BLOCKCHAIN)
                    break
                default:
                    cb(Config.ERROR_INVALID_RESOLUTION)
                    break
            }
        })
    }
}

function addHashToDatabase(msg,hash) {
    let uid = msg.member.id;
    if (fs.existsSync('./Pinned/' + uid + '.txt')) {
        var readData = fs.readFileSync('./Pinned/' + uid + '.txt');
        fs.writeFileSync('./Pinned/' + uid + '.txt', readData + hash + '\n');
    } else {
        fs.writeFileSync('./Pinned/' + uid+ '.txt', hash + '\n')
    }
}

function addDTubeVideoToIPFS(msg,hash,trickle,doneMsg,author,permlink,res) {
    // Pin files to IPFS
    fs.readFile(hash,(err,data) => {
        if (err != null) {
            msg.channel.send('Error reading downloaded file: ' + err)
            return
        } 
        IPFS.add(data,{trickle: trickle},(err) => {
            if (err != null) {
                msg.channel.send('Error pinning file to IPFS: ' + err)
                return
            }
            msg.channel.send('`@' + author + '/' + permlink + '(' + res + ')`: ' + doneMsg)
            fs.unlink(hash,(err) => {if (err != null) console.log('Error deleting file: ' + err)})
        })
    })
}

function countUsage(userid,filesize) {
    if (usageData[userid] == undefined) {
        usageData[userid] = filesize
    } else {
        usageData[userid] = usageData[userid] + filesize
    }
    fs.writeFile('usage.json',JSON.stringify(usageData,null,4),(err) => {
        if (err != null)
            console.log(err)
    })
}

function isEmptyObject(obj) {
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
}