// server/caseGenerator.js

export const THEMES = {
  hotel: {
    id: "hotel",
    title: "The Verrant Hotel Painting Theft",
    description: "A priceless masterpiece has vanished from the Verrant Hotel penthouse suite.",
    who: ["Chef", "Artist", "Heiress", "Bellhop", "Detective"],
    where: ["Penthouse", "Lobby", "Kitchen", "Library", "Wine Cellar"],
    when: ["10:00 PM", "11:30 PM", "1:00 AM", "2:15 AM", "3:45 AM"],
    how: ["Keycard clone", "Balcony ladder", "Hidden compartment", "Bribed guard", "Secret tunnel"],
    why: ["Insurance fraud", "Artistic obsession", "Blackmail cover-up", "Greed", "Long-held grudge"],
    evidence: [
      {
        text: "A cloned keycard was found dropped near the service elevator.",
        corruptionMap: {
          "Detail Drift": "A cloned keycard was found dropped near the guest elevator.",
          "Source Confusion": "A Master keycard was found dropped near the service elevator.",
          "Fabrication": "A matching gold cufflink was found near the service elevator."
        }
      },
      {
        text: "Muddy footprints lead from the lobby directly to the library.",
        corruptionMap: {
          "Detail Drift": "Wet footprints lead from the lobby directly to the library.",
          "Source Confusion": "Muddy footprints lead from the kitchen directly to the library.",
          "Fabrication": "A torn velvet glove was found on the library table."
        }
      },
      {
        text: "A security camera log showed a 10-minute gap during the incident.",
        corruptionMap: {
          "Detail Drift": "A security camera log showed a 5-minute gap during the incident.",
          "Source Confusion": "A guest login register showed a 10-minute gap during the incident.",
          "Fabrication": "The security camera lens was covered in black spray paint."
        }
      }
    ]
  },
  museum: {
    id: "museum",
    title: "The Royal Museum Diamond Heist",
    description: "The legendary Hope Star Diamond was swapped with a glass replica at the Royal Museum.",
    who: ["Curator", "Janitor", "Security Chief", "Jewel Thief", "Politician"],
    where: ["Gem Hall", "Vault", "Security Room", "Gift Shop", "Roof Guardhouse"],
    when: ["9:00 PM", "11:00 PM", "12:30 AM", "2:00 AM", "4:15 AM"],
    how: ["Laser cutter", "Security feed loop", "EMP device", "Air duct entry", "Inside job code"],
    why: ["Debt settlement", "Political blackmail", "Ideological protest", "Underworld contract", "Replica swap"],
    evidence: [
      {
        text: "A precision glass laser cutter was abandoned in the gift shop.",
        corruptionMap: {
          "Detail Drift": "A industrial glass cutter was abandoned in the gift shop.",
          "Source Confusion": "A precision glass laser cutter was abandoned in the Gem Hall.",
          "Fabrication": "A thermal imaging scope was abandoned in the gift shop."
        }
      },
      {
        text: "An EMP residue was detected near the high-voltage breaker board.",
        corruptionMap: {
          "Detail Drift": "A power surge residue was detected near the high-voltage breaker board.",
          "Source Confusion": "An EMP residue was detected near the security desk terminal.",
          "Fabrication": "A cut copper wire was found hanging from the breaker board."
        }
      },
      {
        text: "Janitor logs registered access to the air vent grate at midnight.",
        corruptionMap: {
          "Detail Drift": "Janitor logs registered access to the air vent grate at 1:00 AM.",
          "Source Confusion": "Curator logs registered access to the air vent grate at midnight.",
          "Fabrication": "An air vent grate screws were found unscrewed on the floor."
        }
      }
    ]
  },
  deepsea: {
    id: "deepsea",
    title: "The Deepsea Station Biotech Leak",
    description: "A hazardous bio-agent was leaked, contaminating the station's main hydroponics deck.",
    who: ["Biologist", "Captain", "Engineer", "Corporate Spy", "AI Specialist"],
    where: ["Hydroponics", "Lab A", "Command Deck", "Docking Bay", "Pressure Lock"],
    when: ["8:00 PM", "10:15 PM", "12:00 AM", "1:30 AM", "3:00 AM"],
    how: ["Air vent release", "Syringe swap", "USB data copy", "Contaminated valve", "Robot override"],
    why: ["Corporate espionage", "Weapon containment", "Whistleblowing", "Station sabotage", "Research rivalry"],
    evidence: [
      {
        text: "A discarded syringe was found floating in the Hydroponics tank.",
        corruptionMap: {
          "Detail Drift": "A shattered glass vial was found floating in the Hydroponics tank.",
          "Source Confusion": "A discarded syringe was found floating in the Lab A sink.",
          "Fabrication": "An empty bio-hazard container was floating in the tank."
        }
      },
      {
        text: "A flash drive containing encrypted lab data was left in the docking bay.",
        corruptionMap: {
          "Detail Drift": "A flash drive containing raw lab logs was left in the docking bay.",
          "Source Confusion": "A flash drive containing encrypted lab data was left on the Command Deck.",
          "Fabrication": "A personal datapad with encrypted credentials was left in the docking bay."
        }
      },
      {
        text: "Manual overrides were triggered on the pressure valve controls.",
        corruptionMap: {
          "Detail Drift": "Emergency overrides were triggered on the pressure valve controls.",
          "Source Confusion": "Manual overrides were triggered on the docking bay hatch controls.",
          "Fabrication": "The pressure valve control screen was smashed with a heavy wrench."
        }
      }
    ]
  }
};

/**
 * Generates a complete case session including ground truth graph, player hands, anchors, and contradictions.
 * @param {number} playerCount Number of players (4-10)
 * @param {string} [themeId] Optional selected theme ID
 * @returns {object} The case configuration
 */
export function generateCase(playerCount, themeId) {
  const themesList = Object.keys(THEMES);
  const selectedThemeId = themeId && THEMES[themeId] ? themeId : themesList[Math.floor(Math.random() * themesList.length)];
  const theme = THEMES[selectedThemeId];

  // 1. Generate Ground Truth (choose one correct option for each timeline category and 3 evidence)
  const who = theme.who[Math.floor(Math.random() * theme.who.length)];
  const where = theme.where[Math.floor(Math.random() * theme.where.length)];
  const when = theme.when[Math.floor(Math.random() * theme.when.length)];
  const how = theme.how[Math.floor(Math.random() * theme.how.length)];
  const why = theme.why[Math.floor(Math.random() * theme.why.length)];
  
  const groundTruth = {
    who,
    where,
    when,
    how,
    why,
    evidence: theme.evidence.map(e => e.text)
  };

  // Define nodes in the Ground Truth Graph (5 timeline + 3 evidence = 8 nodes total)
  const graphNodes = [
    { key: "who", label: "WHO", value: who },
    { key: "where", label: "WHERE", value: where },
    { key: "when", label: "WHEN", value: when },
    { key: "how", label: "HOW", value: how },
    { key: "why", label: "WHY", value: why },
    { key: "evidence-0", label: "EVIDENCE", value: groundTruth.evidence[0] },
    { key: "evidence-1", label: "EVIDENCE", value: groundTruth.evidence[1] },
    { key: "evidence-2", label: "EVIDENCE", value: groundTruth.evidence[2] }
  ];

  // Helper to generate a corrupted version of a graph node
  const getCorruptedFact = (node) => {
    switch (node.key) {
      case "who": {
        const others = theme.who.filter(v => v !== node.value);
        const altWho = others[Math.floor(Math.random() * others.length)];
        return {
          text: `The suspect was identified as the ${altWho}.`,
          corruptionType: "Source Confusion"
        };
      }
      case "where": {
        const others = theme.where.filter(v => v !== node.value);
        const altWhere = others[Math.floor(Math.random() * others.length)];
        return {
          text: `The incident occurred in the ${altWhere}.`,
          corruptionType: "Source Confusion"
        };
      }
      case "when": {
        const others = theme.when.filter(v => v !== node.value);
        const altWhen = others[Math.floor(Math.random() * others.length)];
        // Let's call it Time Distortion or Detail Drift
        return {
          text: `The event transpired at around ${altWhen}.`,
          corruptionType: "Time Distortion"
        };
      }
      case "how": {
        const others = theme.how.filter(v => v !== node.value);
        const altHow = others[Math.floor(Math.random() * others.length)];
        return {
          text: `The perpetrator gained entry/executed the deed via: ${altHow}.`,
          corruptionType: "Detail Drift"
        };
      }
      case "why": {
        const others = theme.why.filter(v => v !== node.value);
        const altWhy = others[Math.floor(Math.random() * others.length)];
        return {
          text: `The motive appears to be: ${altWhy}.`,
          corruptionType: "Detail Drift"
        };
      }
      default: {
        // Evidence nodes
        const index = parseInt(node.key.split("-")[1]);
        const ev = theme.evidence[index];
        const types = Object.keys(ev.corruptionMap);
        const chosenType = types[Math.floor(Math.random() * types.length)];
        return {
          text: ev.corruptionMap[chosenType],
          corruptionType: chosenType
        };
      }
    }
  };

  // Helper to get true text of a node
  const getTrueFactText = (node) => {
    switch (node.key) {
      case "who": return `The suspect was identified as the ${node.value}.`;
      case "where": return `The incident occurred in the ${node.value}.`;
      case "when": return `The event transpired at around ${node.value}.`;
      case "how": return `The perpetrator gained entry/executed the deed via: ${node.value}.`;
      case "why": return `The motive appears to be: ${node.value}.`;
      default: return node.value;
    }
  };

  // 2. Assign Anchor Facts
  // Every player must receive exactly ONE Anchor Fact that is 100% correct.
  // To ensure the truth is reconstructable, we should distribute these Anchor Facts
  // across the graph nodes.
  const players = Array.from({ length: playerCount }, (_, i) => ({
    id: `player-${i}`,
    facts: []
  }));

  // Shuffle the nodes to distribute them as anchors
  const shuffledNodes = [...graphNodes].sort(() => Math.random() - 0.5);

  // We assign one anchor node to each player.
  // If playerCount < 8, some nodes won't be anchors (but will be distributed as regular facts).
  // If playerCount > 8, some nodes will be anchors for multiple players.
  const playerAnchors = [];
  for (let i = 0; i < playerCount; i++) {
    const node = shuffledNodes[i % shuffledNodes.length];
    playerAnchors.push({
      playerIndex: i,
      node: node,
      fact: {
        id: `fact-anchor-${i}`,
        category: node.key.startsWith("evidence") ? "evidence" : node.key,
        text: getTrueFactText(node),
        isCorrect: true,
        isAnchor: true,
        corruptionType: null,
        nodeKey: node.key
      }
    });
  }

  // 3. Seed at least one Mutually Exclusive Contradiction Pair
  // We pick a node (preferably timeline like who, where, when, how, or why).
  // One player gets the Correct version of it. Another player gets the Corrupted version of it.
  // We can pick a node that was assigned as an anchor for Player A, and generate a corrupted fact for Player B.
  // Or just pick any node, give Player A the true fact, Player B the corrupted fact, and make sure neither of them is the anchor if that's easier.
  // Let's seed it deliberately. We pick the first node in graphNodes (e.g. WHO or WHERE).
  // Player 0 and Player 1 will have a contradiction on this node.
  // Wait, Player 0 already has an anchor fact. If Player 0's anchor fact is WHO, we can't give Player 0 a corrupted WHO.
  // So we give Player 0 the true WHO (could be anchor or regular), and Player 1 gets a corrupted WHO.
  // Let's just find a node that is NOT Player 1's anchor. We give Player 1 a corrupted version of that node.
  // We give another player (e.g., Player 0) the true version of that node.
  // This guarantees a contradiction pair!
  const contradictionNode = graphNodes[Math.floor(Math.random() * 5)]; // pick who/where/when/how/why

  // 4. Fill remaining hand slots
  // Let's say each player gets a hand of 4 facts total (1 Anchor + 3 regular).
  const handSize = 4;
  const corruptionBudget = 0.3; // 30% of non-anchor facts should be corrupted

  players.forEach((player, pIdx) => {
    // Start with the anchor fact
    const anchor = playerAnchors.find(pa => pa.playerIndex === pIdx);
    player.facts.push(anchor.fact);

    // List of nodes we can draw regular facts from (should not overlap with this player's anchor node)
    const availableNodes = graphNodes.filter(n => n.key !== anchor.node.key);
    
    // We want to fill the remaining handSize - 1 slots
    const drawnNodes = [...availableNodes].sort(() => Math.random() - 0.5).slice(0, handSize - 1);

    drawnNodes.forEach((node, nodeIdx) => {
      // Check if this is a contradiction node we want to trigger
      // Let's say:
      // - If node is the contradictionNode:
      //   - If this is Player 0, give them the TRUE fact.
      //   - If this is Player 1, give them the CORRUPTED fact.
      let isCorrupted = Math.random() < corruptionBudget;
      
      if (node.key === contradictionNode.key) {
        if (pIdx === 0) {
          isCorrupted = false;
        } else if (pIdx === 1) {
          isCorrupted = true;
        }
      }

      let factText = "";
      let corruptionType = null;

      if (isCorrupted) {
        const corr = getCorruptedFact(node);
        factText = corr.text;
        corruptionType = corr.corruptionType;
      } else {
        factText = getTrueFactText(node);
      }

      player.facts.push({
        id: `fact-reg-${pIdx}-${nodeIdx}`,
        category: node.key.startsWith("evidence") ? "evidence" : node.key,
        text: factText,
        isCorrect: !isCorrupted,
        isAnchor: false,
        corruptionType: corruptionType,
        nodeKey: node.key
      });
    });

    // Shuffle the player's facts hand so they don't know which is the anchor
    player.facts.sort(() => Math.random() - 0.5);
  });

  return {
    themeId: selectedThemeId,
    themeTitle: theme.title,
    themeDescription: theme.description,
    groundTruth,
    graphNodes,
    playersFacts: players.reduce((acc, p) => {
      acc[p.id] = p.facts;
      return acc;
    }, {})
  };
}
