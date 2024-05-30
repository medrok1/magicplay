document.addEventListener("DOMContentLoaded", () => {
    const uploadDeckInput = document.getElementById("upload-deck");
    const drawCardButton = document.getElementById("draw-card");
    const deckElement = document.getElementById("deck");
    const handElement = document.getElementById("hand");
    const playingField = document.getElementById("playing-field");

    let deck = [];
    let hand = [];
    let draggedCard = null;

    async function loadDeck(event) {
        hand = [];
        handElement.innerHTML = "";
        playingField.innerHTML = "";
        
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const deckList = JSON.parse(e.target.result);
                deck = await fetchCardDetails(deckList);
                shuffleDeck();
                drawInitialHand();
            };
            reader.readAsText(file);
        }
    }

    async function fetchCardDetails(deckList) {
        const cardPromises = deckList.map(card => 
            fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(card.name)}`)
            .then(response => response.json())
        );
        return Promise.all(cardPromises);
    }

    function shuffleDeck() {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    function drawInitialHand() {
        for (let i = 0; i < 7; i++) {
            drawCard();
        }
    }

    function drawCard() {
        if (deck.length > 0) {
            const card = deck.pop();
            hand.push(card);
            addCardToHand(card);
        } else {
            alert("Deck is empty!");
        }
    }

    function addCardToHand(card) {
        const cardElement = document.createElement("div");
        cardElement.className = "card";
        cardElement.innerHTML = `<img src="${card.image_uris.small}" alt="${card.name}">`;
        cardElement.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            cardElement.classList.toggle("flipped");
        });
        cardElement.addEventListener("mousedown", (e) => {
            if (e.button === 2) return; // Ignore right click for dragging
            draggedCard = cardElement;
        });
        cardElement.addEventListener("dblclick", () => {
            if (cardElement.style.transform === "rotate(90deg)") {
                cardElement.style.transform = "rotate(0deg)";
            } else {
                cardElement.style.transform = "rotate(90deg)";
            }
        });
        handElement.appendChild(cardElement);
    }

    function handleDragOver(e) {
        e.preventDefault();
    }

    function handleDrop(e) {
        e.preventDefault();
        if (draggedCard) {
            const rect = playingField.getBoundingClientRect();
            draggedCard.style.position = "absolute";
            draggedCard.style.left = `${e.clientX - rect.left - 75}px`; // Adjust for card width
            draggedCard.style.top = `${e.clientY - rect.top - 105}px`; // Adjust for card height
            playingField.appendChild(draggedCard);
            draggedCard = null;
        }
    }

    uploadDeckInput.addEventListener("change", loadDeck);
    drawCardButton.addEventListener("click", drawCard);
    deckElement.addEventListener("click", drawCard);
    playingField.addEventListener("dragover", handleDragOver);
    playingField.addEventListener("drop", handleDrop);
});
