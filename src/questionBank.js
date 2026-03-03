// Question bank for Madhav's Million Coin Challenge
// 50 questions: 10 per subject × 5 subjects
// Difficulty: 1=Easy (Q1-3), 2=Medium (Q4-6), 3=Hard (Q7-9), 4=Bonus (Q10)

export const QUESTION_BANK = [

  // ── Math ───────────────────────────────────────────────────────────────────

  // Easy
  { question: "What is 5 + 3?", options: ["6", "7", "8", "9"], answer: "8", subject: "Math", difficulty: 1 },
  { question: "How many sides does a triangle have?", options: ["2", "3", "4", "5"], answer: "3", subject: "Math", difficulty: 1 },
  { question: "What is 10 - 4?", options: ["4", "5", "6", "7"], answer: "6", subject: "Math", difficulty: 1 },

  // Medium
  { question: "What is 3 × 4?", options: ["7", "10", "12", "14"], answer: "12", subject: "Math", difficulty: 2 },
  { question: "What is half of 20?", options: ["5", "8", "10", "15"], answer: "10", subject: "Math", difficulty: 2 },
  { question: "If you have 2 bags with 6 apples each, how many apples are there in total?", options: ["8", "10", "12", "14"], answer: "12", subject: "Math", difficulty: 2 },

  // Hard
  { question: "What is 7 × 8?", options: ["48", "54", "56", "63"], answer: "56", subject: "Math", difficulty: 3 },
  { question: "What is 100 ÷ 4?", options: ["20", "25", "30", "40"], answer: "25", subject: "Math", difficulty: 3 },
  { question: "If you buy 3 toys for $4 each, how much do you spend in total?", options: ["$7", "$10", "$12", "$15"], answer: "$12", subject: "Math", difficulty: 3 },

  // Bonus
  { question: "What is 12 × 12?", options: ["124", "132", "144", "156"], answer: "144", subject: "Math", difficulty: 4 },

  // ── Science ────────────────────────────────────────────────────────────────

  // Easy
  { question: "Which planet do we live on?", options: ["Mars", "Venus", "Earth", "Jupiter"], answer: "Earth", subject: "Science", difficulty: 1 },
  { question: "What do plants need to make food?", options: ["The Moon", "Sunlight", "Sand", "Snow"], answer: "Sunlight", subject: "Science", difficulty: 1 },
  { question: "What do we call baby dogs?", options: ["Kittens", "Cubs", "Puppies", "Chicks"], answer: "Puppies", subject: "Science", difficulty: 1 },

  // Medium
  { question: "What is the largest planet in our solar system?", options: ["Earth", "Saturn", "Jupiter", "Mars"], answer: "Jupiter", subject: "Science", difficulty: 2 },
  { question: "What does a caterpillar turn into?", options: ["A bee", "A butterfly", "A spider", "A worm"], answer: "A butterfly", subject: "Science", difficulty: 2 },
  { question: "What covers most of the Earth's surface?", options: ["Sand", "Ice", "Water", "Grass"], answer: "Water", subject: "Science", difficulty: 2 },

  // Hard
  { question: "What is the closest star to Earth?", options: ["Sirius", "The Moon", "The Sun", "Polaris"], answer: "The Sun", subject: "Science", difficulty: 3 },
  { question: "What gas do humans need to breathe to stay alive?", options: ["Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"], answer: "Oxygen", subject: "Science", difficulty: 3 },
  { question: "What do plants make their food from using sunlight?", options: ["Respiration", "Digestion", "Photosynthesis", "Evaporation"], answer: "Photosynthesis", subject: "Science", difficulty: 3 },

  // Bonus
  { question: "Which planet is known as the Red Planet?", options: ["Venus", "Jupiter", "Mars", "Mercury"], answer: "Mars", subject: "Science", difficulty: 4 },

  // ── History ────────────────────────────────────────────────────────────────

  // Easy
  { question: "What holiday do we celebrate on July 4th?", options: ["Thanksgiving", "Halloween", "Independence Day", "Christmas"], answer: "Independence Day", subject: "History", difficulty: 1 },
  { question: "Who was the first President of the United States?", options: ["Abraham Lincoln", "George Washington", "Thomas Jefferson", "John Adams"], answer: "George Washington", subject: "History", difficulty: 1 },
  { question: "On which holiday do we give thanks and eat turkey?", options: ["Easter", "Christmas", "Thanksgiving", "Halloween"], answer: "Thanksgiving", subject: "History", difficulty: 1 },

  // Medium
  { question: "What famous tower is in Paris, France?", options: ["Big Ben", "Eiffel Tower", "Leaning Tower", "Colosseum"], answer: "Eiffel Tower", subject: "History", difficulty: 2 },
  { question: "What country is the Taj Mahal in?", options: ["China", "Egypt", "India", "Brazil"], answer: "India", subject: "History", difficulty: 2 },
  { question: "What ocean is on the east coast of the United States?", options: ["Pacific Ocean", "Indian Ocean", "Arctic Ocean", "Atlantic Ocean"], answer: "Atlantic Ocean", subject: "History", difficulty: 2 },

  // Hard
  { question: "In what year did the United States declare independence?", options: ["1492", "1776", "1812", "1865"], answer: "1776", subject: "History", difficulty: 3 },
  { question: "Who is credited with sailing to the Americas in 1492?", options: ["Amerigo Vespucci", "Ferdinand Magellan", "Christopher Columbus", "Leif Erikson"], answer: "Christopher Columbus", subject: "History", difficulty: 3 },
  { question: "What is the name of the document that is the supreme law of the United States?", options: ["The Treaty", "The Constitution", "The Declaration", "The Bill of Rights"], answer: "The Constitution", subject: "History", difficulty: 3 },

  // Bonus
  { question: "Which President helped end slavery in the United States?", options: ["George Washington", "Abraham Lincoln", "Thomas Jefferson", "Benjamin Franklin"], answer: "Abraham Lincoln", subject: "History", difficulty: 4 },

  // ── Civics ─────────────────────────────────────────────────────────────────

  // Easy
  { question: "What do police officers do?", options: ["Cook food", "Build houses", "Keep people safe", "Fly planes"], answer: "Keep people safe", subject: "Civics", difficulty: 1 },
  { question: "Who helps us when we are sick?", options: ["A firefighter", "A teacher", "A doctor", "A chef"], answer: "A doctor", subject: "Civics", difficulty: 1 },
  { question: "What do firefighters do?", options: ["Teach school", "Put out fires", "Fix cars", "Bake bread"], answer: "Put out fires", subject: "Civics", difficulty: 1 },

  // Medium
  { question: "What do you call the leader of the United States?", options: ["King", "Prime Minister", "President", "Mayor"], answer: "President", subject: "Civics", difficulty: 2 },
  { question: "What do we put in a recycle bin?", options: ["Food scraps", "Paper and cans", "Dirty clothes", "Broken glass"], answer: "Paper and cans", subject: "Civics", difficulty: 2 },
  { question: "What building does the President of the United States live and work in?", options: ["The Capitol", "The White House", "The Pentagon", "The Mansion"], answer: "The White House", subject: "Civics", difficulty: 2 },

  // Hard
  { question: "How many stars are on the United States flag?", options: ["48", "50", "52", "56"], answer: "50", subject: "Civics", difficulty: 3 },
  { question: "What is one job of the U.S. Supreme Court?", options: ["Make laws", "Lead the army", "Decide if laws are fair", "Collect taxes"], answer: "Decide if laws are fair", subject: "Civics", difficulty: 3 },
  { question: "How many senators does each U.S. state send to the Senate?", options: ["1", "2", "3", "4"], answer: "2", subject: "Civics", difficulty: 3 },

  // Bonus
  { question: "What do we call the system where citizens vote for their leaders?", options: ["A monarchy", "A dictatorship", "A democracy", "An empire"], answer: "A democracy", subject: "Civics", difficulty: 4 },

  // ── Reading & Language ─────────────────────────────────────────────────────

  // Easy
  { question: "Which of these is a vowel?", options: ["B", "C", "E", "T"], answer: "E", subject: "Reading", difficulty: 1 },
  { question: "Which word rhymes with HAT?", options: ["Dog", "Car", "Bat", "Sun"], answer: "Bat", subject: "Reading", difficulty: 1 },
  { question: "What is the first letter of the alphabet?", options: ["B", "Z", "A", "E"], answer: "A", subject: "Reading", difficulty: 1 },

  // Medium
  { question: "What do you call a group of words that makes a complete thought?", options: ["A letter", "A sentence", "A paragraph", "A word"], answer: "A sentence", subject: "Reading", difficulty: 2 },
  { question: "Which word is the opposite of HOT?", options: ["Warm", "Cold", "Bright", "Fast"], answer: "Cold", subject: "Reading", difficulty: 2 },
  { question: "What punctuation mark goes at the end of a question?", options: [".", "!", "?", ","], answer: "?", subject: "Reading", difficulty: 2 },

  // Hard
  { question: "What does the prefix 'un-' mean in words like 'unhappy' or 'unkind'?", options: ["Very", "Again", "Not", "More"], answer: "Not", subject: "Reading", difficulty: 3 },
  { question: "What do you call the person who wrote a book?", options: ["Illustrator", "Publisher", "Author", "Editor"], answer: "Author", subject: "Reading", difficulty: 3 },
  { question: "Every story has a beginning, a middle, and a ___.", options: ["Title", "End", "Chapter", "Hero"], answer: "End", subject: "Reading", difficulty: 3 },

  // Bonus
  { question: "What is a synonym — a word that means the same — for 'happy'?", options: ["Sad", "Angry", "Joyful", "Tired"], answer: "Joyful", subject: "Reading", difficulty: 4 },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Pick `count` questions from pool, trying to avoid repeating the same subject back-to-back.
function pickTier(pool, count, prevSubject = null) {
  const shuffled = shuffle(pool);
  const picked = [];
  let lastSubject = prevSubject;

  // First pass: pick with subject variety
  for (const q of shuffled) {
    if (picked.length >= count) break;
    if (q.subject !== lastSubject) {
      picked.push(q);
      lastSubject = q.subject;
    }
  }

  // Second pass: fill any remaining slots without the variety constraint
  for (const q of shuffled) {
    if (picked.length >= count) break;
    if (!picked.includes(q)) picked.push(q);
  }

  return picked;
}

// Builds a 10-question game:
//   Q1-3  → Easy    (difficulty 1)
//   Q4-6  → Medium  (difficulty 2)
//   Q7-9  → Hard    (difficulty 3)
//   Q10   → Bonus   (difficulty 4)
// Subject variety is enforced across tier boundaries where possible.
export function buildGameQuestions() {
  const easy   = QUESTION_BANK.filter(q => q.difficulty === 1);
  const medium = QUESTION_BANK.filter(q => q.difficulty === 2);
  const hard   = QUESTION_BANK.filter(q => q.difficulty === 3);
  const bonus  = QUESTION_BANK.filter(q => q.difficulty === 4);

  const t1 = pickTier(easy,   3, null);
  const t2 = pickTier(medium, 3, t1[t1.length - 1]?.subject);
  const t3 = pickTier(hard,   3, t2[t2.length - 1]?.subject);
  const t4 = pickTier(bonus,  1, t3[t3.length - 1]?.subject);

  return [...t1, ...t2, ...t3, ...t4];
}
