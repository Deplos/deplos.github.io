const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("animation");
    });
});

const animationObjects = document.querySelectorAll("[data-anim]");

animationObjects.forEach((entry) => observer.observe(entry));