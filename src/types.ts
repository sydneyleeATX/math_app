export enum OperationType {
  ADDITION = 'Addition',
  SUBTRACTION = 'Subtraction',
  MULTIPLICATION = 'Multiplication',
  DIVISION = 'Division',
  EXPONENT = 'Exponent',
  FRACTIONS = 'Fractions',
  SQUARE_ROOT = 'Square Root',
  DECIMALS = 'Decimal Operations',
}

export const ALL_OPERATIONS: OperationType[] = [
  OperationType.ADDITION,
  OperationType.SUBTRACTION,
  OperationType.MULTIPLICATION,
  OperationType.DIVISION,
  OperationType.EXPONENT,
  OperationType.FRACTIONS,
  OperationType.SQUARE_ROOT,
  OperationType.DECIMALS,
];

export interface FractionType { // Renamed from Fraction to FractionType
  numerator: number;
  denominator: number;
}

export type Answer = number | FractionType;

export interface Question {
  id: string;
  parts: (string | FractionType)[]; // Changed from text: string
  choices: Answer[];
  correctAnswer: Answer;
  operation: OperationType;
  decimalPlaces?: number; // For decimal operations to guide formatting
}

export interface PracticeSettings {
  lower: number;
  upper: number;
  // Specific for exponents (base limits are lower/upper, exponent power has its own limits)
  exponentPowerLower?: number; 
  exponentPowerUpper?: number;
  // Specific for fractions (numerator/denominator limits)
  fractionNumeratorLower?: number;
  fractionNumeratorUpper?: number;
  fractionDenominatorLower?: number; // Should be > 0
  fractionDenominatorUpper?: number;
  // Specific for decimals
  decimalPlaces?: number; // Number of decimal places for operands and results
}

export type AllPracticeSettings = {
  [key in OperationType]: PracticeSettings;
};

export enum GameState {
  SETTINGS = 'SETTINGS',
  PRACTICING = 'PRACTICING',
  RESULTS = 'RESULTS',
}

export interface PracticeStat {
  question: Question;
  userAnswer: Answer;
  isCorrect: boolean;
  timeTakenMs: number;
}

export interface FinalStats {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number; // Percentage
  totalPracticeTimeMs: number;
  avgTimePerQuestionMs: number;
}