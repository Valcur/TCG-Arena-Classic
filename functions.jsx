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
    game.data.Manager.deckOrder = cards.CentralDeck.map(c => c.id)
    const rules = {
        1: { chienSize: 20, cardsPerPlayer: 58 },
        2: { chienSize: 20, cardsPerPlayer: 29 },
        3: { chienSize: 6, cardsPerPlayer: 24 },
        4: { chienSize: 6, cardsPerPlayer: 18 },
        5: { chienSize: 3, cardsPerPlayer: 15 },
    }[game.turn.totalPlayers];

    if (!rules) return;

    const { chienSize, cardsPerPlayer } = rules;
    const deckOrder = game.data.GameplayManager.deckOrder; // référence stable
    const myPosition = game.turn.orderPosition;
    const startOffset = myPosition * cardsPerPlayer;

    for (let i = 0; i < cardsPerPlayer; i++) {
        const indexFromTop = deckOrder.length - 1 - startOffset - i;
        if (indexFromTop < chienSize) break;
        const cardId = deckOrder[indexFromTop];
        const card = cards.CentralDeck.find(c => c.id === cardId);
        if (!card) break; // déjà pris par erreur ou pas encore synchronisé
        await functions.moveCard(card, "Hand", { skipStepHistory: true, noLogs: true });
    }

    if (game.isHost) {
        for (let i = 0; i < chienSize; i++) {
            const cardId = deckOrder[i];
            const card = cards.CentralDeck.find(c => c.id === cardId);
            if (!card) break;
            await functions.moveCard(card, "Chien", { skipStepHistory: true, noLogs: true });
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