
// 영어-한글 매핑 테이블
const engToKorMap = {
  // 자음
  'r': 'ㄱ', 'R': 'ㄲ', 's': 'ㄴ', 'e': 'ㄷ', 'E': 'ㄸ', 'f': 'ㄹ', 'a': 'ㅁ', 'q': 'ㅂ', 'Q': 'ㅃ', 't': 'ㅅ', 'T': 'ㅆ',
  'd': 'ㅇ', 'w': 'ㅈ', 'W': 'ㅉ', 'c': 'ㅊ', 'z': 'ㅋ', 'x': 'ㅌ', 'v': 'ㅍ', 'g': 'ㅎ',
  // 모음
  'k': 'ㅏ', 'o': 'ㅐ', 'i': 'ㅑ', 'O': 'ㅒ', 'j': 'ㅓ', 'p': 'ㅔ', 'u': 'ㅕ', 'P': 'ㅖ', 'h': 'ㅗ', 'hk': 'ㅘ', 'ho': 'ㅙ',
  'hl': 'ㅚ', 'y': 'ㅛ', 'n': 'ㅜ', 'nj': 'ㅝ', 'np': 'ㅞ', 'nl': 'ㅟ', 'b': 'ㅠ', 'm': 'ㅡ', 'ml': 'ㅢ', 'l': 'ㅣ'
};

// 한글-영어 매핑 테이블 (자동 생성)
const korToEngMap = Object.fromEntries(Object.entries(engToKorMap).map(([k, v]) => [v, k]));

// 한글 초성, 중성, 종성 리스트
const chosungList = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const jungsungList = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const jongsungList = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

// 복합 자모 분해 매핑
const complexJamo = {
  'ㄲ': ['ㄱ', 'ㄱ'], 'ㄸ': ['ㄷ', 'ㄷ'], 'ㅃ': ['ㅂ', 'ㅂ'], 'ㅆ': ['ㅅ', 'ㅅ'], 'ㅉ': ['ㅈ', 'ㅈ'],
  'ㅘ': ['ㅗ', 'ㅏ'], 'ㅙ': ['ㅗ', 'ㅐ'], 'ㅚ': ['ㅗ', 'ㅣ'], 'ㅝ': ['ㅜ', 'ㅓ'], 'ㅞ': ['ㅜ', 'ㅔ'],
  'ㅟ': ['ㅜ', 'ㅣ'], 'ㅢ': ['ㅡ', 'ㅣ'],
  'ㄳ': ['ㄱ', 'ㅅ'], 'ㄵ': ['ㄴ', 'ㅈ'], 'ㄶ': ['ㄴ', 'ㅎ'], 'ㄺ': ['ㄹ', 'ㄱ'], 'ㄻ': ['ㄹ', 'ㅁ'],
  'ㄼ': ['ㄹ', 'ㅂ'], 'ㄽ': ['ㄹ', 'ㅅ'], 'ㄾ': ['ㄹ', 'ㅌ'], 'ㄿ': ['ㄹ', 'ㅍ'], 'ㅀ': ['ㄹ', 'ㅎ'],
  'ㅄ': ['ㅂ', 'ㅅ']
};

// 바이트 길이 계산
const getByteLength = (str) => new Blob([str]).size;

// 영어 -> 한글 변환 함수
function convertEngToKor(text) {
  let result = '';
  let buffer = [];

  // 한글 조합 함수
  function combineHangul() {
    if (buffer.length === 0) return;

    const chosungIndex = chosungList.indexOf(buffer[0]);
    const jungsungIndex = jungsungList.indexOf(buffer[1]);

    if (chosungIndex === -1 || jungsungIndex === -1) {
      result += buffer.join('');
      return;
    }
    
    // 종성 처리
    let jongsungIndex = 0;
    if (buffer.length > 2) {
      // 복합 종성 처리 (e.g. 'ㄳ')
      if (buffer.length > 3 && jongsungList.includes(buffer[2] + buffer[3])) {
        jongsungIndex = jongsungList.indexOf(buffer[2] + buffer[3]);
      } else {
        jongsungIndex = jongsungList.indexOf(buffer[2]);
      }
    }
    
    const charCode = 44032 + (chosungIndex * 21 * 28) + (jungsungIndex * 28) + jongsungIndex;
    result += String.fromCharCode(charCode);

    // 남은 버퍼 처리
    if (buffer.length > 3 && jongsungIndex > 0) { // 복합 종성이면 2개 소비
        if (jongsungList.includes(buffer[2] + buffer[3])) result += buffer.slice(4).join('');
        else result += buffer.slice(3).join('');
    } else if (buffer.length > 2 && jongsungIndex > 0) {
        result += buffer.slice(3).join('');
    }
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const kor = engToKorMap[char];
    
    if (!kor) {
        combineHangul();
        buffer = [];
        result += char;
        continue;
    }

    // 로직 재구성 필요
    // 간단한 버전으로 우선 구현
     result += kor;

  }
    
    // 한글 조합 로직 (개선된 버전)
    const newResult = Hangul.assemble(result);
    return newResult;
}

// 한글 -> 영어 변환 함수
function convertKorToEng(text) {
  let result = '';
  for (const char of text) {
    const code = char.charCodeAt(0);
    if (code >= 44032 && code <= 55203) { // 한글 음절
      const adjustedCode = code - 44032;
      const chosungIndex = Math.floor(adjustedCode / (21 * 28));
      const jungsungIndex = Math.floor((adjustedCode % (21 * 28)) / 28);
      const jongsungIndex = adjustedCode % 28;

      const chosung = chosungList[chosungIndex];
      const jungsung = jungsungList[jungsungIndex];
      const jongsung = jongsungList[jongsungIndex];
      
      // 초성, 중성, 종성을 영어로 변환
      result += korToEngMap[chosung] || '';
      // 복합 모음 처리
      if (complexJamo[jungsung]) {
          result += complexJamo[jungsung].map(j => korToEngMap[j]).join('');
      } else {
          result += korToEngMap[jungsung] || '';
      }
      if (jongsung) {
        // 복합 종성 처리
        if (complexJamo[jongsung]) {
            result += complexJamo[jongsung].map(j => korToEngMap[j]).join('');
        } else {
            result += korToEngMap[jongsung] || '';
        }
      }
    } else if (korToEngMap[char]) { // 단일 자모
        result += korToEngMap[char];
    }
    else {
      result += char;
    }
  }
  return result;
}


// --- 초기화 함수 ---
export function initConverter() {
    // Hangul.js 라이브러리 동적 로드
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/hangul-js';
    script.onload = () => {
        // 라이브러리 로드 후 변환기 기능 설정
        setupConverter();
    };
    document.head.appendChild(script);
}

function setupConverter() {
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const inputBytes = document.getElementById('input-bytes');
    const outputBytes = document.getElementById('output-bytes');
    const swapButton = document.getElementById('swap-button');

    if (!inputText) return;

    const convert = () => {
        const sourceText = inputText.value;
        // 한글 포함 여부로 자동 감지
        const containsKorean = /[\u3131-\u318E\uAC00-\uD7A3]/.test(sourceText);
        let result = '';

        if (containsKorean) {
            result = convertKorToEng(sourceText);
        } else {
            // Hangul.js를 사용하여 영->한 변환
            result = Hangul.assemble(sourceText.split('').map(char => engToKorMap[char] || char).join(''));
        }

        outputText.value = result;
        inputBytes.textContent = `${getByteLength(sourceText)} Bytes`;
        outputBytes.textContent = `${getByteLength(result)} Bytes`;
    };

    const swapTexts = () => {
        const temp = inputText.value;
        inputText.value = outputText.value;
        outputText.value = temp;
        convert();
    };

    // 기존 이벤트 리스너 제거
    inputText.removeEventListener('input', convert);
    swapButton.removeEventListener('click', swapTexts);

    // 새 이벤트 리스너 추가
    inputText.addEventListener('input', convert);
    swapButton.addEventListener('click', swapTexts);

    convert(); // 초기 로드
}
