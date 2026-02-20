
import { getSortedPosts } from './api.js';
import { renderPostList, renderConverter } from './ui.js';
import { setupPopstateListener } from './router.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. 게시물 목록 가져오기 및 LNB 렌더링
    const allPosts = await getSortedPosts();
    renderPostList(allPosts);

    // 2. 초기 화면으로 한/영 변환기 렌더링
    renderConverter();

    // 3. 뒤로가기/앞으로가기 이벤트 리스너 설정
    setupPopstateListener();
});
