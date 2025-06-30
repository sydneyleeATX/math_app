import React from 'react';
import { type FinalStats, type PracticeStat, type Answer, type FractionType } from '../types';
import { formatAnswer } from '../utils/mathHelpers';
import { OperationType } from '../types';
import VerticalFraction from './VerticalFraction';

interface ResultsScreenProps {
  stats: FinalStats;
  detailedStats: PracticeStat[];
  onRestartSameSettings: () => void;
  onGoToSettings: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ stats, detailedStats, onRestartSameSettings, onGoToSettings }) => {
  const formatTime = (timeMs: number): string => {
    if (timeMs < 0) timeMs = 0; 
    if (timeMs < 1000) return `${timeMs} ms`;
    const totalSeconds = (timeMs / 1000);
    if (timeMs < 60000) return `${totalSeconds.toFixed(1)} s`;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(0);
    return `${minutes}m ${seconds.padStart(2, '0')}s`;
  };

  const isAnswerFraction = (answer: Answer): answer is FractionType => {
    return typeof answer === 'object' && answer !== null && 'numerator' in answer && 'denominator' in answer;
  };

  const isPartFraction = (part: string | FractionType): part is FractionType => {
    return typeof part === 'object' && part !== null && 'numerator' in part;
  }

  const renderAnswer = (answer: Answer, decimalPlaces?: number, showFullPrecision?: boolean) => {
    if (isAnswerFraction(answer)) {
      return <VerticalFraction fraction={answer} />;
    }
    return formatAnswer(answer, decimalPlaces, showFullPrecision);
  };

  const renderQuestionParts = (parts: (string | FractionType)[]) => {
    return parts.map((part, index) => (
      <React.Fragment key={index}>
        {isPartFraction(part) ? <VerticalFraction fraction={part} /> : <span className="mx-px">{part}</span>}
      </React.Fragment>
    ));
  };


  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl max-w-lg mx-auto text-center">
      <h2 className="text-3xl font-bold text-sky-700 mb-6">Practice Results</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6 text-left">
        <div className="bg-sky-50 p-4 rounded-lg shadow">
          <p className="text-sm text-sky-600 font-medium">Total Questions</p>
          <p className="text-2xl font-bold text-sky-800">{stats.totalQuestions}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <p className="text-sm text-green-600 font-medium">Correct Answers</p>
          <p className="text-2xl font-bold text-green-800">{stats.correctAnswers}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <p className="text-sm text-red-600 font-medium">Incorrect Answers</p>
          <p className="text-2xl font-bold text-red-800">{stats.incorrectAnswers}</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg shadow">
          <p className="text-sm text-indigo-600 font-medium">Accuracy</p>
          <p className="text-2xl font-bold text-indigo-800">{stats.accuracy.toFixed(1)}%</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg shadow col-span-2">
          <p className="text-sm text-amber-600 font-medium">Total Practice Time</p>
          <p className="text-2xl font-bold text-amber-800">{formatTime(stats.totalPracticeTimeMs)}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg shadow col-span-2">
          <p className="text-sm text-purple-600 font-medium">Average Time per Question</p>
          <p className="text-2xl font-bold text-purple-800">{formatTime(stats.avgTimePerQuestionMs)}</p>
        </div>
      </div>

      {detailedStats.length > 0 && (
        <details className="mb-6 text-left">
          <summary className="cursor-pointer text-sky-600 hover:text-sky-800 font-medium">
            View Question Details
          </summary>
          <div className="mt-2 space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md bg-gray-50">
            {detailedStats.map((stat, index) => (
              <div key={index} className={`p-2 rounded ${stat.isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                <p className="text-sm font-semibold flex flex-wrap items-center">
                  {renderQuestionParts(stat.question.parts)}
                </p>
                <p className="text-xs">
                  Your answer: {renderAnswer(stat.userAnswer, stat.question.decimalPlaces)} 
                  {!stat.isCorrect && (
                    <> (Incorrect, Correct: {renderAnswer(stat.question.correctAnswer, stat.question.decimalPlaces, stat.question.operation === OperationType.DECIMALS)})</>
                  )}
                  {stat.isCorrect && " (Correct)"}
                </p>
                <p className="text-xs">Time: {formatTime(stat.timeTakenMs)}</p>
              </div>
            ))}
          </div>
        </details>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onRestartSameSettings}
          className="w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150"
        >
          Practice Again (Same Settings)
        </button>
        <button
          onClick={onGoToSettings}
          className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg shadow-md transition duration-150"
        >
          Change Settings
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;