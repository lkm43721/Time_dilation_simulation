document.addEventListener("DOMContentLoaded", () => {
  // 탭 전환 기능
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      console.log("Tab button clicked:", button.getAttribute("data-tab")); // 디버깅 로그 추가
      // 모든 버튼에서 활성 클래스 제거
      tabButtons.forEach((btn) => btn.classList.remove("active"));

      // 클릭된 버튼에 활성 클래스 추가
      button.classList.add("active");

      // 모든 탭 콘텐츠 숨기기
      tabContents.forEach((content) => content.classList.add("hidden"));

      // 선택된 탭 콘텐츠 표시
      const tabId = button.getAttribute("data-tab");
      console.log("Showing tab content:", tabId); // 디버깅 로그 추가
      const targetContent = document.getElementById(`${tabId}-content`);
      if (targetContent) {
        targetContent.classList.remove("hidden");
      } else {
        console.error(`Tab content with ID ${tabId}-content not found`);
      }
    });
  });
  
  // 정보 카드에 호버 효과 추가
  const infoCards = document.querySelectorAll(".info-card");

  infoCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.boxShadow = "var(--shadow-lg)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.boxShadow = "var(--shadow-md)";
    });
  });
});