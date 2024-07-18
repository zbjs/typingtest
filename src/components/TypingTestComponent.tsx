"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

interface WordData {
  [level: string]: string;
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
  const [level, setLevel] = useState<string>("medium");
  const [timeLimit, setTimeLimit] = useState<number>(60);
  const [description, setDescription] = useState<string>("");
  const [typedText, setTypedText] = useState<string>("");
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [incorrectCount, setIncorrectCount] = useState<number>(0);
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
    fetchDescription();
  }, [language, level]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && isRunning) {
      setIsRunning(false);
      setShowResults(true);
      calculateStats();
    }
    return () => clearInterval(interval);
  }, [isRunning, timer]);

  const fetchDescription = async () => {
    try {
      const response = await axios.get<WordData>(`/data/${language}-words.json`);
      const descriptionText = response.data[level];
      setDescription(descriptionText);
    } catch (error) {
      console.error("Error fetching description:", error);
    }
  };

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

  // const handleTypingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const typedValue = event.target.value;
  //   setTypedText(typedValue);

  //   const typedLength = typedValue.length;
  //   const correctLength = description
  //     .slice(0, typedLength)
  //     .split(" ")
  //     .filter((word, i) => word === typedValue.split(" ")[i]).length;
  //   const incorrectLength = typedLength - correctLength;

  //   setCorrectCount(correctLength);
  //   setIncorrectCount(incorrectLength);
  // };

const handleTypingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const typedValue = event.target.value;
  setTypedText(typedValue);

  const typedLength = typedValue.length;
  if (typeof description === "string") {
    const correctLength = description
      .slice(0, typedLength)
      .split(" ")
      .filter((word, i) => word === typedValue.split(" ")[i]).length;
    const incorrectLength = typedLength - correctLength;

    setCorrectCount(correctLength);
    setIncorrectCount(incorrectLength);
  } else {
    console.error("Description is not a string");
    setCorrectCount(0);
    setIncorrectCount(typedLength);
  }
};


  const startTest = () => {
    setIsRunning(true);
    setShowResults(false);
    setCorrectCount(0);
    setIncorrectCount(0);
    setTypedText("");
    setTimer(timeLimit);
    inputRef.current?.focus();
  };

  const calculateStats = () => {
    const totalTypedWords = typedText.split(" ").length;
    const totalTypedCharacters = typedText.length;
    const minutes = timeLimit / 60;

    setStats({
      wordsPerMinute: totalTypedWords / minutes,
      charactersPerMinute: totalTypedCharacters / minutes,
      accuracy: (correctCount / totalTypedWords) * 100 || 0,
      totalWords: totalTypedWords,
      correctWords: correctCount,
      incorrectWords: incorrectCount,
      totalCharacters: totalTypedCharacters,
      totalMistakes: incorrectCount,
    });
  };

  return (
    <div className="container mx-auto p-5 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-indigo-700">
        Typing Test
      </h1>

      <div className="flex justify-center space-x-4 mb-6">
        <div>
          <label
            htmlFor="language"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={handleLanguageChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isRunning}
          >
            <option value="english">English</option>
            <option value="spanish">Spanish</option>
            <option value="french">French</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="level"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Level
          </label>
          <select
            id="level"
            value={level}
            onChange={handleLevelChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isRunning}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="timeLimit"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Time
          </label>
          <select
            id="timeLimit"
            value={timeLimit}
            onChange={handleTimeChange}
            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isRunning}
          >
            <option value={60}>1 minute</option>
            <option value={120}>2 minutes</option>
            <option value={300}>5 minutes</option>
          </select>
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-2xl font-semibold text-indigo-600">
          Time Remaining:{" "}
          <span className="text-3xl">
            {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
          </span>
        </p>
      </div>

      <div className="mb-6">
        <p className="text-xl font-semibold mb-2 text-center text-gray-700">
          Description:
        </p>
        <p className="text-lg text-center text-gray-600">{description}</p>
      </div>

      <div className="mb-6">
        <input
          ref={inputRef}
          type="text"
          value={typedText}
          onChange={handleTypingChange}
          className="w-full p-3 text-xl border-2 border-indigo-300 rounded-lg focus:outline-none focus:border-indigo-500"
          placeholder="Type here..."
          disabled={!isRunning}
        />
      </div>

      <div className="text-center">
        <button
          onClick={startTest}
          className={`bg-indigo-600 text-white px-6 py-2 rounded-lg text-xl font-semibold hover:bg-indigo-700 transition duration-300 ${
            isRunning ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isRunning}
        >
          Start Test
        </button>
      </div>

      {showResults && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-indigo-700">Results</h2>
          <div className="grid grid-cols-2 gap-4">
            <p className="text-lg">
              Words per minute:{" "}
              <span className="font-semibold text-green-600">
                {stats.wordsPerMinute.toFixed(2)}
              </span>
            </p>
            <p className="text-lg">
              Characters per minute:{" "}
              <span className="font-semibold text-blue-600">
                {stats.charactersPerMinute.toFixed(2)}
              </span>
            </p>
            <p className="text-lg">
              Accuracy:{" "}
              <span className="font-semibold text-purple-600">
                {stats.accuracy.toFixed(2)}%
              </span>
            </p>
            <p className="text-lg">
              Total words:{" "}
              <span className="font-semibold">{stats.totalWords}</span>
            </p>
            <p className="text-lg">
              Correct words:{" "}
              <span className="font-semibold text-green-600">
                {stats.correctWords}
              </span>
            </p>
            <p className="text-lg">
              Incorrect words:{" "}
              <span className="font-semibold text-red-600">
                {stats.incorrectWords}
              </span>
            </p>
            <p className="text-lg">
              Total characters:{" "}
              <span className="font-semibold">{stats.totalCharacters}</span>
            </p>
            <p className="text-lg">
              Total mistakes:{" "}
              <span className="font-semibold text-red-600">
                {stats.totalMistakes}
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingComponent;
