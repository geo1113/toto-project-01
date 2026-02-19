/**
 * 이 파일은 UI 관련 함수들을 포함합니다.
 * 목록 렌더링, 콘텐츠 표시, 에러 메시지 등 사용자 인터페이스와 관련된 모든 것을 담당합니다.
 */

import { getSortedPosts } from './api.js';
import { loadPost } from './router.js';

/**
 * 검색창 입력에 대한 이벤트 리스너를 초기화합니다.
 * 이 함수는 DOM이 완전히 로드된 후에 호출되어야 합니다.
 */
export function initSearch() {
  const searchInput = document.getElementById('search-input');
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
}

/**
 * 게시물 목록(LNB)을 받아와 화면에 렌더링합니다.
 * @param {Array} posts - 렌더링할 게시물 객체의 배열
 * @param {Function} onLinkClick - 각 목록 항목의 링크를 클릭했을 때 실행될 콜백 함수
 */
export function renderPostList(posts, onLinkClick) {
  const postList = document.getElementById('post-list');
  if (!postList) return;

  postList.innerHTML = '';
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
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;
  mainContent.innerHTML = html;
}

/**
 * 방문자 카운터를 메인 콘텐츠 영역 상단에 표시합니다.
 */
export function displayVisitorCount() {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  const visitorCount = updateVisitorCounter();
  const counterEl = document.createElement('div');
  counterEl.id = 'visitor-counter';
  counterEl.innerHTML = `👥 누적 접속자: <strong>${visitorCount.toLocaleString()}</strong>명`;
  mainContent.prepend(counterEl);
}

/**
 * localStorage를 사용하여 방문자 수를 업데이트하고 반환합니다.
 * @returns {number} 업데이트된 방문자 수
 */
function updateVisitorCounter() {
  let count = parseInt(localStorage.getItem('total_visits') || '2540');
  count += Math.floor(Math.random() * 3) + 1;
  localStorage.setItem('total_visits', count);
  return count;
}

/**
 * 에러 메시지를 메인 콘텐츠 영역에 표시합니다.
 * @param {string} message - 표시할 에러 메시지
 */
export function showError(message) {
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;
  mainContent.innerHTML = `<div class="error"><strong>Error:</strong> ${message}</div>`;
}

/**
 * Disqus 댓글 스레드를 로드하거나 리셋합니다.
 * @param {string} pageIdentifier - 현재 페이지의 고유 식별자
 */
export function loadDisqus(pageIdentifier) {
  const disqusThread = document.getElementById('disqus_thread');
  if (!disqusThread) {
    console.log('Disqus thread not found, skipping load.');
    return;
  }
  const pageUrl = window.location.href;
  if (window.DISQUS) {
    DISQUS.reset({
      reload: true,
      config: function () {
        this.page.url = pageUrl;
        this.page.identifier = pageIdentifier;
      }
    });
  } else {
    window.disqus_config = function () {
      this.page.url = pageUrl;
      this.page.identifier = pageIdentifier;
    };
    const d = document, s = d.createElement('script');
    s.src = 'https://ai-recommended-stock.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
  }
}
