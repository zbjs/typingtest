// import type { NextApiRequest, NextApiResponse } from "next";
// import { WordsData } from "@/types/types"; // Ensure this matches the path where you define the types
// import wordsData from "@/context/words.json";

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { language = "english", level = "medium" } = req.query;

//   // Type assertion for wordsData
//   const data = wordsData as unknown as WordsData;

//   if (
//     typeof language === "string" &&
//     typeof level === "string" &&
//     data[language] &&
//     data[language][level as keyof WordLevels] // Type assertion for level
//   ) {
//     res.status(200).json(data[language][level as keyof WordLevels]);
//   } else {
//     res.status(400).json({ error: "Invalid language or level" });
//   }
// }
