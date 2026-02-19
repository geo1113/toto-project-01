// 이 모듈은 URL 변경 감지, 페이지 로딩 처리 등 라우팅 관련 기능을 담당합니다.

import { getPostContent } from './api.js';
import { displayContent, showError, loadDisqus } from './ui.js';

/**
 * 특정 게시물을 불러와 화면에 표시하고, 브라우저 히스토리를 관리합니다.
 * @param {string} file - 불러올 게시물의 경로
 * @param {boolean} addToHistory - 이 페이지 방문을 브라우저 히스토리에 추가할지 여부
 */
export async function loadPost(file, addToHistory = true) {
  try {
    // api 모듈을 사용해 게시물 HTML 내용을 가져옵니다.
    const postHtml = await getPostContent(file);
    // ui 모듈을 사용해 가져온 내용을 메인 콘텐츠 영역에 렌더링합니다.
    displayContent(postHtml);

    // Disqus 댓글창 업데이트
    loadDisqus(file);

    // 브라우저 히스토리에 상태를 추가해야 하는 경우,
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
  // 현재 URL의 쿼리 파라미터를 가져옵니다.
  const urlParams = new URLSearchParams(window.location.search);
  const postFile = urlParams.get('post');

  // 만약 URL에 'post' 파라미터가 지정되어 있다면
  if (postFile) {
    // 해당 게시물을 로드합니다. (히스토리 추가 안 함)
    loadPost(postFile, false);
  } 
  // URL에 파라미터가 없고, 게시물이 하나 이상 존재한다면
  else if (posts.length > 0) {
    // 가장 최신 글(배열의 첫 번째)을 로드합니다.
    const latestPostFile = posts[0].file;
    loadPost(latestPostFile, false);
    // URL을 최신 글로 업데이트합니다. (히스토리 추가 안 함, 주소창만 변경)
    history.replaceState(null, '', `?post=${latestPostFile}`);
  }
}

/**
 * 브라우저의 뒤로가기/앞으로가기 버튼 이벤트를 처리하는 리스너를 설정합니다.
 */
export function setupPopstateListener() {
  // 'popstate' 이벤트(뒤로/앞으로 가기)가 발생하면 실행될 함수를 등록합니다.
  window.addEventListener('popstate', () => {
    // URL이 변경되었으므로, 라우팅 핸들러를 다시 실행하여
    // 현재 URL에 맞는 콘텐츠를 로드합니다.
    const urlParams = new URLSearchParams(window.location.search);
    const postFile = urlParams.get('post');
    if (postFile) {
      loadPost(postFile, false); // 히스토리에 또 추가하지 않도록 false 전달
    }
  });
}
