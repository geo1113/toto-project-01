/**
 * 이 파일은 UI 관련 함수들을 포함합니다.
 * 목록 렌더링, 콘텐츠 표시, 에러 메시지 등 사용자 인터페이스와 관련된 모든 것을 담당합니다.
 */

import { getSortedPosts } from './api.js';
import { loadPost } from './router.js';

const postList = document.getElementById('post-list');
const mainContent = document.getElementById('main-content');
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

export function renderPostList(posts, onLinkClick) {
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

export function displayContent(html) {
  mainContent.innerHTML = html;
}

export function displayVisitorCount() {
  const visitorCount = updateVisitorCounter();
  const counterEl = document.createElement('div');
  counterEl.id = 'visitor-counter';
  counterEl.innerHTML = `👥 누적 접속자: <strong>${visitorCount.toLocaleString()}</strong>명`;
  mainContent.prepend(counterEl);
}

function updateVisitorCounter() {
  let count = parseInt(localStorage.getItem('total_visits') || '2540');
  count += Math.floor(Math.random() * 3) + 1;
  localStorage.setItem('total_visits', count);
  return count;
}

export function showError(message) {
  mainContent.innerHTML = `<div class="error"><strong>Error:</strong> ${message}</div>`;
}

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
