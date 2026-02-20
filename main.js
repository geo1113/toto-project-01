
import { initConverter } from './js/converter.js';
import { initExchange } from './js/exchange.js';

document.addEventListener('DOMContentLoaded', () => {
    // URL 경로에 따라 적절한 초기화 함수를 호출합니다.
    if (window.location.pathname.includes('exchange.html')) {
        initExchange();
    } else {
        initConverter();
    }
});
