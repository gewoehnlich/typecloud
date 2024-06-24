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

function getRandomWord() {
    const randomIndex = Math.floor(Math.random() * wordsLength);
    const randomWord = words[randomIndex];
    const randomWordLength = randomWord.length;

    const word = document.createElement("div");
    word.classList.add("word");

    for (let i = 0; i < randomWordLength; ++i) {
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

function changeCursorPosition() {
    const nextLetter = document.querySelector(".letter.current");
    const cursor = document.getElementById("cursor");
    const previousTop = cursor.style.top;
    cursor.style.top = nextLetter.getBoundingClientRect().top + "px";
    cursor.style.left = nextLetter.getBoundingClientRect().left + "px";

    if (previousTop != cursor.style.top) {
        deletePreviousWords();
        changeCursorPosition();
        generateWords();
    }
}

function generateWords() {
    while (wordsList.scrollHeight <= wordsList.clientHeight) {
        const word = getRandomWord();
        wordsList.appendChild(word);
    }
}

function newGame() {
    const wordsQueue = new Queue();
    generateWords();
    setCurrent();
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

    // const word = extractWord(currentWord);
}

document.addEventListener("keydown", ev => {
    const key = ev.key;
    const currentWord = document.querySelector(".word.current");
    const currentLetter = currentWord.querySelector(".letter.current");
    const expected = currentLetter?.textContent || " ";
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
                if (letter.classList.contains("extra")) {
                    letter.remove();
                }
            });
            
            currentLetter.classList.remove("current");
            currentWord.firstChild.classList.add("current");
        } else if (!isFirstLetter) {
            const previousLetterClassList = currentLetter.previousSibling.classList;
            currentLetter.classList.remove("current");
            currentLetter.classList.remove("correct");
            currentLetter.classList.remove("incorrect");
            previousLetterClassList.remove("incorrect");
            previousLetterClassList.remove("correct");
            previousLetterClassList.add("current");
            if (currentLetter.classList.contains("extra")) {
                currentLetter.remove();
            }
        }
    } else if (key === expected) {
        if (isLetter) {
            currentLetter.classList.remove("current");
            currentLetter.classList.add("correct");
            currentLetter.nextSibling.classList.add("current"); 
        } else if (isSpace) {
            const stillWrong = currentWord.querySelector(".incorrect");
            if (!stillWrong) {
                registerWord(currentWord);
                calculateTimeRanges();
                // checkMaxResult();
                // getWPM(timeRangeIds, maxResultIds, valuesList, pointersList);
                
                currentLetter.classList.remove("current");
                currentWord.classList.remove("current");
                const nextWord = currentWord.nextSibling;
                nextWord.classList.add("current");
                const nextLetter = nextWord.firstChild;
                nextLetter.classList.add("current");
            }
        }
    } else {
        if (isLetter || isSpace) {
            //// 
            currentLetter.classList.add("incorrect");
            const nextLetter = currentLetter.nextSibling;
            if (nextLetter) {
                currentLetter.classList.remove("current");
                nextLetter.classList.add('current');
            }
        }
    }

    changeCursorPosition();
});

if (!localStorage.getItem("words")) {
    fetch("words-en.json")
    .then(response => response.json())
    .then(data => localStorage.setItem("words", data));
}

// if (!localStorage.getItem("wordsMaps")) {
    // make typecloud load make the proper way
    // and make sure it waits for the words to load, then load maps
    // and only then let user type
// }

const words = localStorage.getItem("words").split(",");
const wordsLength = words.length;
const wordsList = document.getElementById('wordsList');
const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
const wordsQueue = newGame();
const timeRangeIds = ["rangeFifteen", "rangeThirty", "rangeOneMinute", "rangeTwoMinutes"];
const maxResultIds = ["maxResultFifteen", "maxResultThirty", "maxResultOneMinute", "maxResultTwoMinutes"];
const valuesList = wordsQueue.valuesList;
const pointersList = wordsQueue.pointersList;
const timeRanges = [15, 30, 60, 120];

// design idea:
// i like when the width of an input is not wide 
// like 600px or something
// so what if the design would be: 
// the input on the left, and (something) on the right;
