document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.video-card');
    const modal = document.getElementById('videoModal');
    const modalTitle = document.getElementById('modalVideoTitle');
    const suggestedList = document.getElementById('suggestedList');
    const closeBtn = document.getElementById('closeBtn');
    const minusBtn = document.getElementById('minusBtn');
    const maxBtn = document.getElementById('maxBtn');
    const skipButtonsGroup = document.getElementById('skipButtonsGroup');
    const videoWrapper = document.querySelector('.video-wrapper');
    const rewindBtn = document.getElementById('rewindBtn');
    const forwardBtn = document.getElementById('forwardBtn');

    // ১. হোভার ও ক্লিক এফেক্ট
    cards.forEach(card => {
        const vid = card.querySelector('video');
        
        card.addEventListener('mouseenter', () => {
            if (vid) {
                vid.muted = true;
                const playPromise = vid.play();
                if (playPromise !== undefined) playPromise.catch(() => {});
            }
        });

        card.addEventListener('mouseleave', () => {
            if (vid) {
                vid.pause();
                vid.currentTime = 0;
            }
        });

        card.addEventListener('click', () => {
            const src = card.getAttribute('data-src');
            const title = card.getAttribute('data-title');
            openPlayer(src, title);
        });
    });

    // ২. প্লেয়ার ওপেন করার লজিক
    function openPlayer(src, title) {
        modalTitle.innerText = title;

        let embedSrc = src;
        if (src.includes('drive.google.com')) {
            embedSrc = src.includes('/preview') ? src : src.replace(/\/view.*/, '/preview');
            
            // Auto Resume System (Saved Time Check)
            const savedTimeKey = `watch_time_${title}`;
            const savedTime = localStorage.getItem(savedTimeKey);

            if (savedTime && parseFloat(savedTime) > 5) {
                const minutes = Math.floor(savedTime / 60);
                const seconds = Math.floor(savedTime % 60);
                const confirmResume = confirm(`আপনি আগে এই মুভিটি ${minutes} মিনিট ${seconds} সেকেন্ড পর্যন্ত দেখেছিলেন। সেই সময়ে যেতে চান?`);
                if (confirmResume) {
                    embedSrc += `?t=${Math.floor(savedTime)}`;
                }
            }

            videoWrapper.innerHTML = `
                <iframe src="${embedSrc}" style="width:100%; height:100%;" allow="autoplay" allowfullscreen frameborder="0"></iframe>
            `;
            
            if (skipButtonsGroup) skipButtonsGroup.style.display = 'none'; // Iframe-এ স্কিপ কাজ করে না
        } else {
            // Local MP4 Video
            videoWrapper.innerHTML = `
                <video id="modalVideo" controls autoplay src="${src}" style="width:100%; height:100%;"></video>
            `;
            if (skipButtonsGroup) skipButtonsGroup.style.display = 'flex';

            // Local Video-এর জন্য স্কিপ ইভেন্ট সেটআপ
            setTimeout(() => {
                const modalVideo = document.getElementById('modalVideo');
                if (modalVideo) {
                    rewindBtn.onclick = () => modalVideo.currentTime -= 10;
                    forwardBtn.onclick = () => modalVideo.currentTime += 10;
                }
            }, 100);
        }

        modal.classList.add('active');
        modal.classList.remove('minimized');
        loadSuggestedVideos(src);
    }

    // ৩. সাজেস্টেড ভিডিও লোড
    function loadSuggestedVideos(currentSrc) {
        suggestedList.innerHTML = '';
        cards.forEach(card => {
            const src = card.getAttribute('data-src');
            const title = card.getAttribute('data-title');

            if (src !== currentSrc) {
                const item = document.createElement('div');
                item.className = 'suggested-item';

                if (src.includes('drive.google.com')) {
                    item.innerHTML = `
                        <div class="drive-thumb"><i class="fa-solid fa-play"></i></div>
                        <p>${title}</p>
                    `;
                } else {
                    item.innerHTML = `
                        <video src="${src}#t=1" preload="metadata" muted></video>
                        <p>${title}</p>
                    `;
                }

                item.addEventListener('click', () => {
                    openPlayer(src, title);
                });
                suggestedList.appendChild(item);
            }
        });
    }

    // ৪. কন্ট্রোল বাটন ইভেন্ট (Max, Min, Close)
    maxBtn.addEventListener('click', () => {
        const modalContent = document.querySelector('.modal-content');
        if (!document.fullscreenElement) {
            if (modalContent.requestFullscreen) modalContent.requestFullscreen();
            else if (modalContent.webkitRequestFullscreen) modalContent.webkitRequestFullscreen();
            else if (modalContent.msRequestFullscreen) modalContent.msRequestFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    });

    closeBtn.addEventListener('click', () => {
        if (document.fullscreenElement) document.exitFullscreen();
        modal.classList.remove('active', 'minimized');
        videoWrapper.innerHTML = '';
    });

    minusBtn.addEventListener('click', () => {
        if (document.fullscreenElement) document.exitFullscreen();
        modal.classList.toggle('minimized');
    });
});