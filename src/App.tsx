import React, { useState, useCallback, useEffect } from 'react';
import { GameState, OperationType, type PracticeSettings, type AllPracticeSettings, type PracticeStat, type FinalStats, ALL_OPERATIONS } from './types';
import Header from './components/Header';
import SettingsForm, { initialGlobalSettings } from './components/SettingsForm';
import PracticeScreen from './components/PracticeScreen';
import ResultsScreen from './components/ResultsScreen';

// ErrorBoundary for catching runtime errors
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  componentDidCatch(error: any, info: any) {
    console.error('[ErrorBoundary] Caught error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{color: 'red', padding: 20}}>
        <h2>Something went wrong.</h2>
        <pre>{String(this.state.error)}</pre>
      </div>;
    }
    return this.props.children;
  }
}


const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.SETTINGS);
  console.log('[DEBUG] App rendering, gameState:', gameState);
  const [activeOperations, setActiveOperations] = useState<OperationType[] | null>(null);
  const [activePracticeAllSettings, setActivePracticeAllSettings] = useState<AllPracticeSettings | null>(null);
  const savedSettings = localStorage.getItem('mathAppSettings');
const [allSettings, setAllSettings] = useState<AllPracticeSettings>(
  savedSettings ? JSON.parse(savedSettings) : initialGlobalSettings
);
  
  const [finalStats, setFinalStats] = useState<FinalStats | null>(null);
  const [detailedPracticeStats, setDetailedPracticeStats] = useState<PracticeStat[]>([]);

  // Persist settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('mathAppSettings', JSON.stringify(allSettings));
  }, [allSettings]);

  const handleStartPractice = useCallback((operations: OperationType[], settings: AllPracticeSettings) => {
    setActiveOperations(operations);
    setActivePracticeAllSettings(settings);
    setAllSettings(settings); // Keep global settings state updated
    setGameState(GameState.PRACTICING);
  }, []);

  const handleEndPractice = useCallback((practiceData: PracticeStat[], totalTimeMs: number) => {
    const totalQuestions = practiceData.length;
    const correctAnswers = practiceData.filter(stat => stat.isCorrect).length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const avgTimePerQuestionMs = totalQuestions > 0 ? Math.round(totalTimeMs / totalQuestions) : 0;

    setFinalStats({
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      accuracy,
      totalPracticeTimeMs: totalTimeMs,
      avgTimePerQuestionMs,
    });
    setDetailedPracticeStats(practiceData);
    setGameState(GameState.RESULTS);
  }, []);

  const handleRestartSameSettings = useCallback(() => {
    if (activeOperations && activeOperations.length > 0 && activePracticeAllSettings) {
      setGameState(GameState.PRACTICING);
    } else {
      // Fallback if state is inconsistent
      setGameState(GameState.SETTINGS);
    }
  }, [activeOperations, activePracticeAllSettings]);

  const handleGoToSettings = useCallback(() => {
    setGameState(GameState.SETTINGS);
  }, []);

  const renderContent = () => {
    console.log('[DEBUG] renderContent called, gameState:', gameState);
    
    switch (gameState) {
      case GameState.SETTINGS:
        return <SettingsForm initialSettings={allSettings} onStartPractice={handleStartPractice} />;
      case GameState.PRACTICING:
        if (activeOperations && activeOperations.length > 0 && activePracticeAllSettings) {
          return <PracticeScreen operations={activeOperations} allSettings={activePracticeAllSettings} onEndPractice={handleEndPractice} />;
        }
        // Fallback if state is inconsistent
        setGameState(GameState.SETTINGS); 
        return <SettingsForm initialSettings={allSettings} onStartPractice={handleStartPractice} />;
      case GameState.RESULTS:
        if (finalStats) {
          return <ResultsScreen stats={finalStats} detailedStats={detailedPracticeStats} onRestartSameSettings={handleRestartSameSettings} onGoToSettings={handleGoToSettings} />;
        }
        // Fallback if stats are missing
        setGameState(GameState.SETTINGS);
        return <SettingsForm initialSettings={allSettings} onStartPractice={handleStartPractice} />;
      default:
        return <p>Loading...</p>;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          {renderContent()}
        </main>
        <footer className="text-center py-4 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} Math Whiz Practice. Sharpen Your Skills!</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default App;