document.addEventListener("DOMContentLoaded", () => {
    const uploadDeckInput = document.getElementById("upload-deck");
    const drawCardButton = document.getElementById("draw-card");
    const deckElement = document.getElementById("deck");
    const handElement = document.getElementById("hand");

    let deck = [];
    let hand = [];

    async function loadDeck(event) {
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
        if (deck.length > 0 && hand.length < 7) {
            const card = deck.pop();
            hand.push(card);
            addCardToHand(card);
        } else if (deck.length === 0) {
            alert("Deck is empty!");
        } else {
            alert("Hand is full!");
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
            cardElement.draggable = true;
            cardElement.addEventListener("dragstart", (e) => {
                e.dataTransfer.setData("text/plain", null); // Required for Firefox
            });
        });
        cardElement.addEventListener("dragend", (e) => {
            cardElement.style.position = "absolute";
            cardElement.style.left = `${e.pageX - 75}px`; // Center the card at the cursor
            cardElement.style.top = `${e.pageY - 105}px`;
        });
        handElement.appendChild(cardElement);
    }

    uploadDeckInput.addEventListener("change", loadDeck);
    drawCardButton.addEventListener("click", drawCard);
    deckElement.addEventListener("click", drawCard);
});
