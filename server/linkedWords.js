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
  'milk', 'apple', 'orange', 'lemon', 'grape', 'storm', 'blanket', 'pillow', 'lamp', 'candle',
  'puzzle', 'game', 'mask', 'rainbow', 'tunnel', 'island', 'volcano', 'desert', 'garden', 'tower'
];

export function pickWord(usedWords) {
  const available = WORDS.filter(w => !usedWords.includes(w));
  if (available.length === 0) return WORDS[Math.floor(Math.random() * WORDS.length)];
  return available[Math.floor(Math.random() * available.length)];
}
