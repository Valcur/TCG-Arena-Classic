async function iniDeck(deckMode) {
    if (!game.isHost) return
    const deckList = deckLists[deckMode]
    console.log("DECK", deckList)
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
        1: { chienSize: 20, cardsPerPlayer: 26 },
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

async function claimRound() {
    if (!cards?.PlayedCards) return
    await functions.moveCards(cards?.PlayedCards, "Won")
    await functions.repositionCards()
}

async function becomeTaker() {
    if (!cards?.Chien) return
    game.data.Manager.isTakerPicked = true
    await functions.moveCards(cards?.Chien, "Hand")
    await functions.repositionCards()
}

async function newTurnTest() {
    const deck = await functions.getDeck()
    if (deck?.length <= 0) return
    const bottomCard = deck[0]
    functions.chatLog("revealed his bottom card: {{card}}", { card: bottomCard })
}

async function updateMyScore() {
    if (!cards?.Won) return
    let total = 0
    for (const card of cards?.Won) {
        const cardData = functions.getCardData(card)
        const value = parseInt(cardData.value, 10)

        if (cardData.special) {
            // Atouts : les 3 bouts (Excuse=0, Petit=1, Le Monde=21) valent 4.5, le reste 0.5
            total += (value === 0 || value === 1 || value === 21) ? 4.5 : 0.5
        } else {
            // Cartes de couleur
            switch (value) {
                case 14: total += 4.5; break // Roi
                case 13: total += 3.5; break // Dame
                case 12: total += 2.5; break // Cavalier
                case 11: total += 1.5; break // Valet
                default: total += 0.5        // As à 10
            }
        }
    }
    game.data.Manager.score = total
}

//---------------- BLACKJACK ---------------- //

async function dealBlackjack() {
    const deck = cards.CentralDeck
    const myPosition = game.turn.orderPosition
    const startOffset = myPosition * 2

    const myCards = []
    for (let i = 0; i < 2; i++) {
        const indexFromTop = deck.length - 1 - startOffset - i
        const card = deck[indexFromTop]
        if (!card) break
        myCards.push(card)
    }
    if (myCards.length > 0) {
        await functions.moveCards(myCards, "MyDraw", { skipStepHistory: true, noLogs: true })
    }

    if (game.isHost) {
        const offset = game.turn.totalPlayers * 2
        const dealerUp = deck[deck.length - 1 - offset]
        const dealerDown = deck[deck.length - 2 - offset]
        if (dealerUp) {
            await functions.moveCards([dealerUp], "Croupier", { skipStepHistory: true, noLogs: true })
        }
        if (dealerDown) {
            await functions.moveCards([dealerDown], "Croupier", { skipStepHistory: true, noLogs: true, faceDown: true })
        }
    }

    await functions.repositionCards()
}

async function updateMyHandValue() {
    const total = computeHandValue()
    game.data.Manager.total = total
    await functions.changeCounterValue(0, total)
    if (total > 21) {
        game.data.Manager.state = "BUST"
    }
}

function computeHandValue(hand) {
    const handCards = hand ?? cards?.MyDraw ?? []
    let total = 0
    let aces = 0
    for (const card of handCards) {
        const cardData = functions.getCardData(card)
        const rank = parseInt(cardData.value, 10)
        if (rank === 1) { aces++; total += 11 }
        else if (rank > 10) total += 10
        else total += rank
    }
    while (total > 21 && aces > 0) {
        total -= 10
        aces--
    }
    return total
}

async function stand() {
    if (game.data.Manager.state !== "PLAYING") return
    game.data.Manager.state = "STAND"
    await checkAllPlayersDone()
}

async function checkAllPlayersDone(oppGame) {
    const playerGame = oppGame || game
    if (!game.isHost) return

    if (playerGame.data.Manager.state !== "PLAYING") {
        game.data.Manager.playerDone[playerGame.playerId] = true
    }

    const allDone = Object.keys(game.data.Manager.playerDone).length >= game.turn.totalPlayers
    if (allDone) {
        await dealerPlay()
    }
}

async function dealerPlay() {
    if (!game.isHost) return

    const hiddenCard = cards.Croupier[1]
    if (hiddenCard) {
        await functions.hideCards([hiddenCard], "no")
    }

    let deck = [...cards.CentralDeck]
    let croupierCards = [...cards.Croupier]
    let total = computeHandValue(croupierCards)

    while (total < 17) {
        const card = deck[deck.length - 1]
        if (!card) break

        deck = deck.slice(0, -1)
        croupierCards = [...croupierCards, card]

        await functions.moveCards([card], "Croupier", { skipStepHistory: true })
        await functions.repositionCards()

        total = computeHandValue(croupierCards)
        functions.chatLog("croupier: " + total + " (deck restant: " + deck.length + ")")
    }

    await resolveRound()
}

async function resolveRound() {
    const dealerTotal = computeHandValue(cards.Croupier)
    const myTotal = computeHandValue(cards.Hand)

    if (game.data.Manager.state === "BUST") {
        functions.chatLog("a perdu (bust).")
    } else if (dealerTotal > 21 || myTotal > dealerTotal) {
        functions.chatLog("a gagné !")
    } else if (myTotal < dealerTotal) {
        functions.chatLog("a perdu.")
    } else {
        functions.chatLog("égalité (push).")
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