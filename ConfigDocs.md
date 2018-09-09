# Config file guide

## Section 1: Bot Settings
All settings regarding how the bot will work can be configured here.

* `"steemAPIURL"` (String): Sets Steem API server
* `"communityAccount"` (String): Sets community Steem account for collectiong donations (e.g. to pay for IPFS servers)
* `"silentModeEnabled"` (Boolean): If set to true, bot messages will be logged to the console instead of sending them to the chat. Excludes `Pong!` replies and download complete messages. Useful if running multiple instances of bot on different servers (and preferbly different geographical location)
* `"sdOnlyMode"` (Boolean): If set to true, 720p, 1080p and source pinning commands will be disabled regardless of whitelists.
* `"hdWhitelistEnabled"` (Boolean): If set to true, whitelisting system is enabled, therefore admins may whitelist certain users to that they can execute 720p, 1080p and source pinning commands.
* `"donationsAccepted"` (Boolean): If set to true, donation commands are enabled.
* `"commandPrefix"` (String): Any string before each bot command goes here. You may change the pre-configured `!` to something else so that it may not conflict with other bots that may be in the same Discord server.

## Section 2: Bot Output Message
Useful to tweak if running the bot on multiple servers to differentiate between instances.

Recommended to tweak: `PING_PEPLY`, `VIDEO_DOWNLOAD_COMPLETE` and `AUDIO_DOWNLOAD_COMPLETE`.