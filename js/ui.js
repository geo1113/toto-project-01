// 이 모듈은 사용자 인터페이스(UI)를 그리거나 업데이트하는 함수들을 제공합니다.

// LNB의 게시물 목록(ul) 요소를 가져옵니다. 다른 함수에서 재사용하기 위해 모듈 스코프에 저장합니다.
const postListElement = document.getElementById('post-list');
// 메인 콘텐츠 영역(main) 요소를 가져옵니다.
const mainContentElement = document.getElementById('main-content');

/**
 * 주어진 게시물 배열을 기반으로 LNB 목록을 생성합니다.
 * @param {Array} posts - 화면에 표시할 게시물 객체 배열
 * @param {function} onLinkClick - 각 목록 링크를 클릭했을 때 실행될 콜백 함수
 */
export function renderPostList(posts, onLinkClick) {
  // 기존 목록을 모두 삭제하여 초기화합니다.
  postListElement.innerHTML = '';
  // 주어진 posts 배열의 각 항목에 대해 반복 실행합니다.
  posts.forEach(post => {
    // li 요소를 생성합니다.
    const listItem = document.createElement('li');
    // a(링크) 요소를 생성합니다.
    const link = document.createElement('a');
    // 링크의 href 속성을 설정합니다. (예: ?post=posts/post1.html)
    link.href = `?post=${post.file}`;
    // 링크의 텍스트를 게시물 제목으로 설정합니다.
    link.textContent = post.title;
    // 링크에 클릭 이벤트 리스너를 추가합니다.
    link.addEventListener('click', (e) => onLinkClick(e, post.file));
    // li 요소의 자식으로 a 요소를 추가합니다.
    listItem.appendChild(link);
    // ul 요소(postListElement)의 자식으로 li 요소를 추가합니다.
    postListElement.appendChild(listItem);
  });
}

/**
 * HTML 문자열에서 <article> 부분만 추출하여 메인 콘텐츠 영역에 표시합니다.
 * @param {string} html - 게시물 파일의 전체 HTML 내용
 */
export function renderMainContent(html) {
  // 문자열 형태의 HTML을 실제 DOM으로 파싱하기 위한 객체를 생성합니다.
  const parser = new DOMParser();
  // HTML 문자열을 파싱하여 새로운 document 객체를 만듭니다.
  const doc = parser.parseFromString(html, 'text/html');
  // 파싱된 document에서 <article> 태그를 찾습니다.
  const article = doc.querySelector('article');

  // 메인 콘텐츠 영역의 기존 내용을 모두 지웁니다.
  mainContentElement.innerHTML = '';
  
  // 만약 <article> 태그가 존재한다면,
  if (article) {
    // 메인 콘텐츠 영역에 새로 불러온 article 요소를 추가합니다.
    mainContentElement.appendChild(article);
  } else {
    // <article> 태그가 없으면 에러 메시지를 표시합니다.
    showError('콘텐츠를 표시할 수 없습니다.');
  }
}

/**
 * 메인 콘텐츠 영역에 에러 메시지를 표시합니다.
 * @param {string} message - 사용자에게 보여줄 에러 메시지
 */
export function showError(message) {
  // 메인 콘텐츠 영역을 초기화합니다.
  mainContentElement.innerHTML = '';
  // p 태그를 만들어 에러 메시지를 담습니다.
  const errorMessage = document.createElement('p');
  errorMessage.textContent = message;
  // 메인 콘텐츠 영역에 에러 메시지를 추가합니다.
  mainContentElement.appendChild(errorMessage);
}
