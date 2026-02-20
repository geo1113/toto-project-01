
// 이 파일은 UI 렌더링 및 사용자 상호작용과 관련된 함수들을 포함합니다.

import { loadPost } from './router.js';
import { incrementVisitorCount } from './api.js';
import { initConverter } from './converter.js';

const postList = document.getElementById('post-list');
const mainContent = document.getElementById('main-content');


/**
 * 한영 변환기 UI를 생성하고 메인 콘텐츠 영역에 렌더링합니다.
 * `initConverter` 함수를 호출하여 기능과 이벤트를 활성화합니다.
 */
export function renderConverter() {
    const converterHTML = `
        <div class="converter-container">
            <header>
                <h1>한/영 변환기</h1>
                <p>한글을 영어 타자로, 또는 영어 타자를 한글로 변환합니다.</p>
            </header>
            <div class="converter-wrapper">
                <div class="textarea-group">
                    <textarea id="input-text" placeholder="텍스트를 입력하세요..."></textarea>
                    <div class="char-counter" id="input-bytes">0 Bytes</div>
                </div>
                <button id="swap-button" title="입력과 출력 바꾸기">↔</button>
                <div class="textarea-group">
                    <textarea id="output-text" readonly placeholder="변환 결과..."></textarea>
                     <div class="char-counter" id="output-bytes">0 Bytes</div>
                </div>
            </div>
        </div>
    `;
    mainContent.innerHTML = converterHTML;
    initConverter(); // 변환기 기능 활성화
}

/**
 * 게시물 데이터를 받아 LNB(왼쪽 네비게이션 바) 목록을 생성하고 화면에 렌더링합니다.
 * @param {Array<Object>} posts - 렌더링할 게시물 객체 배열
 */
export function renderPostList(posts) {
    if (!posts || posts.length === 0) {
        postList.innerHTML = '<li>게시물이 없습니다.</li>';
        return;
    }

    const postLinks = posts.map(post => `
        <li>
            <a href="#" data-post-file="posts/${post.file}">${post.title}</a>
        </li>
    `).join('');

    postList.innerHTML = `<li><a href="#" id="converter-link">한/영 변환기</a></li>${postLinks}`;

    // 각 게시물 링크에 클릭 이벤트 리스너를 추가합니다.
    postList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            document.querySelectorAll('#post-list a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');

            if(link.id === 'converter-link') {
                renderConverter();
                 // 홈페이지에 대한 방문자 수를 표시합니다. ID는 'home'으로 지정합니다.
                displayVisitorCount('home');
            } else {
                const postFile = link.dataset.postFile;
                loadPost(postFile);
            }
        });
    });
}

/**
 * 특정 페이지의 방문자 수를 가져와 화면에 표시합니다.
 * @param {string} pageId - 방문자 수를 가져올 페이지의 고유 ID (예: 'post1.html')
 */
export async function displayVisitorCount(pageId) {
    const totalCountElement = document.getElementById('visitor-count-total');
    if (!pageId || !totalCountElement) return;

    try {
        // 방문자 수를 1 증가시키고 새로운 수를 가져옵니다.
        const newTotalCount = await incrementVisitorCount(pageId); 
        totalCountElement.textContent = newTotalCount;
    } catch (error) {
        console.error('방문자 수를 업데이트하는 데 실패했습니다:', error);
        totalCountElement.textContent = '측정 불가';
    }
}
