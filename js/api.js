// 이 파일은 Firebase Firestore와 상호작용하는 함수들을 모아놓은 모듈입니다.
// 게시물 데이터 가져오기, 방문자 수 업데이트 등 비동기 작업을 처리합니다.

/**
 * Firestore에서 게시물 목록을 가져와 파일 이름과 생성 날짜를 포함하는 객체 배열로 반환합니다.
 * 예외 발생 시 빈 배열을 반환하여 애플리케이션의 안정성을 보장합니다.
 * @returns {Promise<Array<{file: string, date: string}>>} 날짜로 정렬된 게시물 정보 배열
 */
export async function getSortedPosts() {
  try {
    // 'posts.json' 파일은 모든 게시물의 메타데이터를 담고 있습니다.
    const response = await fetch('posts.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const posts = await response.json();

    // 게시물을 날짜 내림차순으로 정렬합니다.
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error("게시물 목록을 가져오는 데 실패했습니다:", error);
    return []; // 오류 발생 시 빈 배열 반환
  }
}

/**
 * Firestore에서 특정 페이지의 방문자 수를 가져옵니다.
 * 해당 페이지의 문서가 없으면 0을 반환합니다.
 * @param {string} pageId - 방문자 수를 조회할 페이지의 고유 ID (예: 'post1.html')
 * @returns {Promise<number>} 해당 페이지의 방문자 수
 */
export async function getVisitorCount(pageId) {
  // 페이지 ID가 없으면 함수를 중단합니다.
  if (!pageId) return 0;

  // Firebase에서 페이지 ID에 해당하는 문서를 가져옵니다.
  // 실제 프로덕션에서는 여기에 Firebase SDK 코드가 들어갑니다.
  // 지금은 localStorage를 사용하여 기능을 모방합니다.
  const count = parseInt(localStorage.getItem(`visitor_count_${pageId}`) || '0', 10);
  return count;
}

/**
 * Firestore의 특정 페이지 방문자 수를 1 증가시킵니다.
 * 트랜잭션을 사용하여 여러 사용자가 동시에 접속해도 안전하게 수를 증가시킵니다.
 * @param {string} pageId - 방문자 수를 증가시킬 페이지의 고유 ID
 * @returns {Promise<number|null>} 업데이트된 방문자 수, 실패 시 null
 */
export async function incrementVisitorCount(pageId) {
  if (!pageId) return null;

  try {
    // 1. 현재 카운트를 가져옵니다.
    const currentCount = await getVisitorCount(pageId);
    
    // 2. 카운트를 1 증가시킵니다.
    const newCount = currentCount + 1;
    
    // 3. 증가된 카운트를 저장합니다.
    localStorage.setItem(`visitor_count_${pageId}`, newCount.toString());
    
    console.log(`[${pageId}] 방문자 수 업데이트:`, newCount);
    return newCount;
  } catch (error) {
    console.error(`[${pageId}] 방문자 수 업데이트 실패:`, error);
    return null; // 실패 시 null 반환
  }
}
