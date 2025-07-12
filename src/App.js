import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const LetterMatchingApp = () => {
  const [gameState, setGameState] = useState({
    currentLetters: [],
    selectedCards: [],
    score: 0,
    matches: 0,
    level: 1,
    maxMatches: 5
  });
  
  const [message, setMessage] = useState({
    text: "Tap on matching uppercase and lowercase letters!",
    type: "info"
  });
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [cardStates, setCardStates] = useState({});

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const getRandomLetters = (count) => {
    const shuffled = letters.split('').sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const generateGame = useCallback(() => {
    const newLetters = getRandomLetters(gameState.maxMatches);
    setGameState(prev => ({
      ...prev,
      currentLetters: newLetters,
      selectedCards: []
    }));
    setCardStates({});
  }, [gameState.maxMatches]);

  const selectCard = (letter, isUppercase) => {
    const cardId = `${letter}-${isUppercase ? 'upper' : 'lower'}`;
    
    if (cardStates[cardId] === 'matched' || cardStates[cardId] === 'selected') return;
    
    setGameState(prev => {
      let newSelectedCards = [...prev.selectedCards];
      
      if (newSelectedCards.length >= 2) {
        newSelectedCards = [];
        setCardStates(prevStates => {
          const newStates = { ...prevStates };
          Object.keys(newStates).forEach(key => {
            if (newStates[key] === 'selected' || newStates[key] === 'wrong') {
              delete newStates[key];
            }
          });
          return newStates;
        });
      }
      
      newSelectedCards.push({ letter, isUppercase, cardId });
      
      setCardStates(prevStates => ({
        ...prevStates,
        [cardId]: 'selected'
      }));
      
      return {
        ...prev,
        selectedCards: newSelectedCards
      };
    });
  };

  const checkMatch = useCallback(() => {
    if (gameState.selectedCards.length !== 2) return;
    
    const [card1, card2] = gameState.selectedCards;
    const isMatch = card1.letter === card2.letter && card1.isUppercase !== card2.isUppercase;
    
    if (isMatch) {
      setCardStates(prev => ({
        ...prev,
        [card1.cardId]: 'matched',
        [card2.cardId]: 'matched'
      }));
      
      setGameState(prev => ({
        ...prev,
        matches: prev.matches + 1,
        score: prev.score + 10 * prev.level,
        selectedCards: []
      }));
      
      setMessage({
        text: `Great job! ${card1.letter.toUpperCase()} and ${card1.letter.toLowerCase()} match! 🎉`,
        type: 'success'
      });
      
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
      
    } else {
      setCardStates(prev => ({
        ...prev,
        [card1.cardId]: 'wrong',
        [card2.cardId]: 'wrong'
      }));
      
      setMessage({
        text: "Try again! Those letters don't match. 🤔",
        type: 'error'
      });
      
      if (navigator.vibrate) {
        navigator.vibrate([50, 50, 50]);
      }
      
      setTimeout(() => {
        setCardStates(prev => {
          const newStates = { ...prev };
          delete newStates[card1.cardId];
          delete newStates[card2.cardId];
          return newStates;
        });
        
        setGameState(prev => ({
          ...prev,
          selectedCards: []
        }));
      }, 1000);
    }
  }, [gameState.selectedCards]);

  const levelUp = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      level: prev.level + 1,
      matches: 0,
      maxMatches: Math.min(5 + prev.level, 10)
    }));
    
    setShowConfetti(true);
    setMessage({
      text: `Level ${gameState.level + 1}! 🌟 Let's match more letters!`,
      type: 'success'
    });
    
    setTimeout(() => {
      setShowConfetti(false);
      generateGame();
    }, 2000);
  }, [gameState.level, generateGame]);

  const shuffle = () => {
    const newLetters = [...gameState.currentLetters].sort(() => Math.random() - 0.5);
    setGameState(prev => ({
      ...prev,
      currentLetters: newLetters,
      selectedCards: []
    }));
    setCardStates({});
    setMessage({
      text: "Letters shuffled! 🔄",
      type: 'info'
    });
  };

  const newGame = () => {
    setGameState({
      currentLetters: [],
      selectedCards: [],
      score: 0,
      matches: 0,
      level: 1,
      maxMatches: 5
    });
    setCardStates({});
    setMessage({
      text: "New game started! Match the letters! 🎮",
      type: 'info'
    });
    generateGame();
  };

  useEffect(() => {
    generateGame();
  }, [generateGame]);

  useEffect(() => {
    if (gameState.selectedCards.length === 2) {
      const timer = setTimeout(() => {
        checkMatch();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.selectedCards, checkMatch]);

  useEffect(() => {
    if (gameState.matches >= gameState.maxMatches && gameState.matches > 0) {
      const timer = setTimeout(() => {
        levelUp();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState.matches, gameState.maxMatches, levelUp]);

  const LetterCard = ({ letter, isUppercase }) => {
    const cardId = `${letter}-${isUppercase ? 'upper' : 'lower'}`;
    const state = cardStates[cardId] || '';
    
    let cardClass = 'letter-card';
    if (state === 'selected') cardClass += ' selected';
    if (state === 'matched') cardClass += ' matched';
    if (state === 'wrong') cardClass += ' wrong';

    return (
      <div
        className={cardClass}
        onClick={() => selectCard(letter, isUppercase)}
        style={{
          background: state === 'selected' ? 'linear-gradient(135deg, #ff6b6b, #ffa500)' :
                     state === 'matched' ? 'linear-gradient(135deg, #4ecdc4, #44a08d)' :
                     state === 'wrong' ? 'linear-gradient(135deg, #ff4757, #ff3838)' :
                     'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        {isUppercase ? letter : letter.toLowerCase()}
      </div>
    );
  };

  return (
    <div className="app">
      <div className="header">
        <h1>🎯 Letter Match 🎯</h1>
        <p>Tap matching letters!</p>
      </div>

      <div className="game-container">
        <div className="score-board">
          <div className="score-item">Score: {gameState.score}</div>
          <div className="score-item">Matches: {gameState.matches}/{gameState.maxMatches}</div>
          <div className="score-item">Level: {gameState.level}</div>
        </div>

        <div className="game-board">
          <div className="letter-column">
            <div className="column-title">Uppercase</div>
            {gameState.currentLetters.map((letter, index) => (
              <LetterCard key={`upper-${letter}-${index}`} letter={letter} isUppercase={true} />
            ))}
          </div>
          
          <div className="letter-column">
            <div className="column-title">Lowercase</div>
            {[...gameState.currentLetters].sort(() => Math.random() - 0.5).map((letter, index) => (
              <LetterCard key={`lower-${letter}-${index}`} letter={letter} isUppercase={false} />
            ))}
          </div>
        </div>

        <div className={`message ${message.type}`}>
          {message.text}
        </div>

        <div className="controls">
          <button className="btn btn-primary" onClick={newGame}>
            New Game
          </button>
          <button className="btn btn-secondary" onClick={shuffle}>
            Shuffle
          </button>
        </div>
      </div>

      {showConfetti && (
        <div className="confetti">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LetterMatchingApp;