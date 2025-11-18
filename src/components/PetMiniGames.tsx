/**
 * Pet Mini-Games Component
 * Step 225 - Create interactive mini-games for pets
 */

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

// Mini-game interface
export interface MiniGame {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  rewards: {
    xp: number;
    happiness: number;
    coins: number;
  };
  energyCost: number;
}

// Mini-games list
const MINI_GAMES: MiniGame[] = [
  {
    id: 'fetch',
    name: 'Fetch Game',
    description: 'Throw the ball and your pet will fetch it!',
    icon: '🎾',
    difficulty: 'easy',
    rewards: { xp: 10, happiness: 15, coins: 5 },
    energyCost: 10,
  },
  {
    id: 'memory',
    name: 'Memory Match',
    description: 'Match pairs of cards with your pet',
    icon: '🎴',
    difficulty: 'medium',
    rewards: { xp: 20, happiness: 20, coins: 10 },
    energyCost: 15,
  },
  {
    id: 'treasure',
    name: 'Treasure Hunt',
    description: 'Help your pet find hidden treasures',
    icon: '💎',
    difficulty: 'hard',
    rewards: { xp: 30, happiness: 25, coins: 20 },
    energyCost: 20,
  },
  {
    id: 'racing',
    name: 'Pet Racing',
    description: 'Race against time to the finish line',
    icon: '🏃',
    difficulty: 'medium',
    rewards: { xp: 15, happiness: 20, coins: 8 },
    energyCost: 12,
  },
  {
    id: 'tricks',
    name: 'Trick Training',
    description: 'Teach your pet new tricks',
    icon: '🎪',
    difficulty: 'easy',
    rewards: { xp: 12, happiness: 18, coins: 6 },
    energyCost: 8,
  },
];

// Custom hook for mini-games
export function useMiniGames() {
  const [currentGame, setCurrentGame] = useState<MiniGame | null>(null);
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [highScores, setHighScores] = useState<Record<string, number>>({});

  const startGame = (game: MiniGame) => {
    setCurrentGame(game);
    setGameActive(true);
    setScore(0);
  };

  const endGame = (finalScore: number) => {
    if (!currentGame) return null;

    // Update high score
    const currentHigh = highScores[currentGame.id] || 0;
    if (finalScore > currentHigh) {
      setHighScores({
        ...highScores,
        [currentGame.id]: finalScore,
      });
    }

    const rewards = {
      ...currentGame.rewards,
      // Bonus for high score
      bonusCoins: finalScore > currentHigh ? 10 : 0,
    };

    setGameActive(false);
    setCurrentGame(null);

    return rewards;
  };

  const addScore = (points: number) => {
    setScore((prev) => prev + points);
  };

  return {
    currentGame,
    gameActive,
    score,
    highScores,
    startGame,
    endGame,
    addScore,
  };
}

// Main pet mini-games component
export default function PetMiniGames() {
  const {
    currentGame,
    gameActive,
    score,
    highScores,
    startGame,
    endGame,
    addScore,
  } = useMiniGames();

  const { settings } = useSettingsStore();
  const [selectedGame, setSelectedGame] = useState<MiniGame | null>(null);

  const handleStartGame = (game: MiniGame) => {
    startGame(game);
  };

  const handleEndGame = () => {
    const rewards = endGame(score);
    if (rewards) {
      alert(`Game Over! Score: ${score}\nRewards: ${rewards.xp} XP, ${rewards.happiness} Happiness, ${rewards.coins + rewards.bonusCoins} Coins`);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        🎮 Pet Mini-Games
      </h2>

      {/* Game selection */}
      {!gameActive && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Choose a Game</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {MINI_GAMES.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: settings.reducedMotion ? 0 : index * 0.1 }}
                onClick={() => setSelectedGame(game)}
                className={`cursor-pointer rounded-xl p-6 transition-all ${
                  selectedGame?.id === game.id
                    ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg ring-4 ring-primary-200'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-6xl">{game.icon}</div>
                  <div className="flex-1">
                    <div className={`font-bold text-xl mb-1 ${
                      selectedGame?.id === game.id ? 'text-white' : 'text-gray-900'
                    }`}>
                      {game.name}
                    </div>
                    <div className={`text-sm mb-3 ${
                      selectedGame?.id === game.id ? 'text-white opacity-90' : 'text-gray-600'
                    }`}>
                      {game.description}
                    </div>

                    <div className={`flex flex-wrap gap-2 text-xs mb-3 ${
                      selectedGame?.id === game.id ? 'text-white' : 'text-gray-700'
                    }`}>
                      <span className={`px-2 py-1 rounded ${
                        selectedGame?.id === game.id
                          ? 'bg-white bg-opacity-20'
                          : game.difficulty === 'easy'
                          ? 'bg-green-100 text-green-700'
                          : game.difficulty === 'medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {game.difficulty.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded ${
                        selectedGame?.id === game.id ? 'bg-white bg-opacity-20' : 'bg-gray-100'
                      }`}>
                        ⚡ -{game.energyCost}
                      </span>
                    </div>

                    <div className={`text-xs space-y-1 ${
                      selectedGame?.id === game.id ? 'text-white opacity-90' : 'text-gray-600'
                    }`}>
                      <div>Rewards: {game.rewards.xp} XP, {game.rewards.happiness} Happiness, {game.rewards.coins} Coins</div>
                      {highScores[game.id] && (
                        <div className="font-bold">High Score: {highScores[game.id]}</div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {selectedGame && (
            <button
              onClick={() => handleStartGame(selectedGame)}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-bold text-lg hover:from-green-600 hover:to-blue-600 transition-all shadow-lg"
            >
              Start {selectedGame.name}
            </button>
          )}
        </div>
      )}

      {/* Active game */}
      {gameActive && currentGame && (
        <div>
          {currentGame.id === 'fetch' && <FetchGame score={score} addScore={addScore} onEnd={handleEndGame} />}
          {currentGame.id === 'memory' && <MemoryGame score={score} addScore={addScore} onEnd={handleEndGame} />}
          {currentGame.id === 'treasure' && <TreasureGame score={score} addScore={addScore} onEnd={handleEndGame} />}
          {currentGame.id === 'racing' && <RacingGame score={score} addScore={addScore} onEnd={handleEndGame} />}
          {currentGame.id === 'tricks' && <TrickGame score={score} addScore={addScore} onEnd={handleEndGame} />}
        </div>
      )}

      {!gameActive && (
        <div className="mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">
            Mini-Games Guide
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Play mini-games to earn XP, happiness, and coins</li>
            <li>• Harder games give better rewards</li>
            <li>• Each game costs energy to play</li>
            <li>• Beat your high scores for bonus rewards</li>
            <li>• Take breaks between games!</li>
          </ul>
        </div>
      )}
    </div>
  );
}

// Fetch game component
function FetchGame({ score, addScore, onEnd }: { score: number; addScore: (points: number) => void; onEnd: () => void }) {
  const [ballPosition, setBallPosition] = useState(50);
  const [throwCount, setThrowCount] = useState(0);
  const maxThrows = 10;

  const throwBall = () => {
    const newPosition = Math.random() * 80 + 10;
    setBallPosition(newPosition);
    setThrowCount(throwCount + 1);
    addScore(10);

    if (throwCount + 1 >= maxThrows) {
      setTimeout(onEnd, 1000);
    }
  };

  return (
    <div className="text-center">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">🎾 Fetch Game</h3>

      <div className="mb-6 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl p-6">
        <div className="text-4xl font-bold mb-2">Score: {score}</div>
        <div className="text-lg">Throws: {throwCount}/{maxThrows}</div>
      </div>

      <div className="mb-6 bg-green-50 rounded-xl p-8 h-64 relative overflow-hidden">
        <motion.div
          animate={{ left: `${ballPosition}%` }}
          className="absolute bottom-4 text-6xl"
          style={{ transform: 'translateX(-50%)' }}
        >
          🎾
        </motion.div>

        <motion.div
          animate={{
            x: [0, 20, 0],
          }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute bottom-4 left-4 text-6xl"
        >
          🐕
        </motion.div>
      </div>

      <button
        onClick={throwBall}
        disabled={throwCount >= maxThrows}
        className="w-full py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Throw Ball!
      </button>
    </div>
  );
}

// Memory game component
function MemoryGame({ score, addScore, onEnd }: { score: number; addScore: (points: number) => void; onEnd: () => void }) {
  const icons = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'];
  const [cards] = useState([...icons, ...icons].sort(() => Math.random() - 0.5));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first] === cards[second]) {
        setMatched([...matched, first, second]);
        addScore(20);
      }
      setTimeout(() => setFlipped([]), 1000);
    }

    if (matched.length === cards.length && matched.length > 0) {
      setTimeout(onEnd, 1500);
    }
  }, [flipped, matched]);

  const handleCardClick = (index: number) => {
    if (flipped.length < 2 && !flipped.includes(index) && !matched.includes(index)) {
      setFlipped([...flipped, index]);
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">🎴 Memory Match</h3>

      <div className="mb-6 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-xl p-4 text-center">
        <div className="text-3xl font-bold">Score: {score}</div>
        <div className="text-sm">Matches: {matched.length / 2}/{icons.length}</div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {cards.map((card, index) => (
          <motion.div
            key={index}
            onClick={() => handleCardClick(index)}
            whileHover={{ scale: 1.05 }}
            className={`aspect-square flex items-center justify-center text-5xl rounded-xl cursor-pointer ${
              flipped.includes(index) || matched.includes(index)
                ? 'bg-white'
                : 'bg-purple-200'
            }`}
          >
            {flipped.includes(index) || matched.includes(index) ? card : '❓'}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Treasure game component
function TreasureGame({ score, addScore, onEnd }: { score: number; addScore: (points: number) => void; onEnd: () => void }) {
  const [treasuresFound, setTreasuresFound] = useState(0);
  const [positions] = useState(
    Array.from({ length: 5 }, () => ({
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 10,
    }))
  );
  const [found, setFound] = useState<number[]>([]);

  const findTreasure = (index: number) => {
    if (!found.includes(index)) {
      setFound([...found, index]);
      setTreasuresFound(treasuresFound + 1);
      addScore(30);

      if (treasuresFound + 1 >= 5) {
        setTimeout(onEnd, 1000);
      }
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">💎 Treasure Hunt</h3>

      <div className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl p-4 text-center">
        <div className="text-3xl font-bold">Score: {score}</div>
        <div className="text-sm">Treasures: {treasuresFound}/5</div>
      </div>

      <div className="mb-6 bg-gradient-to-b from-blue-100 to-green-100 rounded-xl p-4 h-96 relative">
        {positions.map((pos, index) => (
          <motion.div
            key={index}
            onClick={() => findTreasure(index)}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            className="absolute text-5xl cursor-pointer"
            animate={found.includes(index) ? { scale: 0, opacity: 0 } : {}}
          >
            {found.includes(index) ? '✅' : '💎'}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Racing game component
function RacingGame({ score, addScore, onEnd }: { score: number; addScore: (points: number) => void; onEnd: () => void }) {
  const [position, setPosition] = useState(0);
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    if (position >= 100) {
      onEnd();
    }
  }, [position]);

  const run = () => {
    setPosition(Math.min(100, position + 5));
    setClicks(clicks + 1);
    addScore(5);
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">🏃 Pet Racing</h3>

      <div className="mb-6 bg-gradient-to-r from-blue-400 to-cyan-500 text-white rounded-xl p-4 text-center">
        <div className="text-3xl font-bold">Score: {score}</div>
        <div className="text-sm">Clicks: {clicks}</div>
      </div>

      <div className="mb-6 bg-blue-50 rounded-xl p-8 relative">
        <div className="h-20 bg-blue-200 rounded-lg relative overflow-hidden">
          <motion.div
            animate={{ left: `${position}%` }}
            className="absolute top-1/2 transform -translate-y-1/2 text-5xl"
          >
            🐕
          </motion.div>
        </div>
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-6xl">
          🏁
        </div>
      </div>

      <button
        onClick={run}
        disabled={position >= 100}
        className="w-full py-4 bg-blue-500 text-white rounded-xl font-bold text-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Run! 🏃
      </button>
    </div>
  );
}

// Trick training game component
function TrickGame({ score, addScore, onEnd }: { score: number; addScore: (points: number) => void; onEnd: () => void }) {
  const tricks = ['Sit', 'Stay', 'Roll Over', 'Shake', 'Play Dead'];
  const [currentTrick, setCurrentTrick] = useState(0);
  const [practiced, setPracticed] = useState(0);

  const practice = () => {
    setPracticed(practiced + 1);
    addScore(12);

    if (practiced + 1 >= 5) {
      if (currentTrick < tricks.length - 1) {
        setCurrentTrick(currentTrick + 1);
        setPracticed(0);
      } else {
        setTimeout(onEnd, 1000);
      }
    }
  };

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">🎪 Trick Training</h3>

      <div className="mb-6 bg-gradient-to-r from-pink-400 to-purple-500 text-white rounded-xl p-6 text-center">
        <div className="text-3xl font-bold mb-2">Score: {score}</div>
        <div className="text-xl">Learning: {tricks[currentTrick]}</div>
        <div className="text-sm">Progress: {practiced}/5</div>
      </div>

      <div className="mb-6 bg-purple-50 rounded-xl p-8 text-center">
        <motion.div
          animate={{
            rotate: practiced * 72,
            scale: [1, 1.2, 1],
          }}
          className="text-9xl mb-4"
        >
          🐕
        </motion.div>
        <div className="text-2xl font-bold text-purple-900">{tricks[currentTrick]}</div>
      </div>

      <button
        onClick={practice}
        className="w-full py-4 bg-purple-500 text-white rounded-xl font-bold text-lg hover:bg-purple-600 transition-colors"
      >
        Practice Trick
      </button>
    </div>
  );
}
