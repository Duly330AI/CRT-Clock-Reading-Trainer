export const numberWords: Record<number, string[]> = {
  1: ['one', '1'],
  2: ['two', '2'],
  3: ['three', '3'],
  4: ['four', '4'],
  5: ['five', '5'],
  6: ['six', '6'],
  7: ['seven', '7'],
  8: ['eight', '8'],
  9: ['nine', '9'],
  10: ['ten', '10'],
  11: ['eleven', '11'],
  12: ['twelve', '12'],
  15: ['fifteen', '15'],
  20: ['twenty', '20'],
  25: ['twenty-five', 'twenty five', '25'],
  30: ['thirty', '30'],
  35: ['thirty-five', 'thirty five', '35'],
  40: ['forty', '40'],
  45: ['forty-five', 'forty five', '45'],
  50: ['fifty', '50'],
  55: ['fifty-five', 'fifty five', '55']
};

export type Difficulty = 'kids' | 'easy' | 'medium' | 'hard';

export interface TimeState {
  hour: number;
  minute: number;
  isAM: boolean;
}

// Levenshtein distance for typo tolerance
export function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) { matrix[i] = [i]; }
  for (let j = 0; j <= a.length; j++) { matrix[0][j] = j; }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(matrix[i][j - 1] + 1, // insertion
                   matrix[i - 1][j] + 1) // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function generateRandomTime(difficulty: Difficulty): TimeState {
  const hour = Math.floor(Math.random() * 12) + 1;
  const isAM = Math.random() > 0.5;
  
  let minuteOptions: number[];
  if (difficulty === 'easy' || difficulty === 'kids') {
    minuteOptions = [0, 15, 30, 45];
  } else {
    minuteOptions = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
  }
  
  const minute = minuteOptions[Math.floor(Math.random() * minuteOptions.length)];
  
  return { hour, minute, isAM };
}

export function getPrimaryAnswer(time: TimeState, difficulty: Difficulty): string {
  const { hour, minute, isAM } = time;
  const nextHour = hour === 12 ? 1 : hour + 1;
  const hWord = numberWords[hour][0];
  const nextHWord = numberWords[nextHour][0];
  
  if (difficulty === 'hard') {
    if (hour === 12 && minute === 0) return isAM ? 'midnight' : 'noon';
  }

  let base = '';
  if (minute === 0) {
    base = `${hWord} o'clock`;
  } else if (minute === 15) {
    base = `quarter past ${hWord}`;
  } else if (minute === 30) {
    base = `half past ${hWord}`;
  } else if (minute === 45) {
    base = `quarter to ${nextHWord}`;
  } else if (minute < 30) {
    base = `${numberWords[minute][0]} past ${hWord}`;
  } else {
    base = `${numberWords[60 - minute][0]} to ${nextHWord}`;
  }

  if (difficulty === 'hard') {
    if (isAM) {
      if (hour === 12) return base.replace('twelve', 'midnight');
      return `${base} in the morning`;
    } else {
      if (hour === 12) return `${base} in the afternoon`;
      if (hour < 6) return `${base} in the afternoon`;
      if (hour >= 6 && hour < 9) return `${base} in the evening`;
      return `${base} at night`;
    }
  }
  
  return base;
}

export function getValidAnswers(time: TimeState, difficulty: Difficulty): string[] {
  const { hour, minute, isAM } = time;
  const nextHour = hour === 12 ? 1 : hour + 1;

  const hWords = numberWords[hour];
  const nextHWords = numberWords[nextHour];

  // Strict mode for kids and easy
  if (difficulty === 'easy' || difficulty === 'kids') {
    if (minute === 0) return [`${hWords[0]} o'clock`, `${hWords[0]} oclock`, hWords[0]];
    if (minute === 15) return [`quarter past ${hWords[0]}`, `a quarter past ${hWords[0]}`];
    if (minute === 30) return [`half past ${hWords[0]}`, `a half past ${hWords[0]}`];
    if (minute === 45) return [`quarter to ${nextHWords[0]}`, `a quarter to ${nextHWords[0]}`];
  }

  let baseAnswers: string[] = [];

  if (minute === 0) {
    hWords.forEach(h => {
      baseAnswers.push(`${h} o'clock`);
      baseAnswers.push(`${h} oclock`);
      baseAnswers.push(`${h}`);
    });
  } else if (minute <= 30) {
    const mWords = minute === 15 ? ['quarter', 'a quarter', 'fifteen', '15'] : 
                   minute === 30 ? ['half', 'a half', 'thirty', '30'] : 
                   numberWords[minute];
    
    mWords.forEach(m => {
      hWords.forEach(h => {
        baseAnswers.push(`${m} past ${h}`);
        baseAnswers.push(`${m} after ${h}`);
        if (minute !== 15 && minute !== 30) {
           baseAnswers.push(`${m} minutes past ${h}`);
           baseAnswers.push(`${m} minutes after ${h}`);
        }
      });
    });
  } else {
    const toMinute = 60 - minute;
    const mWords = toMinute === 15 ? ['quarter', 'a quarter', 'fifteen', '15'] : numberWords[toMinute];
    
    mWords.forEach(m => {
      nextHWords.forEach(h => {
        baseAnswers.push(`${m} to ${h}`);
        baseAnswers.push(`${m} till ${h}`);
        if (toMinute !== 15) {
           baseAnswers.push(`${m} minutes to ${h}`);
           baseAnswers.push(`${m} minutes till ${h}`);
        }
      });
    });
  }

  // Add digital format
  const minStr = minute < 10 ? `0${minute}` : `${minute}`;
  hWords.forEach(h => {
    baseAnswers.push(`${h}:${minStr}`);
    baseAnswers.push(`${h} ${minStr}`);
    if (minute !== 0) {
      numberWords[minute].forEach(m => {
        baseAnswers.push(`${h} ${m}`);
      });
    }
  });

  if (difficulty === 'hard') {
    const periodAnswers: string[] = [];
    baseAnswers.forEach(a => {
      periodAnswers.push(`${a} am`);
      periodAnswers.push(`${a} a.m.`);
      periodAnswers.push(`${a} a.m`);
      periodAnswers.push(`${a} pm`);
      periodAnswers.push(`${a} p.m.`);
      periodAnswers.push(`${a} p.m`);
      
      if (isAM) {
        if (hour === 12) {
          periodAnswers.push(a.replace('twelve', 'midnight'));
          periodAnswers.push(`${a} at night`);
        } else {
          periodAnswers.push(`${a} in the morning`);
        }
      } else {
        if (hour === 12) {
          periodAnswers.push(`${a} in the afternoon`);
        } else if (hour < 6) {
          periodAnswers.push(`${a} in the afternoon`);
        } else if (hour >= 6 && hour < 9) {
          periodAnswers.push(`${a} in the evening`);
        } else {
          periodAnswers.push(`${a} at night`);
        }
      }
    });
    
    // Add exact noon/midnight
    if (hour === 12 && minute === 0) {
      periodAnswers.push(isAM ? 'midnight' : 'noon');
      periodAnswers.push(isAM ? '12 midnight' : '12 noon');
    }
    
    return [...baseAnswers, ...periodAnswers];
  }

  return baseAnswers;
}

export function checkAnswer(userInput: string, validAnswers: string[]): boolean {
  const normalizedInput = userInput.toLowerCase().replace(/\s+/g, ' ').trim();
  
  return validAnswers.some(ans => {
    const normalizedAns = ans.toLowerCase();
    if (normalizedAns === normalizedInput) return true;
    
    // Typo tolerance: Allow 1 typo for words > 5 chars, 2 typos for > 12 chars
    if (normalizedAns.length > 5 && !normalizedAns.includes(':')) {
      const maxTypos = normalizedAns.length > 12 ? 2 : 1;
      if (levenshtein(normalizedAns, normalizedInput) <= maxTypos) {
        return true;
      }
    }
    return false;
  });
}

export function generateMultipleChoice(time: TimeState, difficulty: Difficulty): string[] {
  const correct = getPrimaryAnswer(time, difficulty);
  const options = new Set<string>();
  options.add(correct);
  
  // Generate 3 wrong but plausible options
  while(options.size < 4) {
    const randomTime = generateRandomTime(difficulty);
    options.add(getPrimaryAnswer(randomTime, difficulty));
  }
  
  return Array.from(options).sort(() => Math.random() - 0.5);
}
