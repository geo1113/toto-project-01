/**
 * 이 파일은 UI 관련 함수들을 포함합니다.
 * 목록 렌더링, 콘텐츠 표시, 에러 메시지 등 사용자 인터페이스와 관련된 모든 것을 담당합니다.
 */

// 필요한 함수들을 다른 모듈에서 가져옵니다.
import { getSortedPosts } from './api.js';
import { loadPost } from './router.js';

// DOM 요소들을 가져옵니다.
const postList = document.getElementById('post-list');
const mainContent = document.getElementById('main-content');
const searchInput = document.getElementById('search-input');

// 검색창에 이벤트 리스너를 추가합니다.
// 사용자가 입력할 때마다 LNB 목록을 필터링합니다.
if (searchInput) {
  searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.toLowerCase();
    const allPosts = await getSortedPosts();
    const filteredPosts = allPosts.filter(p => p.title.toLowerCase().includes(query));
    renderPostList(filteredPosts, (event, postFile) => {
      event.preventDefault();
      loadPost(postFile);
    });
  });
}

/**
 * 게시물 목록(LNB)을 받아와 화면에 렌더링합니다.
 * @param {Array} posts - 렌더링할 게시물 객체의 배열
 * @param {Function} onLinkClick - 각 목록 항목의 링크를 클릭했을 때 실행될 콜백 함수
 */
export function renderPostList(posts, onLinkClick) {
  // LNB 목록을 비웁니다.
  postList.innerHTML = '';

  // 각 게시물에 대해 목록 항목(li)을 생성합니다.
  posts.forEach(post => {
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${post.file.replace('.md', '')}`;

    const titleSpan = document.createElement('span');
    titleSpan.className = 'post-title';
    titleSpan.textContent = post.title;

    const dateSpan = document.createElement('span');
    dateSpan.className = 'post-date';
    dateSpan.textContent = post.date;

    link.appendChild(titleSpan);
    link.appendChild(dateSpan);
    
    // 링크 클릭 이벤트를 설정합니다.
    link.onclick = (event) => onLinkClick(event, post.file);

    listItem.appendChild(link);
    postList.appendChild(listItem);
  });
}

/**
 * 주어진 HTML 콘텐츠를 메인 영역에 표시합니다.
 * @param {string} html - 표시할 HTML 문자열
 */
export function displayContent(html) {
  // 메인 콘텐츠 영역을 비웁니다.
  mainContent.innerHTML = '';
  
  // HTML 문자열을 파싱하여 DOM 요소로 변환합니다.
  const contentEl = parseHTML(html);
  if (contentEl) {
    updateMainContent(mainContent, contentEl);
  } else {
    showError('콘텐츠를 불러오는 데 실패했습니다.');
  }
}

/**
 * 에러 메시지를 메인 콘텐츠 영역에 표시합니다.
 * @param {string} message - 표시할 에러 메시지
 */
export function showError(message) {
  mainContent.innerHTML = `<div class="error"><strong>Error:</strong> ${message}</div>`;
}

/**
 * HTML 문자열을 DOM 요소로 파싱합니다.
 * @param {string} html - 파싱할 HTML 문자열
 * @returns {Element} - 파싱된 최상위 요소
 */
function parseHTML(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  return doc.body.firstChild;
}

/**
 * Disqus 댓글 스레드를 로드하거나 리셋합니다.
 * @param {string} pageIdentifier - 현재 페이지의 고유 식별자
 */
export function loadDisqus(pageIdentifier) {
  // 'disqus_thread' 엘리먼트를 찾습니다.
  const disqusThread = document.getElementById('disqus_thread');
  // 만약 엘리먼트가 없다면, 함수를 종료합니다.
  if (!disqusThread) {
    console.log('Disqus thread not found, skipping load.');
    return;
  }
    
  const pageUrl = window.location.href;

  // 만약 window.DISQUS 객체가 존재하면 (Disqus가 이미 로드된 경우)
  if (window.DISQUS) {
    // Disqus를 리셋하여 새로운 댓글 스레드를 로드합니다.
    DISQUS.reset({
      reload: true,
      config: function () {  
        this.page.url = pageUrl;
        this.page.identifier = pageIdentifier;
      }
    });
  } else { // 만약 Disqus가 아직 로드되지 않았다면,
    // 전역 변수를 설정합니다.
    window.disqus_config = function () {
      this.page.url = pageUrl;
      this.page.identifier = pageIdentifier;
    };
    // Disqus 스크립트를 동적으로 생성하고 추가하여 로드합니다.
    const d = document, s = d.createElement('script');
    s.src = 'https://ai-recommended-stock.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
  }
}


/**
 * 메인 콘텐츠를 업데이트하고 접속자 카운터를 표시합니다.
 * @param {HTMLElement} el - 콘텐츠를 표시할 부모 엘리먼트
 * @param {HTMLElement} article - 표시할 기사(article) 엘리먼트
 */
export function updateMainContent(el, article) {
    el.innerHTML = '';
      if (article) {
        // 접속자 수 업데이트 및 엘리먼트 생성
        const visitorCount = updateVisitorCounter();
        const counterEl = document.createElement('div');
        counterEl.id = 'visitor-counter';
        counterEl.innerHTML = \`👥 누적 접속자: <strong>${visitorCount.toLocaleString()}</strong>명\`;
        
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