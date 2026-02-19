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
          position: fixed;
          top: 1.3rem;
          left: 1rem;
          display: flex;
          gap: 0.5rem;
          z-index: 9999;
        }
        .settings-btn {
            background: var(--main-bg, #fff);
            color: var(--text-color, #333);
            border: 2px solid var(--accent-color, #fca311);
            padding: 0.6rem 1rem;
            border-radius: 30px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: bold;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
            transition: all 0.2s;
        }
        .settings-btn:hover {
            background: var(--accent-color, #fca311);
            color: #000;
            transform: translateY(-2px);
        }
      </style>
      <button id="dark-mode-toggle" class="settings-btn">🌙 다크모드</button>
      <button id="translate-btn" class="settings-btn">🌐 한영번역</button>
    `;
  }

  initFunctionality() {
    const darkModeToggle = this.shadowRoot.getElementById('dark-mode-toggle');
    const translateBtn = this.shadowRoot.getElementById('translate-btn');

    // 다크 모드 기능
    darkModeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDarkMode = document.body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
      darkModeToggle.textContent = isDarkMode ? '☀️ 라이트모드' : '🌙 다크모드';
    });

    // 페이지 로드 시 저장된 테마 적용
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️ 라이트모드';
    }

    // 번역 기능
    translateBtn.addEventListener('click', () => {
      this.translatePage();
    });
  }

  translatePage() {
    const currentLang = document.documentElement.lang;
    let targetLang = 'en';
    let originalLang = 'ko';

    // 현재 언어가 영어라면 한국어로, 아니면 영어로 번역
    const cookieLang = this.getCookie('googtrans');
    if (cookieLang && cookieLang.includes('en')) {
        targetLang = 'ko';
        originalLang = 'en';
    } else {
        targetLang = 'en';
        originalLang = 'ko';
    }

    this.doGoogleTranslate(originalLang, targetLang);
  }

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  doGoogleTranslate(originalLang, targetLang) {
    // 쿠키를 직접 설정하여 언어 변경을 트리거
    let existingCookie = this.getCookie('googtrans');
    if(existingCookie) {
        // 기존 쿠키의 언어 코드를 변경
        existingCookie = existingCookie.replace(/\/[a-z]{2}$/, `/${targetLang}`);
    } else {
        existingCookie = `/auto/${targetLang}`;
    }

    document.cookie = `googtrans=${existingCookie}; path=/; domain=${window.location.hostname}`;
    document.cookie = `googtrans=${existingCookie}; path=/; domain=.${window.location.hostname}`;

    // 구글 번역 스크립트가 로드되었는지 확인하고, 없으면 추가
    let translateScript = document.querySelector('script[src*="translate.googleapis.com"]');
    if (!translateScript) {
      const script = document.createElement('script');
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.head.appendChild(script);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement({pageLanguage: originalLang}, 'google_translate_element');
        // 스크립트 로드 후 잠시 기다렸다가 언어 변경 적용
        setTimeout(() => location.reload(), 500);
      };
    } else {
        // 스크립트가 이미 있으면 페이지 새로고침으로 번역 적용
        location.reload();
    }
  }
}

customElements.define('settings-toolbar', SettingsToolbar);
