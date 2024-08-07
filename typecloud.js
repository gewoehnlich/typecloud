function getWordQueueArray() {
    const array = [];
    for (let i = 0; i < arrayLength; ++i) {
        array.push(Number(0));
    }

    return array;
}

class TimeNode {
    constructor(val, time) {
        this.val = val;
        this.next = null;
        this.time = time;
    }
}

class TimeQueue {
    constructor() {
        this.end = null;

        this.valueFifteenSeconds = 0;
        this.valueThirtySeconds = 0;
        this.valueOneMinute = 0;
        this.valueTwoMinutes = 0;
        this.valuesList = ["valueFifteenSeconds", "valueThirtySeconds", "valueOneMinute", "valueTwoMinutes"];
        
        this.pointerFifteenSeconds = null;
        this.pointerThirtySeconds = null;
        this.pointerOneMinute = null;
        this.pointerTwoMinutes = null;
        this.pointersList = ["pointerFifteenSeconds", "pointerThirtySeconds", "pointerOneMinute", "pointerTwoMinutes"];
    }

    add(val) {
        const node = new TimeNode(val, Date.now());

        if (!this.end) {
            for (let key of this.valuesList) {
                this[key] = 0;
            }

            this.end = node;  
            for (let key of this.pointersList) {
                this[key] = node;
            }
        } else {
            this.end.next = node;
            this.end = this.end.next;
        }

        for (let key of this.valuesList) {
            this[key] += val;
        }
    }
}

class WordNode {
    constructor(word) {
        this.word = word;
        this.totalCount = getWordQueueArray();
        for (const letter of word) {
            ++this.totalCount[letter.charCodeAt(0)];
        }

        this.wrongCount = getWordQueueArray();
    }
}

class WordQueue {
    constructor() {
        this.head = null;
        this.end = null;
        this.length = 0;
        this.maxLength = 100;

        const words = localStorage.getItem("wordQueueWords");
        if (!words) {
            localStorage.setItem("wordQueueWords", "");
        } else {
            const wordsArray = words.split(",");
            const wordsArrayLength = wordsArray.length;

            const headNode = new WordNode(wordsArray[0]);
            this.head = headNode;
            this.end = headNode;
            this.length += 1;

            for (let i = 1; i < wordsArrayLength; ++i) {
                const newNode = new WordNode(wordsArray[i]);
                this.end.next = newNode;
                this.end = this.end.next;
                this.length += 1;
            }
        }

        this.totalCount = localStorage.getItem("wordQueueTotalCount")?.split(",");
        if (!this.totalCount) {
            this.totalCount = getWordQueueArray();
            localStorage.setItem("wordQueueTotalCount", this.totalCount);
        }

        this.wrongCount = localStorage.getItem("wordQueueWrongCount")?.split(",");
        if (!this.wrongCount) {
            this.wrongCount = getWordQueueArray();
            localStorage.setItem("wordQueueWrongCount", this.wrongCount);
        }
    }

    add(word) {
        if (!this.head) {
            const node = new WordNode(word);
            this.head = node;
            this.end = node;
        } else {
            this.end.next = new WordNode(word);
            this.end = this.end.next; 
        }

        ++this.length;

        while (this.length > this.maxLength) {
            // this function does not remove wrong and total count back
            // wordQueueWords has to take into account not only RegularWords, but SymbolsWords and NumbersWords too.
            this.head = this.head.next;
            --this.length;
        }
    }
}

class Node {
    constructor(word, time) {
        this.word = word; // length is word.length;
        this.time = time;
        this.next = null;
        this.totalCount = {};
        this.wrongCount = {};
    }
}

// class Queue {
//     constructor() {
//         this.head = null;
//         this.end = null;
//         this.currentLength = 0;
//         this.maxLength = 100;

//         this.valueFifteenSeconds = 0;
//         this.valueThirtySeconds = 0;
//         this.valueOneMinute = 0;
//         this.valueTwoMinutes = 0;
//         this.valuesList = ["valueFifteenSeconds", "valueThirtySeconds", "valueOneMinute", "valueTwoMinutes"];
        
//         this.pointerFifteenSeconds = null;
//         this.pointerThirtySeconds = null;
//         this.pointerOneMinute = null;
//         this.pointerTwoMinutes = null;
//         this.pointersList = ["pointerFifteenSeconds", "pointerThirtySeconds", "pointerOneMinute", "pointerTwoMinutes"];

//         const words = localStorage.getItem("wordQueueWords");
//         if (!words) {
//             localStorage.setItem("wordQueueWords", "");
//         } else {
//             const wordsArray = words.split(",");
//             const wordsArrayLength = wordsArray.length;

//             const headNode = new WordNode(wordsArray[0]);
//             this.head = headNode;
//             this.end = headNode;
//             this.length += 1;

//             for (let i = 1; i < wordsArrayLength; ++i) {
//                 const newNode = new WordNode(wordsArray[i]);
//                 this.end.next = newNode;
//                 this.end = this.end.next;
//                 this.length += 1;
//             }
//         }

//         this.totalCount = localStorage.getItem("wordQueueTotalCount")?.split(",");
//         if (!this.totalCount) {
//             this.totalCount = getWordQueueArray();
//             localStorage.setItem("wordQueueTotalCount", this.totalCount);
//         }

//         this.wrongCount = localStorage.getItem("wordQueueWrongCount")?.split(",");
//         if (!this.wrongCount) {
//             this.wrongCount = getWordQueueArray();
//             localStorage.setItem("wordQueueWrongCount", this.wrongCount);
//         }
//     }    
// }

function makeCapsLockWord(wordElement, randomWord) {
    const randomWordLength = randomWord.length;
    for (let i = 0; i < randomWordLength; ++i) {
        const letter = document.createElement("span");
        letter.classList.add("letter");
        letter.textContent = convertLetterToUpper(randomWord[i]);

        wordElement.appendChild(letter);
    }

    addSymbolAndSpaceElements(wordElement);
}

function makeRegularWord(wordElement, randomWord) {
    const randomWordLength = randomWord.length;
    for (let i = 0; i < randomWordLength; ++i) {
        const letter = document.createElement("span");
        letter.classList.add("letter");
        letter.textContent = randomWord[i];

        wordElement.appendChild(letter);
    }

    addSymbolAndSpaceElements(wordElement);
}

function addSymbolAndSpaceElements(wordElement) {
    const randomSymbol = getRandomSymbol();
    const symbol = document.createElement("span");
    symbol.classList.add("letter", "symbol");
    symbol.textContent = randomSymbol;
    wordElement.appendChild(symbol);

    const space = getSpaceElement();
    wordElement.appendChild(space);    
}

function getRandomWord(lettersArray) {
    const randomIndex = Math.floor(Math.random() * lettersArray.length);
    const randomWord = words[randomIndex];

    wordQueue.add(randomWord);

    const wordElement = document.createElement("div");
    wordElement.classList.add("word");

    if (capsLockCount) {
        makeCapsLockWord(wordElement, randomWord);
        --capsLockCount;
    } else {
        makeRegularWord(wordElement, randomWord);
        const firstCharRandom = (Math.random() <= 0.3);
        if (firstCharRandom) {
            wordElement.firstChild.textContent = convertLetterToUpper(wordElement.firstChild.textContent);
        }
    }

    return wordElement;
}

function convertLetterToUpper(letter) {
    const charAscii = letter.charCodeAt(0);
    const upperLetter = String.fromCharCode(charAscii - 32);
    return upperLetter;
}

function getSpaceElement() {
    const space = document.createElement("span");
    space.classList.add("letter");
    space.classList.add("space");
    return space;
}

function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * symbolsLength);
    return symbols[randomIndex];
}


function makeWordQueueRecords() {
    let wordQueueWords = "";
    let curr = wordQueue.head;
    while (curr) {
        wordQueueWords += curr.word + ",";
        curr = curr.next;
    }

    if (wordQueueWords != "") {
        wordQueueWords = wordQueueWords.slice(0, -1);
    }

    localStorage.setItem("wordQueueWords", wordQueueWords);
    localStorage.setItem("wordQueueWrongCount", wordQueue.wrongCount);
    localStorage.setItem("wordQueueTotalCount", wordQueue.totalCount);
}

function changeCursorPosition() {
    const nextLetterPosition = document.querySelector(".letter.current").getBoundingClientRect();
    const previousTopPosition = cursor.style.top;
    cursor.style.top = nextLetterPosition.top + "px";
    cursor.style.left = nextLetterPosition.left + "px";

    if (previousTopPosition != cursor.style.top) {
        makeWordQueueRecords();
        deletePreviousWords();
        changeCursorPosition();
        generateWords();
    }
}

function calculateCoefficientArray(arrayIndexes) {
    let seenCoefficientsSum = 0;
    const array = [];
    for (const i of arrayIndexes) {
        const lettersTotalCount = parseInt(wordQueueTotalCount[i]);
        if (lettersTotalCount == 0) {
            array.push(seenCoefficientsSum);
            continue;
        }

        const lettersWrongCount = parseInt(wordQueueWrongCount[i]);
        const lettersCoefficient = lettersWrongCount / lettersTotalCount;
        seenCoefficientsSum += lettersCoefficient;
        array.push(seenCoefficientsSum);
    }

    const lettersOccurenceConsistencyCoefficient = Math.max(1, array[array.length - 1] / 4);
    const lettersConsistencyArray = [];
    let lettersConsistencySum = 0;
    for (const i of arrayIndexes) {
        lettersConsistencySum += 1 / Math.max(1, wordQueueTotalCount[i]);
        lettersConsistencyArray.push(lettersConsistencySum);
    }

    const coefficient = lettersOccurenceConsistencyCoefficient / lettersConsistencyArray[array.length - 1];
    for (let i = 0; i < array.length; ++i) {
        array[i] += lettersConsistencyArray[i] * coefficient;
    }

    return array;
}

function generateCoefficientArrays() {
    wordQueueTotalCount = localStorage.getItem("wordQueueTotalCount").split(",");
    wordQueueWrongCount = localStorage.getItem("wordQueueWrongCount").split(",");
    symbolsCoefficientArray = calculateCoefficientArray(symbolsIndexes);
    numbersCoefficientArray = calculateCoefficientArray(numbersIndexes);
    lettersCoefficientArray = calculateCoefficientArray(lettersIndexes);
}

function generateWords() {
    generateCoefficientArrays();

    while (wordsList.scrollHeight <= wordsList.clientHeight) {
        const randomValue = Math.random();
        if (randomValue <= 0.075) {
            generateSymbolsWord(symbolsCoefficientArray);
        } else if (randomValue <= 0.125) {
            generateNumbersWord(numbersCoefficientArray);
        } else {
            if (randomValue <= 0.2) {
                capsLockCount += 1 + Math.ceil(Math.random() * 3);
            }

            generateRegularWord(lettersCoefficientArray);
        }
    }
}

function generateRegularWord(array) {
    const lettersArray = getProblematicLetter(array);
    const word = getRandomWord(lettersArray);
    wordsList.appendChild(word);
}

function generateNumbersWord(array) {
    const numbersWord = document.createElement("div");
    numbersWord.classList.add("word", "numbers");

    const numbersWordLength = Math.ceil(Math.random() * numbersLength) + 1;
    for (let i = 0; i < numbersWordLength; ++i) {
        const number = document.createElement("span");
        number.classList.add("letter", "number");
        number.textContent = numbers[Math.floor(Math.random() * numbersLength)];
        numbersWord.appendChild(number);
    }

    const space = getSpaceElement();
    numbersWord.appendChild(space);
    wordsList.appendChild(numbersWord);
}

function generateSymbolsWord(array) {
    const extraSymbolsLength = Math.floor(Math.random() * 4);
    const symbolsWordLength = 9 + extraSymbolsLength;

    const symbolsWord = document.createElement("div");
    symbolsWord.classList.add("word", "symbols");
    for (let i = 0; i < symbolsWordLength; ++i) {
        const symbol = document.createElement("span");
        symbol.classList.add("letter", "symbol");
        symbol.textContent = symbols[Math.floor(Math.random() * symbolsLength)];
        symbolsWord.appendChild(symbol);
    }

    const space = getSpaceElement();
    symbolsWord.appendChild(space);
    wordsList.appendChild(symbolsWord);
}

function getProblematicLetter(array) {
    // this function determines what letter to draw words from

    const totalLettersCoefficientSum = array[25];
    const randomValue = Math.random() * totalLettersCoefficientSum;
    let letterIndex = 0;
    let left = 0;
    let right = 25;
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        if (array[mid] <= randomValue) {
            letterIndex = mid;
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return wordsIndexes[letterIndex];
}

function setCursorPosition() {
    const currentLetterPosition = document.querySelector(".letter.current").getBoundingClientRect();
    cursor.style.top = currentLetterPosition.top + "px";
    cursor.style.left = currentLetterPosition.left + "px";
}

function newGame() {
    const timeQueue = new TimeQueue();
    generateWords();
    setCurrent();
    setMaxResult();
    setCursorPosition();

    return timeQueue;
}

function deletePreviousWords() {
    while (true) {
        const firstWord = wordsList.firstChild;
        if (firstWord.classList.contains("current")) {
            break;
        }

        firstWord.remove();
    }
}

function setCurrent() {
    const firstWord = wordsList.firstChild;
    firstWord.classList.add("current");
    
    const firstLetter = firstWord.firstChild;
    firstLetter.classList.add('current');
}

function calculateTimeRanges() {                                   /////////// there should be more descriptive name for a function
    const timeNow = Date.now();
    for (let i = 3; i >= 0; --i) {
        if (i != 3 && timeQueue[valuesList[i + 1]] < timeQueue[valuesList[i]]) {
            timeQueue[valuesList[i]] = timeQueue[valuesList[i + 1]];
            timeQueue[pointersList[i]] = timeQueue[pointersList[i + 1]];
        } else {
            let outOfRange = true;
            while (outOfRange && timeQueue[pointersList[i]]) {
                const pointerTime = timeQueue[pointersList[i]].time;
                const diff = (timeNow - pointerTime) / 1000;
                
                if (diff < timeRanges[i]) {
                    outOfRange = false;
                } else {
                    timeQueue[valuesList[i]] -= timeQueue[pointersList[i]].val;
                    timeQueue[pointersList[i]] = timeQueue[pointersList[i]].next;
                }
            }
        }
        
        ///// it would be better to make it in a separate function
        const resultElement = document.getElementById(timeRangeIds[i]);
        resultElement.textContent = timeQueue[valuesList[i]];
    }
}

function updateMaxResult() { 
    for (let i = 0; i < 4; ++i) {
        if (timeQueue[valuesList[i]] > maxResultValues[i]) {
            maxResultValues[i] = timeQueue[valuesList[i]];
            localStorage.setItem(maxResultIds[i], maxResultValues[i]);
            document.getElementById(maxResultIds[i]).textContent = maxResultValues[i];
        }
    }
}

function setMaxResult() {
    for (let i = 0; i < 4; ++i) {
        document.getElementById(maxResultIds[i]).textContent = maxResultValues[i];
    }
}

document.addEventListener("keydown", ev => {
    const key = ev.key;
    const currentWord = document.querySelector(".word.current");
    const currentLetter = currentWord.querySelector(".letter.current");
    const expected = currentLetter.textContent || " ";
    const isLetter = key.length === 1 && key != " ";
    const isSpace = key === " ";
    const isBackspace = key === "Backspace";

    if (isBackspace) {
        const isFirstLetter = currentLetter === currentWord.firstChild;
        if (ev.ctrlKey) {
            const lettersToInvalidate = [...document.querySelectorAll('.word.current .letter')];
            lettersToInvalidate.forEach(letter => {
                letter.classList?.remove("incorrect");
                letter.classList?.remove("correct");
            });
            
            currentLetter.classList.remove("current");
            currentWord.firstChild.classList.add("current");
        } else if (!isFirstLetter) {
            currentLetter.classList.remove("current");
            currentLetter.classList.remove("correct");
            currentLetter.classList.remove("incorrect");

            const previousLetterClassList = currentLetter.previousSibling.classList;
            previousLetterClassList.remove("incorrect");
            previousLetterClassList.remove("correct");
            previousLetterClassList.add("current");
        }
    } else if (key === expected) {
        if (isLetter) {
            currentLetter.classList.remove("current");
            currentLetter.classList.add("correct");
            currentLetter.nextSibling.classList.add("current"); 
        } else if (isSpace) {
            let stillWrong = false;
            for (const letter of currentWord.childNodes) {
                if (letter.classList.contains("incorrect")) {
                    stillWrong = true;
                    break;
                }
            }

            if (!stillWrong) {
                const length = currentWord.childNodes.length;
                timeQueue.add(length);
                
                calculateTimeRanges();
                updateMaxResult();
                
                currentLetter.classList.remove("current");
                currentWord.classList.remove("current");
                const nextWord = currentWord.nextSibling;
                nextWord.classList.add("current");
                const nextLetter = nextWord.firstChild;
                nextLetter.classList.add("current");
            }
        }
    } else {
        if (expected === " ") {
            // i have trouble with implementing this
            // because every word ends with a "space" element
            // and if user for example make a mistake when "space" is current
            // it should add an extra element
            // which is problematic, because i will have to move this "space"
            
            // ??? will return to it after some time
        } else if (isLetter || isSpace) {
            currentLetter.classList.add("incorrect");
            const nextLetter = currentLetter.nextSibling;
            if (nextLetter) {
                currentLetter.classList.remove("current");
                nextLetter.classList.add('current');
            }
            
            const letterAscii = currentLetter.textContent.charCodeAt(0);
            // ++wordQueue.curr.wrongCount[letterAscii];
        }
    }

    changeCursorPosition();
});

async function makeLocalStorageRecordsIfNeeded() {
    async function loadWords() {
        const response = await fetch("words-en.json");
        const words = await response.json();
        return words;
    }

    async function loadWordsIndexes() {
        const response = await fetch("wordsIndexes.json");
        const wordsIndexesData = await response.json();
        return wordsIndexesData;
    }

    async function loadTrie() {
        const response = await fetch("trie4.json");
        const trieData = await response.json();
        return trieData;
    }

    async function storeTrieInIndexedDB(data) {
        const request = indexedDB.open("trie", 1);

        request.onsuccess = function(event) {
            const db = event.target.result;
            const transaction = db.transaction("trie", 'readwrite');
            const objectStore = transaction.objectStore("trie");

            objectStore.put(data);
        }
    }

    let words;
    if (!localStorage.getItem("words")) {
        words = await loadWords();
        localStorage.setItem("words", words);
    }

    let wordsIndexes;
    for (let i = 0; i < lettersLength; ++i) {
        const letter = letters[i];
        if (!localStorage.getItem(letter + "LetterWords")) {
            if (!wordsIndexes) {
                wordsIndexes = await loadWordsIndexes();
            }

            localStorage.setItem(letter + "LetterWords", wordsIndexes[i]);
        }
    }

    let trieData;
    if (!indexedDB.databases()) {
        console.log('wer')
        data = await loadTrie();
        trieData = await storeTrieInIndexedDB(data);
    }

    // data = await loadTrie();
    // trieData = await storeTrieInIndexedDB(data);

    if (wordsIndexes || words || trieData) {
        location.reload();
    }
}

function getMaxResultValues() {
    let maxResultValues = [];
    for (const result of maxResultIds) {
        const maxResult = localStorage.getItem(result);
        if (!maxResult) {
            localStorage.setItem(result, 0);
            maxResultValues.push(Number(0));
        } else {
            maxResultValues.push(parseInt(maxResult));
        }
    }

    return maxResultValues;
}

function getWordIndexes() {
    const wordsIndexes = [];
    for (const letter of letters) {
        const keyLetters = localStorage.getItem(letter + "LetterWords").split(",");
        wordsIndexes.push(keyLetters);
    }
    
    return wordsIndexes;
}





const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const lettersLength = letters.length;
const symbols = ['!', '"', '#', '$', '%', '&', '(', ')', '*', '+', ',', '-', '.', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^',
     '_', '`', '{', '|', '}', '~', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const symbolsLength = symbols.length;
const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const numbersLength = numbers.length;
const timeRangeIds = ["rangeFifteen", "rangeThirty", "rangeOneMinute", "rangeTwoMinutes"];
const maxResultIds = ["maxResultFifteen", "maxResultThirty", "maxResultOneMinute", "maxResultTwoMinutes"];
const arrayLength = 127;
const symbolsIndexes = [33, 34, 35, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 58, 59, 60, 61, 62, 63, 64, 91, 92, 93, 94, 95, 96, 123, 124, 125, 126];
const numbersIndexes = [48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
const lettersIndexes = [97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122];
let wordQueueTotalCount;
let wordQueueWrongCount;
let symbolsCoefficientArray;
let numbersCoefficientArray;
let lettersCoefficientArray;

makeLocalStorageRecordsIfNeeded();
const words = localStorage.getItem("words").split(",");
const wordsLength = words.length;
const wordsList = document.getElementById('wordsList');
const maxResultValues = getMaxResultValues();
const wordsIndexes = getWordIndexes();

let capsLockCount = 0;
const cursor = document.getElementById("cursor");
const wordQueue = new WordQueue();
const timeQueue = newGame(); 
const valuesList = timeQueue.valuesList;
const pointersList = timeQueue.pointersList;
const timeRanges = [15, 30, 60, 120];

// design idea:
// i like when the width of an input is not wide 
// like 700px or something
// so what if the design would be: 
// the input on the left, and (something) on the right;

// make so sometimes typecloud instead of regular words
// would "talk" to the user
// like "congratulation you have reached *something*! keep it up!"
// and the user would have to type that out
// just like regular testcases
// maybe it is a good idea
// to make like "epic", "legendary" testcases
// like in Gwent

// here is another idea for typecloud
// make two modes for it
// the first should incourage people to type as accurate as possible
// the purpose of this is to teach user how to type properly
// and the second mode would get activated
// when user accuracy was good enough for some time
// so now he has to be typing as fast as he can
//
// make so for the first mode he would get panished twice per mistake
// meaning wrongCount would be not +1, but +2 for example
// and for the second mode he would not get panished at all

// make so for the accuracy mode the symbols would be placed randomly
// at any position in a word
// for the speed mode they would be either at the beginning or at the end

// maybe color every letter that a user has to press with a different color?
// like there are 8 fingers you have to use to type, right?
// so maybe instead of just dark grey text, make different tones of it for every finger?
// so it would be more clear what finger to use to type a letter

// learn how to use google chrome javascript debugger
// it's going to be much easier so debug code
// right now i have a problem with implementing generateSymbolsWord();
// it gets called much more times, than i expected
// i have to investigate what it causing such a behavior

// make a dynamic coefficients for symbols and numbers
// meaning if i just got a symbols word
// the chance of drawing another symbols word drops to 0
// and increases with every roll
// the same with numbers too

// make so if a user makes a mistake in a word
// it would be drawn the very next time a new word needs to be drawn
// so the user would get the same exact word 
// a required number of times before it will type in the right way
// without making any mistake




// realize typecloud words database as a trie
// it will work like this:
// random letter out of the worse gets drawn
// then algorithm keeps rolling worse letters
// while there are words containing those letters
// like: user drawn 't', 'h', 'e'
// and there is a word "the" in words
// so it is the one that gets drawn
// if, for example, user drawn 't', 'h', 'z'
// but there are no words containing all those letters
// then it rolls back the last one
// and it selects random word out of 't', 'h'
// this is the best idea i have so far
// but very difficult to implement