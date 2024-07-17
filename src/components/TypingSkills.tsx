"use client";
import { useEffect, useState, useRef } from "react";
import { NextPage } from "next";

interface TypingStats {
  wordsPerMinute: number;
  charactersPerMinute: number;
  accuracy: number;
  totalWords: number;
  totalCharacters: number;
  totalMistakes: number;
  correctWords: number;
  incorrectWords: number;
}

enum TypingLevel {
  Beginner = "beginner",
  Medium = "medium",
  Advanced = "advanced",
}

const TypingSkills: NextPage = () => {
  const [inputText, setInputText] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [completedWords, setCompletedWords] = useState<
    { word: string; correct: boolean }[]
  >([]);
  const [timer, setTimer] = useState(60); // Default timer of 1 minute
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedTime, setSelectedTime] = useState(60); // Default selected time
  const [stats, setStats] = useState<TypingStats>({
    wordsPerMinute: 0,
    charactersPerMinute: 0,
    accuracy: 0,
    totalWords: 0,
    totalCharacters: 0,
    totalMistakes: 0,
    correctWords: 0,
    incorrectWords: 0,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [testText, setTestText] = useState<string[]>([]);
  const [typingLevel, setTypingLevel] = useState<TypingLevel>(
    TypingLevel.Beginner
  );

  useEffect(() => {
    fetchWords();
  }, [typingLevel]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRunning && !isPaused && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
      calculateResults();
      setIsRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isPaused, timer]);

  const fetchWords = () => {
    let url: string;
    switch (typingLevel) {
      case TypingLevel.Beginner:
        url = "/beginner-words.json"; // Replace with actual API endpoint
        break;
      case TypingLevel.Medium:
        url = "/medium-words.json"; // Replace with actual API endpoint
        break;
      case TypingLevel.Advanced:
        url = "/advanced-words.json"; // Replace with actual API endpoint
        break;
      default:
        url = "/beginner-words.json";
        break;
    }

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch words");
        }
        return response.json();
      })
      .then((data) => setTestText(shuffleArray(data)))
      .catch((error) => console.error("Error loading words:", error));
  };

  const shuffleArray = (array: string[]) => {
    return array.sort(() => Math.random() - 0.5);
  };

  const calculateResults = () => {
    const totalWords = completedWords.length;
    const totalCharacters = completedWords.reduce(
      (sum, { word }) => sum + word.length,
      0
    );
    const correctWords = completedWords.filter(({ correct }) => correct).length;
    const incorrectWords = totalWords - correctWords;
    const totalMistakes = completedWords.filter(
      ({ correct }) => !correct
    ).length;
    const wordsPerMinute = (totalWords / (selectedTime - timer)) * 60 || 0; // Avoid division by zero
    const charactersPerMinute =
      (totalCharacters / (selectedTime - timer)) * 60 || 0; // Avoid division by zero
    const accuracy = (correctWords / totalWords) * 100 || 0; // Avoid division by zero

    setStats({
      wordsPerMinute,
      charactersPerMinute,
      accuracy,
      totalWords,
      totalCharacters,
      totalMistakes,
      correctWords,
      incorrectWords,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputText(value);

    if (value.endsWith(" ")) {
      const currentWord = testText[currentWordIndex];
      const trimmedInput = value.trim();
      const isCorrect = trimmedInput === currentWord;

      setCompletedWords([
        ...completedWords,
        { word: currentWord, correct: isCorrect },
      ]);
      setInputText("");
      setCurrentWordIndex((prev) => prev + 1);
    }
  };

  const startTest = () => {
    setIsRunning(true);
    setIsPaused(false);
    setTimer(selectedTime);
    setInputText("");
    setCurrentWordIndex(0);
    setCompletedWords([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const pauseTest = () => {
    setIsPaused((prev) => !prev);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTime(parseInt(e.target.value));
  };

  const handleLevelChange = (level: TypingLevel) => {
    setTypingLevel(level);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-4">
        Test your typing skills
      </h1>
      <div className="flex justify-center mb-4">
        <button
          onClick={() => handleLevelChange(TypingLevel.Beginner)}
          className={`mr-4 px-4 py-2 rounded ${
            typingLevel === TypingLevel.Beginner
              ? "bg-blue-500 text-white"
              : "bg-gray-300 text-gray-700"
          }`}
        >
          Beginner
        </button>
        <button
          onClick={() => handleLevelChange(TypingLevel.Medium)}
          className={`mr-4 px-4 py-2 rounded ${
            typingLevel === TypingLevel.Medium
              ? "bg-blue-500 text-white"
              : "bg-gray-300 text-gray-700"
          }`}
        >
          Medium
        </button>
        <button
          onClick={() => handleLevelChange(TypingLevel.Advanced)}
          className={`px-4 py-2 rounded ${
            typingLevel === TypingLevel.Advanced
              ? "bg-blue-500 text-white"
              : "bg-gray-300 text-gray-700"
          }`}
        >
          Advanced
        </button>
      </div>
      <div className="text-center mb-4">
        <label htmlFor="timeSelect" className="block text-xl mb-2">
          Select Time:
        </label>
        <select
          id="timeSelect"
          value={selectedTime}
          onChange={handleTimeChange}
          className="border border-gray-300 p-2 mb-4"
          disabled={isRunning}
        >
          <option value={60}>1 minute</option>
          <option value={120}>2 minutes</option>
          <option value={300}>5 minutes</option>
          <option value={600}>10 minutes</option>
          <option value={1200}>20 minutes</option>
          <option value={1800}>30 minutes</option>
        </select>
        <p className="text-xl">Time: {timer} seconds</p>
        <div className="flex justify-center flex-wrap">
          {completedWords.map((wordObj, index) => (
            <span
              key={index}
              className={`m-1 p-1 rounded ${
                wordObj.correct
                  ? "bg-green-200 text-green-700"
                  : "bg-red-200 text-red-700"
              }`}
            >
              {wordObj.word}
            </span>
          ))}
          {isRunning && !isPaused && (
            <span className="font-mono text-xl m-1 p-1 border-b-2 border-blue-500">
              {testText[currentWordIndex]}
            </span>
          )}
        </div>
      </div>
      <div className="flex justify-center mb-4">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={handleInputChange}
          className="border border-gray-300 p-2 w-full max-w-md"
          disabled={!isRunning || isPaused}
        />
      </div>
      <div className="text-center">
        <button
          onClick={startTest}
          className={`bg-blue-500 text-white px-4 py-2 rounded mr-2 ${
            isRunning && !isPaused ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isRunning && !isPaused}
        >
          Start Test
        </button>
        <button
          onClick={pauseTest}
          className={`bg-yellow-500 text-white px-4 py-2 rounded ${
            !isRunning ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!isRunning}
        >
          {isPaused ? "Resume Test" : "Pause Test"}
        </button>
      </div>
      {timer === 0 && (
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-center mb-4">Results</h2>
          <p>Words per minute: {stats.wordsPerMinute.toFixed(2)}</p>
          <p>Characters per minute: {stats.charactersPerMinute.toFixed(2)}</p>
          <p>Accuracy: {stats.accuracy.toFixed(2)}%</p>
          <p>Total words: {stats.totalWords}</p>
          <p>Correct words: {stats.correctWords}</p>
          <p>Incorrect words: {stats.incorrectWords}</p>
          <p>Total characters: {stats.totalCharacters}</p>
          <p>Total mistakes: {stats.totalMistakes}</p>
        </div>
      )}
    </div>
  );
};

export default TypingSkills;
