// 이 파일은 클라이언트 사이드 라우팅을 관리하는 모듈입니다.
// URL 변경을 감지하고, 그에 맞는 콘텐츠를 로드하며, 브라우저 히스토리를 관리합니다.

import { renderPostList, displayVisitorCount } from './ui.js';
import { getSortedPosts } from './api.js';

const mainContent = document.getElementById('main-content');

/**
 * 지정된 경로의 HTML 파일을 메인 콘텐츠 영역에 비동기적으로 로드합니다.
 * 로딩 전후로 CSS 클래스를 제어하여 부드러운 전환 효과를 줍니다.
 * @param {string} postFile - 로드할 게시물 파일 경로 (예: 'posts/post1.html')
 */
export async function loadPost(postFile) {
  mainContent.classList.add('fade-out');

  try {
    const response = await fetch(postFile);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const postHtml = await response.text();
    mainContent.innerHTML = postHtml;

    // 게시물이 성공적으로 로드된 후, 해당 게시물의 방문자 수를 표시합니다.
    const pageId = postFile.split('/').pop(); // 파일 이름만 추출 (예: 'post1.html')
    await displayVisitorCount(pageId);

    // Disqus 댓글 스레드를 리셋합니다.
    resetDisqus(pageId);

  } catch (error) {
    mainContent.innerHTML = `<p>게시물을 불러오는 데 실패했습니다. (경로: ${postFile})</p>`;
    console.error(error);
  } finally {
    // 콘텐츠 로드 완료 후 URL을 업데이트하고 fade-in 효과를 적용합니다.
    const url = `?post=${postFile.split('/').pop()}`;
    history.pushState({ path: url }, '', url);
    mainContent.classList.remove('fade-out');
  }
}

/**
 * 브라우저의 뒤로가기/앞으로가기 버튼에 대응하기 위한 popstate 이벤트 리스너를 설정합니다.
 */
export function setupPopstateListener() {
  window.addEventListener('popstate', async (event) => {
    const allPosts = await getSortedPosts();
    handleRouting(allPosts);
  });
}

/**
 * 현재 URL을 분석하여 적절한 콘텐츠를 로드하는 라우팅 함수입니다.
 * URL에 'post' 파라미터가 있으면 해당 게시물을, 없으면 최신 게시물을 로드합니다.
 * @param {Array<Object>} allPosts - 모든 게시물 정보 배열
 */
export async function handleRouting(allPosts) {
  const params = new URLSearchParams(window.location.search);
  const postFile = params.get('post');

  if (postFile) {
    // URL에 post 파라미터가 있으면 해당 게시물을 로드합니다.
    await loadPost(`posts/${postFile}`);
  } else if (allPosts.length > 0) {
    // 파라미터가 없고 게시물이 있으면 최신 게시물을 로드합니다.
    await loadPost(`posts/${allPosts[0].file}`);
  } else {
    // 게시물이 없으면 환영 메시지를 표시합니다.
    mainContent.innerHTML = '<h1>환영합니다!</h1><p>왼쪽 목록에서 게시물을 선택하세요.</p>';
    // 홈페이지에 대한 방문자 수를 표시합니다. ID는 'home'으로 지정합니다.
    await displayVisitorCount('home');
  }
}

/**
 * Disqus 댓글 시스템을 새로운 페이지에 맞게 리셋하고 다시 로드합니다.
 * @param {string} pageIdentifier - 현재 페이지를 식별하는 고유 값 (게시물 파일명 사용)
 */
function resetDisqus(pageIdentifier) {
  if (window.DISQUS) {
    window.DISQUS.reset({
      reload: true,
      config: function () {
        this.page.url = window.location.href;
        this.page.identifier = pageIdentifier;
      }
    });
  } else {
    console.log("Disqus가 로드되지 않았습니다.")
  }
}
