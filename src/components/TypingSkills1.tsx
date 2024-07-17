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

const TypingSkills: NextPage = () => {
  const [inputText, setInputText] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [completedWords, setCompletedWords] = useState<
    { word: string; correct: boolean }[]
  >([]);
  const [timer, setTimer] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
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

  useEffect(() => {
    fetch("/words.json")
      .then((response) => response.json())
      .then((data) => setTestText(shuffleArray(data)))
      .catch((error) => console.error("Error loading words:", error));
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isRunning && timer > 0) {
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
  }, [isRunning, timer]);

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
    const wordsPerMinute = (totalWords / (60 - timer)) * 60;
    const charactersPerMinute = (totalCharacters / (60 - timer)) * 60;
    const accuracy = (correctWords / totalWords) * 100;

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
    setTimer(60);
    setInputText("");
    setCurrentWordIndex(0);
    setCompletedWords([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-4">
        Test your typing skills
      </h1>
      <div className="text-center mb-4">
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
          {isRunning && (
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
          disabled={!isRunning}
        />
      </div>
      <div className="text-center">
        <button
          onClick={startTest}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={isRunning}
        >
          Start Test
        </button>
      </div>
      {timer === 0 && (
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-center mb-4">Results</h2>
          <p className="text-xl ">Words per minute: {stats.wordsPerMinute.toFixed(2)}</p>
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
