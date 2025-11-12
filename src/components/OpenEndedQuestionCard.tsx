import React, { useState, useEffect, useRef } from 'react';
import { type Question, type Answer, type FractionType } from '../types';
import { areAnswersEqual, formatAnswer } from '../utils/mathHelpers';
import VerticalFraction from './VerticalFraction';

interface OpenEndedQuestionCardProps {
  question: Question;
  onAnswerSubmit: (answer: Answer, isCorrect: boolean) => void;
}

const OpenEndedQuestionCard: React.FC<OpenEndedQuestionCardProps> = ({ question, onAnswerSubmit }) => {
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when a new question loads
  useEffect(() => {
    setUserInput('');
    setFeedback(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [question.id]);

  const isFractionType = (part: string | FractionType): part is FractionType => {
    return typeof part === 'object' && part !== null && 'numerator' in part;
  };

  const parseUserAnswer = (input: string): Answer | null => {
    const trimmed = input.trim();
    
    // Check if it's a fraction (e.g., "3/4" or "3 / 4")
    const fractionMatch = trimmed.match(/^(-?\d+)\s*\/\s*(\d+)$/);
    if (fractionMatch) {
      const numerator = parseInt(fractionMatch[1], 10);
      const denominator = parseInt(fractionMatch[2], 10);
      if (denominator === 0) return null;
      return { numerator, denominator };
    }
    
    // Try to parse as a number
    const num = parseFloat(trimmed);
    if (!isNaN(num)) {
      return num;
    }
    
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userInput.trim()) {
      setFeedback({ message: 'Please enter an answer', isCorrect: false });
      return;
    }

    const parsedAnswer = parseUserAnswer(userInput);
    
    if (parsedAnswer === null) {
      setFeedback({ message: 'Invalid answer format', isCorrect: false });
      return;
    }

    const isCorrect = areAnswersEqual(parsedAnswer, question.correctAnswer, question.decimalPlaces);
    
    if (isCorrect) {
      setFeedback({ message: 'Correct!', isCorrect: true });
    } else {
      const correctAnswerStr = typeof question.correctAnswer === 'object' && 'numerator' in question.correctAnswer
        ? `${question.correctAnswer.numerator}/${question.correctAnswer.denominator}`
        : formatAnswer(question.correctAnswer, question.decimalPlaces);
      setFeedback({ message: `Incorrect. The answer is ${correctAnswerStr}`, isCorrect: false });
    }

    // Submit the answer after a brief delay to show feedback
    setTimeout(() => {
      onAnswerSubmit(parsedAnswer, isCorrect);
    }, 1000);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-xl">
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center min-h-[3em] flex items-center justify-center flex-wrap">
        {question.parts.map((part, index) => (
          <React.Fragment key={index}>
            {isFractionType(part) ? (
              <VerticalFraction fraction={part} />
            ) : (
              <span className="mx-1">{part}</span>
            )}
          </React.Fragment>
        ))}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="answer-input" className="block text-sm font-medium text-gray-700 mb-2">
            Your Answer:
          </label>
          <input
            ref={inputRef}
            id="answer-input"
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            placeholder="Enter your answer"
            disabled={feedback !== null}
            autoComplete="off"
          />
          <p className="text-xs text-gray-500 mt-1">
            For fractions, use format: 3/4
          </p>
        </div>

        {feedback && (
          <div className={`p-3 rounded-lg text-center font-semibold ${
            feedback.isCorrect 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {feedback.message}
          </div>
        )}

        <button
          type="submit"
          disabled={feedback !== null}
          className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150"
        >
          Submit Answer
        </button>
      </form>
    </div>
  );
};

export default OpenEndedQuestionCard;
