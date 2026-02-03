const isDebug = false;
const contents = ["base_form", "meaning", "present_form", "past_form", "past_participle", "present_participle"];
const contentsInJp = ["原形", "意味", "現在形", "過去形", "過去分詞", "ing形"];

// エラーを画面に表示する（iPad用）
window.onerror = function(msg, url, line) {
  alert("エラー発生: " + msg + "\n行番号: " + line);
};

let questionsData = [];
let nowQuestionIndex = 0;
let questionParm, answerParm;

// DOM要素
let elements = {};

function getParm(p) { return new URLSearchParams(window.location.search).get(p); }

async function loadData() {
  const details = isDebug ? ["AAA"] : new URLSearchParams(window.location.search).getAll('detail');
  if (details.length === 0) { alert("範囲指定なし"); return; }

  try {
    const fetchPromises = details.map(d => fetch(`./${d}.json`).then(res => res.json()));
    const results = await Promise.all(fetchPromises);
    questionsData = results.flat();
    
    // シャッフル
    questionsData.sort(() => Math.random() - 0.5);

    // 件数制限
    let c = getParm('count');
    if (c && c !== 'all') questionsData.length = Math.min(questionsData.length, parseInt(c));

    update(0);
    elements.loading.style.display = 'none';
    elements.container.classList.remove('hidden');
  } catch (e) {
    alert("JSONロード失敗: " + e);
  }
}

function update(index) {
  const data = questionsData[index];
  if (!data || !elements.front) return;

  elements.front.textContent = data[questionParm];
  elements.sub.textContent = `${contentsInJp[contents.indexOf(questionParm)]}→${contentsInJp[contents.indexOf(answerParm)]}`;
  
  setTimeout(() => {
    if (elements.backQ) elements.backQ.textContent = data[questionParm] + " を直すと";
    if (elements.backA) elements.backA.textContent = data[answerParm];
  }, 400);
  if (elements.now) elements.now.textContent = index + 1;
}

document.addEventListener('DOMContentLoaded', () => {
  // 安全に要素を取得
  const ids = {
    loading: 'loading-overlay',
    container: 'question-container',
    front: 'front-content',
    sub: 'front-sub-content',
    backA: 'back-content',
    backQ: 'back-question-content', // ← ここがHTMLと一致しているか超重要！
    now: 'now-count',
    total: 'question-count',
    card: 'card',
    btnShow: 'show-answer-btn',
    btnNext: 'next-question-btn',
    hQ: 'header-question',
    hA: 'header-answer'
  };

  for (let key in ids) {
    elements[key] = document.getElementById(ids[key]);
  }

  questionParm = isDebug ? "base_form" : getParm('question');
  answerParm = isDebug ? "meaning" : getParm('answer');

  if (!contents.includes(questionParm) || !contents.includes(answerParm)) {
    alert("パラメータ不正: " + questionParm + " / " + answerParm);
    return;
  }

  if (elements.hQ) elements.hQ.textContent = contentsInJp[contents.indexOf(questionParm)];
  if (elements.hA) elements.hA.textContent = contentsInJp[contents.indexOf(answerParm)];

  elements.btnShow.onclick = () => elements.card.classList.toggle('flipped');
  elements.btnNext.onclick = () => {
    nowQuestionIndex++;
    if (nowQuestionIndex >= questionsData.length) {
      elements.front.textContent = "終了";
    } else {
      update(nowQuestionIndex);
      elements.card.classList.remove('flipped');
    }
  };

  loadData();
});
