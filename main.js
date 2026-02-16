// 이 파일은 애플리케이션의 메인 진입점(Entry Point)입니다.
// 각 기능별 모듈을 가져와 전체 애플리케이션의 동작을 조립하고 초기화합니다.

// 기능별 모듈에서 필요한 함수들을 가져옵니다.
import { getSortedPosts } from './js/api.js';
import { renderPostList } from './js/ui.js';
import { handleRouting, loadPost, setupPopstateListener } from './js/router.js';

// 검색창(input) 요소를 가져옵니다.
const searchInput = document.getElementById('search-input');

/**
 * 애플리케이션을 초기화하는 메인 함수입니다.
 * async 키워드를 사용하여 내부에서 await를 사용할 수 있도록 합니다.
 */
async function initialize() {
  // 1. 모든 게시물 데이터를 가져와서 정렬합니다.
  const allPosts = await getSortedPosts();

  // 2. LNB 목록의 링크를 클릭했을 때의 동작을 정의하는 함수입니다.
  const handleLinkClick = (event, postFile) => {
    // a 태그의 기본 동작(페이지 전체 새로고침)을 막습니다.
    event.preventDefault();
    // router의 loadPost 함수를 호출하여 해당 게시물을 동적으로 로드합니다.
    loadPost(postFile);
  };

  // 3. 검색창에 입력이 발생했을 때의 동작을 정의합니다.
  searchInput.addEventListener('input', (e) => {
    // 입력된 검색어를 소문자로 변환합니다.
    const searchTerm = e.target.value.toLowerCase();
    // 전체 포스트에서 제목에 검색어가 포함된 포스트만 필터링합니다.
    const filteredPosts = allPosts.filter(post => 
      post.title.toLowerCase().includes(searchTerm)
    );
    // 필터링된 결과를 사용하여 LNB 목록을 다시 렌더링합니다.
    renderPostList(filteredPosts, handleLinkClick);
  });

  // 4. 전체 게시물 목록을 사용하여 초기 LNB 목록을 렌더링합니다.
  renderPostList(allPosts, handleLinkClick);

  // 5. 현재 URL을 기반으로 적절한 콘텐츠를 표시합니다.
  handleRouting(allPosts);

  // 6. 브라우저의 뒤로가기/앞으로가기 버튼 이벤트를 처리하는 리스너를 설정합니다.
  setupPopstateListener();
}

// HTML 문서 로딩이 완료되면 애플리케이션 초기화 함수를 실행합니다.
document.addEventListener('DOMContentLoaded', initialize);
