const findBtn = document.getElementById("find-btn");
const ingredientInput = document.getElementById("ingredient-input");
const recipeList = document.getElementById("recipe-list");

// Helper: safely create text element
function createSafeElement(tag, text) {
    const el = document.createElement(tag);
    el.textContent = text;
    return el;
}

// Clear and show message
function showMessage(msg) {
    recipeList.innerHTML = "";
    recipeList.appendChild(createSafeElement("p", msg));
}

findBtn.addEventListener("click", async () => {
    const input = ingredientInput.value.trim().toLowerCase();
    if (!input) {
        showMessage("Please enter ingredient(s).");
        return;
    }

    const ingredients = input.split(",").map(i => i.trim()).filter(Boolean);
    if (ingredients.length === 0) {
        showMessage("Please enter valid ingredient(s).");
        return;
    }

    showMessage("Loading recipes…");

    try {
        const url = `https://your-backend-on-render.onrender.com/api/recipes?ingredients=${encodeURIComponent(ingredients.join(','))}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch recipes");
        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
            showMessage(`No recipes found containing: ${ingredients.join(", ")}`);
            return;
        }

        recipeList.innerHTML = "";

        data.forEach(recipe => {
            const card = document.createElement("div");
            card.classList.add("recipe-card");

            // Title safely
            const title = createSafeElement("h3", recipe.title || "Untitled Recipe");
            card.appendChild(title);

            // Image safely
            if (recipe.image) {
                const img = document.createElement("img");
                img.src = recipe.image;
                img.alt = recipe.title || "Recipe Image";
                card.appendChild(img);
            }

            // Used ingredients
            const used = createSafeElement("p", `Used: ${recipe.usedIngredients.map(i => i.name).join(", ")}`);
            card.appendChild(used);

            // Missing ingredients
            const missing = createSafeElement("p", `Missing: ${recipe.missedIngredients.map(i => i.name).join(", ")}`);
            missing.classList.add("missing");
            card.appendChild(missing);

            // Prepare button
            const prepareBtn = document.createElement("a");
            prepareBtn.classList.add("prepare-btn");
            prepareBtn.textContent = "Prepare";
            prepareBtn.href = `recipe.html?id=${encodeURIComponent(recipe.id)}`;
            card.appendChild(prepareBtn);

            recipeList.appendChild(card);
        });

        imagesLoaded(recipeList, function () {
            new Masonry(recipeList, {
                itemSelector: '.recipe-card',
                gutter: 20,
                fitWidth: true,
                horizontalOrder: true
            });
        });

    } catch (err) {
        showMessage("Error fetching recipes. Please try again later.");
        console.error(err);
    }
});
