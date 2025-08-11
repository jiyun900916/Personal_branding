'use strict';


// (A) Splitting 먼저 준비
$(function () {
  if (window.Splitting) Splitting();
  else window.addEventListener('load', () => Splitting());
});

/* =====================================================
  1. 기본 링크 튕김 방지
===================================================== */
$(document).on('click', 'a[href="#"]', function (e) {
  e.preventDefault();
});

/* =====================================================
  2. Scrolla (once: true → 1회만 실행)
===================================================== */
 $('.animate').not('.animate-title').scrolla({
   mobile: true,
   once: true, // 진입 1회만
   onScroll: function (el) {
     el.addClass('motion');
     el.find('.animate').addClass('motion');

     // ✍️ handwrite 텍스트 시작
     const hw = el.find('.handwrite')[0];
     if (hw) {
       hw.classList.add('play');
       // 마지막 글자 끝나면 커서 멈춤 (1회만)
       if (!hw.dataset.done) {
         const chars = hw.querySelectorAll('.char:not(.whitespace)');
         const last = chars[chars.length - 1];
         if (last) {
           last.addEventListener('animationend', () => hw.classList.add('handwrite-done'), { once: true });
         }
         hw.dataset.done = '1';
       }
     }
   }
 });

/* =====================================================
  3. 타이틀(.tit) ScrollTrigger
===================================================== */
gsap.utils.toArray('.tit').forEach((titEl) => {
  ScrollTrigger.create({
    trigger: titEl,
    start: "top 80%",
    onEnter: () => titEl.classList.add('motion'),
     onEnterBack: () => titEl.classList.add('motion'),
    toggleActions: "play none none none"
  });
});

/* =====================================================
  4. .animate-title 전용 ScrollTrigger
===================================================== */
gsap.utils.toArray('.animate-title').forEach((titEl) => {
  ScrollTrigger.create({
    trigger: titEl,
    start: "top 80%",
    onEnter: () => titEl.classList.add('motion'),
    onEnterBack: () => titEl.classList.add('motion'),
    toggleActions: "play none none none"
  });
});

/* =====================================================
  5. spread_container 이미지 퍼짐 효과
===================================================== */
gsap.registerPlugin(ScrollTrigger);

const positions = [
  { x: -900, y: -100 }, { x: -500, y: -300 }, { x: 0, y: -300 }, { x: 700, y: -300 },
  { x: -730, y: 200 }, { x: -200, y: 400 }, { x: 500, y: 10 }, { x: 800, y: 200 },
];

gsap.utils.toArray('.img').forEach((img, i) => {
  const pos = positions[i] || { x: 0, y: 0 };

  gsap.set(img, {
    xPercent: -50, yPercent: -50, left: "50%", top: "50%",
    scale: 0.5, opacity: 0, position: "absolute"
  });

  gsap.to(img, {
    x: pos.x, y: pos.y, scale: 1, opacity: 1,
    ease: "power2.out", duration: 6, delay: i * 0.3,
    scrollTrigger: {
      trigger: ".spread_container",
      start: "top bottom",
      end: "bottom top",
      scrub: true
    }
  });
});

/* =========================================
   21) Handwriting Typing Animation
========================================= */
// Ⅰ. 문자 분해


// Ⅱ. 스크롤 진입 시 1회만 재생
const el = document.querySelector('.handwrite');
if(el){
  const io = new IntersectionObserver((entries)=>{
    if(!entries[0].isIntersecting) return;
    el.classList.add('play');
    io.disconnect();
  }, { threshold: 0.35 });
  io.observe(el);

  const chars = [...el.querySelectorAll('.char')].filter(c=>!c.classList.contains('whitespace'));
  const last = chars[chars.length - 1];
  if(last){
    last.addEventListener('animationend', ()=> el.classList.add('handwrite-done'), { once:true });
  }
}

/* =====================================================
  6. Journal 타임라인/그리드/엔트리 연동
===================================================== */
const timelineEl = document.querySelector('.timeline');
const timelineItems = Array.from(document.querySelectorAll('.timeline .timeline-item'));
const gridItems = Array.from(document.querySelectorAll('.gridR .grid-item'));
const entries = Array.from(document.querySelectorAll('.description .entry'));

const getText = (el, sel) => (el?.querySelector(sel)?.textContent || '').trim();
const yearsFromTimeline = timelineItems.map(it => getText(it, '.year'));
const yearToIndex = new Map(yearsFromTimeline.map((y, i) => [y, i]));

const indexOfByYear = (yearText, fallbackIndex) => {
  const idx = yearToIndex.get((yearText || '').trim());
  return (typeof idx === 'number') ? idx : fallbackIndex;
};
const indexOfGrid = (gridEl, fallback) => indexOfByYear(getText(gridEl, 'span'), fallback);
const indexOfEntry = (_entryEl, fallback) => fallback;

function setActive(index) {
  timelineItems.forEach((it, i) => it.classList.toggle('active', i === index));
  gridItems.forEach((it, i) => it.classList.toggle('is-active', i === index));
  entries.forEach((el, i) => el.classList.toggle('active', i === index));
}

// 타임라인 클릭
timelineItems.forEach((item, i) => {
  const activate = () => setActive(i);
  item.setAttribute('tabindex', '0');
  item.addEventListener('click', activate);
  item.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
  });
});

// 그리드 클릭
gridItems.forEach((item, i) => {
  const idx = indexOfGrid(item, i);
  item.addEventListener('click', () => setActive(idx));
});

// 엔트리 클릭
entries.forEach((entry, i) => {
  const idx = indexOfEntry(entry, i);
  entry.setAttribute('tabindex', '0');
  entry.style.cursor = 'pointer';
  entry.addEventListener('click', () => setActive(idx));
  entry.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(idx); }
  });
});

// 스크롤 진입 시 엔트리 자동 활성화
const ioEntries = new IntersectionObserver((list) => {
  const vis = list.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!vis) return;
  const idx = entries.indexOf(vis.target);
  if (idx > -1) setActive(idx);
}, { threshold: [0.25, 0.5, 0.75], rootMargin: '0px 0px -40% 0px' });

entries.forEach(el => ioEntries.observe(el));

// 타임라인 세로 라인 드로잉
if (timelineEl) {
  const ioLine = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      timelineEl.classList.add('play');
      ioLine.disconnect();
    }
  }, { threshold: 0.35 });
  ioLine.observe(timelineEl);
}

// 초기 활성화
let initial = timelineItems.findIndex(it => it.classList.contains('active'));
if (initial < 0) initial = 0;
setActive(initial);

// 보조 스타일 (CSS 이동 권장)
const style = document.createElement('style');
style.textContent = `
  .grid-item.is-active::after { background: rgba(129, 88, 37, 0.25); }
  .grid-item.is-active img { transform: scale(1.05); transition: transform .3s ease; }
  .entry { transition: background-color .2s ease, border-color .2s ease; }
  .entry.active { background:#f9f5ed; border-color:#f0e6d6; }
`;
document.head.appendChild(style);

/* =====================================================
  7. projectCard ScrollTrigger
===================================================== */
gsap.utils.toArray('.projectCard').forEach((card) => {
  ScrollTrigger.create({
    trigger: card,
    start: "top 80%",
    onEnter: () => card.classList.add('motion'),
    onEnterBack: () => card.classList.add('motion'),
    toggleActions: "play none none none"
  });
});

/* =====================================================
  8. PROJECT CARD 숫자 룰렛 (hover)
===================================================== */
$('.projectCard').hover(function () {
  const $card = $(this);
  $card.find('.num_b').each(function () {
    const $numEl = $(this);
    const originalText = $numEl.text().trim();
    const match = originalText.match(/^([\d\.]+)\s*(.*)$/);
    if (!match) return;

    const targetNumStr = match[1];
    const unit = match[2];
    const isDecimal = targetNumStr.includes('.');
    const decimalPlaces = isDecimal ? targetNumStr.split('.')[1].length : 0;
    const targetNum = parseFloat(targetNumStr);

    if ($numEl.data('animating')) return;
    $numEl.data('animating', true);

    let count = 0;
    const maxCount = 20;
    const delay = 30;

    const interval = setInterval(() => {
      count++;
      const randomValue = isDecimal
        ? (Math.random() * (targetNum * 2)).toFixed(decimalPlaces)
        : Math.floor(Math.random() * (targetNum * 2 + 10));
      $numEl.html(`${randomValue} ${unit}`);

      if (count >= maxCount) {
        clearInterval(interval);
        $numEl.html(`${targetNum} ${unit}`);
        $numEl.data('animating', false);
      }
    }, delay);
  });
}, function () {});

/* =====================================================
  9. numbers 섹션 숫자 룰렛 (스크롤 진입 시)
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const numbers = document.querySelectorAll(".num");
  const section = document.querySelector(".numbers");

  const animateNumbers = () => {
    numbers.forEach((num) => {
      const originalText = num.textContent.trim();
      const targetNum = parseInt(originalText, 10);
      if (num.dataset.animating === "true") return;
      num.dataset.animating = "true";

      let count = 0;
      const maxCount = 20;
      const delay = 30;

      const interval = setInterval(() => {
        count++;
        num.textContent = Math.floor(Math.random() * (targetNum * 2 + 10));
        if (count >= maxCount) {
          clearInterval(interval);
          num.textContent = targetNum;
          num.dataset.animating = "false";
        }
      }, delay);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) animateNumbers();
    });
  }, { threshold: 0.5 });

  observer.observe(section);
});


/* =========================================
   FAQ Accordion
   - 한 번에 하나만 열림
   - aria-expanded / aria-hidden 접근성 유지
   - height를 내용 높이에 맞춰 애니메이션
========================================= */
(() => {
  const wrap = document.getElementById('faqPanel');
  if (!wrap) return;

  const items = [...wrap.querySelectorAll('.faq_item')];
  const qs = items.map(i => i.querySelector('.faq_q'));
  const as = items.map(i => i.querySelector('.faq_a'));

  const closeAll = () => {
    qs.forEach(q => q.setAttribute('aria-expanded', 'false'));
    as.forEach(a => {
      a.classList.remove('is-open');
      a.style.height = '0px';
      a.setAttribute('aria-hidden', 'true');
    });
  };

  const openAt = (i) => {
    qs[i].setAttribute('aria-expanded', 'true');
    as[i].classList.add('is-open');
    as[i].setAttribute('aria-hidden', 'false');
    as[i].style.height = as[i].scrollHeight + 'px';
  };

  qs.forEach((q, i) => {
    q.addEventListener('click', () => {
      const isOpen = q.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        q.setAttribute('aria-expanded', 'false');
        as[i].classList.remove('is-open');
        as[i].style.height = '0px';
        as[i].setAttribute('aria-hidden', 'true');
        return;
      }
      closeAll();
      openAt(i);
    });
  });

  // 초기 상태: 모두 닫힘
  closeAll();

  // 리사이즈 시 열린 항목 높이 보정
  window.addEventListener('resize', () => {
    as.forEach((a, i) => {
      if (qs[i].getAttribute('aria-expanded') === 'true') {
        a.style.height = a.scrollHeight + 'px';
      }
    });
  });
})();