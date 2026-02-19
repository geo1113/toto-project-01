// 이 파일은 애플리케이션의 메인 진입점(Entry Point)입니다.
// 각 기능별 모듈을 가져와 전체 애플리케이션의 동작을 조립하고 초기화합니다.

import './js/components/settingsToolbar.js'; // 웹 컴포넌트 등록
import { getSortedPosts } from './js/api.js';
import { renderPostList, initSearch } from './js/ui.js';
import { handleRouting, loadPost, setupPopstateListener } from './js/router.js';

/**
 * 애플리케이션을 초기화하는 메인 함수입니다.
 * async 키워드를 사용하여 내부에서 await를 사용할 수 있도록 합니다.
 */
async function initialize() {
  // 1. 검색 기능을 초기화합니다.
  initSearch();

  // 2. 모든 게시물 데이터를 가져와서 정렬합니다.
  const allPosts = await getSortedPosts();

  // 3. LNB 목록의 링크를 클릭했을 때의 동작을 정의하는 함수입니다.
  const handleLinkClick = (event, postFile) => {
    event.preventDefault();
    loadPost(postFile);
  };

  // 4. 전체 게시물 목록을 사용하여 초기 LNB 목록을 렌더링합니다.
  renderPostList(allPosts, handleLinkClick);

  // 5. 현재 URL을 기반으로 적절한 콘텐츠를 표시합니다.
  handleRouting(allPosts);

  // 6. 브라우저의 뒤로가기/앞으로가기 버튼 이벤트를 처리하는 리스너를 설정합니다.
  setupPopstateListener();
}

// HTML 문서 로딩이 완료되면 애플리케이션 초기화 함수를 실행합니다.
document.addEventListener('DOMContentLoaded', initialize);
