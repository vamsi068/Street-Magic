document.addEventListener("DOMContentLoaded", function () {
    // Function to highlight the active link in the navigation bar
    const arrangeAboutSection = () => {
        const aboutSection = document.querySelector(".about-section");
        if (aboutSection) {
          aboutSection.style.display = "flex";
          aboutSection.style.alignItems = "center";
          aboutSection.style.justifyContent = "space-between";
          
        }
      };
    
      arrangeAboutSection();
    });
  
    // Function to add smooth scrolling to anchor links
    const enableSmoothScrolling = () => {
      const anchorLinks = document.querySelectorAll('a[href^="#"]');
      anchorLinks.forEach(link => {
        link.addEventListener("click", function (e) {
          e.preventDefault();
          const targetId = this.getAttribute("href").substring(1);
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            if ("scrollBehavior" in document.documentElement.style) {
              targetElement.scrollIntoView({ behavior: "smooth" });
            } else {
              // Fallback for older browsers
              targetElement.scrollIntoView();
            }
          }
        });
      });
    };
  