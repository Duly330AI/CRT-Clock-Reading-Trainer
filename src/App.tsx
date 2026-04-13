import React, { useState, useEffect, useRef } from 'react';
import { Clock } from './components/Clock';
import { Difficulty, TimeState, generateRandomTime, getValidAnswers, checkAnswer, getPrimaryAnswer, generateMultipleChoice } from './utils/timeLogic';
import { Clock as ClockIcon, CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy, Play, Baby } from 'lucide-react';

type GameState = 'start' | 'playing' | 'result';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('start');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [time, setTime] = useState<TimeState>({ hour: 12, minute: 0, isAM: true });
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [mcOptions, setMcOptions] = useState<string[]>([]);
  const maxRounds = 10;
  
  const inputRef = useRef<HTMLInputElement>(null);

  const startGame = (selectedDifficulty: Difficulty) => {
    const newTime = generateRandomTime(selectedDifficulty);
    setDifficulty(selectedDifficulty);
    setScore(0);
    setRound(1);
    setFeedback(null);
    setUserInput('');
    setTime(newTime);
    if (selectedDifficulty === 'kids') {
      setMcOptions(generateMultipleChoice(newTime, selectedDifficulty));
    }
    setGameState('playing');
  };

  const handleTextSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim() || feedback) return;
    processAnswer(userInput);
  };

  const handleMcClick = (answer: string) => {
    if (feedback) return;
    setUserInput(answer); // For visual feedback
    processAnswer(answer);
  };

  const processAnswer = (answer: string) => {
    const validAnswers = getValidAnswers(time, difficulty);
    const isCorrect = checkAnswer(answer, validAnswers);

    if (isCorrect) {
      setFeedback('correct');
      setScore(s => s + 1);
    } else {
      setFeedback('incorrect');
    }
  };

  const handleNext = () => {
    if (round >= maxRounds) {
      setGameState('result');
    } else {
      const newTime = generateRandomTime(difficulty);
      setRound(r => r + 1);
      setFeedback(null);
      setUserInput('');
      setTime(newTime);
      if (difficulty === 'kids') {
        setMcOptions(generateMultipleChoice(newTime, difficulty));
      }
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && !feedback && difficulty !== 'kids' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState, feedback, difficulty]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ClockIcon className="w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-tight">Clock Reading Trainer</h1>
          </div>
          {gameState === 'playing' && (
            <div className="flex justify-between items-center text-blue-100 text-sm font-medium mt-4">
              <span>Round {round}/{maxRounds}</span>
              <span>Score: {score}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          
          {/* Start Screen */}
          {gameState === 'start' && (
            <div className="flex flex-col items-center space-y-6">
              <p className="text-center text-slate-600 mb-4">
                Learn how to read and express time in English. Choose a difficulty to begin!
              </p>
              
              <div className="w-full space-y-3">
                <button
                  onClick={() => startGame('kids')}
                  className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-300 transition-colors group"
                >
                  <div className="text-left">
                    <div className="font-bold text-purple-700 text-lg flex items-center gap-2">
                      <Baby className="w-5 h-5" /> Kids Mode
                    </div>
                    <div className="text-purple-600 text-sm">Multiple choice buttons, no typing</div>
                  </div>
                  <Play className="w-6 h-6 text-purple-500 group-hover:text-purple-600" />
                </button>

                <button
                  onClick={() => startGame('easy')}
                  className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 transition-colors group"
                >
                  <div className="text-left">
                    <div className="font-bold text-emerald-700 text-lg">Easy</div>
                    <div className="text-emerald-600 text-sm">Strict 15-minute intervals (type answer)</div>
                  </div>
                  <Play className="w-6 h-6 text-emerald-500 group-hover:text-emerald-600" />
                </button>

                <button
                  onClick={() => startGame('medium')}
                  className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:border-amber-300 transition-colors group"
                >
                  <div className="text-left">
                    <div className="font-bold text-amber-700 text-lg">Medium</div>
                    <div className="text-amber-600 text-sm">5-minute intervals</div>
                  </div>
                  <Play className="w-6 h-6 text-amber-500 group-hover:text-amber-600" />
                </button>

                <button
                  onClick={() => startGame('hard')}
                  className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-rose-200 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 transition-colors group"
                >
                  <div className="text-left">
                    <div className="font-bold text-rose-700 text-lg">Hard</div>
                    <div className="text-rose-600 text-sm">Includes AM/PM expressions</div>
                  </div>
                  <Play className="w-6 h-6 text-rose-500 group-hover:text-rose-600" />
                </button>
              </div>
            </div>
          )}

          {/* Playing Screen */}
          {gameState === 'playing' && (
            <div className="flex flex-col items-center">
              <div className="mb-8">
                <Clock time={time} size={220} />
              </div>

              {difficulty === 'kids' ? (
                // Kids Mode: Multiple Choice
                <div className="w-full space-y-3">
                  <p className="text-center text-sm font-medium text-slate-700 mb-2">What time is it?</p>
                  <div className="grid grid-cols-1 gap-3">
                    {mcOptions.map((option, idx) => {
                      let btnClass = "w-full p-4 rounded-xl border-2 text-left font-medium transition-all ";
                      
                      if (!feedback) {
                        btnClass += "border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50";
                      } else {
                        const isCorrectOption = option === getPrimaryAnswer(time, difficulty);
                        const isSelectedOption = option === userInput;
                        
                        if (isCorrectOption) {
                          btnClass += "border-emerald-500 bg-emerald-50 text-emerald-800";
                        } else if (isSelectedOption && !isCorrectOption) {
                          btnClass += "border-rose-500 bg-rose-50 text-rose-800";
                        } else {
                          btnClass += "border-slate-200 bg-slate-50 text-slate-400 opacity-50";
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={feedback !== null}
                          onClick={() => handleMcClick(option)}
                          className={btnClass}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                // Normal Mode: Text Input
                <form onSubmit={handleTextSubmit} className="w-full space-y-4">
                  <div>
                    <label htmlFor="timeInput" className="block text-sm font-medium text-slate-700 mb-1">
                      What time is it?
                    </label>
                    <input
                      ref={inputRef}
                      id="timeInput"
                      type="text"
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      disabled={feedback !== null}
                      placeholder="e.g. quarter past three"
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
                      autoComplete="off"
                    />
                  </div>

                  {!feedback && (
                    <button
                      type="submit"
                      disabled={!userInput.trim()}
                      className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      Check Answer
                    </button>
                  )}
                </form>
              )}

              {/* Feedback Area (Shared) */}
              {feedback && (
                <div className="w-full mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className={`p-4 rounded-xl border-2 flex items-start gap-3 ${
                    feedback === 'correct' 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    {feedback === 'correct' ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold text-lg">
                        {feedback === 'correct' ? 'Correct! 🎉' : 'Not quite!'}
                      </p>
                      <p className="text-sm mt-1 opacity-90">
                        {feedback === 'correct' ? (
                          `${time.hour}:${time.minute.toString().padStart(2, '0')} = ${getPrimaryAnswer(time, difficulty)}`
                        ) : (
                          <>Correct answer: <span className="font-bold">{getPrimaryAnswer(time, difficulty)}</span></>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {round >= maxRounds ? 'See Results' : 'Next Question'}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Result Screen */}
          {gameState === 'result' && (
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6">
                <Trophy className="w-12 h-12 text-amber-500" />
              </div>
              
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Training Complete!</h2>
              <p className="text-slate-600 mb-8">
                You scored <span className="font-bold text-blue-600 text-xl">{score}</span> out of {maxRounds}
              </p>

              <button
                onClick={() => setGameState('start')}
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
              >
                <RotateCcw className="w-6 h-6" />
                Play Again
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
