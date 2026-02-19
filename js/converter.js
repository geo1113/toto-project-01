const engToKor = {
    'q': 'ㅂ', 'w': 'ㅈ', 'e': 'ㄷ', 'r': 'ㄱ', 't': 'ㅅ', 'y': 'ㅛ', 'u': 'ㅕ', 'i': 'ㅑ', 'o': 'ㅐ', 'p': 'ㅔ',
    'a': 'ㅁ', 's': 'ㄴ', 'd': 'ㅇ', 'f': 'ㄹ', 'g': 'ㅎ', 'h': 'ㅗ', 'j': 'ㅓ', 'k': 'ㅏ', 'l': 'ㅣ',
    'z': 'ㅋ', 'x': 'ㅌ', 'c': 'ㅊ', 'v': 'ㅍ', 'b': 'ㅠ', 'n': 'ㅜ', 'm': 'ㅡ',
    'Q': 'ㅃ', 'W': 'ㅉ', 'E': 'ㄸ', 'R': 'ㄲ', 'T': 'ㅆ', 'O': 'ㅒ', 'P': 'ㅖ',
    'L': 'ㅣ',
};

const korToEng = Object.fromEntries(Object.entries(engToKor).map(([k, v]) => [v, k]));
const koreanConsonantsAndVowels = "[\\u3131-\\u318E]"; // 한글 자음, 모음

const getByteLength = (str) => new Blob([str]).size;

// 변환기 초기화 함수
export function initConverter() {
    const inputText = document.getElementById('input-text');
    const outputText = document.getElementById('output-text');
    const inputBytes = document.getElementById('input-bytes');
    const outputBytes = document.getElementById('output-bytes');
    const swapButton = document.getElementById('swap-button');

    if (!inputText) return; // 변환기 요소가 없으면 실행 중단

    const convert = () => {
        const sourceText = inputText.value;
        const containsKorean = new RegExp(koreanConsonantsAndVowels).test(sourceText);
        let result = '';

        if (containsKorean) {
            // 한글 -> 영어
            result = sourceText.split('').map(char => korToEng[char] || char).join('');
        } else {
            // 영어 -> 한글
            result = sourceText.split('').map(char => engToKor[char] || char).join('');
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

    // 기존 이벤트 리스너가 있다면 제거 (중복 방지)
    inputText.removeEventListener('input', convert);
    swapButton.removeEventListener('click', swapTexts);

    // 새 이벤트 리스너 추가
    inputText.addEventListener('input', convert);
    swapButton.addEventListener('click', swapTexts);

    convert(); // 초기 로드 시 변환 실행
}
