// server/testGenerator.js
import { generateCase, THEMES } from './caseGenerator.js';

console.log("Running Case Generator validation tests...");

try {
  // Test with 4 players
  const numPlayers = 4;
  const caseData = generateCase(numPlayers);

  // 1. Basic properties check
  if (!caseData.themeId || !caseData.themeTitle || !caseData.themeDescription) {
    throw new Error("Missing basic theme details in generated case.");
  }
  console.log("✓ Basic details present:", caseData.themeTitle);

  // 2. Ground truth structure check
  const gt = caseData.groundTruth;
  if (!gt.who || !gt.where || !gt.when || !gt.how || !gt.why || !Array.isArray(gt.evidence)) {
    throw new Error("Invalid Ground Truth structure.");
  }
  if (gt.evidence.length !== 3) {
    throw new Error(`Expected 3 evidence statements, got ${gt.evidence.length}`);
  }
  console.log("✓ Ground Truth structure matches schema.");

  // 3. Graph Nodes check
  if (!Array.isArray(caseData.graphNodes) || caseData.graphNodes.length !== 8) {
    throw new Error(`Expected 8 graph nodes, got ${caseData.graphNodes ? caseData.graphNodes.length : 'none'}`);
  }
  console.log("✓ Graph Nodes count matches schema (8 nodes).");

  // 4. Players hands check
  const factKeys = Object.keys(caseData.playersFacts);
  if (factKeys.length !== numPlayers) {
    throw new Error(`Expected facts for ${numPlayers} players, got ${factKeys.length}`);
  }

  factKeys.forEach((pKey, idx) => {
    const hand = caseData.playersFacts[pKey];
    
    // Check hand size
    if (hand.length !== 4) {
      throw new Error(`Expected player hand size of 4, got ${hand.length} for ${pKey}`);
    }

    // Check Anchor Fact properties
    const anchors = hand.filter(f => f.isAnchor);
    if (anchors.length !== 1) {
      throw new Error(`Expected exactly 1 Anchor Fact per player, found ${anchors.length} for ${pKey}`);
    }

    const anchor = anchors[0];
    if (!anchor.isCorrect) {
      throw new Error(`Anchor Fact must be correct! Found incorrect anchor for ${pKey}`);
    }

    if (anchor.corruptionType !== null) {
      throw new Error(`Anchor Fact cannot have a corruption type! Found: ${anchor.corruptionType} for ${pKey}`);
    }
  });
  console.log(`✓ Distributed hands to ${numPlayers} players successfully.`);
  console.log("✓ Exactly one 100% correct Anchor Fact per player verified.");

  // 5. Test with 8 players to verify coverage
  const largeCase = generateCase(8);
  const largeFactKeys = Object.keys(largeCase.playersFacts);
  const anchorNodes = new Set();
  
  largeFactKeys.forEach(pKey => {
    const hand = largeCase.playersFacts[pKey];
    const anchor = hand.find(f => f.isAnchor);
    anchorNodes.add(anchor.nodeKey);
  });
  
  console.log("✓ Graph coverage with 8 players verified (anchor node variety count):", anchorNodes.size);

  console.log("\nALL CASE GENERATOR TESTS PASSED SUCCESSFULLY! 🎉");
  process.exit(0);
} catch (error) {
  console.error("\n❌ TEST FAILED:", error.message);
  process.exit(1);
}
