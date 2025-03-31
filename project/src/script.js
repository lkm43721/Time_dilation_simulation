// 지구와 GPS 위성 시뮬레이션을 위한 기본적인 상호작용

document.addEventListener("DOMContentLoaded", () => {
    // 탭 전환 기능
    const tabButtons = document.querySelectorAll(".tab-button")
    const tabContents = document.querySelectorAll(".tab-content")
  
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // 모든 버튼에서 활성 클래스 제거
        tabButtons.forEach((btn) => btn.classList.remove("active"))
  
        // 클릭된 버튼에 활성 클래스 추가
        button.classList.add("active")

        // 모든 탭 콘텐츠 숨기기
        tabContents.forEach((content) => content.classList.add("hidden"))
  
        // 선택된 탭 콘텐츠 표시
        const tabId = button.getAttribute("data-tab")
        document.getElementById(`${tabId}-content`).classList.remove("hidden")
      })
    })
  
    // 재생/일시정지 버튼 토글 (three.js에서 주요 로직 처리)
    const playButton = document.querySelector(".play-button")
    
    // 정보 카드에 호버 효과 추가
    const infoCards = document.querySelectorAll(".info-card")
  
    infoCards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        card.style.boxShadow = "var(--shadow-lg)"
      })
  
      card.addEventListener("mouseleave", () => {
        card.style.boxShadow = "var(--shadow-md)"
      })
    })
})