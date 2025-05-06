import { wodTemplates } from './wodTemplates';
import movementLibrary from '../data/movement_library.json';

function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

function pickUniqueMovements(categories: string[], count: number): any[] {
  const selected: any[] = [];
  const usedCategories = new Set();

  const shuffled = shuffle(movementLibrary);
  for (let move of shuffled) {
    if (categories.includes(move.category) && !usedCategories.has(move.category)) {
      selected.push(move);
      usedCategories.add(move.category);
    }
    if (selected.length === count) break;
  }
  return selected;
}

export function generateWOD() {
  const template = getRandomItem(wodTemplates);

  const movementCount = template.type === 'single' ? 1 : (template.type === 'couplet' ? 2 : 3);
  const movementCategories = ['push', 'pull', 'squat', 'hinge', 'core', 'cardio'];

  const movements = pickUniqueMovements(movementCategories, movementCount);

  return {
    ...template,
    movements
  };
}