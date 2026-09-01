async function iniDeck(deckMode) {
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

    if (!rules) return; // le tarot classique se joue à 3, 4 ou 5

    const { chienSize, cardsPerPlayer } = rules;
    const deck = cards.CentralDeck ?? [];
    const myPosition = game.turn.orderPosition;
    const startOffset = myPosition * cardsPerPlayer;

    for (let i = 0; i < cardsPerPlayer; i++) {
        const indexFromTop = deck.length - 1 - startOffset - i;
        if (indexFromTop < chienSize) break; // zone réservée au chien
        const card = deck[indexFromTop];
        if (!card) break;
        await functions.moveCard(card, "Hand", { skipStepHistory: true });
    }

    if (game.isHost) {
        for (let i = 0; i < chienSize; i++) {
            const card = deck[i];
            if (!card) break;
            await functions.moveCard(card, "Chien", { skipStepHistory: true });
        }
    }

    await functions.repositionCards();
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