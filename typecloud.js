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

    // const word = extractWord(currentWord);
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

    console.log(key);
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
            if (currentLetter.classList.contains("extra")) {
                currentLetter.remove();
            } else {
                currentLetter.classList.remove("current");
                currentLetter.classList.remove("correct");
                currentLetter.classList.remove("incorrect");
            }

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

// if (!localStorage.getItem("wordsMap")) {
//     ///////////
//     ///////////
//     ///////////
//     const data = fetch("wordsMap.json").then(response => response.json());
//     console.log(data);
// }

// idea instead of wordsMap
// i don't need to store a map
// what if a would have two arrays instead
// of 26 chars in length
// that would store mistakes made
// the others store letters in total
// it would keep storing it till the end of line
// once previous words get deleted
// i will make a record to the localStorage
// that will update current user results in there
// and typecloud would immediately draw new words
// with this knowledge in mind


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
const timeRangeIds = ["rangeFifteen", "rangeThirty", "rangeOneMinute", "rangeTwoMinutes"];
const maxResultIds = ["maxResultFifteen", "maxResultThirty", "maxResultOneMinute", "maxResultTwoMinutes"];

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

for (const letter of letters) {
    if (!localStorage.getItem(letter + "Wrong")) {
        localStorage.setItem(letter + "Wrong", 0);
    }

    if (!localStorage.getItem(letter + "Total")) {
        localStorage.setItem(letter + "Total", 0);
    }
}

const wordsQueue = newGame();
const valuesList = wordsQueue.valuesList;
const pointersList = wordsQueue.pointersList;
const timeRanges = [15, 30, 60, 120];

// design idea:
// i like when the width of an input is not wide 
// like 600px or something
// so what if the design would be: 
// the input on the left, and (something) on the right;

// const data = localStorage.getItem("")
