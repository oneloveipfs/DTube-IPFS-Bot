# Config file guide

## Section 1: Bot Settings
All settings regarding how the bot will work can be configured here.

* `"steemAPIURL"` (String): Sets Steem API server
* `"IPFS_API_Port"` (Integer): Sets the IPFS API port the bot should use while communicating with IPFS daemon
* `"communityAccount"` (String): Sets community Steem account for collectiong donations (e.g. to pay for IPFS servers)
* `"trickledag"` (Bool): Enable trickledag pinning by setting it to true. You may have to try setting this to `false` if same IPFS hash (as downloaded file name) is obtained without trickledag option.
* `"silentModeEnabled"` (Boolean): If set to true, bot messages will be logged to the console instead of sending them to the chat. Excludes `Pong!` replies and download complete messages. Useful if running multiple instances of bot on different servers (and preferbly different geographical location)
* `"sdOnlyMode"` (Boolean): If set to true, 720p, 1080p and source pinning commands will be disabled regardless of whitelists.
* `"hdWhitelistEnabled"` (Boolean): If set to true, whitelisting system is enabled, therefore admins may whitelist certain users to that they can execute 720p, 1080p and source pinning commands.
`"restrictedMode"` (Boolean): If set to true, only whitelisted users (if whitelisting system is enabled) may run any pinning commands regardless of resolutions.
* `"donationsAccepted"` (Boolean): If set to true, donation commands are enabled.
* `"commandPrefix"` (String): Any string before each bot command goes here. You may change the pre-configured `!` to something else so that it may not conflict with other bots that may be in the same Discord server.
* `"nodeID"` (Number or String): A short unique identifier that may be used to filter `!stats` command. Alternatively, the entire peer ID of IPFS node may be used for filtering this command.

## Section 2: Bot Output Message
Useful to tweak if running the bot on multiple servers to differentiate between instances.

Recommended to tweak: 
* `PING_PEPLY`
* `VIDEO_DOWNLOAD_COMPLETE`
* `AUDIO_DOWNLOAD_COMPLETE`
* `ERROR_FILE_ALREADY_PINNED`
* `IPFS_ID_MESSAGE_PREFIX`
* `IPFS_STAT_EMBED_TITLE`