/**
 * 설정 툴바 웹 컴포넌트
 * 다크 모드 토글과 번역 기능을 제공합니다.
 */
class SettingsToolbar extends HTMLElement {
  constructor() {
    super();
    this.isDark = localStorage.getItem('theme') === 'dark';

    // 쿠키를 확인하여 현재 언어 상태를 설정합니다.
    const langCookie = document.cookie.split('; ').find(row => row.startsWith('googtrans='));
    this.isEnglish = !!(langCookie && langCookie.split('=')[1].includes('/en'));

    // HTML lang 속성도 동기화합니다.
    document.documentElement.lang = this.isEnglish ? 'en' : 'ko';
  }

  connectedCallback() {
    this.render();
    this.applyTheme();
    // 구글 번역 스크립트를 초기화합니다.
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
    if (this.isEnglish) {
      // 영어 -> 한글로 변경
      // 쿠키를 만료시켜 제거합니다.
      const domain = window.location.hostname;
      document.cookie = 'googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      if (domain !== 'localhost') {
        document.cookie = 'googtrans=; path=/; domain=.' + domain + '; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      }
    } else {
      // 한글 -> 영어로 변경
      // 쿠키를 설정합니다.
      document.cookie = `googtrans=/ko/en; path=/`;
    }

    // 페이지를 새로고침하여 번역을 적용합니다.
    window.location.reload();
  }

  initTranslate() {
    // 중복 로드 방지
    if (document.getElementById('google-translate-script')) return;

    // 구글 번역 위젯 초기화 콜백 함수를 정의합니다.
    window.googleTranslateElementInit = () => {
      new google.translate.TranslateElement({
        pageLanguage: 'ko', // 원본 언어
        includedLanguages: 'en', // 번역할 언어
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false // 위젯 자동 표시 안 함
      }, 'google_translate_element'); // 위젯을 렌더링할 div의 ID
    };

    // 구글 번역 API 스크립트를 동적으로 추가합니다.
    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
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
    // 접속자 수 업데이트 및 엘리먼트 생성
    const visitorCount = updateVisitorCounter();
    const counterEl = document.createElement('div');
    counterEl.className = 'visitor-counter';
    counterEl.style.float = 'right';
    counterEl.style.marginBottom = '10px';
    counterEl.innerHTML = `👥 누적 접속자: <strong>${visitorCount.toLocaleString()}</strong>명`;
    
    el.appendChild(counterEl);
    el.appendChild(article);
  } else {
    showError('콘텐츠를 표시할 수 없습니다.');
  }
}

/**
 * 접속자 수를 시뮬레이션하여 업데이트합니다.
 */
function updateVisitorCounter() {
  let count = parseInt(localStorage.getItem('total_visits') || '2540');
  count += Math.floor(Math.random() * 3) + 1; // 자연스러운 증가 연출
  localStorage.setItem('total_visits', count);
  return count;
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
