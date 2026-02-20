
const API_URL = 'https://v6.exchangerate-api.com/v6/YOUR_API_KEY/latest/USD'; // 실제 API 키로 교체해야 합니다.
const SUPPORTED_CURRENCIES = [
    // 북미
    'USD', 'CAD',
    // 아시아
    'KRW', 'JPY', 'CNY', 'HKD', 'SGD', 'THB',
    // 유럽
    'EUR', 'GBP', 'CHF', 'SEK', 'NOK', 'DKK',
    // 오세아니아
    'AUD', 'NZD'
];

let rates = {};

const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('from-currency');
const midCurrencySelect = document.getElementById('mid-currency');
const toCurrencySelect = document.getElementById('to-currency');
const resultText = document.getElementById('result-text');
const lastUpdatedText = document.getElementById('last-updated');

async function fetchRates() {
    try {
        // exchangerate-api.com은 특정 키 없이도 Public API를 제공합니다.
        // 이 URL은 기본적으로 USD를 기준으로 환율을 가져옵니다.
        const response = await fetch(`https://open.er-api.com/v6/latest/USD`);
        if (!response.ok) throw new Error('환율 정보를 가져오는 데 실패했습니다.');
        
        const data = await response.json();
        if (data.result === 'error') throw new Error(data['error-type']);

        rates = data.rates;
        populateCurrencies();
        calculate();
        
        const updateTime = new Date(data.time_last_update_utc).toLocaleString();
        lastUpdatedText.textContent = `기준 환율 시각: ${updateTime}`;

    } catch (error) {
        console.error(error);
        resultText.textContent = '오류: 환율 정보 로딩 실패';
    }
}

function populateCurrencies() {
    // 지원되는 통화 목록만 필터링
    const availableCurrencies = SUPPORTED_CURRENCIES.filter(currency => rates[currency]);

    [fromCurrencySelect, midCurrencySelect, toCurrencySelect].forEach(select => {
        availableCurrencies.forEach(currency => {
            const option = document.createElement('option');
            option.value = currency;
            option.textContent = currency;
            select.appendChild(option);
        });
    });

    // 기본값 설정
    fromCurrencySelect.value = 'KRW';
    midCurrencySelect.value = 'USD';
    toCurrencySelect.value = 'THB';
}

function calculate() {
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromCurrencySelect.value;
    const midCurrency = midCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;

    if (isNaN(amount) || !rates[fromCurrency] || !rates[midCurrency] || !rates[toCurrency]) {
        resultText.textContent = '-';
        return;
    }

    // 이중 환율 계산 로직
    // 1. 기준 통화 -> USD로 변환
    const amountInUSD = amount / rates[fromCurrency];
    // 2. USD -> 중간 통화로 변환
    const amountInMid = amountInUSD * rates[midCurrency];
    // 3. 중간 통화 -> USD로 변환
    const midInUSD = amountInMid / rates[midCurrency];
    // 4. USD -> 최종 통화로 변환
    const finalAmount = midInUSD * rates[toCurrency];

    resultText.textContent = `${amount.toLocaleString()} ${fromCurrency} = ${finalAmount.toLocaleString(undefined, {maximumFractionDigits: 2})} ${toCurrency}`;
}

export function initExchange() {
    if (document.getElementById('calculator-container')) { // 계산기 페이지인지 확인
        fetchRates();
        amountInput.addEventListener('input', calculate);
        fromCurrencySelect.addEventListener('change', calculate);
        midCurrencySelect.addEventListener('change', calculate);
        toCurrencySelect.addEventListener('change', calculate);
    }
}
