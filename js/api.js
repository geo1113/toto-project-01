// 이 모듈은 애플리케이션에 필요한 데이터를 가져오고 처리하는 함수들을 제공합니다.

/**
 * posts.json 파일을 가져와 날짜순으로 정렬한 게시물 목록을 반환합니다.
 * @returns {Promise<Array>} 날짜 내림차순(최신순)으로 정렬된 게시물 객체 배열
 */
export async function getSortedPosts() {
  try {
    const response = await fetch('posts.json');
    if (!response.ok) throw new Error('데이터를 불러오지 못했습니다.');
    
    const posts = await response.json();
    
    // 날짜 내림차순 정렬 (최신순: 2024-05-24 -> 2024-05-23)
    // 날짜 문자열을 직접 비교하거나 Date 객체로 변환하여 비교합니다.
    posts.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    return posts;
  } catch (error) {
    console.error('getSortedPosts 에러:', error);
    return [];
  }
}

/**
 * 특정 게시물 HTML 파일의 내용을 텍스트로 가져옵니다.
 */
export async function getPostContent(file) {
  const response = await fetch(file);
  if (!response.ok) {
    throw new Error('네트워크 응답이 올바르지 않습니다.');
  }
  return response.text();
}
