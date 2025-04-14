// Конфигурация игры
const isTelegram = typeof window.Telegram !== 'undefined' && window.Telegram.WebApp;
const tg = isTelegram ? window.Telegram.WebApp : null;

const gameConfig = {
    words: {
        grade5: [
            { wrong: "програма", correct: "программа" },
            { wrong: "искуство", correct: "искусство" },
            { wrong: "алфавит", correct: "алфавит" },
            { wrong: "балон", correct: "балон" }
        ],
        grade6: [
            { wrong: "симетрия", correct: "симметрия" },
            { wrong: "аккумулировать", correct: "аккумулировать" },
            { wrong: "диллема", correct: "дилема" },
            { wrong: "интелект", correct: "интеллект" }
        ]
    }
};

// Состояние игры
let gameState = {
    currentGrade: null,
    currentWord: null,
    attempts: 0,
    score: 0
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    // Проверка среды выполнения
    const isTelegram = typeof window.Telegram !== 'undefined' && window.Telegram.WebApp;
    const tg = isTelegram ? window.Telegram.WebApp : null;
    console.log('App initialized'); // Должно появиться в консоли


    // Получаем элементы DOM
    const elements = {
        levelModal: document.getElementById('levelModal'),
        gameContainer: document.querySelector('.game-container'),
        wordDisplay: document.getElementById('wordDisplay'),
        answerInput: document.getElementById('answerInput'),
        scoreDisplay: document.getElementById('score'),
        message: document.getElementById('message'),
        levelButtons: document.querySelectorAll('.level-btn'),
        checkAnswerBtn: document.getElementById('checkAnswerBtn'),
        showAnswerBtn: document.getElementById('showAnswerBtn'),
        exitGameBtn: document.getElementById('exitGameBtn')
    };

    if (!elements.levelModal || !elements.gameContainer) {
        console.error('Critical elements not found!');
        return;
      }

    // Инициализация игры
    function initGame(grade) {
        try {
            gameState = {
                currentGrade: grade,
                currentWord: null,
                attempts: 0,
                score: 0
            };
            
            elements.levelModal.style.display = 'none';
            elements.gameContainer.style.display = 'block';
            loadNewWord();
            
            if(isTelegram) tg.MainButton.hide();
        } catch (error) {
            console.error('Game init error:', error);
            showMessage('Ошибка запуска игры', 'error');
        }
    }

    // Загрузка нового слова
    function loadNewWord() {
        const wordsList = gameConfig.words[gameState.currentGrade];
        gameState.currentWord = wordsList[Math.floor(Math.random() * wordsList.length)];
        gameState.attempts = 0;
        
        elements.wordDisplay.textContent = gameState.currentWord.wrong;
        elements.answerInput.value = '';
        elements.answerInput.focus();
    }

    // Проверка ответа
    function checkAnswer() {
        const userAnswer = elements.answerInput.value.trim().toLowerCase();
        const correctAnswer = gameState.currentWord.correct.toLowerCase();

        if(!userAnswer) {
            showMessage('Введите ответ!', 'error');
            return;
        }

        if(userAnswer === correctAnswer) {
            gameState.score++;
            updateScore();
            showMessage('Правильно! +1 балл', 'success');
            loadNewWord();
        } else {
            gameState.attempts++;
            
            if(gameState.attempts >= 2) {
                showAnswer();
            } else {
                showMessage('Неверно! Попробуйте еще раз', 'error');
            }
        }
    }

    // Показать ответ
    function showAnswer() {
        showMessage(`Правильный ответ: ${gameState.currentWord.correct}`, 'info');
        loadNewWord();
    }

    // Выход из игры
    function exitGame() {
        if(isTelegram) {
            tg.sendData(JSON.stringify({
                action: 'exit',
                score: gameState.score
            }));
            tg.close();
        } else {
            alert(`Игра завершена!\nВаш счет: ${gameState.score}`);
            window.location.reload();
        }
    }

    // Обновление счета
    function updateScore() {
        elements.scoreDisplay.textContent = gameState.score;
    }

    // Показать сообщение
    function showMessage(text, type) {
        elements.message.className = `message ${type}`;
        elements.message.textContent = text;
        elements.message.style.display = 'block';
        
        setTimeout(() => {
            elements.message.style.display = 'none';
        }, 2000);
    }

    // Настройка Telegram Web App
    if(isTelegram) {
        tg.expand();
        tg.MainButton.setText('Выбрать уровень').show();
        tg.MainButton.onClick(() => {
            tg.showPopup({
                title: 'Выберите уровень',
                items: [
                    { id: 'grade5', type: 'default', text: '5 класс' },
                    { id: 'grade6', type: 'default', text: '6 класс' }
                ]
            }, (selectedId) => initGame(selectedId));
        });
    } else {
        elements.levelModal.style.display = 'flex';
    }

    // Назначение обработчиков событий
    elements.levelButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            initGame(btn.dataset.grade);
        });
    });

    elements.checkAnswerBtn.addEventListener('click', checkAnswer);
    elements.showAnswerBtn.addEventListener('click', showAnswer);
    elements.exitGameBtn.addEventListener('click', exitGame);

    // Обработка нажатия Enter в поле ввода
    elements.answerInput.addEventListener('keypress', (e) => {
        if(e.key === 'Enter') {
            checkAnswer();
        }
    });
});