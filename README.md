# TOASTbot
A custom-made Discord server management bot to easily run science competitions virtually. It was implemented in two iterations of Quarantine Science Tournament: https://sites.google.com/view/ihssc/home

TOASTbot has two iterations, `bot.js` was mainly kept online for competitor use, managing both logistics and single-handedly managing the fast-paced Battle Tower round. `bot2.js` is a specialized version for complete server resets and overhauls. Note only one can be run at a time.

Note that command starting symbols "!" or "$" or "@" depends on what is put in the config file with the authorization token. This file runs using node.js and will require those modules installed.

## Documentation for bot.js
**Commands:**

*Open:*
> ``!ping``: Test response time. Can be used to check if bot is online.
> ``!count``: Returns current number of servers and users.
> ``!rand [min#] [max#]``: Generates a random integer between min and max, inclusive.
> ``!help``: Sends open/leader commands.
> ``!info``: Sends tournament information links.

*Leader only commands:*
> ``!question``: Sends current question in channel.
> ``!submit [answer]``: Submits final answer for current question. Sends new question.

*Admin only commands:*
> ``!reset``: Resets leaders and scores. Sets new admin and log channel. Stops gameplay.
> ``!stop``: Stops gameplay. Sends message to all leaders to notify. Can only be used by admin.
> ``!start``: Starts gameplay. Sends message to all leaders to notify. Can only be used by admin.
> ``!setup [@user]``: Sets new leader with a score of 0.
> ``!setscore [team#] [question#]``: Sets team's score to a custom question number (#).
> ``!setleader [team#] [@user]``: Sets team's leader to a new user.
> ``!list``: Lists all current teams and their current question number.

*Logistic commands (can only be used by admin):*
> ``!assign``: Uses uploaded file `input.csv` to add roles.
> ``!removeroles "team"/"room"``: Removes either team or room roles from all members.

*Note: There is a full reset when the bot stops running.*

## Documentation for bot2.js (incomplete)

**Commands:**
*No commands are currently open. All commands from v1 currently deprecated.*

*Generic Commands*
> ``$ping``: Test response time. Can be used to check if bot is online. :white_check_mark: 
> ``$getteamno``: Returns number of teams. :white_check_mark: 

*Team/Room Management (Admin)*
> ``$addteam``: Adds a single team: auto-creates role, text channel, voice channel. :white_check_mark: 
> ``$clearteams``: Deletes all team roles and channels. :white_check_mark: 
> ``$addteamsupto [#]``: Adds all teams up to a certain number. :white_check_mark: :warning: 
> **=> does not sort teams over 50 due to category limit**
> ``$setroomcount``: Sets room amount, adjusts text/voice channels and roles. :x:

*Role Management (Admin)* 
> ``$remove [role_id]`` Removes certain role from everyone. :white_check_mark: :red_square: 
> ``$massaccess [role_id] [channel_type] [allow/deny]``: Allows or denies role from all channels of specified type. :white_check_mark:
> ``$massassign``: Reads Google Sheet and assigns roles accordingly. :x:
> ``$massremove [role_type]``: Removes all roles of a certain type. :white_check_mark: :red_square: 

*Other Moderation (Admin)*
> ``$massclear [channel_type]``: Fully clears all channels of specified type.  :x::warning: 
> **=> unknown error just deletes channel, currently working on**
