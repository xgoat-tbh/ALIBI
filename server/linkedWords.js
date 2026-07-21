export const WORDS = [
  'cat', 'dog', 'sun', 'moon', 'ocean', 'desert', 'music', 'paint', 'book', 'fire',
  'ice', 'rain', 'snow', 'wind', 'tree', 'flower', 'stone', 'glass', 'mirror', 'clock',
  'key', 'door', 'window', 'bridge', 'road', 'river', 'lake', 'mountain', 'star', 'cloud',
  'storm', 'night', 'day', 'light', 'dark', 'shadow', 'echo', 'ghost', 'laugh', 'cry',
  'smile', 'dream', 'memory', 'secret', 'treasure', 'castle', 'crown', 'sword', 'shield', 'arrow',
  'heart', 'brain', 'bone', 'blood', 'wing', 'feather', 'shell', 'pearl', 'gold', 'silver',
  'copper', 'iron', 'wood', 'paper', 'thread', 'needle', 'wheel', 'chain', 'rope', 'cage',
  'bell', 'drum', 'flute', 'horn', 'song', 'dance', 'feast', 'bread', 'wine', 'honey',
  'salt', 'pepper', 'rose', 'lily', 'oak', 'pine', 'fox', 'wolf', 'bear', 'rabbit',
  'eagle', 'hawk', 'dove', 'snake', 'fish', 'whale', 'lion', 'tiger', 'horse', 'spider',
  'milk', 'apple', 'orange', 'lemon', 'grape', 'blanket', 'pillow', 'lamp', 'candle',
  'puzzle', 'game', 'mask', 'rainbow', 'tunnel', 'island', 'volcano', 'garden', 'tower',
  'fog', 'dawn', 'dust', 'rust', 'clay', 'ash', 'moss', 'vapor', 'ember', 'crystal',
  'thunder', 'wave', 'tide', 'glacier', 'blaze', 'frost', 'breeze', 'whirl', 'echo',
  'sphinx', 'kraken', 'phoenix', 'dragon', 'griffin', 'basilisk', 'chimera', 'harpy',
  'velvet', 'leather', 'silk', 'linen', 'denim', 'woven', 'fleece', 'satin',
  'crimson', 'violet', 'amber', 'jade', 'cobalt', 'ivory', 'scarlet', 'emerald',
  'lantern', 'beacon', 'compass', 'anchor', 'rudder', 'voyage', 'horizon', 'summit',
  'riddle', 'enigma', 'paradox', 'mirage', 'omen', 'fable', 'myth', 'relic',
  'biscuit', 'pickle', 'toast', 'sugar', 'cocoa', 'saffron', 'basil', 'mint',
  'circus', 'carnival', 'jester', 'acrobat', 'marble', 'statue', 'canvas', 'easel',
  'planet', 'comet', 'nebula', 'solar', 'lunar', 'orbit', 'eclipse', 'gravity',
  'robot', 'cyborg', 'laser', 'rocket', 'satellite', 'microchip', 'code', 'pixel',
  'harvest', 'seedling', 'bloom', 'thicket', 'meadow', 'orchard', 'canopy', 'bamboo',
  'coral', 'kelp', 'shore', 'lagoon', 'delta', 'fjord', 'geyser', 'echo',
  'cinnamon', 'clove', 'ginger', 'nutmeg', 'vanilla', 'caramel', 'toffee', 'fudge',
  'battle', 'truce', 'alliance', 'treaty', 'parley', 'siege', 'raid', 'fortress',
  'potion', 'scroll', 'wand', 'chalice', 'amulet', 'rune', 'glyph', 'shrine',
  'ladder', 'pulley', 'lever', 'spring', 'gear', 'pendulum', 'turbine', 'module',
  'cactus', 'fern', 'ivy', 'moss', 'petal', 'thorn', 'pollen', 'root',
  'verse', 'rhyme', 'sonnet', 'prose', 'lyric', 'proverb', 'riddle', 'haiku',
];

export function pickWord(usedWords) {
  const available = WORDS.filter(w => !usedWords.includes(w));
  if (available.length === 0) return WORDS[Math.floor(Math.random() * WORDS.length)];
  return available[Math.floor(Math.random() * available.length)];
}
