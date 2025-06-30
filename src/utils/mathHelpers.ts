import { OperationType, type Question, type Answer, type FractionType, type PracticeSettings } from '../types';

export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min: number, max: number, decimalPlaces: number): number {
  const factor = Math.pow(10, decimalPlaces);
  const value = Math.random() * (max - min) + min;
  return Math.round(value * factor) / factor;
}

export function getDisplayDecimalPlaces(decimalPlaces: number): number {
  return Math.max(2, decimalPlaces * 2); // Always at least 2 for safety
}


function shuffleArray<T,>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, Math.abs(a % b));
}

export function simplifyFraction(num: number, den: number): FractionType {
  if (den === 0) {
    console.error("Attempted to simplify fraction with zero denominator.");
    return { numerator: num, denominator: 1 }; // Or handle as an error appropriately
  }
  if (num === 0) return { numerator: 0, denominator: 1 };
  
  const commonDivisor = gcd(num, den);
  let simplifiedNum = num / commonDivisor;
  let simplifiedDen = den / commonDivisor;

  if (simplifiedDen < 0) {
    simplifiedNum = -simplifiedNum;
    simplifiedDen = -simplifiedDen;
  }
  return { numerator: simplifiedNum, denominator: simplifiedDen };
}

export function formatAnswer(answer: Answer, fixedDecimalPlaces?: number, showFullPrecision?: boolean): string {
  // Always round decimal operation answers to the given decimal places, even for 'full precision' mode

  if (typeof answer === 'number') {
    if (showFullPrecision) {
      // Show full precision, avoid unnecessary rounding
      return answer.toString();
    }
    if (fixedDecimalPlaces !== undefined && fixedDecimalPlaces !== null) {
      return answer.toFixed(fixedDecimalPlaces);
    }
    if (Number.isInteger(answer)) {
      return answer.toString();
    }
    if (Math.abs(answer) < 0.001 && answer !== 0) return answer.toExponential(2);

    const s = answer.toFixed(2); 
    if (s.endsWith('.00')) return answer.toFixed(0);
    if (s.endsWith('0')) return answer.toFixed(1);
    return s;
  }
  
  if (typeof answer === 'object' && 'numerator' in answer && 'denominator' in answer) {
    const f = answer as FractionType;
    if (f.denominator === 1) return f.numerator.toString();
    return `${f.numerator}/${f.denominator}`; 
  }

  console.warn("formatAnswer received an unexpected type:", answer);
  return String(answer); 
}

export function areAnswersEqual(ans1: Answer, ans2: Answer, decimalPlaces?: number): boolean {
  if (typeof ans1 === 'number' && typeof ans2 === 'number') {
    if (decimalPlaces !== undefined && decimalPlaces !== null) {
      const factor = Math.pow(10, decimalPlaces);
      return Math.round(ans1 * factor) === Math.round(ans2 * factor);
    }
    return Math.abs(ans1 - ans2) < 0.001; 
  }
  if (typeof ans1 === 'object' && typeof ans2 === 'object' && 'numerator' in ans1 && 'denominator' in ans1 && 'numerator' in ans2 && 'denominator' in ans2) { 
    const simp1 = simplifyFraction(ans1.numerator, ans1.denominator);
    const simp2 = simplifyFraction(ans2.numerator, ans2.denominator);
    return simp1.numerator === simp2.numerator && simp1.denominator === simp2.denominator;
  }
  return false;
}

function generateNumericDistractors(correctAnswer: number, count: number, range: number = 10): number[] {
  const distractors: Set<number> = new Set();
  if (count === 0) return [];
  while (distractors.size < count) {
    const offsetMagnitude = getRandomInt(1, Math.max(1, Math.abs(Math.round(correctAnswer * 0.2)), range));
    const offset = offsetMagnitude * (Math.random() < 0.5 ? 1: -1);
    
    let distractor = correctAnswer + offset;
    if (Number.isInteger(correctAnswer)) distractor = Math.round(distractor);

    if (distractor !== correctAnswer && !Array.from(distractors).some(d => areAnswersEqual(d, distractor))) {
      distractors.add(distractor);
    } else if (distractors.size < count) { 
        const randomDistractor = correctAnswer + getRandomInt(1,5) * (Math.random() < 0.5 ? 1 : -1) + (Math.random() > 0.5 ? 0.5 : 0);
        if (randomDistractor !== correctAnswer && !Array.from(distractors).some(d => areAnswersEqual(d, randomDistractor))) {
            distractors.add(Number.isInteger(correctAnswer) ? Math.round(randomDistractor) : randomDistractor);
        }
    }
  }
  return Array.from(distractors);
}

function generateDecimalDistractors(correctAnswer: number, count: number, decimalPlaces: number): number[] {
  const distractors: Set<number> = new Set();
  const factor = Math.pow(10, decimalPlaces);
  if (count === 0) return [];

  while (distractors.size < count) {
    const offsetMagnitudeScaled = getRandomInt(1, 10 + Math.abs(Math.round(correctAnswer*factor*0.1)));
    const offset = (offsetMagnitudeScaled / factor) * (Math.random() < 0.5 ? 1 : -1);
    let distractor = parseFloat((correctAnswer + offset).toFixed(decimalPlaces));

    if (!areAnswersEqual(distractor, correctAnswer, decimalPlaces) && !Array.from(distractors).some(d => areAnswersEqual(d, distractor, decimalPlaces))) {
      distractors.add(distractor);
    }
  }
  return Array.from(distractors);
}

function generateSquareRootDistractors(actualRoot: number, count: number): number[] {
  const distractors: Set<number> = new Set();
  const correctChoiceRounded = parseFloat(actualRoot.toFixed(1)); 
  if (count === 0) return [];

  const candidates: number[] = [];
  candidates.push(parseFloat(Math.floor(actualRoot).toFixed(1)));
  candidates.push(parseFloat(Math.ceil(actualRoot).toFixed(1)));
  candidates.push(parseFloat((correctChoiceRounded - 0.5).toFixed(1)));
  candidates.push(parseFloat((correctChoiceRounded + 0.5).toFixed(1)));
  candidates.push(parseFloat((correctChoiceRounded - 1.0).toFixed(1)));
  candidates.push(parseFloat((correctChoiceRounded + 1.0).toFixed(1)));
  
  if (actualRoot > 5) {
    candidates.push(parseFloat((correctChoiceRounded - 2.0).toFixed(1)));
    candidates.push(parseFloat((correctChoiceRounded + 2.0).toFixed(1)));
  }

  shuffleArray(candidates);

  for (const cand of candidates) {
    if (distractors.size >= count) break;
    if (Math.abs(cand - correctChoiceRounded) > 0.05 && !Array.from(distractors).some(d => Math.abs(d - cand) < 0.05) ) {
       if (cand >=0) distractors.add(cand);
    }
  }
  
  let attempts = 0;
  while(distractors.size < count && attempts < 20) {
    const randomOffset = (getRandomInt(1, 5) * 0.5 + getRandomInt(0,1)) * (Math.random() < 0.5 ? -1 : 1);
    let newDistractor = parseFloat(Math.max(0, correctChoiceRounded + randomOffset).toFixed(1));
    if (Math.abs(newDistractor - correctChoiceRounded) > 0.05 && !Array.from(distractors).some(d => Math.abs(d - newDistractor) < 0.05)) {
        distractors.add(newDistractor);
    }
    attempts++;
  }

  return Array.from(distractors).slice(0, count);
}


function generateFractionDistractors(correctAnswer: FractionType, count: number, numRange: {lower: number, upper: number}, denRange: {lower: number, upper: number}): FractionType[] {
  const distractors: FractionType[] = [];
  const simplifiedCorrect = simplifyFraction(correctAnswer.numerator, correctAnswer.denominator);
  if (count === 0) return [];

  while (distractors.length < count) {
    let num = simplifiedCorrect.numerator;
    let den = simplifiedCorrect.denominator;

    const changeType = getRandomInt(1, 4);
    switch (changeType) {
      case 1: num += getRandomInt(1, 3) * (Math.random() < 0.5 ? 1 : -1); break;
      case 2: den += getRandomInt(1, 2) * (Math.random() < 0.5 ? 1 : -1); break;
      case 3: num *= -1; break; 
      case 4: 
        num = getRandomInt(numRange.lower, numRange.upper);
        den = getRandomInt(denRange.lower, denRange.upper);
        break;
    }
    
    if (den === 0) den = 1; 
    const distractor = simplifyFraction(num, den);

    if (!areAnswersEqual(distractor, correctAnswer) && !distractors.some(d => areAnswersEqual(d, distractor))) {
      distractors.push(distractor);
    }
  }
  return distractors;
}


export function generateQuestion(operationType: OperationType, settings: PracticeSettings): Question {
  const id = Date.now().toString() + Math.random().toString();
  let questionParts: (string | FractionType)[] = [];
  let correctAnswer: Answer;
  let choices: Answer[] = [];
  const numDistractors = 3;
  let questionDecimalPlaces: number | undefined = undefined;


  const { 
    lower, upper, 
    exponentPowerLower = 0, exponentPowerUpper = 3,
    fractionNumeratorLower = 1, fractionNumeratorUpper = 10,
    fractionDenominatorLower = 2, fractionDenominatorUpper = 10,
    decimalPlaces = 1, 
  } = settings;


  switch (operationType) {
    case OperationType.ADDITION: {
      const num1 = getRandomInt(lower, upper);
      const num2 = getRandomInt(lower, upper);
      correctAnswer = num1 + num2;
      questionParts = [`${num1} + ${num2} = ?`];
      choices = [correctAnswer, ...generateNumericDistractors(correctAnswer, numDistractors)];
      break;
    }
    case OperationType.SUBTRACTION: {
      const num1 = getRandomInt(lower, upper);
      const num2 = getRandomInt(lower, upper);
      correctAnswer = num1 - num2;
      questionParts = [`${num1} - ${num2} = ?`];
      choices = [correctAnswer, ...generateNumericDistractors(correctAnswer, numDistractors)];
      break;
    }
    case OperationType.MULTIPLICATION: {
      const num1 = getRandomInt(lower, upper);
      const num2 = getRandomInt(lower, upper);
      correctAnswer = num1 * num2;
      questionParts = [`${num1} × ${num2} = ?`];
      choices = [correctAnswer, ...generateNumericDistractors(correctAnswer, numDistractors)];
      break;
    }
    case OperationType.DIVISION: {
      let num2 = getRandomInt(lower, upper);
      while (num2 === 0) num2 = getRandomInt(Math.max(1, lower), upper); 
      
      const resultLowerBound = Math.max(1, Math.floor(lower / (num2 === 0 ? 1 : Math.abs(num2))));
      const resultUpperBound = Math.max(resultLowerBound, Math.floor(upper / (num2 === 0 ? 1 : Math.abs(num2))), 5);

      const result = getRandomInt(resultLowerBound, resultUpperBound);
      
      const num1 = num2 * result;
      correctAnswer = result;
      questionParts = [`${num1} ÷ ${num2} = ?`];
      choices = [correctAnswer, ...generateNumericDistractors(correctAnswer, numDistractors, 5)];
      break;
    }
    case OperationType.EXPONENT: {
      const base = getRandomInt(lower, upper);
      const actualExpLower = Math.max(0, exponentPowerLower); 
      const actualExpUpper = Math.max(actualExpLower, exponentPowerUpper);
      const exponent = getRandomInt(actualExpLower, actualExpUpper);
      correctAnswer = Math.pow(base, exponent);
      questionParts = [`${base} ^ ${exponent} = ?`];
      choices = [correctAnswer, ...generateNumericDistractors(correctAnswer, numDistractors, Math.abs(correctAnswer) > 10 ? Math.round(Math.abs(correctAnswer)/4) : 10)];
      break;
    }
    case OperationType.FRACTIONS: {
      const n1 = getRandomInt(fractionNumeratorLower, fractionNumeratorUpper);
      const d1 = getRandomInt(Math.max(1, fractionDenominatorLower), fractionDenominatorUpper);
      const n2 = getRandomInt(fractionNumeratorLower, fractionNumeratorUpper);
      const d2 = getRandomInt(Math.max(1, fractionDenominatorLower), fractionDenominatorUpper);

      const f1Raw: FractionType = {numerator: n1, denominator: d1};
      const f2Raw: FractionType = {numerator: n2, denominator: d2};

      const ops = ['+', '-', '×', '÷'] as const;
      const op = ops[getRandomInt(0, ops.length - 1)];
      
      let resNum, resDen;
      switch (op) {
        case '+':
          resNum = f1Raw.numerator * f2Raw.denominator + f2Raw.numerator * f1Raw.denominator;
          resDen = f1Raw.denominator * f2Raw.denominator;
          break;
        case '-':
          resNum = f1Raw.numerator * f2Raw.denominator - f2Raw.numerator * f1Raw.denominator;
          resDen = f1Raw.denominator * f2Raw.denominator;
          break;
        case '×':
          resNum = f1Raw.numerator * f2Raw.numerator;
          resDen = f1Raw.denominator * f2Raw.denominator;
          break;
        case '÷':
          let safeN2 = f2Raw.numerator;
          let safeD2 = f2Raw.denominator;
          if (safeN2 === 0) { 
            safeN2 = getRandomInt(Math.max(1, fractionNumeratorLower), fractionNumeratorUpper);
            safeD2 = getRandomInt(Math.max(1, fractionDenominatorLower), fractionDenominatorUpper);
          }
          resNum = f1Raw.numerator * safeD2;
          resDen = f1Raw.denominator * safeN2;
          if (resDen === 0) { 
             resDen = 1; 
          }
          break;
      }
      correctAnswer = simplifyFraction(resNum, resDen);
      
      const displayOperand = (f: FractionType): string | FractionType => {
        const simplified = simplifyFraction(f.numerator, f.denominator);
        if (simplified.numerator === 0) return "0";
        if (simplified.denominator === 1) return simplified.numerator.toString();
        return simplified;
      };

      const f1Part = displayOperand(f1Raw);
      const f2Part = displayOperand(f2Raw);
      
      questionParts = ["(", f1Part, `) ${op} (`, f2Part, ") = ?"];
      choices = [correctAnswer, ...generateFractionDistractors(correctAnswer as FractionType, numDistractors, 
        {lower: fractionNumeratorLower, upper: fractionNumeratorUpper}, 
        {lower: Math.max(1,fractionDenominatorLower), upper: fractionDenominatorUpper}
      )];
      break;
    }
    case OperationType.SQUARE_ROOT: {
      const radicandLower = Math.max(1, lower);
      const radicandUpper = Math.max(radicandLower + 1, upper); 
      const radicand = getRandomInt(radicandLower, radicandUpper);
      const actualRoot = Math.sqrt(radicand);
      
      correctAnswer = parseFloat(actualRoot.toFixed(1));
      questionParts = [`√${radicand} = ?`];
      questionDecimalPlaces = 1; 
      choices = [correctAnswer, ...generateSquareRootDistractors(actualRoot, numDistractors)];
      break;
    }
    case OperationType.DECIMALS: {
      questionDecimalPlaces = Math.max(1, Math.min(5, decimalPlaces));
      const num1 = getRandomFloat(lower, upper, questionDecimalPlaces);
      const num2 = getRandomFloat(lower, upper, questionDecimalPlaces);
      
      const ops = ['+', '-', '×'] as const;
      const op = ops[getRandomInt(0, ops.length - 1)];
      let calcResult: number;

      switch (op) {
        case '+': calcResult = num1 + num2; break;
        case '-': calcResult = num1 - num2; break;
        case '×': calcResult = num1 * num2; break;
      }
      const displayDecimalPlaces = getDisplayDecimalPlaces(questionDecimalPlaces);
      const roundedCorrect = Number(calcResult.toFixed(displayDecimalPlaces));
      const distractors = generateDecimalDistractors(roundedCorrect, numDistractors, displayDecimalPlaces);
      const filteredDistractors = distractors.filter((d: number) => Math.abs(d - roundedCorrect) > Math.pow(10, -displayDecimalPlaces));
      choices = shuffleArray([roundedCorrect, ...filteredDistractors]);
      correctAnswer = roundedCorrect; 
      questionParts = [`${num1.toFixed(questionDecimalPlaces)} ${op} ${num2.toFixed(questionDecimalPlaces)} = ?`];
      break;
    }
    default:
      console.error("Unknown operation type in generateQuestion:", operationType);
      throw new Error("Unknown operation type");
  }

  return {
    id,
    parts: questionParts,
    choices: shuffleArray(choices),
    correctAnswer,
    operation: operationType,
    decimalPlaces: questionDecimalPlaces,
  };
}