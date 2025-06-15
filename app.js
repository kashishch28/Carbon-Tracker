document.addEventListener("DOMContentLoaded", function () {
  const productSelect = document.getElementById("product-select");
  const productInfo = document.getElementById("product-info");
  const productName = document.getElementById("product-name");
  const carbonValue = document.getElementById("carbon-value");
  const waterValue = document.getElementById("water-value");
  const wasteValue = document.getElementById("waste-value");
  const carbonBar = document.getElementById("carbon-bar");
  const waterBar = document.getElementById("water-bar");
  const wasteBar = document.getElementById("waste-bar");
  const alternativesList = document.getElementById("alternatives-list");

  let products = [];

  Papa.parse("products_dataset.csv", {
    download: true,
    header: true,
    complete: function (results) {
      products = results.data
        .filter(p =>
          p.name &&
          !isNaN(parseFloat(p.carbon)) &&
          !isNaN(parseFloat(p.water)) &&
          !isNaN(parseFloat(p.waste)) &&
          p.alternatives
        )
        .map(p => ({
          name: p.name.trim(),
          carbon: parseFloat(p.carbon),
          water: parseFloat(p.water),
          waste: parseFloat(p.waste),
          alternatives: p.alternatives.split(";").map(a => a.trim())
        }));

      if (products.length === 0) {
        alert("No valid products found in CSV.");
        return;
      }

      populateDropdown();
    },
    error: function (err) {
      console.error("CSV Load Error:", err);
      alert("Failed to load products from CSV.");
    }
  });

  function populateDropdown() {
    products.forEach((product, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = product.name;
      productSelect.appendChild(option);
    });
  }

  productSelect.addEventListener("change", function () {
    const selectedIndex = this.value;
    if (selectedIndex === "") {
      productInfo.classList.add("hidden");
      return;
    }

    const selectedProduct = products[selectedIndex];
    productInfo.classList.remove("hidden");

    productName.textContent = selectedProduct.name;
    carbonValue.textContent = `${selectedProduct.carbon} kg CO₂`;
    waterValue.textContent = `${selectedProduct.water} L`;
    wasteValue.textContent = `${selectedProduct.waste} g`;

    carbonBar.style.width = `${(selectedProduct.carbon / 100) * 100}%`;
    waterBar.style.width = `${(selectedProduct.water / 4000) * 100}%`;
    wasteBar.style.width = `${(selectedProduct.waste / 1000) * 100}%`;

    alternativesList.innerHTML = "";
    selectedProduct.alternatives.forEach((alt) => {
      const li = document.createElement("li");
      li.classList.add("alternative-item");
      li.innerHTML = `
        <span class="alt-name">${alt}</span>
        <button class="alt-select-btn">Choose</button>
      `;
      alternativesList.appendChild(li);
    });
  });

  // Chat logic
  const chatInput = document.getElementById("chat-input");
  const chatMessages = document.getElementById("chat-messages");
  const sendButton = document.getElementById("send-button");

  function addChatMessage(message, isUser = true) {
    const msg = document.createElement("div");
    msg.className = isUser ? "user-msg" : "bot-msg";
    msg.textContent = message;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function chatbotReply(userMessage) {
    const msg = userMessage.toLowerCase();
    if (msg.includes("carbon")) {
      return "Carbon footprint is the CO₂ released in the lifecycle of a product.";
    } else if (msg.includes("alternative")) {
      return "Try switching to reusable or recycled options 🌿.";
    } else {
      return "I can help with sustainability info. Ask about 'carbon', 'water', or 'waste'.";
    }
  }

  sendButton.addEventListener("click", () => {
    const userMsg = chatInput.value.trim();
    if (userMsg === "") return;
    addChatMessage(userMsg, true);
    const reply = chatbotReply(userMsg);
    setTimeout(() => addChatMessage(reply, false), 500);
    chatInput.value = "";
  });

  chatInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") sendButton.click();
  });
});
