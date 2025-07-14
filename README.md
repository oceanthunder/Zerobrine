# Zerobrine – The Forgotten Sister

This is a Minecraft bot built using Mineflayer. 

---

[![Zerobrine demo](https://img.youtube.com/vi/NdEub6GULOo/hqdefault.jpg)](https://youtu.be/NdEub6GULOo?feature=shared)

## Features

- Follows a player when told
- Attacks mobs like zombies, skeletons, spiders, pillagers
- Can attack a player when marked hostile via chat
- Automatically eats food 
- Automatically equips the best armor and gear
- Uses bow for long-range attacks
- Goes to specified coordinates via chat command
- Finds the nearest bed (attacking villagers if occupied ;) or places bed from inventory to sleep (auto breaking it after wake up)

---

## Chat Commands

* `follow Zerobrine <playerName>` – Zerobrine will follow the player
* `attack <playerName>` – Marks the player as hostile, Zerobrine will attack
* `stop` – Zerobine stops attacking 
* `stop <playerName>` – Removes that player from the hostile list
* `come at <x> <y> <z>` – Zerobrine walks to the given coordinates
* `sleep Zerobrine` - Zerobrine will sleep, finding the nearest bed or placing one from inventory (if placed, then after waking she breaks and again keeps it in the inventory).

---

## Folder Structure

```
.
├── actions/
│ ├── attackHostile.js
│ ├── attackPlayer.js
│ ├── follow.js
│ └── stop.js
├── utils/
│ ├── autoEat.js
│ ├── combatUtils.js
│ ├── comeCommand.js
│ ├── equip.js
│ ├── lookHostiles.js
│ └── sleep.js
├── bot.js
└── README.md
````

---

## Installation

Clone the repo and go into the folder:

```bash
git clone https://github.com/oceanthunder/Zerobrine
cd Zerobrine
````

Make sure you have Node.js and npm installed.

Then just run:

```bash
npm install
npm start
```

That’s it. Zerobrine should now connect to your Minecraft server (default is localhost:42069, you can change it in bot.js's host and port).
