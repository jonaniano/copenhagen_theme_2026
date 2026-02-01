// Share

window.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll(".share a");
  links.forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      event.preventDefault();
      // Security: Validate URL protocol to prevent javascript: protocol attacks
      try {
        const url = new URL(anchor.href, window.location.origin);
        if (url.protocol === "https:" || url.protocol === "http:") {
          window.open(anchor.href, "", "height = 500, width = 500");
        }
      } catch {
        // Invalid URL, ignore
      }
    });
  });
});
