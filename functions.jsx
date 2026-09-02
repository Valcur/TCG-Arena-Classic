async function iniDeck(deckMode) {
    if (!game.isHost) return
    const deckList = deckLists[deckMode]
    if (!deckList) return
    const deck = []
    for (const cardId of deckList) {
        deck.push(await functions.createCard(cardId, "CentralDeck"))
    }
    await functions.shuffleSection("CentralDeck")
    await functions.repositionCards()
}

async function dealTarotWithChien() {
    const rules = {
        1: { chienSize: 20, cardsPerPlayer: 58 },
        2: { chienSize: 20, cardsPerPlayer: 29 },
        3: { chienSize: 6, cardsPerPlayer: 24 },
        4: { chienSize: 6, cardsPerPlayer: 18 },
        5: { chienSize: 3, cardsPerPlayer: 15 },
    }[game.turn.totalPlayers];

    if (!rules) return;

    const { chienSize, cardsPerPlayer } = rules;
    const deck = cards.CentralDeck;
    const myPosition = game.turn.orderPosition;
    const startOffset = myPosition * cardsPerPlayer;

    const handCards = [];
    for (let i = 0; i < cardsPerPlayer; i++) {
        const indexFromTop = deck.length - 1 - startOffset - i;
        if (indexFromTop < chienSize) break;
        const card = deck[indexFromTop];
        if (!card) break;
        handCards.push(card);
    }
    if (handCards.length > 0) {
        await functions.moveCards(handCards, "Hand", { skipStepHistory: true, noLogs: true });
    }

    if (game.isHost) {
        const chienCards = [];
        for (let i = 0; i < chienSize; i++) {
            const card = deck[i];
            if (!card) break;
            chienCards.push(card);
        }
        if (chienCards.length > 0) {
            await functions.moveCards(chienCards, "Chien", { skipStepHistory: true, noLogs: true });
        }
    }

    await functions.repositionCards();
}

async function removeCardProperty() {
    for (const card of transitionCards) {
        functions.giveCardTo(card)
    }
}

const deckLists = {
    "tarotDeck": [
        "THEFOOL",
        "THEMAGICIAN",
        "THEHIGHPRIESTESS",
        "THEEMPRESS",
        "THEEMPEROR",
        "THEHIEROPHANT",
        "THELOVERS",
        "THECHARIOT",
        "STRENGTH",
        "THEHERMIT",
        "WHEELOFFORTUNE",
        "JUSTICE",
        "THEHANGEDMAN",
        "DEATH",
        "TEMPERANCE",
        "THEDEVIL",
        "THETOWER",
        "THESTAR",
        "THEMOON",
        "THESUN",
        "JUDGEMENT",
        "THEWORLD",
        "ACEOFCUPS",
        "TWOOFCUPS",
        "THREEOFCUPS",
        "FOUROFCUPS",
        "FIVEOFCUPS",
        "SIXOFCUPS",
        "SEVENOFCUPS",
        "EIGHTOFCUPS",
        "NINEOFCUPS",
        "TENOFCUPS",
        "PAGEOFCUPS",
        "KNIGHTOFCUPS",
        "QUEENOFCUPS",
        "KINGOFCUPS",
        "ACEOFPENTACLES",
        "TWOOFPENTACLES",
        "THREEOFPENTACLES",
        "FOUROFPENTACLES",
        "FIVEOFPENTACLES",
        "SIXOFPENTACLES",
        "SEVENOFPENTACLES",
        "EIGHTOFPENTACLES",
        "NINEOFPENTACLES",
        "TENOFPENTACLES",
        "PAGEOFPENTACLES",
        "KNIGHTOFPENTACLES",
        "QUEENOFPENTACLES",
        "KINGOFPENTACLES",
        "ACEOFSWORDS",
        "TWOOFSWORDS",
        "THREEOFSWORDS",
        "FOUROFSWORDS",
        "FIVEOFSWORDS",
        "SIXOFSWORDS",
        "SEVENOFSWORDS",
        "EIGHTOFSWORDS",
        "NINEOFSWORDS",
        "TENOFSWORDS",
        "PAGEOFSWORDS",
        "KNIGHTOFSWORDS",
        "QUEENOFSWORDS",
        "KINGOFSWORDS",
        "ACEOFWANDS",
        "TWOOFWANDS",
        "THREEOFWANDS",
        "FOUROFWANDS",
        "FIVEOFWANDS",
        "SIXOFWANDS",
        "SEVENOFWANDS",
        "EIGHTOFWANDS",
        "NINEOFWANDS",
        "TENOFWANDS",
        "PAGEOFWANDS",
        "KNIGHTOFWANDS",
        "QUEENOFWANDS",
        "KINGOFWANDS"
    ],
    "classicDeck": [
        "ACEOFCUPS",
        "TWOOFCUPS",
        "THREEOFCUPS",
        "FOUROFCUPS",
        "FIVEOFCUPS",
        "SIXOFCUPS",
        "SEVENOFCUPS",
        "EIGHTOFCUPS",
        "NINEOFCUPS",
        "TENOFCUPS",
        "PAGEOFCUPS",
        "QUEENOFCUPS",
        "KINGOFCUPS",
        "ACEOFPENTACLES",
        "TWOOFPENTACLES",
        "THREEOFPENTACLES",
        "FOUROFPENTACLES",
        "FIVEOFPENTACLES",
        "SIXOFPENTACLES",
        "SEVENOFPENTACLES",
        "EIGHTOFPENTACLES",
        "NINEOFPENTACLES",
        "TENOFPENTACLES",
        "PAGEOFPENTACLES",
        "QUEENOFPENTACLES",
        "KINGOFPENTACLES",
        "ACEOFSWORDS",
        "TWOOFSWORDS",
        "THREEOFSWORDS",
        "FOUROFSWORDS",
        "FIVEOFSWORDS",
        "SIXOFSWORDS",
        "SEVENOFSWORDS",
        "EIGHTOFSWORDS",
        "NINEOFSWORDS",
        "TENOFSWORDS",
        "PAGEOFSWORDS",
        "QUEENOFSWORDS",
        "KINGOFSWORDS",
        "ACEOFWANDS",
        "TWOOFWANDS",
        "THREEOFWANDS",
        "FOUROFWANDS",
        "FIVEOFWANDS",
        "SIXOFWANDS",
        "SEVENOFWANDS",
        "EIGHTOFWANDS",
        "NINEOFWANDS",
        "TENOFWANDS",
        "PAGEOFWANDS",
        "QUEENOFWANDS",
        "KINGOFWANDS"
    ]
}