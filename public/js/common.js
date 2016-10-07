$(function(){

	//모바일 메뉴 열기
	var speed=800;
	var navPos;
	var gnbPos;
	$("#moGnb").click(function(){
		navPos=$("header nav").css("top");
		gnbPos=$("#gnb").css("margin-right");
		$("header nav").css("top",0);
		$("#gnb").stop().animate({marginRight:0},speed);
	});

	//모바일 메뉴 닫기
	$("#moGnbClose").click(function(){
		$("#gnb").stop().animate({marginRight:gnbPos},speed,function(){
			$("header nav").css("top",navPos);
		});
	});

	//모바일 슬라이드 메뉴
	var oneDepthA=$("#gnb > li > a");
	var index;
	var visibleIndex;
	oneDepthA.click(function(){
		index=$(this).parent("li").index();
		visibleIndex=$("#gnb > li > ul:visible").parent("li").index();
		if(index != visibleIndex){
			$("#gnb > li > ul:visible").slideUp();
			$(this).next().slideDown();
		}else{
			$("#gnb > li > ul:visible").slideUp();
		}
	});

});