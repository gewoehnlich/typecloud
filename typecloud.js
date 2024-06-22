const words = "typecloud,gewoehnlich,nieuk".split(",");
const wordsLength = words.length;
const wordsList = document.getElementById('wordsList');
const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

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
    generateWords();
    setCurrent();
    changeCursorPosition();
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

newGame();
