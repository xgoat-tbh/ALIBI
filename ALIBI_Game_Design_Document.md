# ALIBI
### A Game Design Document
**Genre:** Browser-based multiplayer social deduction / investigation party game
**Players:** 4–10 · **Session Length:** 10–20 minutes · **Voice:** Built-in · **Platform:** Desktop-first web browser

---

## 1. Product Vision

ALIBI is a party game about the horror and comedy of realizing your own memory might be lying to you. It sits in the same living-room-energy space as Jackbox and Among Us, but it opens a lane those games never touched: **deduction without deception**. Nobody at the table is an impostor. Nobody is bluffing. Everyone is doing their honest best to reconstruct the truth from a hand of facts that might be wrong — and that single premise is the whole game.

The design target is a title where:

- A round can be taught in under sixty seconds ("here's what you remember, talk to your friends, figure out what really happened").
- The best stories to tell afterward are not "I fooled everyone" but "I was so sure I was right, and I wasn't" or "everyone doubted me and I was the only one telling the truth."
- The game is exactly as fun with strangers in a browser lobby as it is with six friends yelling on a call.

ALIBI's competitive set is Jackbox Party Packs, Among Us, Wavelength, Codenames, and Werewolf/Mafia — but its emotional territory is closer to a courtroom drama or an eyewitness psychology experiment than a spy thriller.

---

## 2. The Core Design Pillar

> **"I know what I saw... but now I'm not sure if I should trust my own memory."**

Every mechanic in this document is a stress-test of that sentence. Before any feature ships, it should be measured against one question: *does this make players doubt themselves, or does it just make them doubt each other?* ALIBI is strongest when the tension is internal (self-doubt) and social (persuading others), and weakest whenever it accidentally imports "who is lying" tension from traditional social deduction games. There are no liars in this game. That has to stay true even under the pressure of "wow, this would be more dramatic if someone could just be secretly wrong on purpose" — that instinct is the road back to Mafia, and this document deliberately avoids it.

---

## 3. Core Rules at a Glance

- The server privately generates a complete, true account of a fictional incident (a **Ground Truth**) that no player ever sees in full.
- Each player receives a private hand of "memories" — short factual claims about the incident.
- Some memories are true. Some are subtly wrong. Nobody, including the player holding them, knows which is which.
- Players talk (voice-first) to compare memories, notice overlaps and contradictions, and build a shared theory of what happened on a communal investigation board.
- Each player privately commits to ("locks") the single memory they're most confident is true, at a self-chosen stake.
- The group submits one final reconstruction of the incident.
- The truth is revealed. Points are awarded for accurate locks, accurate group reconstruction, and for correctly identifying which shared facts were contradictions.
- Nobody is eliminated. Everyone plays every phase of every round.

---

## 4. Core Gameplay Loop

```
 ┌──────────────┐   ┌───────────┐   ┌───────────────┐   ┌────────────────┐   ┌──────────────────┐   ┌──────────────┐
 │ 1. Incident  │──▶│ 2. Private│──▶│ 3. Testimony   │──▶│ 4. Investigation│──▶│ 5. Confidence     │──▶│ 6. Truth      │
 │   Generation │   │   Memory  │   │  (Structured   │   │   Board         │   │    Lock (Stakes)  │   │   Reveal &    │
 │  (server)    │   │  (silent) │   │   Chaos)       │   │ (shared, live)  │   │  (private, timed) │   │   Scoring     │
 └──────────────┘   └───────────┘   └───────────────┘   └────────────────┘   └──────────────────┘   └──────────────┘
                                                                                                              │
                                                                                       loop repeats ◀─────────┘
```

The loop is deliberately short (10–20 minutes covers 2–4 rounds of a match), because the design bets on *volume of rounds* rather than *depth of a single round* — much like a Jackbox game, players should be itching to play "one more case" rather than settling in for a single 45-minute session.

---

## 5. Match Flow — Detailed Round Structure

### Phase 1 — Case Open (10–15 seconds)
The incident premise is announced to everyone simultaneously: a one-line hook ("A priceless painting has disappeared from the Verrant Hotel") plus flavor art. This is a pure hype beat — no information yet, just tone-setting, so voice chat has something to react to together before the deducing starts.

### Phase 2 — Private Memory (30–45 seconds)
Each player privately receives 3–5 memory fragments, tagged loosely by category (Who / Where / When / How / Why). They read silently. A soft countdown timer builds urgency without being punishing — this is a memorization moment, not a puzzle to solve alone.

**Design change from the original brief:** memories are *not* uniformly distributed. See Section 6 (Memory System) for the "Ground Truth Graph" and "Anchor Fact" changes, which fix a fairness problem in the original design.

### Phase 3 — Testimony ("Structured Chaos")
The original brief's testimony phase — "each player explains what they know" — reads fine on paper but plays badly in an 8-person voice call: it's a sequence of monologues, which is the single most boring shape a party game phase can take. Nobody is doing anything while they wait their turn, and the first player to talk is always working with the least context.

**Redesign:** Testimony is split into two beats:

1. **Opening Statements (parallel, staggered):** Every player is muted except the current speaker, but instead of speaking to the full group in a fixed order, players are placed into a quick randomized order and given a *hard* 20-second cap per turn (visually countdown, cut off if they run over). Short and snappy keeps energy up and prevents rambling.
2. **Open Cross-Talk (2–3 minutes, unmuted):** The floor opens completely. This is where the game actually happens — people say "wait, you said the elevator was broken too?" and start comparing notes in real time. This is intentionally chaotic; see Section 21 for why that's the point, not a bug.

An **"Objection!"** button is available during cross-talk — pressing it doesn't accuse anyone of lying (there are no liars), it simply flags "I have information that conflicts with what was just said" and gives that player priority to jump in, which helps prevent louder players from steamrolling the conversation.

### Phase 4 — Investigation Board (live, shared, 3–4 minutes)
A shared board with five columns (Who / Where / When / How / Why) fills with statement cards as players drag facts onto it. See Section 8 for the full redesign of this mechanic (the "Because" requirement and Challenge mechanic), which turns this from a bulletin board into the actual crux of the game.

### Phase 5 — Confidence Lock (private, simultaneous, 20–30 seconds)
Each player privately selects one fact and a stake tier (see Section 9). This is the moment of maximum internal tension — "do I actually trust what I remember, enough to bet on it?"

### Phase 6 — Final Reconstruction (group, 60–90 seconds)
The group has one shared, editable "case file" (Who/Where/When/How/Why + a one-line "supporting evidence" note) that anyone can propose changes to; the game requires a rough majority (not full consensus — see Section 19, Edge Cases) to lock it in before time runs out.

### Phase 7 — Truth Reveal (30–45 seconds, spectacle beat)
The real timeline is revealed one category at a time, with each player's locked fact and the group's final reconstruction checked live against it. This is built as the "highlight reel" moment — reactions matter more than numbers here, so the reveal is paced for drama (each category gets its own beat, not a single wall of text).

### Phase 8 — Scoring & Recap (10–15 seconds)
Score deltas animate in, plus one or two automatically-generated "moments" (e.g., "Priya was the only one who doubted the popular theory — and she was right," or "Marcus locked in a fact with maximum confidence... and it was fabricated"). These recap cards are what get screenshotted and shared — they're doing marketing work for the game.

Total round time: roughly 6–8 minutes. A standard match runs 2 rounds (quick match) or 3 (standard match), fitting the 10–20 minute target.

---

## 6. Memory System

### The problem with the original design
In the source brief, memory corruption is unstructured — some facts are just "intentionally corrupted," full stop. Played out over real games, this creates a fairness complaint that will show up in reviews within a week: *"I got completely garbage facts and there was nothing I could do — that's not a skill issue, that's bad luck."* A game whose core emotion is "should I trust myself" collapses if the honest answer, half the time, is "no, and there was never anything you could have done about it."

### The fix: the Ground Truth Graph + guaranteed Anchor Fact

The server doesn't generate a flat list of true/false facts — it generates a small **graph** of the incident: nodes for Who, Where, When, How, Why, plus 2-4 supporting Evidence nodes that connect to them (a broken window supports "escaped through the roof," a security log gap supports "cameras were disabled," etc.). Player hands are drawn from this graph so that facts have *structural* relationships to each other, not just random independent truth values. This is what makes contradictions and corroboration feel meaningful instead of arbitrary (Section 7).

Every player is guaranteed **exactly one Anchor Fact**: a memory that is 100% true, always. They are never told which of their facts is the anchor. This does two things:

- It keeps the game statistically fair — nobody's whole hand can be garbage, so a bad round never feels like it was decided entirely by the deal.
- It preserves the self-doubt tension perfectly, because "I have at least one true fact, but I don't know which" is a more interesting mental state than "everything I have might be false," which just breeds apathy ("why bother, I probably can't trust any of it").

### Corruption taxonomy
Not all "wrong" facts should feel the same. Four types, tuned per round via a corruption budget (see Section 12, Difficulty Scaling):

| Type | Description | Feel |
|---|---|---|
| **Detail Drift** | Same fact, wrong specific (red jacket → maroon jacket) | Easy to dismiss as "close enough," creates gentle disagreement |
| **Source Confusion** | Right detail, wrong subject/place attached to it | Creates "wait, that happened somewhere else" arguments |
| **Time Distortion** | Correct event, wrong time attached | Breaks alibis and sequencing, drives the WHEN column specifically |
| **Fabrication** | A plausible but entirely invented detail with no basis in the Ground Truth Graph | Rare (low % of the corruption budget), high-impact, the "wait, nobody else has heard this" moment |

### Mutually Exclusive Pairs
At least one pair of facts per round is deliberately built so that two players hold opposite claims about the same graph node (Player A: "the suspect wore red," Player B: "the suspect wore black") where **only one is correct** and the other is corrupted. These pairs are seeded deliberately (not left to chance) because they are the single most reliable source of the "wait, we disagree" conversational spark the whole game depends on. Without guaranteeing at least one per round, some rounds would play out too smoothly and lack a flashpoint.

---

## 7. Contradiction System

Contradictions are not a failure state to be resolved — they're the content. The system is built to make them visible, discussable, and eventually a scoring opportunity, rather than something the game quietly lets players miss.

- **Auto-flagging:** When two statements placed on the same board column meaningfully conflict, the board visually flags them (a subtle pulse, not an alarm — the game never tells players *who* is wrong, only *that* something doesn't line up).
- **Minority Report Bonus:** This is the single most important scoring rule for making the game feel fair and dramatic. Truth in ALIBI is never decided by majority vote — a fact believed by only one player can still be the correct one. Players who correctly locked or defended a fact that the *majority* of the table doubted or contradicted receive a significant bonus. This does two things: it rewards genuine independent conviction over social conformity, and it directly punishes the lazy "just go with whatever the loudest person said" strategy that would otherwise dominate.
- **Contradiction Points:** Separately from locking a true fact, players earn a smaller reward simply for correctly *flagging* a real contradiction during Phase 4 (whether or not they know which side is true) — this rewards attentiveness and cross-referencing even for players who aren't confident enough to lock anything.

---

## 8. Investigation Mechanics

The shared board is the game's actual "board game" — it needs enough friction to be interesting to manipulate, but not so much that it becomes a UI puzzle rather than a social one.

### The "Because" requirement
Placing a statement onto the board requires attaching a one-line justification (typed or spoken and auto-captioned) — not proof, just reasoning: *"because Priya said the same thing,"* or *"because that lines up with the broken window."* This does three things:

1. It forces players to externalize their reasoning, which is what turns a vague feeling ("I think it's this") into something the rest of the table can actually evaluate and argue with.
2. It creates a natural signal for spotting fabricated facts — genuinely corrupted-but-sincere memories tend to have thin, hard-to-elaborate justifications when pressed, while true memories tend to connect to other things.
3. It gives the recap system (Phase 8) material to work with — "the reasoning that won the round" is a shareable artifact.

### The Challenge mechanic
Any player can Challenge a card on the board (distinct from a simple disagreement) — this doesn't accuse anyone of lying, it simply asks the placer to add one more supporting detail under light time pressure (10 seconds). This is deliberately framed as **memory pressure-testing**, not interrogation: real memories, even wrong ones held in good faith, usually produce *something* further; outright fabrications are the ones that most often stall out. It's a soft signal, not a lie detector — the game must never let this feel definitive, or it becomes a stealth "find the impostor" mechanic, which is exactly what ALIBI is not.

### Category pressure
The five columns aren't just organizational — WHY is deliberately the hardest column to fill (motive-related facts are rarer in the initial hands and often only inferable from combining other columns), which gives late-round conversation somewhere to go once WHO/WHERE/WHEN feel mostly settled.

---

## 9. Confidence Lock (Staking System)

### The problem with the original design
"Choosing an incorrect fact is heavily punished" as a single flat penalty creates a rational-but-boring optimal strategy: risk-averse players simply stop locking anything, or only lock the single safest, most-corroborated fact — which drains all the tension out of the moment that's supposed to be the emotional peak of the round.

### The fix: tiered staking
Instead of one binary lock, players choose both *which* fact and *how hard* they're betting on it:

| Stake Tier | Reward if correct | Penalty if wrong | Player mindset |
|---|---|---|---|
| **Hunch** | Small | None | "I'll flag this but I'm not risking anything" |
| **Confident** | Medium | Small | "I'd bet a little on this" |
| **Certain** | Large | Large | "I am staking my round on this" |

This converts the lock from a single fearful decision into a genuine poker-style read of your own memory and the table's mood — and it directly supports the Minority Report bonus (Section 7): the most dramatic moment in the game is a player going **Certain** on a fact the entire rest of the table has dismissed, and being right.

---

## 10. Scoring System & Long-Term Progression

Three separate currencies, deliberately kept legible and distinct so competitive and cooperative players both have something to chase:

- **Truth Points (competitive, per-player):** Earned from locked facts, Minority Report bonuses, and correctly flagged contradictions. This is the "who played the best round" number.
- **Trust Points (cooperative, whole-table):** Earned collectively based on how close the group's Final Reconstruction (Phase 6) came to the real Ground Truth. This rewards the table for functioning well as a group even if any individual had a rough round — critical for keeping the game feeling like a shared social experience rather than a zero-sum contest, which matters a lot for a game played casually with friends.
- **Detective Rating (meta-progression, cross-match):** A slow-moving, MMR-style number that tracks a player's long-term accuracy and calibration (not just raw points — a player who goes Certain constantly and is right half the time should rate lower than one who calibrates stakes to their actual confidence). This is what powers matchmaking for players who want a competitive queue, without polluting casual play with visible rank pressure.

### Recommendation on long-term direction
Ship **cooperative-primary, competitive-layered**: Trust Points and the shared recap moments are the default, visible, "what we're playing for" layer (this is what makes the game work in a living room with friends who don't want to feel pitted against each other). Truth Points and Detective Rating exist underneath for players who want it, surfaced via an optional ranked queue and personal profile stats, similar to how Overcooked's star ratings sit alongside individual performance stats. A fully competitive/ranked-first model risks turning testimony into guarded, strategic silence, which kills the exact chattiness (Section 21) that makes the game worth playing.

---

## 11. Player Psychology

ALIBI's tension runs on three psychological levers, and understanding them explains why several of the redesigns above matter:

- **The illusion of memory confidence.** Real eyewitness psychology shows people are frequently *most* confident about memories that are subtly wrong — confidence and accuracy are not the same thing. ALIBI weaponizes this directly: a player's gut certainty is not a reliable guide, and the game is explicitly designed to produce moments where the most confident person in the room is wrong, and the quiet, uncertain person is right.
- **Social proof pressure.** In any group discussion, the majority opinion tends to gravitationally pull individual conviction toward it, even against someone's own private information — this is precisely why the Minority Report bonus (Section 7) exists as a counterweight; without it, group discussion would just converge on "whatever the confident talker said first" every single round.
- **Loss aversion at the Lock.** The moment before locking a fact is designed to be the game's peak adrenaline beat — tiered staking (Section 9) exists specifically to keep that moment from being resolved by pure risk-aversion.

---

## 12. Social Dynamics

- **No elimination, ever.** Every player is doing something in every phase of every round — there's no "you're dead, wait 8 minutes" dead time that plagues Mafia-likes. This alone is one of the biggest usability upgrades over the genre's classics.
- **Cross-talk is the design, not a defect.** See Section 21 — the game is engineered to produce overlapping speech, and the UI/voice tooling (Objection button, Phase 4's live board) exists to manage that chaos rather than suppress it.
- **No accusation vocabulary.** Every mechanic name and prompt in the game (Challenge, Objection, Because) is deliberately framed around *information*, never around *guilt* — players should never feel like they're being told "you're lying," because nobody is.
- **Shared spectacle beats.** The Case Open and Truth Reveal phases are built as moments the whole table experiences together, giving natural rhythm points for reactions, laughing, and groaning in unison — these are the "everybody leans into their screen at once" beats that make party games memorable to play in person.

---

## 13. Difficulty Scaling

Difficulty is tuned through the Ground Truth Graph generator (Section 15), not through explicit "easy/hard" player-facing settings that would feel gamey for a social party game. Levers, adjustable per case template:

- **Corruption budget %** — the proportion of dealt facts that are non-Anchor and corrupted (tunable roughly 15% for early/tutorial cases up to 40%+ for advanced "Chaos Case" content).
- **Graph density** — how many Evidence nodes connect to Timeline nodes; denser graphs create more corroboration opportunities but also more room for misleading Source Confusion facts.
- **Guaranteed Mutually Exclusive Pairs** — count scales with player count and case difficulty (more players, more pairs, so nobody is left out of a direct disagreement).
- **Player count scaling** — with 4 players, hands are slightly larger (more overlap needed to reach full graph coverage); with 10 players, hands are smaller and more players share partial overlaps, making the social cross-referencing puzzle richer rather than just longer.

New players are funneled into **Tutorial Cases** — low corruption, high overlap, one obvious contradiction — that teach the loop's shape (memory → talk → board → lock → reveal) without punishing early bad calls hard, ramping into **Classic Cases** and eventually **Chaos Cases** as their Detective Rating (Section 10) climbs.

---

## 14. Replayability

- **Combinatorial case templates.** Rather than authoring fixed stories (a fixed weakness of the original brief's fully hand-written examples), cases are assembled from independent modular pieces — Setting (hotel, museum, lab, vault...), Cast (roles: victim, suspect archetype, witnesses), and Motive/Method pools — recombined by the Ground Truth Graph generator (Section 15). A modest library of modular pieces produces a far larger space of distinct-feeling cases than the same amount of effort spent hand-writing whole scenarios.
- **Daily Case.** One shared, same-for-everyone case per day, encouraging comparison of results with friends outside the game itself (a proven retention hook in the puzzle-game space).
- **Personal stats and "signature" moments.** Long-term tracking of things like Minority Report win rate, calibration accuracy (confidence vs. correctness), and a running highlight reel of a player's best "everyone doubted me and I was right" moments.
- **Community case submission** (post-launch): a moderated pipeline for community-authored Setting/Cast/Motive modules, similar to how Jackbox-adjacent communities generate longevity through user content, without ever letting user content touch the actual truth/corruption logic (to preserve balance).

---

## 15. Random Incident Generation (Content Pipeline)

The generator is the game's most important piece of "invisible" infrastructure — it needs to reliably produce cases that are internally consistent, fair, and appropriately tense, forever, without an author hand-tuning each one.

**Pipeline:**

1. **Select modules:** Setting + Cast + Motive/Method are drawn (weighted by player history, to avoid repeats).
2. **Build the Ground Truth Graph:** Timeline nodes (Who/Where/When/How/Why) are populated and linked to 2–4 Evidence nodes, forming the one true account of the incident.
3. **Assign the Anchor Fact:** every player is guaranteed one true fact drawn from the graph, distributed so that (across the whole table) every graph node is covered by at least one true, anchored claim somewhere in the room — this guarantees the truth is always fully reconstructable *in principle* by the group, even in a worst-case round.
4. **Distribute remaining hand slots:** additional facts per player are drawn from the graph (true) or generated as corrupted variants per the taxonomy (Section 6), governed by the round's corruption budget.
5. **Seed Mutually Exclusive Pairs:** at least one guaranteed direct contradiction pair is injected per round, scaled by difficulty.
6. **Validate:** an automated consistency pass confirms the case is solvable (the true graph is fully coverable by the anchors in the room) and appropriately hard (corruption budget within target range) before it's dealt.

This keeps case generation systemic rather than authored line-by-line, which is what makes the "infinite cases" replayability promise actually sustainable for a live game.

---

## 16. Future Expansion

- **Ranked seasons** built on Detective Rating, with cosmetic-only rewards (detective badges, board themes) — no pay-to-win pressure on a system that's fundamentally about honest reasoning.
- **Cooperative "Cold Case" mode**: a longer-form, multi-round investigation of a single larger incident spread across a whole match, for groups that want more depth than the 10–20 minute quick-match loop.
- **Spectator/audience mode**: non-playing viewers see the full Ground Truth from the start and watch players reason toward (or away from) it — built specifically for streaming (Section 23).
- **Custom case creator**: a constrained authoring tool that lets players build Setting/Cast/Motive modules within the validated generator, rather than freeform scenario writing (to preserve the fairness guarantees in Section 15).
- **Themed seasonal case packs** (noir, sci-fi, workplace-comedy settings) as a lightweight way to keep the modular content library growing without touching core systems.

---

## 17. Browser Suitability

- **Zero-install, link-and-play** lobby model is the single biggest onboarding advantage a browser title has over a client-download party game — critical for the "friend sends a link mid-call" viral loop this genre depends on.
- **Session length (10–20 min) matches browser attention spans** far better than a 45-minute session would; it's built to be a "one more round" game rather than a sit-down commitment.
- **Real-time state sync** (the live investigation board, timers, simultaneous locks) is a natural fit for WebSocket-based architecture already standard in browser party games.
- **Spectator links** allow non-playing friends (or a streaming audience) to watch a match without needing to join, which matters a lot for both viral growth and streamer suitability (Section 23).

---

## 18. Voice Chat Experience

- **Built-in, no external app required** — this is a hard requirement for a genre where "half the group forgot to join the Discord call" is a common actual failure mode of similar games.
- **Phase-aware muting**: automatic hard-mute during Private Memory (Phase 2) so nobody accidentally thinks out loud; staggered solo-unmute during Opening Statements; full open floor during Cross-Talk and Investigation.
- **Objection button** (Section 5) as a lightweight interrupt-priority tool for chaotic 8–10 person calls, so quieter players have a structured way to cut in rather than needing to out-shout the table.
- **Live captions** for every spoken phase (also an accessibility requirement, Section 19), which doubles as content for players without working mics.

---

## 19. Accessibility

- **Full text fallback** for every voice interaction — testimony, challenges, and objections can all be typed and are shown captioned to the whole table, so mic access is never a hard requirement to play.
- **Screen-reader-friendly memory cards and board**, since the board (Section 8) is the game's central interactive surface.
- **Colorblind-safe board categories** — column identity (Who/Where/When/How/Why) is conveyed by icon and label, never by color alone.
- **Adjustable phase timers** (a lobby-host toggle for a "relaxed pace" mode extending Phases 2–4), useful for neurodivergent players or groups that simply want a slower, more conversational game night.
- **Text-to-speech read-aloud** option for private memory cards.

---

## 20. Edge Cases

- **Disconnection mid-round:** a disconnected player's already-placed board contributions remain visible (tagged "testimony from an absent player"), and they get a bounded reconnection window; if they don't return, their un-locked facts simply become permanently un-lockable by anyone else (facts are private information, never transferable), which is itself an interesting minor wrinkle rather than a broken state.
- **AFK / non-participation:** each player must place at least one statement on the board and make some Lock choice (even a Hunch-tier one) to avoid a small "no engagement" penalty — this keeps quiet lobbies functional without forcing anyone to talk if they've opted for the text fallback.
- **Total group consensus failure:** if Phase 6's Final Reconstruction can't reach majority agreement before the timer runs out, the game locks in whatever the board currently shows as the most-supported statement per column automatically — the round always resolves, it never stalls the match.
- **A true fact that everyone doubts:** explicitly not an edge case to "fix" — this is the exact scenario the Minority Report bonus (Section 7) exists to reward, and it should be common enough to be a recognizable, celebrated recap moment.
- **Collusion via out-of-game channels:** since voice is built-in and the game has no hidden roles to protect, this is a much smaller risk than in traditional social deduction titles — there's nothing to collude *about* except genuinely shared honest information, which is the point.

---

## 21. Why This Game Is Fun

The fun comes from a genuinely rare emotional combination: the collaborative energy of a group solving a puzzle together, plus the personal vulnerability of not being sure you can trust your own head. Nobody in this game gets to coast — even the quietest player at the table has a fact that might be the key piece everyone else is missing, or might be the thing they need to have the courage to abandon. And because nobody is eliminated and nobody is "the bad guy," every round ends with a shared laugh or shared groan rather than one player feeling singled out.

## 22. Why Friends Will Talk Over Each Other

Because the information is genuinely partial and overlapping by design (Section 6), real cross-talk is structurally guaranteed, not just possible — someone will always have a piece that changes what someone else just said, and the Cross-Talk beat (Section 5) is built with zero turn structure specifically so that collision happens. The Objection button exists not to prevent the chaos but to give it a release valve so it stays fun instead of just noisy.

## 23. Why Streamers Would Enjoy It

- No elimination means no dead-air stretches waiting for a streamer's turn to matter again.
- The Truth Reveal (Phase 7) and auto-generated recap moments (Phase 8) are purpose-built highlight-reel content, ready to clip.
- Spectator mode (Section 16) lets a streamer's chat see the full Ground Truth and backseat-guess in real time, which is a proven engagement pattern for deduction and quiz-style stream content.
- Because there's no hidden role to protect, streamers never have to worry about a chat overlay accidentally "outing" them the way it can in impostor-style games — there's nothing to out.

## 24. Why This Is Different From Existing Social Deduction Games

Traditional social deduction (Mafia, Werewolf, Among Us) is fundamentally about **deception skill** — someone knows the truth and is actively hiding it, and the game rewards good liars and good lie-detectors. ALIBI removes that skill requirement entirely, which matters more than it might sound: a large number of people find bluffing-based games either stressful or simply not their idea of fun, and that's a real, underserved audience. ALIBI replaces "who's lying" tension with **epistemic** tension — everyone is sincere, and the challenge is entirely about reasoning under uncertainty, not the interpersonal skill of deception. It's closer in spirit to a shared eyewitness psychology experiment than to a bluffing game, and that distinction is the entire reason it can exist as its own genre entry rather than "Among Us with extra steps."

---

## 25. Self-Critique — Five Biggest Weaknesses & Redesigns

**1. The original Testimony phase was a boring monologue sequence.**
*Fixed in Section 5* with the Structured Chaos model (staggered fast opening statements + genuinely open cross-talk), and the Objection tool to keep the open floor navigable rather than a shouting match.

**2. Flat corruption with no fairness guarantee made bad luck feel like a design flaw, not a feature.**
*Fixed in Section 6* via the Ground Truth Graph and the guaranteed, unknown Anchor Fact per player, plus a named corruption taxonomy so "wrong" facts have different, legible textures instead of being uniformly arbitrary.

**3. A single flat "heavily punished" Confidence Lock pushed all players toward risk-averse non-participation, killing the game's supposed emotional peak.**
*Fixed in Section 9* with tiered staking (Hunch / Confident / Certain), turning the Lock into a genuine bet on self-trust rather than a binary trap best avoided.

**4. Majority-rules social pressure would have quietly turned every round into "agree with whoever talked first," undermining the entire premise that truth isn't decided by popularity.**
*Fixed in Section 7* with the Minority Report bonus, which explicitly and mechanically rewards correctly trusting an unpopular fact — this is arguably the single most load-bearing rule in the whole design, since it's what keeps confident wrong talkers from steamrolling quiet correct ones.

**5. Hand-authored example incidents (as given in the original brief) don't scale — a game that reuses the same handful of "painting stolen from hotel" stories will feel stale within a few sessions.**
*Fixed in Section 15* with a modular, validated Ground Truth Graph generator (Setting × Cast × Motive/Method recombination) that produces a combinatorially large space of internally-consistent, fairness-checked cases automatically, rather than relying on an ever-growing pile of hand-written scenarios.

---

*End of document.*
