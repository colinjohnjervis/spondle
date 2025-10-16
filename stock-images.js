// stock-images.js
// Simple stock image picker + carousel for create-event.html

// Stock images grouped by category
const stockImages = {
  music: [
    "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=1200&q=80"
  ],
  comedy: [
    // Locally hosted image (Voles)
    "https://raw.githubusercontent.com/colinjohnjervis/spondle/main/images/Screenshot_20251016-105803.png",
    // Existing Unsplash fallbacks
    "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&q=80"
  ],
  theatre: [
    "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80"
  ],
  sports: [
    "https://images.unsplash.com/photo-1505842465776-3acb9e92c0f0?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=1200&q=80"
  ],
  festival: [
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1464375117522-1311d6a5b81b?auto=format&fit=crop&w=1200&q=80"
  ]
};

// Called from create-event.html
export function initStockImagePicker() {
  const select = document.getElementById("stockImageSelect");
  const input = document.getElementById("imageUrlInput");

  // Create carousel container
  const carousel = document.createElement("div");
  carousel.id = "stockImageCarousel";
  carousel.className = "flex gap-2 overflow-x-auto mt-2 pb-2";
  select.parentElement.appendChild(carousel);

  // When category changes
  select.addEventListener("change", () => {
    const category = select.value;
    carousel.innerHTML = "";

    if (stockImages[category]) {
      stockImages[category].forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = category;
        img.className =
          "h-24 w-36 object-cover rounded cursor-pointer hover:opacity-80 border border-gray-600";
        img.addEventListener("click", () => {
          input.value = url;
          highlightSelected(img);
        });
        carousel.appendChild(img);
      });
    }
  });

  // Highlight selected image
  function highlightSelected(selectedImg) {
    carousel.querySelectorAll("img").forEach(img => {
      img.classList.remove("ring-4", "ring-green-500");
    });
    selectedImg.classList.add("ring-4", "ring-green-500");
  }
}
