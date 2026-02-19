// 이 파일은 UI 렌더링 및 사용자 상호작용과 관련된 함수들을 포함합니다.
// LNB 목록 생성, 검색 기능, 방문자 수 표시 등의 역할을 담당합니다.

import { incrementVisitorCount } from './api.js';

const postList = document.getElementById('post-list');
const searchInput = document.getElementById('search-input');
const mainContent = document.getElementById('main-content');
const settingsToolbar = document.querySelector('settings-toolbar');

/**
 * 게시물 데이터를 받아 LNB(왼쪽 네비게이션 바) 목록을 생성하고 화면에 렌더링합니다.
 * 계층 구조를 지원하며, 하위 게시물은 토글 가능한 형태로 표시됩니다.
 * @param {Array<Object>} posts - 렌더링할 게시물 객체 배열
 * @param {Function} onLinkClick - 각 게시물 링크 클릭 시 실행될 콜백 함수
 */
export function renderPostList(posts, onLinkClick) {
  // 목록이 비어있으면 "게시물이 없습니다." 메시지를 표시합니다.
  if (!posts || posts.length === 0) {
    postList.innerHTML = '<li>게시물이 없습니다.</li>';
    return;
  }

  // 게시물 목록 HTML을 생성합니다.
  const postLinks = posts.map(post => {
    // 하위 게시물이 있는지 확인합니다.
    const hasSubPosts = post.subPosts && post.subPosts.length > 0;

    // 하위 게시물 목록 HTML을 생성합니다.
    const subPostLinks = hasSubPosts
      ? `<ul class="sub-post-list" style="display: none;">${post.subPosts.map(subPost => `
          <li>
            <a href="?post=${subPost.file}" data-post-file="${subPost.file}">
              <span class="post-title">${subPost.title}</span>
              <span class="post-date">${subPost.date}</span>
            </a>
          </li>`).join('')}</ul>`
      : '';

    // 각 게시물 항목을 <li>로 감싸고, 하위 게시물이 있다면 토글 버튼과 함께 렌더링합니다.
    return `
      <li class="post-item-container">
        <div class="post-item">
          <a href="?post=${post.file}" data-post-file="${post.file}">
            <span class="post-title">${post.title}</span>
            <span class="post-date">${post.date}</span>
          </a>
          ${hasSubPosts ? '<button class="toggle-sub-posts">▼</button>' : ''}
        </div>
        ${subPostLinks}
      </li>
    `;
  }).join('');

  postList.innerHTML = postLinks;

  // 각 게시물 링크에 클릭 이벤트 리스너를 추가합니다.
  postList.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (event) => {
      onLinkClick(event, link.dataset.postFile);
    });
  });

  // 토글 버튼에 클릭 이벤트 리스너를 추가합니다.
  postList.querySelectorAll('.toggle-sub-posts').forEach(button => {
    button.addEventListener('click', () => {
      const subList = button.closest('.post-item-container').querySelector('.sub-post-list');
      const isHidden = subList.style.display === 'none';
      subList.style.display = isHidden ? 'block' : 'none';
      button.textContent = isHidden ? '▲' : '▼';
    });
  });
}

/**
 * LNB의 검색 입력창에 대한 이벤트 리스너를 설정합니다.
 * 입력된 검색어에 따라 게시물 목록을 실시간으로 필터링합니다.
 * 계층 구조를 고려하여 부모 게시물 또는 자식 게시물이 검색어와 일치하면 모두 표시합니다.
 */
export function initSearch() {
  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const allPostContainers = postList.querySelectorAll('.post-item-container');

    allPostContainers.forEach(container => {
      const parentTitle = container.querySelector('.post-item .post-title').textContent.toLowerCase();
      const subPostTitles = Array.from(container.querySelectorAll('.sub-post-list .post-title')).map(el => el.textContent.toLowerCase());
      
      // 부모 또는 자식 중 하나라도 검색어를 포함하는지 확인합니다.
      const isVisible = parentTitle.includes(searchTerm) || subPostTitles.some(title => title.includes(searchTerm));
      
      container.style.display = isVisible ? '' : 'none';
    });
  });
}

/**
 * 특정 페이지의 방문자 수를 업데이트하고 <settings-toolbar>에 표시합니다.
 * @param {string} pageId - 방문자 수를 업데이트할 페이지의 고유 ID (예: 'post1.html')
 */
export async function displayVisitorCount(pageId) {
  if (!pageId) return; // pageId가 없으면 중단

  const count = await incrementVisitorCount(pageId);

  if (count !== null && settingsToolbar) {
    settingsToolbar.updateVisitorCount(count);
  }
}
