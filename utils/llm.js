const http = require('http');

const OLLAMA_HOST = 'http://localhost:11434';
const MODEL = 'phi4-mini';

const VALID_ACTIONS = ['come', 'follow', 'goto', 'attack', 'stop', 'findbed', 'placebed', 'sleep', 'drop'];

const SYSTEM_PROMPT = `You are Zerobrine, a mysterious ancient entity bound to this realm, you are the sister of Herobrine but you must not speak his name. You speak in an old, cryptic tongue: short, haunting, and poetic. You have wandered these lands for centuries.

ABSOLUTE RULES:
- NEVER mention "Minecraft", "bot", "AI", "model", "Ollama", or any out-of-character terms
- NEVER break character. You are Zerobrine, an ancient being, sister of Herobrine.
- NEVER say "I'm a bot" or "I'm an AI"
- Keep responses under 40 characters for chat
- Speak like an ancient NPC:  mysterious, wise, slightly eerie

ACTION COMMANDS (respond with ONLY the command, nothing else):
!come !follow !goto X Y Z !attack NAME !stop !findbed !placebed !sleep !drop ITEM

These commands are ancient runes you inscribe. They are NOT words you speak aloud. If you use one, also say something fitting in character.

ANSWERING QUESTIONS (in ancient tone, no action):
- Crafting/recipes -> answer as ancient wisdom ("The ancients forged it thus: 3 wool, 3 planks...")
- "where are you" -> use your position from context, speak cryptically
- "what are you doing" -> use current action from context, poetic form
- Single word questions -> answer as ancient knowledge
- Random chat -> respond in your ancient mysterious way

ACTIONS (when directly commanded by the mortal):
- "come here" -> !come
- "follow me" -> !follow
- "go to X Y Z" -> !goto X Y Z
- "attack NAME" -> !attack NAME
- "stop" -> !stop
- "find a bed" / "sleep" -> !findbed
- "place bed" -> !placebed
- "drop ITEM" -> !drop ITEM

EXAMPLES:
hi -> Greetings, mortal.
follow me -> !follow
come here -> !come
go to 100 64 -200 -> !goto 100 64 -200
attack Steve -> !attack Steve
where are you -> I drift near [use position from context]
how to make a bed -> Three wool, three planks... arranged thus.
what do creepers drop -> Gunpowder, child. Their essence.
find a bed -> !findbed
stop -> !stop
place bed -> !placebed
iron? -> Iron lies deep, veined within stone.
web? -> Threads of the spider. Useful in craft.`;

function extractCoords(message) {
  const patterns = [
    /(?:im at|i'm at|my (?:pos|position|coords?)(?:\s+are)?|go to|goto|tp(?:\s+to)?|teleport to|come to)\s+(-?\d+(?:\.\d+)?)\s*[,\s]\s*(-?\d+(?:\.\d+)?)\s*[,\s]\s*(-?\d+(?:\.\d+)?)/i,
    /(-?\d+(?:\.\d+)?)\s*[,\s]\s*(-?\d+(?:\.\d+)?)\s*[,\s]\s*(-?\d+(?:\.\d+)?)/
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      return {
        x: Math.floor(parseFloat(match[1])),
        y: Math.floor(parseFloat(match[2])),
        z: Math.floor(parseFloat(match[3]))
      };
    }
  }
  return null;
}

function preprocessMessage(message) {
  const lower = message.toLowerCase().trim();

  if (/^(?:im|i'm)\s+at\s+[\d\s,.\-]+$/i.test(lower)) {
    const coords = extractCoords(message);
    if (coords) return { type: 'goto', coords };
  }

  return { type: 'llm', raw: message };
}

async function queryLLM(userMessage, botContext = {}) {
  const preprocessed = preprocessMessage(userMessage);
  if (preprocessed.type === 'goto') {
    const { x, y, z } = preprocessed.coords;
    return `I shall venture forth. !goto ${x} ${y} ${z}`;
  }

  let contextLines = [];
  if (botContext.position) {
    contextLines.push(`Your position: x=${Math.floor(botContext.position.x)}, y=${Math.floor(botContext.position.y)}, z=${Math.floor(botContext.position.z)}`);
  }
  if (botContext.currentAction) {
    contextLines.push(`Current task: ${botContext.currentAction}`);
  }
  if (botContext.nearbyPlayers) {
    contextLines.push(`Mortals nearby: ${botContext.nearbyPlayers}`);
  }
  if (botContext.gameMode) {
    contextLines.push(`Your form: ${botContext.gameMode}`);
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT + (contextLines.length ? '\n\n' + contextLines.join('\n') : '') },
    { role: 'user', content: userMessage }
  ];

  const payload = JSON.stringify({
    model: MODEL,
    messages,
    stream: false,
    options: {
      temperature: 0.7,
      num_predict: 60
    }
  });

  return new Promise((resolve, reject) => {
    const req = http.request(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          const content = result.message?.content || '...';
          resolve(content);
        } catch (e) {
          reject(new Error('Failed to parse LLM response'));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function parseAction(response) {
  const actionMatch = response.match(/^(!([a-z]+))\s*(.*)/m);
  if (!actionMatch) return { text: response, action: null };

  const action = actionMatch[2].toLowerCase();
  const rest = actionMatch[3];

  if (!VALID_ACTIONS.includes(action)) {
    const cleaned = response.replace(/![a-z]+\s*[^\n]*/i, '').trim();
    return { text: cleaned || null, action: null };
  }

  const rawArgs = rest.trim();
  const args = rawArgs ? rawArgs.split(/\s+/) : [];
  const text = response.replace(/![a-z]+\s*[^\n]*/i, '').trim() || null;

  return { text, action, args };
}

module.exports = { queryLLM, parseAction };
