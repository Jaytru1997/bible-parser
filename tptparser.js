// const fs = require("fs");
const puppeteer = require("puppeteer");
// dataset-test-content is the target for chapter content
// data-usfm has the book and chapter number
// data-usfm code ${bookCode.chapterNumber.verseNumber}

// book Codes
const bookList = [
  { PSA: ["Psalms", 150] },
  { PRO: ["Proverbs", 31] },
  { SNG: ["Song of Solomon", 8] },
  { MAT: ["Matthew", 28] },
  { MRK: ["Mark", 16] },
  { LUK: ["Luke", 24] },
  { JHN: ["John", 21] },
  { ACT: ["Acts", 28] },
  { ROM: ["Romans", 16] },
  { "1CO": ["1 Corinthians", 16] },
  { "2CO": ["2 Corinthians", 13] },
  { GAL: ["Galatians", 6] },
  { EPH: ["Ephesians", 6] },
  { PHP: ["Philippians", 4] },
  { COL: ["Colossians", 4] },
  { "1TH": ["1 Thessalonians", 5] },
  { "2TH": ["2 Thessalonians", 3] },
  { "1TI": ["1 Timothy", 6] },
  { "2TI": ["2 Timothy", 4] },
  { TIT: ["Titus", 3] },
  { PHM: ["Philemon", 1] },
  { HEB: ["Hebrews", 13] },
  { JAS: ["James", 5] },
  { "1PE": ["1 Peter", 5] },
  { "2PE": ["2 Peter", 3] },
  { "1JN": ["1 John", 5] },
  { "2JN": ["2 John", 1] },
  { "3JN": ["3 John", 1] },
  { JUD: ["Jude", 1] },
  { REV: ["Revelation", 22] },
];
let bookUrls = [];

// Function to generate valid URL for a book and chapter
function generateURL(bookCode, chapter) {
  const baseURL = "https://www.bible.com/bible/1849/";
  return `${baseURL}${bookCode}.${chapter}.TPT`;
}

// Iterate over each book in the list
bookList.forEach((book) => {
  const bookCode = Object.keys(book)[0];
  const bookInfo = book[bookCode];
  const bookName = bookInfo[0];
  const numChapters = bookInfo[1];

  // Generate URLs for each chapter of the book
  for (let chapter = 1; chapter <= numChapters; chapter++) {
    const url = generateURL(bookCode, chapter);
    // console.log(`Book: ${bookName}, Chapter: ${chapter}, URL: ${url}`);
    bookUrls.push(url);
  }
});

// console.log(bookUrls, bookUrls.length);

async function extractTextFromURL(url) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);

    const textContent = await page.$$eval(
      '[data-datatype="usfm"]',
      (elements) => elements.map((element) => element.textContent.trim())
    );

    await browser.close();
    return textContent;
  } catch (error) {
    console.error("An error occurred:", error);
    return null;
  }
}

// Example usage: Extract text content from a URL
const url = bookUrls[0];
extractTextFromURL(url)
  .then((textContent) => {
    console.log("Text content:", textContent);
  })
  .catch((error) => {
    console.error("Error extracting text content:", error);
  });
