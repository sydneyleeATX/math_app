import React from 'react';
import { type Question, type Answer, type FractionType } from '../types';
import { formatAnswer } from '../utils/mathHelpers';
import VerticalFraction from './VerticalFraction';

interface QuestionCardProps {
  question: Question;
  onAnswerSelect: (answer: Answer) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswerSelect }) => {
  
  const getButtonClass = () => {
    // Added: aspect-square, flex, items-center, justify-center
    // Removed: w-full, text-left
    // Adjusted padding p-3 for better content fit in a square
    return "aspect-square flex items-center justify-center p-3 rounded-lg border-2 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white hover:bg-sky-50 border-sky-300 hover:border-sky-500 text-sky-700 font-medium";
  };

  const isFraction = (answer: Answer): answer is FractionType => {
    return typeof answer === 'object' && answer !== null && 'numerator' in answer && 'denominator' in answer;
  };

  const isFractionType = (part: string | FractionType): part is FractionType => {
    return typeof part === 'object' && part !== null && 'numerator' in part;
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
      {/* Changed grid layout to always be grid-cols-2 */}
      <div className="grid grid-cols-2 gap-4">
        {question.choices.map((choice, index) => (
          <button
            key={index}
            onClick={() => onAnswerSelect(choice)}
            className={getButtonClass()}
            aria-label={`Answer choice ${index + 1}: ${isFraction(choice) ? `${choice.numerator} over ${choice.denominator}` : formatAnswer(choice, question.decimalPlaces)}`}
          >
            {/* The span content will be centered by the button's flex properties */}
            <span className="text-lg text-center"> 
              {isFraction(choice) ? (
                <VerticalFraction fraction={choice} />
              ) : (
                formatAnswer(choice, question.decimalPlaces)
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
