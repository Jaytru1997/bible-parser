const fs = require("fs");
const puppeteer = require("puppeteer");
const mysql = require("mysql");
const util = require("util");

// mysql db
const MYSQL_HOST = "localhost";
const MYSQL_USER = "devmode";
const MYSQL_PASSWORD = "900W**Jy1obeMY";
const MYSQL_DB = "tptbible";
const DIALECT = "mysql";

// Create a MySQL connection
const connection = mysql.createConnection({
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DB,
});

// Convert callback-based queries to use Promises
const query = util.promisify(connection.query).bind(connection);

// Function to insert formatted data into MySQL table
async function insertFormattedData(data) {
  const sql =
    "INSERT INTO formatted_data (bookName, chapterNumber, versesArray) VALUES (?, ?, ?)";
  await query(sql, [
    data.bookName,
    data.chapterNumber,
    JSON.stringify(data.versesArray),
  ]);
}

// Function to retrieve formatted data from MySQL table
async function getFormattedData() {
  const sql = "SELECT * FROM formatted_data";
  const rows = await query(sql);
  return rows;
}
const bookList = [
  { PSA: "Psalms" },
  { PRO: "Proverbs" },
  { SNG: "Song of Solomon" },
  { MAT: "Matthew" },
  { MRK: "Mark" },
  { LUK: "Luke" },
  { JHN: "John" },
  { ACT: "Acts" },
  { ROM: "Romans" },
  { "1CO": "1 Corinthians" },
  { "2CO": "2 Corinthians" },
  { GAL: "Galatians" },
  { EPH: "Ephesians" },
  { PHP: "Philippians" },
  { COL: "Colossians" },
  { "1TH": "1 Thessalonians" },
  { "2TH": "2 Thessalonians" },
  { "1TI": "1 Timothy" },
  { "2TI": "2 Timothy" },
  { TIT: "Titus" },
  { PHM: "Philemon" },
  { HEB: "Hebrews" },
  { JAS: "James" },
  { "1PE": "1 Peter" },
  { "2PE": "2 Peter" },
  { "1JN": "1 John" },
  { "2JN": "2 John" },
  { "3JN": "3 John" },
  { JUD: "Jude" },
  { REV: "Revelation" },
];
// let bibleUrls = [];
// let urlParams = [];

// function to async read bible url from tpt json file
function readFileAsync(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        const jsonData = JSON.parse(data);
        resolve(jsonData);
      } catch (parseError) {
        reject(parseError);
      }
    });
  });
}

// Read JSON content from tpt file
const filePath = "./tpt-urls.json"; // path to tpt-urls json file

(async () => {
  try {
    // const jsonData = await readFileAsync(filePath);
    // const bibleUrls = Array.from(jsonData);
    // console.log("File content:", bibleUrls);

    // if (bibleUrls) {
    // const regexPattern = /\/(\w+)\.(\d+)\.TPT$/;

    // for (const url of bibleUrls) {
    //   const match = url.match(regexPattern);
    //   if (match) {
    //     const book = match[1];
    //     const chapter = match[2];
    //     const urlParam = { url, book, chapter };

    //     try {
    //       const textContent = await extractTextFromURL(urlParam);
    //       const bookName = getBookFullName(urlParam.url, bookList);
    //       const withoutFootNotes = filterOutFootnotes(textContent);
    //       const formattedText =
    //         extractChapterAndRemoveMetadata(withoutFootNotes);
    //       formattedText.versesArray = groupVerses(formattedText.versesArray);
    //       formattedText.bookName = bookName;

    //       // Store formatted data in MySQL table
    //       await insertFormattedData(formattedText);
    //     } catch (error) {
    //       console.error("Error extracting text content:", error);
    //     }
    //   }
    // }

    // Retrieve formatted data from MySQL table
    const formattedData = await getFormattedData();
    await generateXMLFileFromDatabase(formattedData);
    // }
  } catch (error) {
    console.error("Error reading file:", error);
  } finally {
    connection.end(); // Close MySQL connection
  }
})();

// readFileAsync(filePath)
//   .then((jsonData) => {
//     bibleUrls = Array.from(jsonData);
//     console.log("File content:", bibleUrls);
//     // console.log("File content:", jsonData);
//     if (bibleUrls) {
//       let inputDataArray = [];
//       const regexPattern = /\/(\w+)\.(\d+)\.TPT$/;
//       urlParams = bibleUrls.map((url) => {
//         const match = url.match(regexPattern);
//         if (match) {
//           const book = match[1];
//           const chapter = match[2];
//           return { url, book, chapter };
//         }
//         return { url, book: "N/A", chapter: "N/A" };
//       });

//       console.log(urlParams);
//       // Loop urlParams
//       urlParams.forEach((urlParam) => {
//         //Extract text content from a URL
//         extractTextFromURL(urlParam)
//           .then((textContent) => {
//             const bookName = getBookFullName(urlParam.url, bookList);
//             const withoutFootNotes = filterOutFootnotes(textContent);
//             const formattedText = extractChapterAndRemoveMetadata(withoutFootNotes);
//             formattedText.versesArray = groupVerses(formattedText.versesArray);
//             formattedText.bookName = bookName;
//             inputDataArray.push(formattedText);
//           })
//           .then(() => {
//             console.log(inputDataArray);
//             generateXMLFile(inputDataArray);
//           })
//           .catch((error) => {
//             console.error("Error extracting text content:", error);
//           });
//       });
//     }
//   })
//   .catch((error) => {
//     console.error("Error reading file:", error);
//   });

//   function to extract text from visited urlParams
async function extractTextFromURL(urlParam) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(urlParam.url);

    // [data-usfm="${urlParam.book}.${urlParam.chapter}"]
    const textContent = await page.$$eval(`[data-usfm]`, (elements) =>
      elements.map((element) => element.textContent.trim())
    );

    await browser.close();
    return textContent;
  } catch (error) {
    console.error("An error occurred:", error);
    return null;
  }
}

// function to get book full name from url shortcode
function getBookFullName(url, bookList) {
  const regex = /\/([A-Z]+)\.\d+\.\w+$/;
  const match = url.match(regex);

  if (match) {
    const extractedBookName = match[1];
    const fullNameObject = bookList.find((book) => extractedBookName in book);

    if (fullNameObject) {
      const fullName = fullNameObject[extractedBookName];
      return fullName;
    }
  }
}

// function to remove footnotes
function filterOutFootnotes(array) {
  const filteredArray = array.map((element) => {
    // Remove content within # ... # (footnote) using regex
    return element.replace(/#([^#]+)#/g, "");
  });

  return filteredArray;
}

// function to remove chapter metadata from web scrape
function extractChapterAndRemoveMetadata(array) {
  const firstItem = array[0];
  const chapterMatch = firstItem.match(/^\d+/);

  let chapterNumber = null;
  if (chapterMatch) {
    chapterNumber = parseInt(chapterMatch[0]);
  }

  // Remove the first item (metadata) from the array
  const versesArray = array.slice(1);

  return { chapterNumber, versesArray };
}

// function to regroup verses from scattered array
function groupVerses(array) {
  const groupedVerses = [];
  let currentVerse = null;

  for (const item of array) {
    const verseMatch = item.match(/^\d+/); // Match verse number at the beginning of the item

    if (verseMatch) {
      if (currentVerse) {
        groupedVerses.push(currentVerse.join(" ")); // Join the lines of the previous verse
      }

      currentVerse = [item];
    } else if (currentVerse) {
      currentVerse.push(item); // Add the current line to the current verse
    }
  }

  if (currentVerse) {
    groupedVerses.push(currentVerse.join(" ")); // Push the last verse
  }

  return groupedVerses;
}

// const url = "https://www.bible.com/bible/1849/GAL.4.TPT";

// function to generate xml file from cleaned data
// function generateXMLFile(dataArray) {
//   const xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
// <XMLBIBLE xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" biblename="The Passion Translation">
// ${dataArray
//   .map(
//     (data) => `  <BIBLEBOOK bnumber="1" bname="${data.bookName}">
//     <CHAPTER cnumber="${data.chapterNumber}">
// ${data.versesArray
//   .map(
//     (verse, index) => `      <VERS vnumber="${index + 1}">
//         ${verse}
//       </VERS>`
//   )
//   .join("\n")}
//     </CHAPTER>
//   </BIBLEBOOK>`
//   )
//   .join("\n")}
// </XMLBIBLE>`;

//   fs.writeFileSync("tpt.xml", xmlContent);
// }

async function generateXMLFileFromDatabase() {
  try {
    const formattedData = await getFormattedData(); // Retrieve formatted data from database

    const xmlContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<XMLBIBLE xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" biblename="The Passion Translation">
${formattedData
  .map((data) => {
    const versesArrayText = data.versesArray; // Get versesArray text from database
    const versesArray = extractVersesArray(versesArrayText); // Extract verses as plain text

    return `  <BIBLEBOOK bnumber="1" bname="${data.bookName}">
${groupVersesByChapterAndVerse(versesArray, data.chapterNumber)}
  </BIBLEBOOK>`;
  })
  .join("\n")}
</XMLBIBLE>`;

    fs.writeFileSync("tpt.xml", xmlContent);
    console.log("XML file generated successfully!");
  } catch (error) {
    console.error("Error generating XML file:", error);
  }
}

// Function to extract and process versesArray text
function extractVersesArray(versesArrayText) {
  return versesArrayText
    .slice(1, -1) // Remove [] from both ends
    .split('","') // Split by ","
    .map((item) => item.trim()); // Trim whitespace
}

// Function to extract verse number
function extractVerseNumber(verseText) {
  const verseNumberMatch = verseText.match(/^\d+/);
  return verseNumberMatch ? verseNumberMatch[0] : "";
}

// Function to remove verse number from verse text
function removeVerseNumber(verseText) {
  return verseText.replace(/^\d+/, "").trim();
}

// Function to group verses by chapter and verse
function groupVersesByChapterAndVerse(versesArray, chapterNumber) {
  const groupedVerses = [];
  let currentChapter = { chapterNumber, verses: [] };

  for (let i = 0; i < versesArray.length; i++) {
    const verseText = versesArray[i];
    const verseNumber = extractVerseNumber(verseText);
    const cleanVerseText = removeVerseNumber(verseText);

    if (verseNumber !== "") {
      if (verseNumber === "1" && currentChapter.verses.length > 0) {
        groupedVerses.push(formatChapter(currentChapter));
        currentChapter = {
          chapterNumber: parseInt(chapterNumber) + 1,
          verses: [],
        };
      }

      currentChapter.verses.push({ verseNumber, verseText: cleanVerseText });
    }
  }

  if (currentChapter.verses.length > 0) {
    groupedVerses.push(formatChapter(currentChapter));
  }

  return groupedVerses.join("\n");
}

// Function to format chapter with verses
function formatChapter(chapter) {
  const { chapterNumber, verses } = chapter;
  const formattedVerses = verses
    .map(
      ({ verseNumber, verseText }) =>
        `      <VERS vnumber="${verseNumber}">${verseText}</VERS>`
    )
    .join("\n");
  return `    <CHAPTER cnumber="${chapterNumber}">
${formattedVerses}
    </CHAPTER>`;
}
/*
  Deduction from pupeteer extract

  1. the first character is the chapter number
  2. chapter verses start with chapter:verse and then a string of characters
  3. footnotes are included in verses with a leading #


{
  chapterNumber: 4,
  versesArray: [
    '1Let me illustrate: As long as an heir is a minor, he’s not really much different than a servant, although he’s the master over all of them.',
    '2For until the time appointed by the father, the child is under the domestic supervision of the guardians of the estate.',
    '3So it is with us. When we were juveniles we were enslaved under the hostile spirits of the world.',
    '4But when the time of fulfillment had come, God sent his Son, born of a woman, #  4:4  Every child has a mother; but for Jesus to be “born of a woman” meant there was no human father, no male counterpart. Jesus’ true Father is the Father of Eternity. No other child has had a virgin birth, “born of a woman,” except him. All the rest of us are born from a father and a mother.   born under the law.',
    '5Yet all of this was so that he would redeem and set free those held hostage to the law so that we would receive our freedom and a full legal adoption as his children.',
    '6And so that we would know that we are his true children,   4:6  This is the Aramaic word  Abba  which means “my father.”  Abba  was borrowed by the Greeks and is found in the Greek manuscripts as well.   My true Father!”',
    '7Now we’re no longer living like slaves under the law, but we enjoy being God’s very own sons and daughters! And because we’re his, we can access everything our Father has—for we are heirs because of what God has done!',
    '8Before we knew God as our Father, we were unwitting servants to the powers that be, which are nothing compared to God.',
    '9But now that we truly know him and are intimately known by him, why would we for a moment consider turning back to those weak and feeble principles of religion, as though we were still subject to them?',
    '10Why would we want to scrupulously observe rituals like special days,   4:10  These terms could also apply to following astrological signs.',
    '11I’m so alarmed about you that I’m beginning to wonder if my labor in ministry among you was a waste of time!',
    '12Beloved ones, I plead with you, brothers and sisters, become like me, for I became like you. You did me no wrong.',
    '13You are well aware that the reason I stayed among you to preach the good news was because of the poor state of my health. #  4:13  Paul’s ministry in Antioch began when he became sick and had to delay his missionary journey to other regions. He may have been afflicted with an illness, or an ophthalmic disorder that was prevalent in the region. The disorder can cause one to have a repugnant appearance. Other scholars think he was simply very ill as a result of his treatment by his enemies on his first missionary journey. Still the Galatians did not reject him; instead they welcomed him with open arms, and his gospel message with open hearts.',
    '14And yet you were so kind to me and did not despise me in my weakness, #  4:14  The Aramaic word can also mean “sickness.”   even though my physical condition put you through an ordeal while I was with you. Actually, you received me and cared for me as though I were an angel from God, as you would have cared for Jesus Christ himself!',
    '15Some of you were even willing, if it were possible, to pluck out your own eyes to replace mine! Where is that kindhearted and free spirit now?',
    '16Have I really become your enemy because I tell you the truth?',
    '17Can’t you see what these false teachers #  4:17  Or “whispering enemies.”   are doing? They want to win you over so you will side with them. They want you divided from me so you will follow only them. Would you call that integrity?',
    '18Isn’t it better to seek excellence and integrity always, and not just only when I’m with you?',
    '19You are my dear children, but I agonize in spiritual “labor pains” once again, until the Anointed One will be fully formed in your hearts!',
    '20How I wish I could be there in person and change my tone toward you, for I am truly dumbfounded over what you are doing!',
    '21-22Tell me, do you want to go back to living strictly by the law? Haven’t you ever listened to what the law really says? Have you forgotten that Abraham had two sons; one by the slave girl, and the other by the freewoman? #  4:21–22  See  Gen. 16:15;  21:2.',
    '23Ishmael, the son of the slave girl, was born of the natural realm. But Isaac, the son of the freewoman, was born supernaturally by the Spirit—a child of the promise of God!',
    '24These two women and their sons express an allegory and become symbols of two covenants. The first covenant was born on Mount Sinai, birthing children into slavery—children born to Hagar.',
    '25For “Hagar” represents the law given at Mount Sinai in Arabia. The “Hagar” metaphor corresponds to the earthly Jerusalem of today who are currently in bondage.',
    '26In contrast, there is a heavenly Jerusalem above us, which is our true “mother.” She is the freewoman, birthing children into freedom! #  4:26  Paul is showing that the law is a system of works that brings bondage and that the promise is a system of grace that brings true freedom.',
    '27For it is written: “Burst forth with gladness, rejoice, O barren woman with no children, break through with the shouts of joy and jubilee, for you are about to give birth! The one who was once considered desolate and barren now has more children than the one who has a husband!” #  4:27  See  Isa. 54:1.',
    '28Dear friends,   4:28  Or “royal proclamation.”',
    '29And just as the son of the natural world at that time harassed the son born of the power of the Holy Spirit, so it is today.',
    '30And what does the Scripture tell us to do? “Expel the slave mother with her son! #  4:30  See  Gen. 21:10. This is showing that the two “sons” are not meant to live together. You cannot mingle law and grace, for only grace is based upon the promise of new life. The son of the slave woman will not be a true heir— for the true heir of the promises is the son of the freewoman.” #  4:30  See  Gen. 21:10–12;  John 8:35.',
    '31It’s now so obvious! We’re not the children of the slave woman; we’re the supernatural sons of the freewoman—sons of grace!'
  ],
  bookName: 'Galatians'
}
  
  */
