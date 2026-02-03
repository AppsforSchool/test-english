const isDebug = false;

// 1. 【最重要】定数を一番上で定義（ReferenceErrorを防ぐ）
const contents = ["base_form", "meaning", "present_form", "past_form", "past_participle", "present_participle"];
const contentsInJp = ["原形", "意味", "現在形", "過去形", "過去分詞", "ing形"];

const debugQuestionParm = "base_form";
const debugAnswerParm = "present_form";
const debugDetailParms = ["AAA"];
const debugCountParm = "10";

const debugQuestionsData = [
  { "base_form": "beat", "meaning": "どきどきする", "present_form": "beat(s)", "past_form": "beat", "past_participle": "beaten", "present_participle": "beating" },
  { "base_form": "cut", "meaning": "切る", "present_form": "cut(s)", "past_form": "cut", "past_participle": "cut", "present_participle": "cutting" }
];

// 2. 変数の初期化
let questionsData = [];
let nowQuestionIndex = 0;
let questionParm, answerParm;

// 3. 要素保持用変数
let loadingOverlay, questionContainer, nowCountArea, questionCountArea;
let card, cardFrontContent, cardFrontSubContent, cardBackContent, cardBackQuestion;
let showAnswerBtn, toIndexBtn, nextQuestionBtn, returnButton, headerQuestion, headerAnswer;

// --- 関数定義 ---
function getAllParmFromUrl(parm) {
  const params = new URLSearchParams(window.location.search);
  return params.getAll(parm);
}
function getParmFromUrl(parm) {
  const params = new URLSearchParams(window.location.search);
  return params.get(parm);
}

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function updateQuestion(index) {
  if (!questionsData[index]) return;
  cardFrontContent.textContent = questionsData[index][questionParm];
  cardFrontSubContent.textContent = `${contentsInJp[contents.indexOf(questionParm)]}を${contentsInJp[contents.indexOf(answerParm)]}に直す`;
  
  setTimeout(() => {
    cardBackQuestion.textContent = `${questionsData[index][questionParm]}を${contentsInJp[contents.indexOf(answerParm)]}に直すと`;
    cardBackContent.textContent = questionsData[index][answerParm];
  }, 400);
  nowCountArea.textContent = index + 1;
}

function flipCard() {
  card.classList.toggle('flipped');
}

async function loadQuestionsData() {
  let details = getAllParmFromUrl('detail');
  if (isDebug) details = debugDetailParms;

  if (details.length === 0) {
    alert('出題範囲が指定されていません。');
    window.location.href = './index.html';
    return;
  }
  
  if (isDebug) {
    questionsData = debugQuestionsData;
  } else {
    const fetchPromises = [];
    details.forEach(d => {
      if (['AAA', 'ABA', 'ABB', 'ABC'].includes(d)) {
        fetchPromises.push(fetch(`./${d}.json`).then(res => res.json()));
      }
    });
    
    try {
      const results = await Promise.all(fetchPromises);
      questionsData = results.flat();
    } catch (error) {
      alert('JSONファイルの取得に失敗しました');
      return;
    }
  }
  
  questionsData = shuffle(questionsData);
  
  let countParm = getParmFromUrl('count');
  if (isDebug) countParm = debugCountParm;
  if (countParm !== 'all') {
    let count = parseInt(countParm);
    if (isNaN(count) || count < 1) {
      alert('出題数が無効です。');
      window.location.href = './index.html';
      return;
    }
    if (questionsData.length > count) questionsData.length = count;
  }
  
  questionCountArea.textContent = questionsData.length;
  updateQuestion(0);
  loadingOverlay.classList.add('hidden');
  questionContainer.classList.remove('hidden');
}

// 4. すべての準備が整ってから実行
document.addEventListener('DOMContentLoaded', () => {
  // 要素の取得
  loadingOverlay = document.getElementById('loading-overlay');
  questionContainer = document.getElementById('question-container');
  nowCountArea = document.getElementById('now-count');
  questionCountArea = document.getElementById('question-count');
  card = document.getElementById('card');
  cardFrontContent = document.getElementById('front-content');
  cardFrontSubContent = document.getElementById('front-sub-content');
  cardBackContent = document.getElementById('back-content');
  cardBackQuestion = document.getElementById('back-question-content');
  showAnswerBtn = document.getElementById('show-answer-btn');
  toIndexBtn = document.getElementById('to-index-btn');
  nextQuestionBtn = document.getElementById('next-question-btn');
  returnButton = document.getElementById('return-button');
  headerQuestion = document.getElementById('header-question');
  headerAnswer = document.getElementById('header-answer');

  // パラメータ取得とバリデーション
  questionParm = getParmFromUrl('question');
  answerParm = getParmFromUrl('answer');
  if (isDebug) {
    questionParm = debugQuestionParm;
    answerParm = debugAnswerParm;
  }

  if (!contents.includes(questionParm) || !contents.includes(answerParm) || questionParm === answerParm) {
    alert('URLパラメータが無効、または出題と回答が同じです。');
    window.location.href = './index.html';
    return;
  }

  // 表示更新
  headerQuestion.textContent = contentsInJp[contents.indexOf(questionParm)];
  headerAnswer.textContent = contentsInJp[contents.indexOf(answerParm)];

  // イベント登録
  showAnswerBtn.addEventListener('click', flipCard);
  nextQuestionBtn.addEventListener('click', () => {
    if (nowQuestionIndex + 1 === questionsData.length) {
      cardFrontContent.textContent = '終了！';
      cardFrontSubContent.textContent = '';
      showAnswerBtn.classList.add('hidden');
      toIndexBtn.classList.remove('hidden');
    } else {
      nowQuestionIndex++;
      updateQuestion(nowQuestionIndex);
    }
    flipCard();
  });
  toIndexBtn.addEventListener('click', () => window.location.href = './index.html');
  returnButton.addEventListener('click', () => {
    if (confirm('本当にやめますか？')) window.location.href = './index.html';
  });

  // データ読み込み開始
  loadQuestionsData();
});
