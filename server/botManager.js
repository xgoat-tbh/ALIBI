import { rooms, broadcastRoomState, findPlayerRoom } from './roomManager.js';

const BOT_DELAY_MIN = 300;
const BOT_DELAY_MAX = 1000;

function randDelay() {
  return new Promise(r => setTimeout(r, BOT_DELAY_MIN + Math.random() * (BOT_DELAY_MAX - BOT_DELAY_MIN)));
}

async function botReadyUp(playerId) {
  const room = findPlayerRoom(playerId);
  if (!room || room.status !== 'lobby') return;
  const player = room.players.find(p => p.id === playerId);
  if (!player || player.isReady) return;
  await randDelay();
  player.isReady = true;
  broadcastRoomState(room);
}

async function botSubmitWord(playerId) {
  const room = findPlayerRoom(playerId);
  if (!room || room.status !== 'word_drop') return;
  const player = room.players.find(p => p.id === playerId);
  if (!player) return;
  const already = room.submissions.find(s => s.playerId === playerId);
  if (already) return;
  await randDelay();
  const prompt = room.currentPrompt || '';
  const responses = {
    'cat': ['dog', 'meow', 'kitten', 'feline', 'purr', 'whiskers', 'pet', 'tail'],
    'dog': ['cat', 'bone', 'bark', 'puppy', 'canine', 'pet', 'loyal', 'fetch'],
    'sun': ['moon', 'star', 'shine', 'light', 'sky', 'warm', 'day', 'bright'],
    'moon': ['sun', 'star', 'night', 'sky', 'lunar', 'crescent', 'orbit', 'full'],
    'ocean': ['sea', 'water', 'wave', 'beach', 'blue', 'deep', 'tide', 'fish'],
    'desert': ['sand', 'hot', 'camel', 'dune', 'arid', 'cactus', 'dry', 'sun'],
    'music': ['song', 'sound', 'melody', 'rhythm', 'note', 'beat', 'dance', 'tune'],
    'paint': ['brush', 'color', 'art', 'canvas', 'draw', 'picture', 'paint', 'wall'],
    'book': ['read', 'page', 'story', 'novel', 'cover', 'word', 'library', 'author'],
    'fire': ['burn', 'hot', 'flame', 'smoke', 'heat', 'ember', 'blaze', 'ash'],
    'ice': ['cold', 'water', 'snow', 'freeze', 'cube', 'winter', 'frost', 'solid'],
    'rain': ['water', 'storm', 'wet', 'cloud', 'drop', 'umbrella', 'puddle', 'sky'],
    'snow': ['white', 'cold', 'winter', 'ice', 'flake', 'freeze', 'rain', 'storm'],
    'wind': ['air', 'blow', 'storm', 'breeze', 'sky', 'gale', 'kite', 'weather'],
    'tree': ['leaf', 'wood', 'plant', 'root', 'branch', 'green', 'forest', 'shade'],
    'flower': ['petal', 'rose', 'plant', 'garden', 'bloom', 'color', 'spring', 'scent'],
    'stone': ['rock', 'hard', 'solid', 'boulder', 'pebble', 'mountain', 'wall', 'ground'],
    'glass': ['window', 'clear', 'brittle', 'mirror', 'transparent', 'crystal', 'sheet', 'cup'],
    'mirror': ['glass', 'reflection', 'image', 'look', 'surface', 'self', 'wall', 'see'],
    'clock': ['time', 'tick', 'hour', 'watch', 'minute', 'second', 'pendulum', 'face'],
    'key': ['lock', 'door', 'open', 'metal', 'chain', 'ring', 'access', 'gold'],
    'door': ['open', 'key', 'close', 'exit', 'enter', 'room', 'frame', 'knock'],
    'window': ['glass', 'view', 'light', 'door', 'frame', 'pane', 'clear', 'look'],
    'bridge': ['cross', 'river', 'span', 'road', 'connect', 'arch', 'water', 'path'],
    'road': ['path', 'drive', 'street', 'travel', 'car', 'way', 'route', 'asphalt'],
    'river': ['water', 'flow', 'stream', 'ocean', 'bridge', 'bank', 'current', 'lake'],
    'lake': ['water', 'ocean', 'river', 'pond', 'swim', 'deep', 'shore', 'blue'],
    'mountain': ['peak', 'high', 'hill', 'climb', 'summit', 'snow', 'range', 'valley'],
    'star': ['night', 'sky', 'moon', 'shine', 'light', 'bright', 'galaxy', 'twinkle'],
    'cloud': ['sky', 'rain', 'white', 'storm', 'fluffy', 'air', 'gray', 'cover'],
    'storm': ['rain', 'wind', 'thunder', 'cloud', 'lightning', 'fury', 'tempest', 'gale'],
    'night': ['dark', 'moon', 'star', 'sleep', 'day', 'sky', 'black', 'shadow'],
    'day': ['light', 'sun', 'night', 'time', 'morning', 'noon', 'hour', 'bright'],
    'light': ['dark', 'sun', 'shine', 'bright', 'lamp', 'glow', 'day', 'ray'],
    'dark': ['light', 'night', 'shadow', 'black', 'moon', 'dim', 'space', 'void'],
    'shadow': ['dark', 'light', 'shade', 'silhouette', 'ghost', 'follow', 'darkness', 'figure'],
    'echo': ['sound', 'voice', 'reflection', 'repeat', 'cave', 'reverb', 'call', 'hollow'],
    'ghost': ['spirit', 'haunt', 'phantom', 'shadow', 'scary', 'apparition', 'boo', 'specter'],
    'laugh': ['smile', 'joy', 'happy', 'funny', 'grin', 'humor', 'giggle', 'chuckle'],
    'cry': ['sad', 'tear', 'sob', 'weep', 'laugh', 'emotion', 'pain', 'sound'],
    'smile': ['happy', 'grin', 'face', 'joy', 'laugh', 'mouth', 'bright', 'sunny'],
    'dream': ['night', 'sleep', 'imagine', 'wish', 'vision', 'fantasy', 'hope', 'awake'],
    'memory': ['remember', 'past', 'forget', 'brain', 'nostalgia', 'thought', 'old', 'recall'],
    'secret': ['hidden', 'mystery', 'keep', 'tell', 'private', 'whisper', 'closet', 'code'],
    'treasure': ['gold', 'chest', 'map', 'pirate', 'gem', 'jewel', 'hunt', 'rich'],
    'castle': ['king', 'fortress', 'tower', 'wall', 'stone', 'knight', 'royal', 'ancient'],
    'crown': ['king', 'queen', 'royal', 'gold', 'head', 'throne', 'jewel', 'power'],
    'sword': ['blade', 'knight', 'war', 'sharp', 'fight', 'steel', 'weapon', 'shield'],
    'shield': ['protect', 'sword', 'armor', 'guard', 'defend', 'metal', 'warrior', 'block'],
    'arrow': ['bow', 'shoot', 'target', 'point', 'direction', 'quiver', 'flight', 'sharp'],
    'heart': ['love', 'blood', 'beat', 'pump', 'organ', 'care', 'soul', 'emotion'],
    'brain': ['mind', 'think', 'smart', 'head', 'intellect', 'nerve', 'skull', 'thought'],
    'bone': ['skeleton', 'body', 'hard', 'break', 'joint', 'marrow', 'skull', 'rib'],
    'blood': ['red', 'vein', 'heart', 'body', 'life', 'wound', 'iron', 'pump'],
    'wing': ['fly', 'bird', 'feather', 'angel', 'soar', 'air', 'glide', 'flight'],
    'feather': ['bird', 'light', 'wing', 'soft', 'down', 'quill', 'fly', 'fluffy'],
    'shell': ['turtle', 'ocean', 'hard', 'egg', 'beach', 'crab', 'sand', 'protect'],
    'pearl': ['white', 'oyster', 'gem', 'shell', 'ocean', 'shiny', 'jewel', 'luster'],
    'gold': ['metal', 'rich', 'shine', 'jewel', 'treasure', 'yellow', 'coin', 'precious'],
    'silver': ['metal', 'gold', 'shine', 'coin', 'precious', 'gray', 'iron', 'jewel'],
    'copper': ['metal', 'wire', 'penny', 'brown', 'iron', 'conduct', 'rust', 'bronze'],
    'iron': ['metal', 'steel', 'strong', 'rust', 'heavy', 'silver', 'man', 'melt'],
    'wood': ['tree', 'forest', 'paper', 'fire', 'furniture', 'grain', 'log', 'timber'],
    'paper': ['wood', 'write', 'page', 'fold', 'sheet', 'book', 'letter', 'print'],
    'thread': ['needle', 'sew', 'cloth', 'fabric', 'string', 'thin', 'stitch', 'spool'],
    'needle': ['thread', 'sharp', 'sew', 'pin', 'metal', 'stitch', 'acupuncture', 'haystack'],
    'wheel': ['round', 'car', 'spin', 'tire', 'turn', 'axle', 'ride', 'circle'],
    'chain': ['link', 'metal', 'lock', 'connect', 'ball', 'pull', 'anchor', 'bind'],
    'rope': ['tie', 'pull', 'bind', 'string', 'knot', 'climb', 'cable', 'cord'],
    'cage': ['bars', 'bird', 'jail', 'trap', 'prison', 'animal', 'enclosure', 'lock'],
    'bell': ['ring', 'sound', 'metal', 'church', 'tone', 'signal', 'alarm', 'chime'],
    'drum': ['beat', 'music', 'stick', 'sound', 'rhythm', 'percussion', 'bang', 'march'],
    'flute': ['music', 'instrument', 'wood', 'blow', 'melody', 'note', 'silver', 'wind'],
    'horn': ['sound', 'music', 'animal', 'metal', 'blow', 'car', 'alert', 'tusk'],
    'song': ['music', 'sing', 'melody', 'lyrics', 'tune', 'voice', 'note', 'rhythm'],
    'dance': ['move', 'music', 'beat', 'rhythm', 'step', 'party', 'ball', 'perform'],
    'feast': ['food', 'eat', 'party', 'meal', 'celebrate', 'banquet', 'plenty', 'table'],
    'bread': ['food', 'wheat', 'eat', 'dough', 'bake', 'flour', 'toast', 'loaf'],
    'wine': ['glass', 'grape', 'drink', 'red', 'bottle', 'vine', 'alcohol', 'cheese'],
    'honey': ['bee', 'sweet', 'gold', 'sticky', 'flower', 'sugar', 'wax', 'nectar'],
    'salt': ['pepper', 'ocean', 'sodium', 'crystal', 'food', 'season', 'taste', 'mineral'],
    'pepper': ['salt', 'spice', 'black', 'mill', 'season', 'hot', 'vegetable', 'grind'],
    'rose': ['flower', 'red', 'petal', 'thorn', 'garden', 'scent', 'bloom', 'love'],
    'lily': ['flower', 'white', 'petal', 'garden', 'bloom', 'peace', 'water', 'purity'],
    'oak': ['tree', 'strong', 'wood', 'leaf', 'acorn', 'forest', 'mighty', 'branch'],
    'pine': ['tree', 'forest', 'wood', 'needle', 'pinecone', 'scent', 'green', 'tall'],
    'fox': ['animal', 'red', 'sly', 'hunt', 'forest', 'wild', 'quick', 'clever'],
    'wolf': ['howl', 'pack', 'animal', 'moon', 'wild', 'forest', 'gray', 'hunt'],
    'bear': ['animal', 'forest', 'honey', 'grizzly', 'wild', 'large', 'brown', 'den'],
    'rabbit': ['bunny', 'hop', 'animal', 'carrot', 'ear', 'fast', 'white', 'hole'],
    'eagle': ['bird', 'fly', 'soar', 'bald', 'wing', 'high', 'freedom', 'prey'],
    'hawk': ['bird', 'eagle', 'soar', 'wing', 'prey', 'falcon', 'fly', 'keen'],
    'dove': ['bird', 'peace', 'white', 'fly', 'wing', 'gentle', 'olive', 'pure'],
    'snake': ['reptile', 'slither', 'venom', 'scale', 'grass', 'danger', 'serpent', 'cold'],
    'fish': ['swim', 'water', 'ocean', 'scale', 'fin', 'aquatic', 'hook', 'fresh'],
    'whale': ['ocean', 'large', 'mammal', 'fish', 'blue', 'deep', 'mighty', 'sea'],
    'lion': ['king', 'animal', 'safari', 'mane', 'wild', 'pride', 'roar', 'golden'],
    'tiger': ['stripe', 'animal', 'wild', 'big', 'jungle', 'orange', 'cat', 'fierce'],
    'horse': ['ride', 'animal', 'hoof', 'stable', 'gallop', 'swift', 'equine', 'ranch'],
    'spider': ['web', 'insect', 'eight', 'legs', 'spin', 'creepy', 'arachnid', 'crawl'],
    'milk': ['white', 'drink', 'cow', 'dairy', 'cold', 'bottle', 'cereal', 'cream'],
    'apple': ['fruit', 'red', 'tree', 'pie', 'sweet', 'cider', 'core', 'green'],
    'orange': ['fruit', 'color', 'juice', 'sweet', 'citrus', 'vitamin', 'round', 'peel'],
    'lemon': ['sour', 'fruit', 'yellow', 'juice', 'citrus', 'tangy', 'zest', 'slice'],
    'grape': ['fruit', 'wine', 'purple', 'vine', 'sweet', 'cluster', 'raisin', 'juice'],
    'blanket': ['warm', 'sleep', 'cover', 'soft', 'bed', 'cozy', 'quilt', 'rest'],
    'pillow': ['sleep', 'soft', 'bed', 'head', 'rest', 'case', 'down', 'dream'],
    'lamp': ['light', 'bulb', 'table', 'shade', 'glow', 'illuminate', 'desk', 'bright'],
    'candle': ['wax', 'flame', 'light', 'wick', 'scent', 'melt', 'glow', 'romance'],
    'puzzle': ['piece', 'solve', 'game', 'brain', 'jigsaw', 'mystery', 'riddle', 'stack'],
    'game': ['play', 'fun', 'lose', 'board', 'rule', 'sport', 'winner', 'score'],
    'mask': ['face', 'cover', 'hide', 'carnival', 'identity', 'disguise', 'protection', 'anonymous'],
    'rainbow': ['color', 'sky', 'rain', 'bridge', 'spectrum', 'arch', 'vivid', 'prism'],
    'tunnel': ['underground', 'dark', 'passage', 'hole', 'dig', 'connect', 'light', 'train'],
    'island': ['ocean', 'sand', 'palm', 'isolated', 'beach', 'tropical', 'paradise', 'remote'],
    'volcano': ['lava', 'erupt', 'mountain', 'fire', 'magma', 'hot', 'ash', 'crater'],
    'garden': ['flower', 'plant', 'green', 'grow', 'yard', 'nature', 'tend', 'bloom'],
    'tower': ['tall', 'building', 'high', 'castle', 'lookout', 'skyscraper', 'spire', 'rise'],
  };
  const promptLower = prompt.toLowerCase();
  const options = responses[promptLower];
  let word = 'mind';
  if (options && options.length > 0) {
    word = options[Math.floor(Math.random() * options.length)];
  } else {
    const fallbacks = ['think', 'word', 'free', 'idea', 'vibe', 'link', 'flow', 'quick'];
    word = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
  room.submissions.push({ playerId, playerName: player.name, word });
  broadcastRoomState(room);
}

export function handleAddBots(socketId, count = 1) {
  const room = findPlayerRoom(socketId);
  if (!room || room.status !== 'lobby') return;
  const host = room.players.find(p => p.id === socketId && p.isHost);
  if (!host) return;

  const botNames = [
    'Agent Smith', 'Detective Noir', 'Inspector Rex',
    'Officer Chen', 'Specialist Vega', 'Analyst Frost',
    'Captain Drake', 'Sergeant Blake', 'Coroner Miles',
    'Prof. Hawthorne', 'Agent Delta', 'Detective Cross'
  ];

  const existingNames = room.players.map(p => p.name);
  const available = botNames.filter(n => !existingNames.includes(n));

  const toAdd = Math.min(count, 10 - room.players.length, available.length);
  for (let i = 0; i < toAdd; i++) {
    const name = available[i] || `Bot-${i + 1}`;
    const botId = `bot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const player = {
      id: botId, name, isHost: false, isReady: true,
      isBot: true, score: 0, lastScoreDelta: 0
    };
    room.players.push(player);
    botReadyUp(botId);
  }

  broadcastRoomState(room);
}

export async function processBots(room) {
  if (!room) return;
  const bots = room.players.filter(p => p.isBot);
  if (bots.length === 0) return;

  switch (room.status) {
    case 'word_drop':
      for (const bot of bots) {
        botSubmitWord(bot.id);
      }
      break;
  }
}
