const engToKor = {
  'q': 'ㅂ', 'w': 'ㅈ', 'e': 'ㄷ', 'r': 'ㄱ', 't': 'ㅅ', 'y': 'ㅛ', 'u': 'ㅕ', 'i': 'ㅑ', 'o': 'ㅐ', 'p': 'ㅔ',
  'a': 'ㅁ', 's': 'ㄴ', 'd': 'ㅇ', 'f': 'ㄹ', 'g': 'ㅎ', 'h': 'ㅗ', 'j': 'ㅓ', 'k': 'ㅏ', 'l': 'ㅣ',
  'z': 'ㅋ', 'x': 'ㅌ', 'c': 'ㅊ', 'v': 'ㅍ', 'b': 'ㅠ', 'n': 'ㅜ', 'm': 'ㅡ',
  'Q': 'ㅃ', 'W': 'ㅉ', 'E': 'ㄸ', 'R': 'ㄲ', 'T': 'ㅆ', 'O': 'ㅒ', 'P': 'ㅖ',
  'L': 'ㅣ',
};

const korToEng = Object.fromEntries(Object.entries(engToKor).map(([k, v]) => [v, k]));

const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const inputBytes = document.getElementById('input-bytes');
const outputBytes = document.getElementById('output-bytes');
const swapButton = document.getElementById('swap-button');
const directionRadios = document.getElementsByName('conversion-direction');

const getByteLength = (str) => new Blob([str]).size;

const convert = () => {
  const direction = document.querySelector('input[name="conversion-direction"]:checked').value;
  const sourceText = inputText.value;
  let result = '';

  if (direction === 'enToKo') {
    result = sourceText.split('').map(char => engToKor[char] || char).join('');
  } else {
    result = sourceText.split('').map(char => korToEng[char] || char).join('');
  }

  outputText.value = result;
  inputBytes.textContent = `${getByteLength(sourceText)} Bytes`;
  outputBytes.textContent = `${getByteLength(result)} Bytes`;
};

const swapTexts = () => {
  const temp = inputText.value;
  inputText.value = outputText.value;
  outputText.value = temp;
  convert(); // 스왑 후 변환을 다시 실행하여 바이트 등 정보 업데이트
};

inputText.addEventListener('input', convert);
directionRadios.forEach(radio => radio.addEventListener('change', convert));
swapButton.addEventListener('click', swapTexts);

// 초기 로드 시 변환 실행
convert();
