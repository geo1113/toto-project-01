import { initConverter } from './converter.js';

// 1. 전역 콜백 함수 선언 (Google 번역)
window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement(
        { pageLanguage: 'ko', includedLanguages: 'ko,en', layout: google.translate.TranslateElement.InlineLayout.SIMPLE, autoDisplay: false },
        'google_translate_element'
    );
};

document.addEventListener('DOMContentLoaded', () => {
    const postList = document.getElementById('post-list');
    const mainContent = document.getElementById('main-content');
    const searchInput = document.getElementById('search-input');
    const themeToggleButton = document.getElementById('theme-toggle');

    let posts = [];

    // 2. 스크립트 동적 로드 (Disqus, Google Translate)
    function loadDynamicScript(src, id, callback) {
        if (document.getElementById(id)) return; // 이미 있으면 로드하지 않음
        const script = document.createElement('script');
        script.src = src;
        script.id = id;
        script.async = true;
        document.body.appendChild(script);
        if (callback) script.onload = callback;
    }

    loadDynamicScript('https://toto-project-01.disqus.com/embed.js', 'disqus-embed-script');
    loadDynamicScript('//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit', 'google-translate-script');

    // 3. 게시물 목록 로드 및 LNB 생성
    fetch('posts.json') 
        .then(response => {
            if (!response.ok) throw new Error('posts.json not found');
            return response.json();
        })
        .then(data => {
            posts = data.posts;
            renderPostList(posts);
            const initialPath = window.location.hash.substring(1) || (posts.length > 0 ? posts[0].file : null);
            if (initialPath) loadContent(initialPath);
        })
        .catch(error => {
            console.error('Error fetching or rendering posts:', error);
            mainContent.innerHTML = '<p>게시물 목록을 불러오는 데 실패했습니다.</p>';
        });

    function renderPostList(postsToRender) {
        postList.innerHTML = ''; 
        postsToRender.forEach(post => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="post-item">
                    <a href="#${post.file}" data-path="${post.file}" class="post-link">
                        <span class="post-title">${post.title}</span>
                        <span class="post-date">${post.date}</span>
                    </a>
                    ${post.subPosts ? '<button class="toggle-sub-posts">▼</button>' : ''}
                </div>
            `;
            if (post.subPosts) {
                const subList = document.createElement('ul');
                subList.className = 'sub-post-list';
                subList.style.display = 'none';
                post.subPosts.forEach(subPost => {
                    const subLi = document.createElement('li');
                    subLi.innerHTML = `<a href="#${subPost.file}" data-path="${subPost.file}" class="post-link sub-post-link">${subPost.title}</a>`;
                    subList.appendChild(subLi);
                });
                li.appendChild(subList);
            }
            postList.appendChild(li);
        });
    }

    // 4. 콘텐츠 로드
    function loadContent(path) {
        fetch(path)
            .then(response => {
                if (!response.ok) throw new Error(`Content not found: ${path}`);
                return response.text();
            })
            .then(html => {
                mainContent.innerHTML = html;
                
                // post1.html을 위한 한/영 변환기 초기화
                if (path.includes('post1.html')) {
                    initConverter();
                }
                
                // post4.html을 위한 환율 계산기 초기화
                if (path.includes('posts/post4.html')) {
                    import('./exchange-rate.js')
                        .then(module => {
                            module.initExchangeRateConverter();
                        })
                        .catch(err => {
                            console.error('Failed to load exchange rate module:', err);
                        });
                }

                // Disqus 리셋
                if (window.DISQUS) {
                    DISQUS.reset({
                        reload: true,
                        config: function () {
                            this.page.url = window.location.origin + window.location.pathname + '#' + path;
                            this.page.identifier = path;
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error loading content:', error);
                mainContent.innerHTML = '<p>콘텐츠를 불러오는 데 실패했습니다.</p>';
            });
    }

    // 5. URL 변경 감지 (뒤로/앞으로 가기)
    window.addEventListener('hashchange', () => {
        const path = window.location.hash.substring(1);
        if(path) loadContent(path);
    });
    
    // 6. 이벤트 위임 (LNB 클릭)
    postList.addEventListener('click', (e) => {
        const link = e.target.closest('.post-link');
        if (link) {
            e.preventDefault();
            const path = link.dataset.path;
            window.location.hash = path; 
        }

        const toggleBtn = e.target.closest('.toggle-sub-posts');
        if (toggleBtn) {
            const subList = toggleBtn.parentElement.nextElementSibling;
            if (subList) {
                const isHidden = subList.style.display === 'none';
                subList.style.display = isHidden ? 'block' : 'none';
                toggleBtn.textContent = isHidden ? '▲' : '▼';
            }
        }
    });

    // 7. 검색
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredPosts = posts.filter(post => {
            const titleMatch = post.title.toLowerCase().includes(searchTerm);
            const subPostMatch = post.subPosts ? post.subPosts.some(sub => sub.title.toLowerCase().includes(searchTerm)) : false;
            return titleMatch || subPostMatch;
        });
        renderPostList(filteredPosts);
    });

    // 8. 테마 토글
    themeToggleButton.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        themeToggleButton.textContent = isDarkMode ? '☀️' : '🌙';
    });

    // 초기 테마 적용
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleButton.textContent = '☀️';
    }
});
