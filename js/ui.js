/**
 * 설정 툴바 웹 컴포넌트
 * 다크 모드 토글과 번역 기능을 제공합니다.
 */
class SettingsToolbar extends HTMLElement {
  constructor() {
    super();
    this.isDark = localStorage.getItem('theme') === 'dark';
    this.isEnglish = document.documentElement.lang === 'en';
  }

  connectedCallback() {
    this.render();
    this.applyTheme();
    this.initTranslate();
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
    
    // 구글 번역 연동 개선: 위젯이 로드될 때까지 재시도
    const triggerTranslation = () => {
      const googleCombo = document.querySelector('.goog-te-combo');
      if (googleCombo) {
        googleCombo.value = lang;
        googleCombo.dispatchEvent(new Event('change'));
      } else {
        // 위젯이 아직 없으면 500ms 후 다시 시도
        setTimeout(triggerTranslation, 500);
      }
    };
    
    triggerTranslation();
    this.render();
  }

  initTranslate() {
    if (window.googleTranslateElementInit) return;

    window.googleTranslateElementInit = () => {
      new google.translate.TranslateElement({
        pageLanguage: 'ko',
        includedLanguages: 'ko,en',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
      }, 'google_translate_element');
    };

    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    const div = document.createElement('div');
    div.id = 'google_translate_element';
    div.style.display = 'none'; // 위젯 자체는 숨김
    document.body.appendChild(div);
  }

  render() {
    this.innerHTML = `
      <div class="settings-toolbar">
        <button class="settings-btn" id="theme-toggle">
          ${this.isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
        <button class="settings-btn" id="lang-toggle">
          ${this.isEnglish ? '🇰🇷 한글' : '🇺🇸 English'}
        </button>
      </div>
    `;

    this.querySelector('#theme-toggle').onclick = () => this.toggleTheme();
    this.querySelector('#lang-toggle').onclick = () => this.toggleLanguage();
  }
}

if (!customElements.get('settings-toolbar')) {
  customElements.define('settings-toolbar', SettingsToolbar);
}

const getPostListElement = () => document.getElementById('post-list');
const getMainContentElement = () => document.getElementById('main-content');

/**
 * 주어진 게시물 배열을 기반으로 LNB 목록을 생성합니다.
 * 제목 옆에 날짜(yyyy-mm-dd)를 추가합니다.
 */
export function renderPostList(posts, onLinkClick) {
  const el = getPostListElement();
  if (!el) return;

  el.innerHTML = '';
  posts.forEach(post => {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.href = `?post=${post.file}`;
    
    // 제목과 날짜를 함께 표시
    link.innerHTML = `
      <span class="post-title">${post.title}</span>
      <span class="post-date">${post.date}</span>
    `;
    
    link.addEventListener('click', (e) => onLinkClick(e, post.file));
    listItem.appendChild(link);
    el.appendChild(listItem);
  });
}

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

export function showError(message) {
  const el = getMainContentElement();
  if (!el) return;

  el.innerHTML = '';
  const errorMessage = document.createElement('p');
  errorMessage.textContent = message;
  el.appendChild(errorMessage);
}
