import React, { useState, useEffect, useCallback } from 'react';
import { type Question, type Answer, type OperationType, type AllPracticeSettings, type PracticeStat } from '../types';
import { generateQuestion, areAnswersEqual, getRandomInt } from '../utils/mathHelpers';
import QuestionCard from './QuestionCard';

interface PracticeScreenProps {
  operations: OperationType[];
  allSettings: AllPracticeSettings;
  onEndPractice: (stats: PracticeStat[], totalTimeMs: number) => void;
}

const PracticeScreen: React.FC<PracticeScreenProps> = ({ operations, allSettings, onEndPractice }) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState(0);
  const [elapsedTimeMs, setElapsedTimeMs] = useState(0);
  const [questionStartTimeMs, setQuestionStartTimeMs] = useState(0);
  const [practiceStats, setPracticeStats] = useState<PracticeStat[]>([]);
  // const [answeredState, setAnsweredState] = useState<{ answer: Answer | null; correct: boolean | null } | null>(null); // Removed
  const [currentOperationForQuestion, setCurrentOperationForQuestion] = useState<OperationType | null>(null);

  const loadNextQuestion = useCallback(() => {
    if (operations.length === 0) { 
        console.warn("loadNextQuestion called with no operations. Ending practice.");
        onEndPractice([], elapsedTimeMs); 
        return;
    }
    // setAnsweredState(null); // No longer needed
    const randomOpIndex = getRandomInt(0, operations.length - 1);
    const selectedOp = operations[randomOpIndex];
    const settingsForOp = allSettings[selectedOp];
    
    setCurrentOperationForQuestion(selectedOp);
    const newQuestion = generateQuestion(selectedOp, settingsForOp);
    setCurrentQuestion(newQuestion);
    setQuestionStartTimeMs(Date.now());
  }, [operations, allSettings, onEndPractice, elapsedTimeMs]); // Keep elapsedTimeMs if used in onEndPractice fallback, but primarily driven by other deps

  useEffect(() => {
    if (operations.length > 0) {
        loadNextQuestion();
    } else {
        console.error("PracticeScreen rendered with no operations.");
        onEndPractice([], elapsedTimeMs); // Pass current time if ending immediately
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Load first question on mount based on initial operations

  useEffect(() => {
    const timerId = setInterval(() => {
      setElapsedTimeMs(prevTime => prevTime + 100);
    }, 100);
    return () => clearInterval(timerId);
  }, []);

  const handleAnswerSelect = (selectedAnswer: Answer) => {
    if (!currentQuestion) return; // Should not happen if a question is displayed

    const timeTakenMs = Date.now() - questionStartTimeMs;
    const isCorrect = areAnswersEqual(selectedAnswer, currentQuestion.correctAnswer, currentQuestion.decimalPlaces);

    // setAnsweredState({ answer: selectedAnswer, correct: isCorrect }); // No longer needed for UI delay

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    } else {
      setIncorrectAnswers(prev => prev + 1);
    }

    setPracticeStats(prevStats => [
      ...prevStats,
      { question: currentQuestion, userAnswer: selectedAnswer, isCorrect, timeTakenMs }
    ]);
    
    // Load next question immediately
    if (operations.length > 0) {
        loadNextQuestion();
    } else { // Should not happen during active practice
        onEndPractice(practiceStats, elapsedTimeMs);
    }
  };

  const formatTime = (timeMs: number): string => {
    const totalHundredths = Math.floor(timeMs / 100);
    const totalSeconds = Math.floor(totalHundredths / 10);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const getTopicDisplay = () => {
    if (operations.length > 1) return "Mixed Practice";
    if (operations.length === 1) return operations[0];
    return "N/A";
  }

  return (
    <div className="flex flex-col items-center space-y-6 p-4 w-full">
      <div className="w-full max-w-xl bg-white p-4 rounded-lg shadow-lg flex justify-between items-center">
        <div className="text-lg">
          <span className="font-semibold text-sky-700">Topic:</span> {getTopicDisplay()}
          {currentOperationForQuestion && operations.length > 1 && (
            <span className="text-sm text-gray-500 ml-2">({currentOperationForQuestion})</span>
          )}
        </div>
        <button
          onClick={() => onEndPractice(practiceStats, elapsedTimeMs)}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-150"
          aria-label="End Practice Session"
        >
          End Practice
        </button>
      </div>

      <div className="w-full max-w-xl bg-white p-4 rounded-lg shadow-lg flex justify-around text-center">
        <div>
          <p className="text-sm text-gray-500">Timer</p>
          <p className="text-2xl font-bold text-sky-600" aria-live="polite">{formatTime(elapsedTimeMs)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Correct</p>
          <p className="text-2xl font-bold text-green-500" aria-live="polite">{correctAnswers}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Incorrect</p>
          <p className="text-2xl font-bold text-red-500" aria-live="polite">{incorrectAnswers}</p>
        </div>
      </div>

      {currentQuestion && (
        <QuestionCard 
          question={currentQuestion} 
          onAnswerSelect={handleAnswerSelect}
          // answeredState prop removed
        />
      )}
      {!currentQuestion && operations.length > 0 && (
         <p className="text-lg text-gray-600">Loading question...</p>
      )}
       {!currentQuestion && operations.length === 0 && ( // Should be caught by App.tsx ideally
         <p className="text-lg text-red-600">No operations selected. Please go back to settings.</p>
      )}
    </div>
  );
};

export default PracticeScreen;