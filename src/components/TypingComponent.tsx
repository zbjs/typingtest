'use client';


import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

interface WordData {
  [level: string]: string[];
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await axios.get<WordData>(
          `/data/${language}-words.json`
        );
        setWords(response.data[level]);
        setCurrentWord(response.data[level][0]);
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
      calculateAccuracy();
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

  const calculateAccuracy = () => {
    const totalTyped = correctCount + incorrectCount;
    if (totalTyped === 0) {
      setAccuracy(100);
    } else {
      const calculatedAccuracy = (correctCount / totalTyped) * 100;
      setAccuracy(parseFloat(calculatedAccuracy.toFixed(2)));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Typing Practice</h1>
      <div className="flex justify-center mb-4">
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
      <div className="flex justify-center mb-4">
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
      <div className="flex justify-center mb-4">
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
      <div className="flex justify-center mb-4">
        <p className="text-lg">Time Remaining: {timer} seconds</p>
      </div>
      <div className="mb-4">
        <h2 className="text-2xl font-semibold mb-2 text-center">
          Current Word:
        </h2>
        <p className="text-xl text-center">{currentWord}</p>
      </div>
      <div className="flex justify-center mb-4">
        <input
          ref={inputRef}
          type="text"
          value={typedWord}
          onChange={handleTypingChange}
          className="p-2 border rounded w-full max-w-md"
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
          <p className="text-lg">Accuracy: {accuracy}%</p>
          <p className="text-lg">Correct: {correctCount}</p>
          <p className="text-lg">Incorrect: {incorrectCount}</p>
        </div>
      )}
    </div>
  );
};

export default TypingComponent;
