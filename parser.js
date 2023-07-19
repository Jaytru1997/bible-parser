const fs = require("fs");
const xml2js = require("xml2js");

// Read the XML data from a file
fs.readFile("xml.xml", "utf8", (err, xmlData) => {
  if (err) {
    console.error("Error reading XML file:", err);
    return;
  }

  const bookCodes = [
    { GEN: "Genesis" },
    { EXO: "Exodus" },
    { LEV: "Leviticus" },
    { NUM: "Numbers" },
    { DEU: "Deuteronomy" },
    { JOS: "Joshua" },
    { JDG: "Judges" },
    { RUT: "Ruth" },
    { "1SA": "1 Samuel" },
    { "2SA": "2 Samuel" },
    { "1KI": "1 Kings" },
    { "2KI": "2 Kings" },
    { "1CH": "1 Chronicles" },
    { "2CH": "2 Chronicles" },
    { EZR: "Ezra" },
    { NEH: "Nehemiah" },
    { EST: "Esther" },
    { JOB: "Job" },
    { PSA: "Psalms" },
    { PRO: "Proverbs" },
    { ECC: "Ecclesiastes" },
    { SNG: "Song of Solomon" },
    { ISA: "Isaiah" },
    { JER: "Jeremiah" },
    { LAM: "Lamentations" },
    { EZK: "Ezekiel" },
    { DAN: "Daniel" },
    { HOS: "Hosea" },
    { JOL: "Joel" },
    { AMO: "Amos" },
    { OBA: "Obadiah" },
    { JON: "Jonah" },
    { MIC: "Micah" },
    { NAM: "Nahum" },
    { HAB: "Habakkuk" },
    { ZEP: "Zephaniah" },
    { HAG: "Haggai" },
    { ZEC: "Zechariah" },
    { MAL: "Malachi" },
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

  // Parse the XML data
  xml2js.parseString(xmlData, (err, result) => {
    if (err) {
      console.error("Error parsing XML:", err);
      return;
    }

    // Create the root element for the new XML
    const newRoot = {
      XMLBIBLE: {
        $: {
          "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          biblename: "Nigerian Pidgin Bible",
        },
        BIBLEBOOK: [],
      },
    };

    // Iterate over the <v> elements in the original XML
    result.verseFile.v.forEach((vElem) => {
      const book = vElem.$.b;
      const chapter = vElem.$.c;
      const verse = vElem.$.v;
      const text = vElem._;

      // Find the book code in the list
      const bookObj = bookCodes.find((code) => Object.keys(code)[0] === book);

      // Skip the verse if the book code is not found in the list
      if (!bookObj) {
        return;
      }

      const bookNumber = bookCodes.indexOf(bookObj) + 1;
      const bookName = Object.values(bookObj)[0];

      // Create the BIBLEBOOK element if it doesn't exist
      let bibleBook = newRoot.XMLBIBLE.BIBLEBOOK.find(
        (b) => b.$.bnumber === bookNumber.toString()
      );
      if (!bibleBook) {
        bibleBook = {
          $: {
            bnumber: bookNumber.toString(),
            bname: bookName,
          },
          CHAPTER: [],
        };
        newRoot.XMLBIBLE.BIBLEBOOK.push(bibleBook);
      }

      // Create the CHAPTER element
      const chapterElem = bibleBook.CHAPTER.find(
        (c) => c.$.cnumber === chapter
      );
      if (!chapterElem) {
        bibleBook.CHAPTER.push({
          $: {
            cnumber: chapter,
          },
          VERS: [],
        });
      }

      // Create the VERS element
      const versElem = {
        $: {
          vnumber: verse,
        },
        _: text,
      };
      bibleBook.CHAPTER.find((c) => c.$.cnumber === chapter).VERS.push(
        versElem
      );
    });

    // Convert the JSON object to XML
    const builder = new xml2js.Builder({
      headless: true,
      xmldec: {
        version: "1.0",
        encoding: "UTF-8",
        standalone: "yes",
      },
    });
    const newXmlData = builder.buildObject(newRoot);

    // Write the new XML to a file
    fs.writeFile("pidgin.xml", newXmlData, "utf8", (err) => {
      if (err) {
        console.error("Error writing XML:", err);
        return;
      }
      console.log("XML conversion successful. File saved as pidgin.xml.");
    });
  });
});
