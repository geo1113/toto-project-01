const API_URL = 'https://open.er-api.com/v6/latest/USD';

// 국가별 통화 및 깃발 정보
const CURRENCY_DATA = {
    'KRW': { name: 'South Korean Won', flag: 'kr' },
    'USD': { name: 'United States Dollar', flag: 'us' },
    'JPY': { name: 'Japanese Yen', flag: 'jp' },
    'EUR': { name: 'Euro', flag: 'eu' },
    'CNY': { name: 'Chinese Yuan', flag: 'cn' },
    'CAD': { name: 'Canadian Dollar', flag: 'ca' },
    'AUD': { name: 'Australian Dollar', flag: 'au' },
    'NZD': { name: 'New Zealand Dollar', flag: 'nz' },
    'GBP': { name: 'British Pound', flag: 'gb' },
    'CHF': { name: 'Swiss Franc', flag: 'ch' },
    'HKD': { name: 'Hong Kong Dollar', flag: 'hk' },
    'SGD': { name: 'Singapore Dollar', flag: 'sg' },
    'THB': { name: 'Thai Baht', flag: 'th' },
    'SEK': { name: 'Swedish Krona', flag: 'se' },
    'NOK': { name: 'Norwegian Krone', flag: 'no' },
    'DKK': { name: 'Danish Krone', flag: 'dk' },
};

let rates = {};
let selections = { from: 'KRW', mid: 'USD', to: 'JPY' };
let activeDropdown = null; // 현재 열려있는 드롭다운

// 환율 계산기 초기화 함수
export function initExchangeRateConverter() {
    const fromAmountInput = document.getElementById('amount-from');
    if (!fromAmountInput) return; // post4.html이 아닐 경우 실행 중단

    const midAmountInput = document.getElementById('amount-mid');
    const toAmountInput = document.getElementById('amount-to');
    const lastUpdatedText = document.getElementById('last-updated');
    const dropdown = document.querySelector('.currency-dropdown');

    // 앱 초기화
    async function initApp() {
        await fetchRates();
        buildSelectors();
        buildDropdown();
        addEventListeners();
        calculate();
    }

    async function fetchRates() {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            if (data.result !== 'success') throw new Error('API Error');
            rates = data.rates;
            const updateTime = new Date(data.time_last_update_utc).toLocaleString();
            lastUpdatedText.textContent = `환율 기준: ${updateTime}`;
        } catch (error) {
            console.error('Failed to fetch rates:', error);
            lastUpdatedText.textContent = '환율 정보 로딩 실패';
        }
    }

    function buildSelectors() {
        document.querySelectorAll('.currency-selector').forEach(selector => {
            const target = selector.dataset.target;
            updateSelector(target);
        });
    }

    function updateSelector(target) {
        const currencyCode = selections[target];
        const data = CURRENCY_DATA[currencyCode];
        const selector = document.querySelector(`[data-target='${target}']`);
        
        selector.innerHTML = `
            <div class="selected-currency">
                <span class="flag-icon flag-icon-${data.flag}"></span>
                <span class="currency-code">${currencyCode}</span>
                <span class="currency-name">${data.name}</span>
                <span class="arrow">▼</span>
            </div>
        `;
    }

    function buildDropdown() {
        let html = '';
        for (const code in CURRENCY_DATA) {
            const data = CURRENCY_DATA[code];
            html += `
                <div class="dropdown-item" data-code="${code}">
                    <span class="flag-icon flag-icon-${data.flag}"></span>
                    <span class="currency-code">${code}</span>
                    <span class="currency-name">${data.name}</span>
                </div>
            `;
        }
        dropdown.innerHTML = html;
    }

    function addEventListeners() {
        fromAmountInput.addEventListener('input', calculate);
        document.querySelectorAll('.currency-selector').forEach(selector => {
            selector.addEventListener('click', e => {
                e.stopPropagation();
                openDropdown(e.currentTarget, e.currentTarget.dataset.target);
            });
        });

        dropdown.addEventListener('click', e => {
            const item = e.target.closest('.dropdown-item');
            if (item) {
                const newCurrency = item.dataset.code;
                if (activeDropdown) {
                    selections[activeDropdown] = newCurrency;
                    updateSelector(activeDropdown);
                    calculate();
                }
                closeDropdown();
            }
        });
    }

    function openDropdown(anchorElement, target) {
        if (activeDropdown === target) {
            closeDropdown();
            return;
        }
        const rect = anchorElement.getBoundingClientRect();
        dropdown.style.left = `${rect.left}px`;
        dropdown.style.top = `${rect.bottom + window.scrollY}px`;
        dropdown.style.width = `${rect.width}px`;
        dropdown.style.display = 'block';
        activeDropdown = target;
    }

    function closeDropdown() {
        dropdown.style.display = 'none';
        activeDropdown = null;
    }

    function calculate() {
        if (Object.keys(rates).length === 0) return;

        const fromAmount = parseFloat(fromAmountInput.value) || 0;
        const fromRate = rates[selections.from];
        const midRate = rates[selections.mid];
        const toRate = rates[selections.to];

        if (!fromRate || !midRate || !toRate) return;

        const amountInUSD = fromAmount / fromRate;
        const midAmount = amountInUSD * midRate;
        const toAmount = amountInUSD * toRate;

        midAmountInput.value = formatNumber(midAmount);
        toAmountInput.value = formatNumber(toAmount);
    }

    function formatNumber(num) {
        return num.toLocaleString(undefined, { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 4 
        });
    }
    
    // 전역 클릭 리스너
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && !e.target.closest('.currency-selector')) {
            closeDropdown();
        }
    });

    initApp();
}
