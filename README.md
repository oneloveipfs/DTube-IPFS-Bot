# DTube IPFS Discord Bot

DTube IPFS Discord bot enables Discord server members to obtain the IPFS hash of a DTube video at a specified resolution, fetches the video and pins video to local IPFS node (where this bot is hosted).

#### Dependencies required

* NodeJS with `npm` command line tools
* `wget`
* `ipfs` (go-ipfs with a running daemon)
* `crontab` for autopinning IPFS files in queue

#### Additional requirements

* A Discord application for the bot in your Discord account

# Installation

1. Clone this repository by typing `git clone https://github.com/techcoderx/DTube-IPFS-Bot.git` in a terminal window.

2. Insert the Discord bot token in `auth.json` file.

3. Run `node bot.js` to start the Discord bot.

Use the link below to invite the bot to your Discord server:

`https://discordapp.com/oauth2/authorize?client_id=YOURCLIENTID&scope=bot&permissions=248897`

(where `YOURCLIENTID` is the client ID of your Discord application)

# Pinning IPFS files

While the IPFS daemon is running, you may run `bash DTubePinFiles.bash` to pin all videos in queue to the local IPFS node. Alternatively, you may use `crontab` to schedule the bash script to run at regular intervals.

For more info about `crontab` which is built into Linux and macOS, visit [here](https://gist.github.com/mkaz/69066bd0c5e45515a264).

# Links support

The Discord bot command supports `d.tube`, `steemit.com` and `busy.org` links. However, this bot only supports DTube videos at the moment. More platform support coming in the next few updates.

# How to contribute

If you found any ways to improve on the code, or found any bugs, feel free to create a pull request on the GitHub repository. You can also contact me on Discord `techcoderx#7481` if you have any enquiries.