"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

interface WordData {
  [level: string]: string[];
}

interface Stats {
  wordsPerMinute: number;
  charactersPerMinute: number;
  accuracy: number;
  totalWords: number;
  correctWords: number;
  incorrectWords: number;
  totalCharacters: number;
  totalMistakes: number;
}

const TypingComponent: React.FC = () => {
  const [language, setLanguage] = useState<string>("english");
  const [level, setLevel] = useState<string>("beginner");
  const [timeLimit, setTimeLimit] = useState<number>(60); // Default to 1 minute
  const [words, setWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState<string>("");
  const [typedWord, setTypedWord] = useState<string>("");
  const [wordIndex, setWordIndex] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [incorrectCount, setIncorrectCount] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(100);
  const [timer, setTimer] = useState<number>(timeLimit);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [stats, setStats] = useState<Stats>({
    wordsPerMinute: 0,
    charactersPerMinute: 0,
    accuracy: 100,
    totalWords: 0,
    correctWords: 0,
    incorrectWords: 0,
    totalCharacters: 0,
    totalMistakes: 0,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await axios.get<WordData>(
          `/data/${language}-words.json`
        );
        const wordsArray = response.data[level];
        const shuffledWords = wordsArray.sort(() => Math.random() - 0.5);
        setWords(shuffledWords);
        setCurrentWord(shuffledWords[0]);
      } catch (error) {
        console.error("Error fetching words:", error);
      }
    };

    fetchWords();
  }, [language, level]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsRunning(false);
      setShowResults(true);
      calculateStats();
    }

    return () => clearInterval(interval);
  }, [isRunning, timer]);

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setLanguage(event.target.value);
  };

  const handleLevelChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setLevel(event.target.value);
  };

  const handleTimeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const time = parseInt(event.target.value, 10);
    setTimeLimit(time);
    setTimer(time);
  };

  const handleTypingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const typedValue = event.target.value.trim();
    setTypedWord(typedValue);

    if (typedValue === currentWord) {
      setCorrectCount((prev) => prev + 1);
      handleWordChange();
    } else if (typedValue.length >= currentWord.length) {
      setIncorrectCount((prev) => prev + 1);
      handleWordChange();
    }
  };

  const handleWordChange = () => {
    setWordIndex((prev) => prev + 1);
    setCurrentWord(words[wordIndex + 1] || "");
    setTypedWord("");
  };

  const startTest = () => {
    setIsRunning(true);
    setShowResults(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setWordIndex(0);
    setCurrentWord(words[0]);
    setTypedWord("");
    setAccuracy(100);
    setTimer(timeLimit);
    inputRef.current?.focus();
  };

  const calculateAccuracy = (correct: number, incorrect: number) => {
    const totalTyped = correct + incorrect;
    if (totalTyped === 0) {
      return 100;
    } else {
      return (correct / totalTyped) * 100;
    }
  };

  const calculateStats = () => {
    const totalTypedWords = correctCount + incorrectCount;
    const totalTypedCharacters = words
      .slice(0, wordIndex)
      .reduce((acc, word) => acc + word.length, 0);
    const totalMistakes = incorrectCount;
    const minutes = timeLimit / 60;

    const calculatedStats: Stats = {
      wordsPerMinute: totalTypedWords / minutes,
      charactersPerMinute: totalTypedCharacters / minutes,
      accuracy: calculateAccuracy(correctCount, incorrectCount),
      totalWords: totalTypedWords,
      correctWords: correctCount,
      incorrectWords: incorrectCount,
      totalCharacters: totalTypedCharacters,
      totalMistakes: totalMistakes,
    };

    setStats(calculatedStats);
  };

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-3xl font-bold mb-4 text-center">Typing Practice</h1>
      <div className="flex justify-center space-x-8">
        <div className="text-center text-orange-600">
          <label htmlFor="language" className="mr-2">
            Select Language:
          </label>
          <select
            id="language"
            value={language}
            onChange={handleLanguageChange}
            className="p-2 border rounded"
          >
            <option value="english">English</option>
            <option value="bengali">Bengali</option>
            <option value="hindi">Hindi</option>
          </select>
        </div>
        <div className="text-center text-orange-500 mb-4">
          <label htmlFor="level" className="mr-2">
            Select Level:
          </label>
          <select
            id="level"
            value={level}
            onChange={handleLevelChange}
            className="p-2 border rounded"
          >
            <option value="beginner">Beginner</option>
            <option value="medium">Medium</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="text-center text-orange-400 mb-4">
          <label htmlFor="timeLimit" className="mr-2">
            Select Time:
          </label>
          <select
            id="timeLimit"
            value={timeLimit}
            onChange={handleTimeChange}
            className="p-2 border rounded"
          >
            <option value={60}>1 minute</option>
            <option value={120}>2 minutes</option>
            <option value={300}>5 minutes</option>
            <option value={600}>10 minutes</option>
          </select>
        </div>
      </div>
      <div className="flex justify-center mb-4">
        <div className="text-2xl text-orange-500">
          Time Remaining:{" "}
          <span className="font-bold text-red-500 m-4 text-3xl">
            {Math.floor(timer / 60)} : {timer % 60}
          </span>
          sec.
        </div>
      </div>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold mb-2 text-center">
          Current Word:
        </h2>
        <p className="text-green-400 font-extrabold text-center text-4xl">
          {currentWord}
        </p>
      </div>
      <div className="flex justify-center mb-4">
        <input
          ref={inputRef}
          type="text"
          value={typedWord}
          onChange={handleTypingChange}
          className="p-2 border rounded w-full max-w-lg font-extrabold text-fuchsia-400 text-4xl"
          placeholder="Type the word here..."
          disabled={!isRunning}
        />
      </div>
      <div className="flex justify-center mb-4">
        <button
          onClick={startTest}
          className={`bg-blue-500 text-white px-4 py-2 rounded mr-2 ${
            isRunning ? "hidden" : ""
          }`}
        >
          Start Test
        </button>
      </div>
      {showResults && (
        <div className="text-center mt-4">
          <h2 className="text-2xl font-semibold">Results:</h2>
          <p className="text-lg">
            Words per minute: {stats.wordsPerMinute.toFixed(2)}
          </p>
          <p className="text-lg">
            Characters per minute: {stats.charactersPerMinute.toFixed(2)}
          </p>
          <p className="text-lg">Accuracy: {stats.accuracy.toFixed(2)}%</p>
          <p className="text-lg">Total words: {stats.totalWords}</p>
          <p className="text-lg">Correct words: {stats.correctWords}</p>
          <p className="text-lg">Incorrect words: {stats.incorrectWords}</p>
          <p className="text-lg">Total characters: {stats.totalCharacters}</p>
          <p className="text-lg">Total mistakes: {stats.totalMistakes}</p>
        </div>
      )}
    </div>
  );
};

export default TypingComponent;
