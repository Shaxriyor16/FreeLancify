// banner-slider.js
document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.hero-slide');
  const progressFill = document.getElementById('progress-fill');
  
  if (!slides.length || !progressFill) return;

  let currentSlide = 0;
  let interval;

  function goToSlide(index) {
    slides[currentSlide].classList.remove('active');
    
    // reset animation
    progressFill.parentElement.classList.remove('animating');
    void progressFill.parentElement.offsetWidth; // trigger reflow
    progressFill.parentElement.classList.add('animating');

    currentSlide = index;
    slides[currentSlide].classList.add('active');
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % slides.length);
  }

  // Init
  progressFill.parentElement.classList.add('animating');
  interval = setInterval(nextSlide, 4000);

  // Optional: hover to pause
  const banner = document.getElementById('hero-slider');
  banner.addEventListener('mouseenter', () => {
    clearInterval(interval);
    progressFill.style.animationPlayState = 'paused';
  });
  banner.addEventListener('mouseleave', () => {
    interval = setInterval(nextSlide, 4000);
    progressFill.style.animationPlayState = 'running';
  });
});
