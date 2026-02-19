// 이 파일은 UI 렌더링 및 사용자 상호작용과 관련된 함수들을 포함합니다.
// LNB 목록 생성, 검색 기능, 방문자 수 표시 등의 역할을 담당합니다.

import { incrementVisitorCount } from './api.js';

const postList = document.getElementById('post-list');
const searchInput = document.getElementById('search-input');
const mainContent = document.getElementById('main-content');

/**
 * 게시물 데이터를 받아 LNB(왼쪽 네비게이션 바) 목록을 생성하고 화면에 렌더링합니다.
 * @param {Array<Object>} posts - 렌더링할 게시물 객체 배열
 * @param {Function} onLinkClick - 각 게시물 링크 클릭 시 실행될 콜백 함수
 */
export function renderPostList(posts, onLinkClick) {
  // 목록이 비어있으면 "게시물이 없습니다." 메시지를 표시합니다.
  if (!posts || posts.length === 0) {
    postList.innerHTML = '<li>게시물이 없습니다.</li>';
    return;
  }

  // 게시물 목록을 HTML 문자열로 변환합니다.
  const postLinks = posts.map(post => `
    <li>
      <a href="?post=${post.file}" data-post-file="${post.file}">
        <span class="post-title">${post.title}</span>
        <span class="post-date">${post.date}</span>
      </a>
    </li>
  `).join('');

  postList.innerHTML = postLinks;

  // 각 링크에 클릭 이벤트 리스너를 추가합니다.
  postList.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (event) => {
      onLinkClick(event, link.dataset.postFile);
    });
  });
}

/**
 * LNB의 검색 입력창에 대한 이벤트 리스너를 설정합니다.
 * 입력된 검색어에 따라 게시물 목록을 실시간으로 필터링합니다.
 */
export function initSearch() {
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const allPosts = postList.querySelectorAll('li');

    allPosts.forEach(post => {
      const title = post.querySelector('.post-title').textContent.toLowerCase();
      const isVisible = title.includes(searchTerm);
      post.style.display = isVisible ? '' : 'none';
    });
  });
}

/**
 * 특정 페이지의 방문자 수를 화면에 표시합니다.
 * 이 함수는 방문자 수를 1 증가시키고, 업데이트된 수를 화면에 렌더링합니다.
 * @param {string} pageId - 방문자 수를 표시할 페이지의 고유 ID (예: 'post1.html')
 */
export async function displayVisitorCount(pageId) {
  if (!pageId) return; // pageId가 없으면 중단

  // 이전에 표시된 카운터가 있다면 제거
  const existingCounter = document.getElementById('visitor-counter');
  if (existingCounter) {
    existingCounter.remove();
  }

  // 방문자 수를 1 증가시키고 새로운 카운트를 가져옵니다.
  const count = await incrementVisitorCount(pageId);

  if (count !== null) {
    const counterEl = document.createElement('div');
    counterEl.id = 'visitor-counter';
    counterEl.innerHTML = ` 누적 방문자수: <strong>${count}</strong>`;
    mainContent.prepend(counterEl); // main-content의 가장 앞에 추가
  }
}
