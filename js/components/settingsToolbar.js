class SettingsToolbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.render();
    this.initFunctionality();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          justify-content: space-between; /* 양 끝으로 요소 배치 */
          align-items: center;
          padding: 0.25rem 2rem; /* 상하 여백을 줄여 얇게 만듦 */
          background: var(--main-bg);
          border-bottom: 1px solid var(--border-color);
        }
        #visitor-counter-container {
            font-size: 0.8rem;
            font-weight: bold;
            color: var(--text-color);
        }
        #visitor-counter-container strong {
            color: var(--accent-color);
        }
        .controls {
            display: flex;
            gap: 0.5rem;
        }
        .settings-btn {
            background: transparent;
            color: var(--text-color, #333);
            border: 1px solid var(--border-color, #ccc);
            padding: 0.3rem 0.8rem; /* 버튼 크기 축소 */
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.8rem; /* 폰트 크기 축소 */
            font-weight: 500;
            transition: all 0.2s;
        }
        .settings-btn:hover {
            background: var(--accent-color, #fca311);
            color: #000;
            border-color: var(--accent-color, #fca311);
        }
      </style>
      <div id="visitor-counter-container"></div>
      <div class="controls">
          <button id="dark-mode-toggle" class="settings-btn">🌙</button>
          <button id="translate-btn" class="settings-btn"></button>
      </div>
    `;
  }

  // 외부에서 방문자 수를 업데이트하기 위한 메서드
  updateVisitorCount(count) {
      const counterEl = this.shadowRoot.getElementById('visitor-counter-container');
      if (counterEl) {
          counterEl.innerHTML = `누적 방문자수: <strong>${count}</strong>`;
      }
  }

  initFunctionality() {
    const darkModeToggle = this.shadowRoot.getElementById('dark-mode-toggle');
    const translateBtn = this.shadowRoot.getElementById('translate-btn');

    // 다크 모드 기능
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDarkMode = document.body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
      darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    });

    // 페이지 로드 시 저장된 테마 적용
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
    }

    // 번역 버튼 초기 텍스트 설정
    this.updateTranslateButtonText();

    // 번역 기능
    translateBtn.addEventListener('click', () => {
      this.translatePage();
    });
  }
  
  updateTranslateButtonText() {
    const translateBtn = this.shadowRoot.getElementById('translate-btn');
    const cookieLang = this.getCookie('googtrans');
    // 쿠키가 /en으로 끝나면 현재 영문, /ko로 끝나거나 없으면 한글
    if (cookieLang && cookieLang.endsWith('/en')) {
        translateBtn.textContent = '한국어';
    } else {
        translateBtn.textContent = 'English';
    }
  }

  translatePage() {
    const cookieLang = this.getCookie('googtrans');
    let targetLang = 'en';

    if (cookieLang && cookieLang.endsWith('/en')) {
        targetLang = 'ko';
    } 

    // googtrans 쿠키 값을 변경하고 페이지를 새로고침하여 번역을 트리거합니다.
    document.cookie = `googtrans=/auto/${targetLang}; path=/; domain=${window.location.hostname}`;
    location.reload();
  }

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
}

customElements.define('settings-toolbar', SettingsToolbar);
