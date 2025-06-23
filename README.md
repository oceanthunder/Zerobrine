# Zerobrine – The Forgotten Sister

This is a Minecraft bot built using Mineflayer. 

---

## Features

- Guards a player when told
- Attacks mobs like zombies, skeletons, spiders, pillagers
- Can attack a player when marked hostile via chat
- Automatically eats food 
- Automatically equips the best armor and gear
- Uses bow for long-range attacks
- Goes to specified coordinates via chat command

---

## Chat Commands

* `guard <botName> <playerName>` – Bot will follow and protect the player
* `attack <playerName>` – Marks the player as hostile, bot will attack
* `stop` – Bot stops attacking or guarding
* `stop <playerName>` – Removes that player from the hostile list
* `come at <x> <y> <z>` – Bot walks to the given coordinates

---

## Folder Structure

```

.
├── actions/              
│   ├── attackHostile.js
│   ├── attackPlayer.js
│   ├── guard.js
│   └── stop.js
├── utils/               
│   ├── autoEat.js
│   ├── combatUtils.js
│   ├── comeCommand.js
│   ├── equip.js
│   └── lookHostiles.js
├── bot.js            
└── README.md

````

---

## Installation

Clone the repo and go into the folder:

```bash
git clone https://github.com/oceanthunder/Zerobrine
cd guardbot
````

Make sure you have Node.js and npm installed.

Then just run:

```bash
npm install
npm start
```

That’s it. The bot should connect to your Minecraft server (default is localhost:25565, you can change it in bot.js's host and port).
