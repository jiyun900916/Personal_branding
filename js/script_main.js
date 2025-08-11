'use strict';

// 1. gnb 마우스 오버, 포커스 시 밑줄
$(function() {
	$('.gnb li a').on('mouseenter focus', function() {
        var bar = $(this).position().left; // 각각 gnb li a 의 position left값을 bar 변수에 저장
        var width = $(this).width(); // 각각 gnb li a 의 width값을 width 변수에 저장
        $('span.bar').css({'left': bar + 'px', 'width': width + 'px', 'opacity': 1}); // span.bar 의 css를 각각의 변수값으로 변경하고 opacity 변경
    });
    $('.gnb li a').on('mouseleave', function() {
        $('span.bar').css({'left': 0, 'width': 0, 'opacity': 0}); // 원래대로 숨겨줌
    });
});



//2. 스크롤 애니메이션
$(function() {
	$('.animate').scrolla({
		mobile: true, //모바일버전시 활성화
		once: true //스크롤시 딱 한번만 하고싶을땐 true
	});    
}); 

//3. 배경색 변경
$(window).on('scroll resize', function() { // 스크롤시 , 윈도우 창크기 변경시 
    var scrollTop = 0;
    scrollTop = $(document).scrollTop();
    bgColor();
    function bgColor() {
        if (scrollTop > 1400) { 
            $('body').addClass('on');
        }else {
            $('body').removeClass('on');
        }
        if (scrollTop > 2700) { 
            $('body').removeClass('on');
        }
    }
});

//4. 햄버거 메뉴
$(function() {
	$('.menuOpen button.open').on('click', function() {
        $('.menuOpen .menuWrap').addClass('on');
    });
    $('.menuOpen .menuWrap .close').on('click', function() {
        $('.menuOpen .menuWrap').removeClass('on');
    });
});