// components/image-carousel.js

export function initImageCarousel(targetSelector) {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  // Inject section HTML
  target.innerHTML = `
    <div class="space-y-4">
      <div>
        <label class="block text-gray-300 mb-2">Event Category & Image</label>
        <select id="categorySelect" required
          class="input-dark w-full bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:ring-blue-500">
          <option value="">Select category</option>
          <option value="music">Music</option>
          <option value="comedy">Comedy</option>
          <option value="theatre">Theatre</option>
          <option value="sports">Sports</option>
          <option value="festival">Festival</option>
          <option value="quiz">Quiz Night</option>
        </select>
      </div>

      <!-- Placeholder Image -->
      <div id="placeholderImageWrapper">
        <img
          src="https://raw.githubusercontent.com/colinjohnjervis/spondle/main/images/file_000000002f686243b31639a2bca68eca.png"
          alt="Spondle placeholder"
          class="w-full h-96 object-cover rounded-lg"
        />
      </div>

      <!-- Carousel (auto from category) -->
      <div id="carouselWrapper" class="hidden"></div>
    </div>
  `;

  // Inject hidden input
  const imageUrlInput = document.createElement("input");
  imageUrlInput.type = "hidden";
  imageUrlInput.name = "image_url";
  target.appendChild(imageUrlInput);

  /* ----------------------------
     STOCK IMAGES BY CATEGORY
  ----------------------------- */
  const stockImages = {
    music: [
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    ],
    comedy: [
      "https://raw.githubusercontent.com/colinjohnjervis/spondle/main/images/voles.png",
      "https://raw.githubusercontent.com/colinjohnjervis/spondle/main/images/Screenshot_20251016-112458.png",
    ],
    theatre: [
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505666287802-931dc83948e0?auto=format&fit=crop&w=1200&q=80",
    ],
    sports: [
      "https://images.unsplash.com/photo-1505842465776-3acb9e92c0f0?auto=format&fit=crop&w=1200&q=80",
    ],
    festival: [
      "https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=1200&q=80",
    ],
    quiz: [
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    ],
  };

  /* ----------------------------
     BUILD CAROUSEL
  ----------------------------- */
  const categorySelect = target.querySelector("#categorySelect");
  const placeholderImageWrapper = target.querySelector("#placeholderImageWrapper");
  const carouselWrapper = target.querySelector("#carouselWrapper");

  function buildCarousel(images = []) {
    carouselWrapper.innerHTML = "";
    if (!images.length) return;

    const container = document.createElement("div");
    container.className = "relative mt-3";

    const track = document.createElement("div");
    track.className =
      "flex overflow-x-auto no-scrollbar gap-2 snap-x snap-mandatory scroll-smooth";
    container.appendChild(track);

    images.forEach((url, index) => {
      const wrap = document.createElement("div");
      wrap.className = "img-wrapper w-full h-96 shrink-0 snap-center border-4 border-transparent rounded-lg transition-all duration-200";
      const img = document.createElement("img");
      img.src = url;
      img.className = "w-full h-full object-cover cursor-pointer rounded-lg";
      img.addEventListener("click", () => {
        track.querySelectorAll(".img-wrapper").forEach((w) => w.classList.remove("selected"));
        wrap.classList.add("selected");
        imageUrlInput.value = url;
      });
      wrap.appendChild(img);
      track.appendChild(wrap);

      // Auto-select first image
      if (index === 0) {
        wrap.classList.add("selected");
        imageUrlInput.value = url;
      }
    });

    carouselWrapper.appendChild(container);
  }

  categorySelect.addEventListener("change", () => {
    const cat = categorySelect.value;
    if (stockImages[cat]) {
      placeholderImageWrapper.classList.add("hidden");
      carouselWrapper.classList.remove("hidden");
      buildCarousel(stockImages[cat]);
    } else {
      carouselWrapper.classList.add("hidden");
      placeholderImageWrapper.classList.remove("hidden");
    }
  });

  /* ----------------------------
     STYLES
  ----------------------------- */
  const style = document.createElement("style");
  style.textContent = `
    .img-wrapper.selected {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.4);
    }

    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `;
  document.head.appendChild(style);
}
