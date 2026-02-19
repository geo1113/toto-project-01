// 이 모듈은 URL 변경 감지, 페이지 로딩 처리 등 라우팅 관련 기능을 담당합니다.

import { getPostContent } from './api.js';
import { displayContent, displayVisitorCount, showError, loadDisqus } from './ui.js';

/**
 * 특정 게시물을 불러와 화면에 표시하고, 브라우저 히스토리를 관리합니다.
 * @param {string} file - 불러올 게시물의 경로
 * @param {boolean} addToHistory - 이 페이지 방문을 브라우저 히스토리에 추가할지 여부
 */
export async function loadPost(file, addToHistory = true) {
  try {
    // 1. api 모듈을 사용해 게시물 HTML 내용을 가져옵니다.
    const postHtml = await getPostContent(file);
    
    // 2. ui 모듈을 사용해 가져온 내용을 메인 콘텐츠 영역에 렌더링합니다.
    displayContent(postHtml);

    // 3. 방문자 카운터를 표시합니다.
    displayVisitorCount();

    // 4. Disqus 댓글창을 업데이트합니다.
    loadDisqus(file);

    // 5. 브라우저 히스토리에 상태를 추가해야 하는 경우,
    if (addToHistory) {
      // pushState를 사용하여 URL을 변경하고 히스토리 엔트리를 추가합니다.
      history.pushState(null, '', `?post=${file}`);
    }
  } catch (error) {
    // 게시물 로딩 중 에러가 발생하면 콘솔에 로그를 남기고,
    console.error('게시물을 불러오는 데 실패했습니다.', error);
    // 사용자에게 에러 메시지를 표시합니다.
    showError('해당 콘텐츠를 찾을 수 없습니다.');
  }
}

/**
 * 페이지가 처음 로드되거나 URL이 변경되었을 때 어떤 콘텐츠를 보여줄지 결정합니다.
 * @param {Array} posts - 전체 게시물 목록 배열
 */
export function handleRouting(posts) {
  const urlParams = new URLSearchParams(window.location.search);
  const postFile = urlParams.get('post');

  if (postFile) {
    loadPost(postFile, false);
  } else if (posts.length > 0) {
    const latestPostFile = posts[0].file;
    loadPost(latestPostFile, false);
    history.replaceState(null, '', `?post=${latestPostFile}`);
  }
}

/**
 * 브라우저의 뒤로가기/앞으로가기 버튼 이벤트를 처리하는 리스너를 설정합니다.
 */
export function setupPopstateListener() {
  window.addEventListener('popstate', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const postFile = urlParams.get('post');
    if (postFile) {
      loadPost(postFile, false);
    }
  });
}
