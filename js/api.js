// 이 모듈은 애플리케이션에 필요한 데이터를 가져오고 처리하는 함수들을 제공합니다.

/**
 * posts.json 파일을 가져와 날짜순으로 정렬한 게시물 목록을 반환합니다.
 * @returns {Promise<Array>} 정렬된 게시물 객체 배열을 담은 프로미스
 */
export async function getSortedPosts() {
  // fetch API를 사용하여 posts.json 파일을 비동기적으로 가져옵니다.
  const response = await fetch('posts.json');
  // 응답(response)을 JSON 형태로 파싱합니다.
  const posts = await response.json();
  // posts 배열을 날짜(date) 기준으로 내림차순 정렬하여 최신 글이 맨 위로 오게 합니다.
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  // 정렬된 배열을 반환합니다.
  return posts;
}

/**
 * 특정 게시물 HTML 파일의 내용을 텍스트로 가져옵니다.
 * @param {string} file - 불러올 게시물의 경로 (예: "posts/post1.html")
 * @returns {Promise<string>} 게시물 HTML 내용을 담은 프로미스
 */
export async function getPostContent(file) {
  // 주어진 경로의 파일을 fetch로 가져옵니다.
  const response = await fetch(file);
  // 응답이 'ok'가 아니면 (예: 404 Not Found) 에러를 발생시킵니다.
  if (!response.ok) {
    throw new Error('네트워크 응답이 올바르지 않습니다.');
  }
  // 응답 내용을 텍스트 형태로 변환하여 반환합니다.
  return response.text();
}
