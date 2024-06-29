class Node {
    constructor(val, time) {
        this.val = val;
        this.next = null;
        this.time = time;
    }
}

class Queue {
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
        const node = new Node(val, Date.now());

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

function getRandomWord(randomIndex) {
    const randomWord = words[randomIndex];
    const randomWordLength = randomWord.length;

    const word = document.createElement("div");
    word.classList.add("word");

    const randomSymbol = getRandomSymbol();
    const symbol = document.createElement("span");
    symbol.classList.add("letter", "symbol");
    symbol.textContent = randomSymbol;
    const symbolsIndex = Math.floor(Math.random() * randomWordLength);

    for (let i = 0; i < symbolsIndex; ++i) {
        const letter = document.createElement("span");
        letter.classList.add("letter");
        letter.textContent = randomWord[i];
        word.appendChild(letter);
    }

    word.appendChild(symbol);

    for (let i = symbolsIndex; i < randomWordLength; ++i) {
        const letter = document.createElement("span");
        letter.classList.add("letter");
        letter.textContent = randomWord[i];
        word.appendChild(letter);
    }

    const space = document.createElement("span");
    space.classList.add("letter");
    space.classList.add("space");
    word.appendChild(space);

    return word;
}

function getRandomSymbol() {
    const randomIndex = Math.floor(Math.random() * symbolsLength);
    return symbols[randomIndex];
}

function changeCursorPosition() {
    const nextLetter = document.querySelector(".letter.current");
    const cursor = document.getElementById("cursor");
    const previousTop = cursor.style.top;
    cursor.style.top = nextLetter.getBoundingClientRect().top + "px";
    cursor.style.left = nextLetter.getBoundingClientRect().left + "px";

    // console.log(previousTop, cursor.style.top);
    if (previousTop != cursor.style.top) {
        // console.log('fwe')
        deletePreviousWords();
        changeCursorPosition();
        generateWords();
        uploadLettersCount();
    }
}

function generateWords() {
    const greedyArray = calculateProbabilities();
    if (greedyArray[25] == 0) {
        regularRandomAlgorithm();
    } else {
        typecloud(greedyArray);
    }
}

function regularRandomAlgorithm() {
    while (wordsList.scrollHeight <= wordsList.clientHeight) {
        const randomIndex = Math.floor(Math.random() * wordsLength);
        const word = getRandomWord(randomIndex);
        wordsList.appendChild(word);
    }
}

function typecloud(greedyArray) {
    const totalProbabilitiesSum = greedyArray[25];
    while (wordsList.scrollHeight <= wordsList.clientHeight) {
        const letterArray = getLetter(totalProbabilitiesSum, greedyArray);
        const randomIndex = getWordIndex(letterArray);
        const word = getRandomWord(randomIndex);
        wordsList.appendChild(word);
    }

    // generateSymbolsWord();
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

    wordsList.appendChild(symbolsWord);
}

function getLetter(totalProbabilitiesSum, greedyArray) {
    const randomValue = Math.random() * totalProbabilitiesSum;
    let letterIndex = 0;
    let left = 0;
    let right = 25;
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        if (greedyArray[mid] <= randomValue) {
            letterIndex = mid;
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return wordsIndexes[letterIndex];
}

function getWordIndex(letterArray) {
    const length = letterArray.length;
    const wordIndex = Math.floor(Math.random() * length);
    return wordIndex;
}

function calculateProbabilities() {
    let totalProbabilitiesSum = 0;
    const greedyArray = [];
    for (let i = 0; i < 26; ++i) {
        const letter = letters[i];
        const lettersTotalCount = parseInt(localStorage.getItem(letter + "Total"));
        if (lettersTotalCount == 0) {
            greedyArray.push(totalProbabilitiesSum);
            continue;
        }

        const lettersWrongCount = parseInt(localStorage.getItem(letter + "Wrong"));
        const lettersProbability = lettersWrongCount / lettersTotalCount;
        totalProbabilitiesSum += lettersProbability;
        greedyArray.push(totalProbabilitiesSum);
    }

    return greedyArray;
}

function uploadLettersCount() {
    // not optimal, there is a way to improve
    // this function is called from changeCursorPosition()
    // which is called at the start
    // which then triggers this function
    // and it does nothing in this case
    // i need to take the comparing cursor's position height
    // in a separate function to optimize
    for (let i = 0; i < 26; ++i) {
        if (!rightLettersCount[i]) {
            continue;
        }

        const letter = letters[i];
        const totalKey = letter + "Total";
        const letterTotalCount = parseInt(localStorage.getItem(totalKey));
        localStorage.setItem(totalKey, letterTotalCount + rightLettersCount[i]);
        rightLettersCount[i] = 0;

        if (!wrongLettersCount[i]) {
            continue;
        }

        const wrongKey = letter + "Wrong";
        const letterWrongCount = parseInt(localStorage.getItem(wrongKey));
        localStorage.setItem(wrongKey, letterWrongCount + wrongLettersCount[i]);
        wrongLettersCount[i] = 0; 
    }
}

function newGame() {
    const wordsQueue = new Queue();
    generateWords();
    setCurrent();
    setMaxResult();
    changeCursorPosition();

    return wordsQueue;
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

function calculateTimeRanges() {
    const timeNow = Date.now();
    for (let i = 3; i >= 0; --i) {
        if (i != 3 && wordsQueue[valuesList[i + 1]] < wordsQueue[valuesList[i]]) {
            wordsQueue[valuesList[i]] = wordsQueue[valuesList[i + 1]];
            wordsQueue[pointersList[i]] = wordsQueue[pointersList[i + 1]];
        } else {
            let outOfRange = true;
            while (outOfRange && wordsQueue[pointersList[i]]) {
                const pointerTime = wordsQueue[pointersList[i]].time;
                const diff = (timeNow - pointerTime) / 1000;
                
                if (diff < timeRanges[i]) {
                    outOfRange = false;
                } else {
                    wordsQueue[valuesList[i]] -= wordsQueue[pointersList[i]].val;
                    wordsQueue[pointersList[i]] = wordsQueue[pointersList[i]].next;
                }
            }
        }
        
        /////
        const resultElement = document.getElementById(timeRangeIds[i]);
        resultElement.textContent = wordsQueue[valuesList[i]];
    }
}

function registerWord(currentWord) {
    const length = currentWord.childNodes.length;
    wordsQueue.add(length);

    const word = extractWord(currentWord);
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

function countRightLetters(word) {
    for (const letter of word) {
        ++rightLettersCount[letter.charCodeAt(0) - 97];
    }
}

function updateMaxResult() { 
    for (let i = 0; i < 4; ++i) {
        if (wordsQueue[valuesList[i]] > maxResultValues[i]) {
            maxResultValues[i] = wordsQueue[valuesList[i]];
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

                // if (currentWord.classList.contains("symbols")) {
                //     generateSymbolsWord();
                // }
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

            ++wrongLettersCount[currentLetter.textContent.charCodeAt(0) - 97];
        }
    }

    changeCursorPosition();
});

if (!localStorage.getItem("words")) {
    //////
    fetch("words-en.json")
    .then(response => response.json())
    .then(data => localStorage.setItem("words", data));
}



// make a testcase where once in 50-100 words
// you can get a orange color word
// containing different symbols like `%@#%(*%#@)
// make sure they are the ones which the user struggle to type
// and i want it to be of an orange color
// so it would stick out
// and be like a legendary testcase

const words = localStorage.getItem("words").split(",");
const wordsLength = words.length;
const wordsList = document.getElementById('wordsList');
const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const symbols = ['!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '-', '.', '/', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', 
    ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~'];
const timeRangeIds = ["rangeFifteen", "rangeThirty", "rangeOneMinute", "rangeTwoMinutes"];
const maxResultIds = ["maxResultFifteen", "maxResultThirty", "maxResultOneMinute", "maxResultTwoMinutes"];
const symbolsLength = symbols.length;

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

// let wordsIndexes;
for (const letter of letters) {
    if (!localStorage.getItem(letter + "Wrong")) {
        localStorage.setItem(letter + "Wrong", 0);
    }

    if (!localStorage.getItem(letter + "Total")) {
        localStorage.setItem(letter + "Total", 0);
    }

    // if (!localStorage.getItem(letter + "Letters")) {
    //     if (!wordsIndexes) {
    //         promise = 
    //             fetch("wordsIndexes.json")
    //             .then(response => response.json())
    //             .then(data => wordsIndexes = data);
    //     }
    // }
}

// make it a different function
// that will make sure all data is available for the user
// so even when the user deletes something frpm localStorage
// it would be restored the next time he opena up typecloud

async function loadWordsIndexes() {
    const response = await fetch("wordsIndexes.json");
    const wordsIndexes = await response.json();
    console.log(wordsIndexes);

    for (let i = 0; i < 26; ++i) {
        const letter = letters[i];
        localStorage.setItem(letter + "Letters", wordsIndexes[i]);
        ++index;
    }
}

if (!localStorage.getItem("aLetters")) {
    loadWordsIndexes();
}

// i have to rewrite all the Promise function
// through this async await way
// i finally understood how it works (i think)
// so there some work to be done
// to rewrite this part of the code

let rightLettersCount = [];
let wrongLettersCount = [];
for (let i = 0; i < 26; ++i) {
    rightLettersCount.push(Number(0));
    wrongLettersCount.push(Number(0));
}

const wordsIndexes = [];
for (const letter of letters) {
    const keyLetters = localStorage.getItem(letter + "Letters").split(",");
    wordsIndexes.push(keyLetters);
}

const wordsQueue = newGame();
const valuesList = wordsQueue.valuesList;
const pointersList = wordsQueue.pointersList;
const timeRanges = [15, 30, 60, 120];

// design idea:
// i like when the width of an input is not wide 
// like 700px or something
// so what if the design would be: 
// the input on the left, and (something) on the right;



// rewrite the code to be Promise based
// so typecloud would download files
// if it can't find corresponding files in localStorage




// i understood that i have to rewrite all this code
// i have to move these global variable into newGame() function
// because with doing it, i am not able to implement promises
// because i need to have a bunch of promises
// that would have to check
// if i need to download any json file
// and there should be a bigger promise
// that would make sure all the smaller promises are fullfilled
// and only then call newGame() function
// for the user to use typecloud


// make so sometimes typecloud instead of regular words
// would "talk" to the user
// like "congratulation you have reached *something*! keep it up!"
// and the user would have to type that out
// just like regular testcases
// maybe it is a good idea
// to make like "epic", "legendary" testcases
// like in Gwent


// i think i'm doing the typecloud algorithm wrong
// because at the moment typecloud stores all your stats
// throughout the whole time i have been using it
// and if for example you have been typing "e" wrong a lot before
// but right now it's not true;
// you would still keep getting testcases to type "e"
//
// so maybe i should rewrite an algorithm to linked list??
// so it would store your last typed 500 words for example
// so it would be dynamic and more up to date
// but the problem arises... how can i store a linked list in a localStorage?
// maybe i should "encode" it a bit
// so then i could get the localStorage string
// separate by "," to differentiate different words
// and then do custom split to the data inside word
// and with every line typed it would be updated
// and stored in localStorage again

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