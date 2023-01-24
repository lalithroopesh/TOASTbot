// OVERHAUL SYSTEM

const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");
const fs = require('fs');

client.on("ready", () => {
  console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
  client.user.setActivity('Preparing for QST 3...', {type: 'PLAYING' });});

// events for when bot joins / leaves servers
client.on("guildCreate", guild => {console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);});

client.on("guildDelete", guild => {console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);});


function get_team_number(message) {
  let category = message.guild.channels.cache.find(c => c.name.slice(0,9).toLowerCase()=="team text" && c.type=="category");
    if (!category) return "error";
    return category.children.array.length; // maybe make .array.length()
}

async function add_team(message, newno) {
  var role_id;

  // create team role
  await message.guild.roles.create({
    data: {
      name: "Team "+newno,
    },
    reason: "Created new team by "+message.author.toString(),
  }).catch(console.error);
  role_id = message.guild.roles.cache.find(r => r.name=="Team "+newno).id;

  // create team text channel
  message.guild.channels.create("team-"+(newno)+"-text", {
    type: 'text',
    permissionOverwrites: [
      {
         id: message.guild.id,
         deny: ['VIEW_CHANNEL'],
      },
      {
        id: role_id,
        allow: ['VIEW_CHANNEL'],
      },
    ],
  }).then(channel => {
  let category = message.guild.channels.cache.find(c => c.name.slice(0,9).toLowerCase()=="team text" && c.type=="category");
      if (!category) message.channel.send("Team text category did not exist");
      channel.setParent(category.id);
  }).catch(console.error);

  // create team voice channel
  message.guild.channels.create("team-"+(newno)+"-voice", {
    type: 'voice',
    permissionOverwrites: [
      {
         id: message.guild.id,
         deny: ['VIEW_CHANNEL'],
      },
      {
        id: role_id,
        allow: ['VIEW_CHANNEL'],
      },
    ],
  }).then(channel => {
  let category = message.guild.channels.cache.find(c => c.name.slice(0,10).toLowerCase()=="team voice" && c.type=="category");
      if (!category) message.channel.send("Team voice category did not exist");
      channel.setParent(category.id);
  }).catch(console.error);
}

// main run
client.on("message", async message => {
    
  // ignore bots
  if(message.author.bot) return;

  // not command
  if(message.content.indexOf(config.prefix) !== 0) return; 

    // not me
  admin_list = ["565635720996323370", "431245657651544064"]
  if (!admin_list.includes(message.author.id)) {
    message.channel.send("You do not have permissions to run that command");
    return;
  }
  
  const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  
  // commands
  try {
  switch(command) {

    // OPEN COMMANDS
    
    
    // GENERIC COMMANDS

    case "ping":
      const m = await message.channel.send("Ping?");
      m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`);
      break;

    case "getteamno":
      message.channel.send(""+get_team_number(message));
      break;

    // TEAM/ROOM MANAGEMENT

    case "addteam":
      let newno = get_team_number(message);

      // prevent if no team text channels
      if (newno == "error") {
        message.channel.send("Team text category not found");
      } else {
        newno += 1;
        add_team(message, newno);
        message.channel.send("Team number `"+newno+"` created.");
      }
      break;

    case "clearteams":
      // delete channels
      message.guild.channels.cache.forEach(function(channel) {
        if (channel.name.slice(0,4).toLowerCase()=="team" && channel.type!="category") channel.delete();
      })

      // delete roles
      message.guild.roles.cache.forEach(function(role) {
        if (role.name.slice(0,4).toLowerCase()=="team" && role.type!="category") role.delete();
      })

      message.channel.send("All teams deleted");
      break;

    case "addteamsupto":
      let newno2 = get_team_number(message);

      for (let i = newno2; i < args[0]; i++) {
        await add_team(message, i+1);
      }
      message.channel.send("Teams `"+(newno2+1)+"` through `"+args[0]+"` created.");
      break;

    // ROLE MANAGEMENT

    case "remove":
      let role = await message.guild.roles.fetch(""+args[0]);
      role.members.forEach(function(member) {
        member.roles.remove(role);
      })

      message.channel.send("`"+role.name+"` removed from all users.");
      break;
    
    case "massaccess":

      message.guild.channels.cache.forEach(function(channel) {
        if (channel.name.slice(0,4).toLowerCase()==args[1].toLowerCase()) {
          if (args[2].toLowerCase()=="allow") channel.updateOverwrite(args[0], {VIEW_CHANNEL: true});
          else channel.updateOverwrite(args[0], {VIEW_CHANNEL: false});
        }
      })

      message.channel.send("One of the arguments was incorrect.");
      console.log(error.toString());

      message.channel.send("`"+message.guild.roles.fetch(""+args[0]).name+"` role updated with `"+args[2]+"` permissions to `"+args[1]+"` channels.")
      break;
    
    case "massremove":
      message.guild.roles.cache.forEach(function(role) {
        if (role.name.slice(0,args[0].length).toLowerCase()==args[0].toLowerCase()) {
          role.members.forEach(function(member) {
            member.roles.remove(role);
          })
        }
      })

      message.channel.send("All roles of type `"+args[0]+"` are removed.");
      break;

    // OTHER MODERATION

    case "massclear":
      message.guild.channels.cache.forEach(async function(channel) {
        if (channel.name.slice(0,args[0].length).toLowerCase()==args[0].toLowerCase()) {
          await channel.clone();
          channel.delete();
        }
      })
      break;

    default:
        message.channel.send("Command not understood.");
  }

  } catch(error) {
    message.channel.send("There was an error. Check your arguments.");
    console.log(error.toString());
  }
  
});

client.login(config.token);