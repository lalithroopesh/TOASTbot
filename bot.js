const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require('fs');

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  client.user.setActivity('scioly helper bot', {type: 'PLAYING' });});

// events for when bot joins / leaves servers
client.on("guildCreate", guild => {console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);});

client.on("guildDelete", guild => {console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);});

const qcontent = fs.readFileSync("./assets/questions.csv",'utf-8');
const questions = qcontent.split("\r\n");

var leaders = [];
var scores = [];
var admin;
var start = false;
var logchannel;

function sendquestion(message) {
  if (leaders.includes(message.author) && start == true) {
    var index = scores[leaders.indexOf(message.author)];
    if (index >= questions.length) {
      message.channel.send("You have already finished all the questions!");
      return;
    }
    var level = Math.floor(index/11)+1;
    var qnum = (index+1)%11;
    var boss = (qnum == 0);
    var points = 0;
    var content = questions[index];
    var data_index = content.indexOf(",");
    var type = content.substring(0,data_index);
    var qtext = content.substring(data_index+1,content.length);

    if (qnum == 0) qnum = "BOSS";
    if (boss) {
      points = level*5+5;
    } else {
      points = level+3;
    }
    message.channel.send(`**Level \`${level}\` | Floor \`${qnum}\` | Points: \`${points}\`**`);
    message.channel.send("**Question type: `"+type.toString()+"`**");
    message.channel.send(qtext.toString());
  } else {
    message.channel.send("You do not have permissions to receive questions.");
  }
}

// main run
client.on("message", async message => {
    
    // ignore bots
  if(message.author.bot) return;

  /*
  if(message.mentions.users.first().id == "565635720996323370") {
    message.channel.send("<:pingsock:738236411467006062>");
    message.author.send("get pung lmao");
    return;
  }
  */

  // irgnores not prefix
  if(message.content.indexOf(config.prefix) !== 0) return; 
  
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  // commands
  try {
  switch(command) {

    // OPEN COMMANDS
    

    
    // !ping
    case "ping":
        const m = await message.channel.send("Ping?");
        m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
        break;
    
    // !count
    case "count":
        message.channel.send(`I am in ${client.guilds.cache.size} servers, serving ${client.users.cache.size} users`);
        break;

    // !rand [lower] [upper]
    case "rand":
      output = (Math.floor((Math.random()*(args[1]-args[0]+1))+Number(args[0]))).toString();
      if (output == "NaN") {
        message.channel.send("Invalid arguments.");
      } else {
        message.channel.send(output);
      }
      break;

    case "help":
      message.channel.send(fs.readFileSync("./assets/help.txt",'utf-8'));
      break;

    case "info":
      message.channel.send("Hey, "+message.author.toString()+"\n\n"+fs.readFileSync("./assets/info.txt",'utf-8'));
      break;
    
    // LEADER COMMANDS

    // !question
    case "question":
      sendquestion(message);
      break;

    // !submit [answer]
    case "submit":
      if (leaders.includes(message.author) && start == true && scores[leaders.indexOf(message.author)] < questions.length) {
        logchannel.send("**Q"+(scores[leaders.indexOf(message.author)]+1).toString()+": Team "+(leaders.indexOf(message.author)+1).toString()+"** ("+message.author.toString()+") **submitted:** "+args.join(" "));
        scores[leaders.indexOf(message.author)] += 1;
        if (scores[leaders.indexOf(message.author)] >= questions.length) {
          logchannel.send("** Team "+(leaders.indexOf(message.author)+1).toString()+"** ("+message.author.toString()+") **has completed all the questions!**");
          message.channel.send("You have finished all the questions!");
        } else {
          sendquestion(message);
        }

      } else {
        message.channel.send("You do not have permissions to do that.");
      }
      break;
    
    // ADMIN COMMANDS

    // !reset
    case "reset":
      if (message.author.id == "565635720996323370") {
        admin = message.author;
        logchannel = message.channel;
        leaders = [];
        scores = [];
        message.channel.send("All leaders and scores removed");
        message.channel.send("Admin is: " + admin.toString());
        message.channel.send("Log channel is: " + logchannel.toString());
        message.channel.send("Questions initialized: `"+questions.length.toString()+"`");
        start = false;
      } else {
        message.channel.send("You do not have permissions to do that.");
      }
      break;
    
    // !stop
    case "stop":
      if (message.author == admin) {
        start = false;
        for (var a = 0; a < leaders.length; a++) {
        leaders[a].send("Questions and submissions have been momentarily paused.")
        }
      } else {
        message.channel.send("You do not have permissions to do that.");
      }
      break;

    // !start
    case "start":
      if (message.author == admin) {
        for (var c = 0; c < leaders.length; c++) {
        leaders[c].send("Questions have begun. In your team channel, you may get your current question with `!question` and submit an answer with `!submit [answer]`");
        }
        start = true;
        message.channel.send("Battle Tower gameplay has begun.");
      } else {
        message.channel.send("You do not have permissions to do that.");
      }
      break;

    // !setup @user
    case "setup":
      if (message.author == admin) {
        if (message.mentions.users.first() == null) {
          message.channel.send("Invalid arguments");
          break;
        }
        leaders.push(message.mentions.users.first());
        scores.push(0);
        message.mentions.users.first().send("You are confirmed as the leader of Team `"+leaders.length.toString()+"`");
        message.channel.send(message.mentions.users.first().toString()+" has been set up as leader of Team `"+leaders.length.toString()+"`");
      } else {
        message.channel.send("You do not have permissions to do that.");
      }
      break;

    // !setscore team# question#
    case "setscore":
      if (message.author == admin) {
        if (args[1] >= 1 && args[1] <= questions.length && args[0] <= scores.length && args[0] >= 1) {
          scores[args[0]-1] = args[1]-1;
          message.channel.send("Team `"+args[0].toString()+"` ("+leaders[args[0]-1].toString()+") question set to `"+args[1].toString()+"`");
        } else {
          message.channel.send("Invalid arguments");
        }
      } else {
        message.channel.send("You do not have permissions to do that.");
      }
      break;

    // !setleader team# @user
    case "setleader":
      if (message.author == admin) {
        if (args[0] <= leaders.length) {
          leaders[args[0]-1] = message.mentions.users.first();
          message.channel.send("Team `"+args[0].toString()+"` leader set to "+message.mentions.users.first().toString());
        } else {
          message.channel.send("Invalid arguments");
        }
      } else {
        message.channel.send("You do not have permissions to do that.");
      }
      break;

    // !list
    case "list":
      if (message.author == admin) {
        if (leaders.length > 0) {
          var text = "Current leaderboard:\n";
          for (var d = 0; d < leaders.length; d++) {
            text += "**Team "+(d+1).toString()+"** ("+leaders[d].toString()+")**: ";
            if (scores[d] >= questions.length) {
              text += "**Finished\n";
            } else {
              text += "**`"+(scores[d]+1).toString()+"`\n";
            }
          }
          message.channel.send(text);
        } else {
          message.channel.send("There are no leaders currently.");
        }
      } else {
        message.channel.send("You do not have permissions to do that.");
      }
      break;

    // LOGISTIC COMMANDS

    // !assign
    case "assign":
      if (message.author.id == "565635720996323370") {
        var csv_data = [];
        var text = fs.readFileSync('./assets/input.csv','utf8').split("\n");
        for (var i = 0; i < text.length; i++) {
          csv_data.push(text[i].split(","));
        }

        const list = message.guild.members.cache;

        //console.log(list);

        for (var i = 0; i < csv_data.length; i++) {
          // Get role
          console.log(csv_data[i]);
          var role = message.guild.roles.cache.find(role => role.name === csv_data[i][0]);
          for (var j = 1; j < csv_data[i].length; j++) {
            // Get user
            var search_key = csv_data[i][j];
            if (search_key == "end" || search_key == "\r") break;
            list.forEach(function(person){
              var nick = person.displayName;
              console.log(nick);
              console.log(search_key);
              console.log("-----");
              if (nick == search_key) {
                person.roles.add(role);
              }
            });
          }
        }
        message.channel.send("Command run successfully.");
        break;
      } else {
        print("You do not have the permissions to do that.")
      }

    // !removeroles team/room
    case "removeroles":
      if (message.author.id == "565635720996323370") {
        switch(args[0]) {
          case "team":
            var roles_list = message.guild.roles.cache;
            roles_list.forEach(function(trole){
              if (trole.name.substring(0,1) == "T" && trole.name.length < 4) {
                var role_members = trole.members;
                role_members.forEach(function(person){
                  person.roles.remove(trole);
                });
                console.log(trole.name+" removed");
              }
            });
            break;
          case "room":
            var roles_list = message.guild.roles.cache;
              roles_list.forEach(function(trole){
                if (trole.name !== "Room Moderator" && trole.name.substring(0,4) == "Room") {
                  var role_members = trole.members;
                  role_members.forEach(function(person){
                    if (!(person.roles.cache.some(role => role.name === 'Room Moderator'))) {
                      person.roles.remove(trole);
                    }
                  });
                  console.log(trole.name+" removed");
                }
              });
            break;
          default:
            message.channel.send("Argument not recognized");
        }
        message.channel.send("Command run successfully.");
      } else {
        message.channel.send("You do not have the permissions to do that")
      }
      break;

    default:
        message.channel.send("Command not understood.");
    }
  } catch(error) {
    message.channel.send("There was an error.");
    console.log(error.toString());
  }
  
});

client.login(config.token);