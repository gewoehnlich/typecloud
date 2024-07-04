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
    }
}

class WordQueue {
    constructor() {
        this.head = null;
        this.end = null;
        this.length = 0;
        this.maxLength = 10;

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

function getWordQueueArray() {
    const array = [];
    for (let i = 0; i < 127; ++i) {
        array.push(Number(0));
    }

    return array;
}

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

function generateWords() {
    const array = getAllLettersMistakesCoefficientArray();
    const noMistakesWereMadeBefore = (array[25] === 0);
    if (noMistakesWereMadeBefore) {
        regularRandomAlgorithm();
    } else {
        typecloud(array);
    }
}

function regularRandomAlgorithm() {
    // this is the algorithm that typecloud is going to use
    // if it's the first time a user logged into typecloud
    // or he is so good, that he just doesn't make mistakes while typing

    while (wordsList.scrollHeight <= wordsList.clientHeight) {
        const randomIndex = Math.floor(Math.random() * wordsLength);
        const word = getRandomWord(randomIndex);
        wordsList.appendChild(word);
    }
}

function typecloud(array) {
    // wordQueueWords has to take into account not only RegularWords, but SymbolsWords and NumbersWords too.
    while (wordsList.scrollHeight <= wordsList.clientHeight) {
        const randomValue = Math.random();
        if (randomValue <= 0.075) {
            generateSymbolsWord();
        } else if (randomValue <= 0.125) {
            generateNumbersWord();
        } else {
            if (randomValue <= 0.2) {
                capsLockCount += 1 + Math.ceil(Math.random() * 3);
            }

            generateRegularWord(array);
        }
    }
}

function generateRegularWord(array) {
    const lettersArray = getProblematicLetter(array);
    const word = getRandomWord(lettersArray);
    wordsList.appendChild(word);
}

function generateNumbersWord() {
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

function generateSymbolsWord() {
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

function getAllLettersMistakesCoefficientArray() {
    // what this function does is:
    // for example, a user got in total 10 words with a letter "e" in them
    // and he made a mistake 3 times trying to type "e" in those words
    // so, his lettersCoefficient is 3/10 = 0.3
    // and all of the letters get calculated this way
    // in order to then use this array to determine what letter is next to work on
    
    // the higher the letter's coefficient = the higher the chance to get a word with that letter
    let seenCoefficientsSum = 0;
    const array = [];
    for (let i = 0; i < lettersLength; ++i) {
        const letter = letters[i];
        const lettersTotalCount = parseInt(localStorage.getItem(letter + "Total"));
        if (lettersTotalCount == 0) {
            array.push(seenCoefficientsSum);
            continue;
        }

        const lettersWrongCount = parseInt(localStorage.getItem(letter + "Wrong"));
        const lettersCoefficient = lettersWrongCount / lettersTotalCount;
        seenCoefficientsSum += lettersCoefficient;
        array.push(seenCoefficientsSum);
    }

    return array;
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

function registerWord(currentWord) {
    const length = currentWord.childNodes.length;
    timeQueue.add(length);

    const word = extractWord(currentWord);                             /////////// there should be more descriptive name for a function
    countRightLetters(word);
}

function extractWord(currentWord) {
    let word = "";
    for (const letter of currentWord.childNodes) {
        if (letter.textContent) {
            word += letter.textContent;
        }
    }

    return word;
}

function countRightLetters(word) {                               ////////////////////////
    for (const letter of word) {
        const letterAscii = letter.charCodeAt(0);
        ++wordQueue.totalCount[letterAscii];
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
                registerWord(currentWord);
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
            ++wordQueue.wrongCount[letterAscii];
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
        console.log(wordsIndexesData);
        return wordsIndexesData;
    }

    let words;
    if (!localStorage.getItem("words")) {
        words = await loadWords();
        localStorage.setItem("words", words);
    }

    let wordsIndexes;
    for (let i = 0; i < 26; ++i) {
        const letter = letters[i];
        if (!localStorage.getItem(letter + "LetterWords")) {
            if (!wordsIndexes) {
                wordsIndexes = await loadWordsIndexes();
            }

            localStorage.setItem(letter + "LetterWords", wordsIndexes[i]);
        }
    }

    if (wordsIndexes || words) {
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
const lettersLength = 26;
const symbols = ['!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^',
     '_', '`', '{', '|', '}', '~', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const symbolsLength = 42;
const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
const numbersLength = 10;
const timeRangeIds = ["rangeFifteen", "rangeThirty", "rangeOneMinute", "rangeTwoMinutes"];
const maxResultIds = ["maxResultFifteen", "maxResultThirty", "maxResultOneMinute", "maxResultTwoMinutes"];

makeLocalStorageRecordsIfNeeded();
const words = localStorage.getItem("words").split(",");
const wordsLength = words.length;
const wordsList = document.getElementById('wordsList');
const maxResultValues = getMaxResultValues();
const wordsIndexes = getWordIndexes();

let capsLockCount = 0;
const cursor = document.getElementById("cursor");
const wordQueue = new WordQueue();                   ///////////////////////////////////////////////////////////
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