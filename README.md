### **⚠️ This repository has been depreciated. All functionalities of the Discord bot will be bundled into OneLoveIPFS v3 release. ⚠️**

# DTube IPFS Discord Bot

DTube IPFS Discord bot enables Discord server members to obtain the IPFS hash of a DTube video at a specified resolution, fetches the video and pins video to local IPFS node (where this bot is hosted). Also pins DSound audio files.

#### Dependencies required

* NodeJS with `npm` command line tools
* `wget`
* `ipfs` (go-ipfs with a running daemon)

#### Additional requirements

* A Discord application for the bot in your Discord account

# Installation

1. Clone this repository by typing `git clone https://github.com/techcoderx/DTube-IPFS-Bot.git` in a terminal window.

2. Install the required node modules. `cd DTube-IPFS-Bot && npm install`

3. Insert the Discord bot token in `auth.json` file.

4. Configure the bot by modifying `config.json` file. If you need help configuring the bot, view the documentation [here](https://github.com/techcoderx/DTube-IPFS-Bot/blob/master/ConfigDocs.md).

5. Run `chmod a+rx Pinned/rmPins.sh` to make unpinning script located at [Pinned](https://github.com/techcoderx/DTube-IPFS-Bot/tree/master/Pinned) folder executable.

6. Run `node --max_old_space_size=4000 bot.js` to start the Discord bot.

Note: you may need increase the value of `--max_old_space_size` if several large files are being downloaded at once.

Use the link below to invite the bot to your Discord server:

`https://discordapp.com/oauth2/authorize?client_id=YOURCLIENTID&scope=bot`

(where `YOURCLIENTID` is the client ID of your Discord application)

# Unpinning IPFS files

You may choose to unpin all IPFS files that were downloaded by a user by doing the following:

1. Navigate to `Pinned` folder

2. Run `./rmPins.sh DiscordUserID` where `DiscordUserID` is the ID of a Discord user.

3. Run `ipfs repo gc` when you're done.

# Links support

The Discord bot command supports all kinds of links of Steem frontends, such as `d.tube`, `dtube.network`, `dsound.audio`, `steemit.com` and `busy.org`. However, this bot only supports DTube videos and DSound audios at the moment. More platform support coming in the next few updates.

# How to contribute

If you found any ways to improve on the code, or found any bugs, feel free to create a pull request on the GitHub repository. You can also contact me on Discord `techcoderx#7481` if you have any enquiries.
