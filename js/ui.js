/**
 * 설정 툴바 웹 컴포넌트
 * 다크 모드 토글과 번역 기능을 제공합니다.
 */
class SettingsToolbar extends HTMLElement {
  constructor() {
    super();
    this.isDark = localStorage.getItem('theme') === 'dark';
    // 초기 언어 설정 확인
    const currentLang = document.documentElement.lang || 'ko';
    this.isEnglish = currentLang === 'en';
  }

  connectedCallback() {
    this.render();
    this.applyTheme();
    // DOM이 완전히 로드된 후 번역 기능 초기화
    if (document.readyState === 'complete') {
      this.initTranslate();
    } else {
      window.addEventListener('load', () => this.initTranslate());
    }
  }

  applyTheme() {
    if (this.isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    this.applyTheme();
    this.render();
  }

  toggleLanguage() {
    this.isEnglish = !this.isEnglish;
    const lang = this.isEnglish ? 'en' : 'ko';
    document.documentElement.lang = lang;
    
    // 구글 번역 연동
    try {
      const googleCombo = document.querySelector('.goog-te-combo');
      if (googleCombo) {
        googleCombo.value = lang;
        googleCombo.dispatchEvent(new Event('change'));
      } else {
        console.warn('Google Translate widget not ready yet.');
      }
    } catch (e) {
      console.error('Translation toggle failed:', e);
    }
    this.render();
  }

  initTranslate() {
    // 이미 로드되었는지 확인
    if (window.googleTranslateElementInit) return;

    window.googleTranslateElementInit = () => {
      if (typeof google !== 'undefined' && google.translate) {
        new google.translate.TranslateElement({
          pageLanguage: 'ko',
          includedLanguages: 'ko,en',
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false
        }, 'google_translate_element');
      }
    };

    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    const div = document.createElement('div');
    div.id = 'google_translate_element';
    div.style.display = 'none';
    document.body.appendChild(div);
  }

  render() {
    this.innerHTML = `
      <div class="settings-toolbar">
        <button class="settings-btn" id="theme-toggle" aria-label="Toggle Dark Mode">
          ${this.isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
        <button class="settings-btn" id="lang-toggle" aria-label="Toggle Language">
          ${this.isEnglish ? '🇰🇷 한글' : '🇺🇸 English'}
        </button>
      </div>
    `;

    this.querySelector('#theme-toggle').onclick = () => this.toggleTheme();
    this.querySelector('#lang-toggle').onclick = () => this.toggleLanguage();
  }
}

// 웹 컴포넌트 등록
if (!customElements.get('settings-toolbar')) {
  customElements.define('settings-toolbar', SettingsToolbar);
}

// UI 조작을 위한 요소 캐싱 (함수 내에서 호출하도록 변경하여 null 방지)
const getPostListElement = () => document.getElementById('post-list');
const getMainContentElement = () => document.getElementById('main-content');

/**
 * 주어진 게시물 배열을 기반으로 LNB 목록을 생성합니다.
 */
export function renderPostList(posts, onLinkClick) {
  const el = getPostListElement();
  if (!el) return;

  el.innerHTML = '';
  posts.forEach(post => {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.href = `?post=${post.file}`;
    link.textContent = post.title;
    link.addEventListener('click', (e) => onLinkClick(e, post.file));
    listItem.appendChild(link);
    el.appendChild(listItem);
  });
}

/**
 * HTML 문자열에서 <article> 부분만 추출하여 메인 콘텐츠 영역에 표시합니다.
 */
export function renderMainContent(html) {
  const el = getMainContentElement();
  if (!el) return;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const article = doc.querySelector('article');

  el.innerHTML = '';
  if (article) {
    el.appendChild(article);
  } else {
    showError('콘텐츠를 표시할 수 없습니다.');
  }
}

/**
 * 메인 콘텐츠 영역에 에러 메시지를 표시합니다.
 */
export function showError(message) {
  const el = getMainContentElement();
  if (!el) return;

  el.innerHTML = '';
  const errorMessage = document.createElement('p');
  errorMessage.textContent = message;
  el.appendChild(errorMessage);
}
