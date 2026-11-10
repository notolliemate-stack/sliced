const descriptions = [
  'Cuddly', 'Cozy', 'Snuggly', 'Sunny', 'Playful',
  'Gentle', 'Happy', 'Fluffy', 'Sweet', 'Tiny',
  'Bubbly', 'Sleepy', 'Cheerful', 'Curious', 'Peppy',
  'Dreamy', 'Friendly', 'Jolly', 'Bouncy', 'Lovely',
];
const animals = [
  'Bunny', 'Otter', 'Panda', 'Kitten', 'Koala',
  'Puppy', 'Fox', 'Hedgehog', 'Duckling', 'Penguin',
  'Hamster', 'Fawn', 'Squirrel', 'Seal', 'Chick',
  'Lamb', 'Alpaca', 'Quokka', 'Mousie', 'Capybara',
];

export function createDefaultUsername(): string {
  const description = descriptions[Math.floor(Math.random() * descriptions.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const digits = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `${description}${animal}${digits}`;
}
