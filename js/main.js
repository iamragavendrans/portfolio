document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 1. GSAP RESPONSIVE SCROLL SETUP
    // ==========================================
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    const track = document.querySelector('.horizontal-container');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let mm = gsap.matchMedia();

    // DESKTOP: Native Horizontal Side-Scroller
    mm.add("(min-width: 769px)", () => {
        const trackWidth = track.scrollWidth;

        // Pin the main track wrapper and translate the inner container
        let scrollTween = gsap.to(track, {
            x: () => -(trackWidth - window.innerWidth),
            ease: "none",
            scrollTrigger: {
                trigger: ".scroll-track",
                pin: true,
                scrub: 1, // Smooth scrubbing
                end: () => "+=" + trackWidth
            }
        });

        // Animate elements popping in as you scroll horizontally
        gsap.utils.toArray('.milestone, .award-card, .skill-orb').forEach(element => {
            gsap.from(element, {
                y: 50,
                opacity: 0,
                duration: 0.8,
                ease: "back.out(1.5)",
                scrollTrigger: {
                    trigger: element,
                    containerAnimation: scrollTween, 
                    start: "left 85%",
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Parallax background transition based on overall horizontal progress
        ScrollTrigger.create({
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            onUpdate: (self) => {
                document.getElementById("parallax-bg").style.transform = `translateX(${-self.progress * 30}vw)`;
            }
        });

        // Side Navigation Logic (Mapping horizontal constraints)
        navLinks.forEach(link => {
            // Remove previous bounds if swapping screensites
            link.onclick = (e) => {
                e.preventDefault();
                const targetElement = document.querySelector(link.getAttribute('href'));
                if (targetElement && scrollTween) {
                    const targetX = targetElement.offsetLeft + (targetElement.offsetWidth / 2) - (window.innerWidth / 2);
                    const maxTranslate = trackWidth - window.innerWidth;
                    const clampedX = Math.max(0, Math.min(targetX, maxTranslate));
                    
                    let startScroll = scrollTween.scrollTrigger ? scrollTween.scrollTrigger.start : 0;
                    let yScroll = startScroll + (clampedX * (trackWidth / maxTranslate));
                    
                    gsap.to(window, { scrollTo: { y: yScroll, autoKill: false }, duration: 1.5, ease: "power3.inOut" });
                }
            };
        });

        // Update active nav state on scroll
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            let currentSection = "";
            document.querySelectorAll('.h-panel').forEach(panel => {
                const panelStart = panel.offsetLeft - 300; 
                if (scrollY >= panelStart) currentSection = "#" + panel.id;
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === currentSection) link.classList.add('active');
            });
        });

        return () => {
            // GSAP cleans up variables if breakpoint shifts naturally
            window.removeEventListener('scroll', null);
        };
    });

    // MOBILE: Strictly Vertical Scrolling Stack
    mm.add("(max-width: 768px)", () => {
        // Vertical pop-ins without containerAnimation hacks
        gsap.utils.toArray('.milestone, .award-card, .skill-orb').forEach(element => {
            gsap.from(element, {
                y: 50,
                opacity: 0,
                duration: 0.8,
                ease: "back.out(1.5)",
                scrollTrigger: {
                    trigger: element,
                    start: "top 85%", // standard top trigger
                    toggleActions: "play none none reverse"
                }
            });
        });

        // Simplistic vertical background parallax
        ScrollTrigger.create({
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 1,
            onUpdate: (self) => {
                document.getElementById("parallax-bg").style.transform = `translateY(${-self.progress * 15}vh)`;
            }
        });

        // Bottom Tab Nav Bar Logic (Standard vertical anchors)
        navLinks.forEach(link => {
            link.onclick = (e) => {
                e.preventDefault();
                const targetElement = document.querySelector(link.getAttribute('href'));
                if (targetElement) {
                    // Just scroll to it natively + offset margin so the target isn't hidden under the mobile status bar
                    gsap.to(window, { scrollTo: { y: targetElement.offsetTop - 20, autoKill: false }, duration: 1, ease: "power2.inOut" });
                }
            };
        });

        // Update active nav state on scroll vertically
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            let currentSection = "";
            document.querySelectorAll('.h-panel').forEach(panel => {
                const panelStart = panel.offsetTop - parseInt(window.innerHeight / 2); 
                if (scrollY >= panelStart) currentSection = "#" + panel.id;
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === currentSection) link.classList.add('active');
            });
        });
    });

    // ==========================================
    // 3. MODAL INTERACTION LOGIC
    // ==========================================
    const milestones = document.querySelectorAll('.milestone.clickable');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalContent = document.getElementById('modal-content');
    const closeModalBtn = document.getElementById('close-modal');

    // Open Modal Function
    milestones.forEach(stone => {
        stone.addEventListener('click', () => {
            const companyId = stone.getAttribute('data-modal');
            const hiddenData = document.getElementById(`data-${companyId}`);
            
            if (hiddenData) {
                modalContent.innerHTML = hiddenData.innerHTML;
                modalOverlay.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Open Project Modal Function
    const projectBtns = document.querySelectorAll('.view-project-btn');
    projectBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the main milestone click event
            const projectId = btn.getAttribute('data-project');
            const hiddenData = document.getElementById(`data-${projectId}`);
            
            if (hiddenData) {
                modalContent.innerHTML = hiddenData.innerHTML;
                modalOverlay.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close Modal Functions
    const closeModal = () => {
        modalOverlay.classList.add('hidden');
        document.body.style.overflow = 'auto'; // Restore scroll
        document.body.style.overflowX = 'hidden'; 
        
        setTimeout(() => { modalContent.innerHTML = ''; }, 300);
    }

    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && !modalOverlay.classList.contains('hidden')) closeModal();
    });

});
