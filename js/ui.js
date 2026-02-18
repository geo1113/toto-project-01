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
    // 페이지 로드 후 구글 번역 초기화
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
    const targetLang = this.isEnglish ? 'en' : 'ko';
    
    // HTML lang 속성 변경 (브라우저 힌트 제공)
    document.documentElement.lang = targetLang;
    
    // 구글 번역 엔진 제어
    const triggerGoogleTranslate = () => {
      const selectEl = document.querySelector('select.goog-te-combo');
      if (selectEl) {
        selectEl.value = targetLang;
        selectEl.dispatchEvent(new Event('change'));
      } else {
        // 아직 로드되지 않았으면 300ms 후 재시도
        setTimeout(triggerGoogleTranslate, 300);
      }
    };

    triggerGoogleTranslate();
    this.render();
  }

  initTranslate() {
    // 중복 로드 방지
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
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);

    // 위젯 컨테이너가 없으면 생성
    if (!document.getElementById('google_translate_element')) {
      const div = document.createElement('div');
      div.id = 'google_translate_element';
      document.body.appendChild(div);
    }
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

export function renderPostList(posts, onLinkClick) {
  const el = getPostListElement();
  if (!el) return;

  el.innerHTML = '';
  posts.forEach(post => {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.href = `?post=${post.file}`;
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

/**
 * Disqus 댓글창을 현재 포스트에 맞게 리셋합니다.
 * @param {string} postFile - 현재 표시 중인 포스트 파일명
 */
export function resetDisqus(postFile) {
  if (typeof DISQUS !== 'undefined') {
    DISQUS.reset({
      reload: true,
      config: function () {
        this.page.identifier = postFile;
        this.page.url = window.location.origin + window.location.pathname + '?post=' + postFile;
      }
    });
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
