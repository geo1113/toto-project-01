// 이 파일은 데이터 관리(포스트 목록, 방문자 수)와 관련된 API 함수들을 포함합니다.

/**
 * posts.json 파일을 비동기적으로 가져와서 게시물 데이터를 반환합니다.
 * 게시물은 날짜 내림차순으로 정렬됩니다.
 * @returns {Promise<Array<Object>>} 날짜순으로 정렬된 게시물 객체 배열
 */
export async function getSortedPosts() {
  try {
    const response = await fetch('posts.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // 'published'가 true인 게시물만 필터링합니다.
    const publishedPosts = data.posts.filter(post => post.published === true);
    
    // 필터링된 게시물을 날짜 내림차순으로 정렬합니다.
    return publishedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error("게시물을 불러오는 데 실패했습니다:", error);
    return []; // 오류 발생 시 빈 배열 반환
  }
}

/**
 * 페이지별 방문자 수를 관리하는 함수입니다.
 * localStorage를 사용하여 각 페이지의 방문 횟수를 저장하고 증가시킵니다.
 * @param {string} pageId - 방문 횟수를 기록할 페이지의 고유 식별자입니다.
 * @returns {number | null} 해당 페이지의 누적 방문자 수 또는 오류 발생 시 null을 반환합니다.
 */
export function incrementVisitorCount(pageId) {
  if (!pageId) {
    console.error('페이지 ID가 제공되지 않았습니다.');
    return null;
  }

  try {
    // 전체 방문자 수 객체를 가져옵니다. 없으면 새로 생성합니다.
    let visitorData = JSON.parse(localStorage.getItem('visitorCounts')) || {};

    // 현재 페이지의 카운트를 1 증가시킵니다. 없으면 1로 초기화합니다.
    visitorData[pageId] = (visitorData[pageId] || 0) + 1;

    // 업데이트된 데이터를 localStorage에 다시 저장합니다.
    localStorage.setItem('visitorCounts', JSON.stringify(visitorData));

    // 해당 페이지의 누적 방문자 수를 반환합니다.
    return visitorData[pageId];

  } catch (error) {
    console.error('방문자 수를 업데이트하는 중 오류가 발생했습니다:', error);
    return null;
  }
}
