
// 영어-한글 매핑 테이블 (QWERTY 기반)
const engToKorMap = {
  // 자음 (Consonants)
  'r': 'ㄱ', 'R': 'ㄲ', 's': 'ㄴ', 'S': 'ㄴ', 'e': 'ㄷ', 'E': 'ㄸ', 'f': 'ㄹ', 'F': 'ㄹ', 'a': 'ㅁ', 'A': 'ㅁ', 'q': 'ㅂ', 'Q': 'ㅃ', 't': 'ㅅ', 'T': 'ㅆ',
  'd': 'ㅇ', 'D': 'ㅇ', 'w': 'ㅈ', 'W': 'ㅉ', 'c': 'ㅊ', 'C': 'ㅊ', 'z': 'ㅋ', 'Z': 'ㅋ', 'x': 'ㅌ', 'X': 'ㅌ', 'v': 'ㅍ', 'V': 'ㅍ', 'g': 'ㅎ', 'G': 'ㅎ',
  // 모음 (Vowels)
  'k': 'ㅏ', 'K': 'ㅏ', 'o': 'ㅐ', 'O': 'ㅒ', 'i': 'ㅑ', 'I': 'ㅑ', 'j': 'ㅓ', 'J': 'ㅓ', 'p': 'ㅔ', 'P': 'ㅖ', 'u': 'ㅕ', 'U': 'ㅕ', 'h': 'ㅗ', 'H': 'ㅗ',
  'y': 'ㅛ', 'Y': 'ㅛ', 'n': 'ㅜ', 'N': 'ㅜ', 'b': 'ㅠ', 'B': 'ㅠ', 'm': 'ㅡ', 'M': 'ㅡ', 'l': 'ㅣ', 'L': 'ㅣ'
};

// 한글-영어 매핑 테이블 (자동 생성)
const korToEngMap = Object.fromEntries(Object.entries(engToKorMap).map(([k, v]) => [v, k]));

// 한글 초성, 중성, 종성 리스트 (분해 시 사용)
const chosungList = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
const jungsungList = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
const jongsungList = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

// 복합 자모 분해 매핑 (분해 시 사용)
const complexJamo = {
  'ㅘ': ['ㅗ', 'ㅏ'], 'ㅙ': ['ㅗ', 'ㅐ'], 'ㅚ': ['ㅗ', 'ㅣ'], 'ㅝ': ['ㅜ', 'ㅓ'], 'ㅞ': ['ㅜ', 'ㅔ'], 'ㅟ': ['ㅜ', 'ㅣ'], 'ㅢ': ['ㅡ', 'ㅣ'],
  'ㄳ': ['ㄱ', 'ㅅ'], 'ㄵ': ['ㄴ', 'ㅈ'], 'ㄶ': ['ㄴ', 'ㅎ'], 'ㄺ': ['ㄹ', 'ㄱ'], 'ㄻ': ['ㄹ', 'ㅁ'], 'ㄼ': ['ㄹ', 'ㅂ'], 'ㄽ': ['ㄹ', 'ㅅ'], 'ㄾ': ['ㄹ', 'ㅌ'], 'ㄿ': ['ㄹ', 'ㅍ'], 'ㅀ': ['ㄹ', 'ㅎ'], 'ㅄ': ['ㅂ', 'ㅅ']
};

// 바이트 길이 계산
const getByteLength = (str) => new Blob([str]).size;

// 한글 -> 영어 변환 함수
function convertKorToEng(text) {
  let result = '';
  for (const char of text) {
    const code = char.charCodeAt(0);
    // 한글 음절 범위 체크
    if (code >= 44032 && code <= 55203) {
      const adjustedCode = code - 44032;
      const chosungIndex = Math.floor(adjustedCode / (21 * 28));
      const jungsungIndex = Math.floor((adjustedCode % (21 * 28)) / 28);
      const jongsungIndex = adjustedCode % 28;

      const chosung = chosungList[chosungIndex];
      const jungsung = jungsungList[jungsungIndex];
      const jongsung = jongsungList[jongsungIndex];

      // 분해된 자모를 영어로 변환
      result += korToEngMap[chosung] || '';
      result += (complexJamo[jungsung] ? complexJamo[jungsung].map(j => korToEngMap[j]).join('') : korToEngMap[jungsung]) || '';
      if (jongsung) {
        result += (complexJamo[jongsung] ? complexJamo[jongsung].map(j => korToEngMap[j]).join('') : korToEngMap[jongsung]) || '';
      }
    } else if (korToEngMap[char]) { // 단일 자모 처리
        result += korToEngMap[char];
    } else { // 한글이 아닌 경우
      result += char;
    }
  }
  return result;
}

// --- 변환기 초기화 --- //
export function initConverter() {
    // hangul-js 라이브러리가 로드되었는지 확인 후, 없다면 동적 로드
    if (typeof Hangul === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/hangul-js';
        script.onload = () => setupConverter();
        document.head.appendChild(script);
    } else {
        setupConverter();
    }
}

// --- 변환기 기능 설정 --- //
function setupConverter() {
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const inputBytes = document.getElementById('input-bytes');
    const outputBytes = document.getElementById('output-bytes');
    const swapButton = document.getElementById('swap-button');

    if (!inputText) return; // 관련 요소가 없으면 중단

    const convert = () => {
        const sourceText = inputText.value;
        // 한글 포함 여부로 자동 감지 (자음,모음,완성형)
        const containsKorean = /[\u3131-\u318E\uAC00-\uD7A3]/.test(sourceText);
        
        const result = containsKorean
            ? convertKorToEng(sourceText) 
            : Hangul.assemble(sourceText.split('').map(char => engToKorMap[char] || char).join(''));

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

    // 이벤트 리스너 중복 방지
    inputText.removeEventListener('input', convert);
    swapButton.removeEventListener('click', swapTexts);

    // 이벤트 리스너 추가
    inputText.addEventListener('input', convert);
    swapButton.addEventListener('click', swapTexts);

    convert(); // 초기 로드 시 변환
}
