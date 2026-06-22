// --- Global Variables ---
let fullDatabase = {};
let cardDatabase = {};

let charts = {
    topCards: null,
    deckPresence: null,
    timeline: null,
    pairs: null,        // NEW
    buzzwords: null     // NEW
};

const heroMap = {
    // Plants
    "Mega-Grow,Smarty": "Green Shadow",
    "Kabloom,Solar": "Solar Flare",
    "Guardian,Solar": "Wall-Knight",
    "Mega-Grow,Solar": "Chompzilla",
    "Guardian,Kabloom": "Spudow",
    "Guardian,Smarty": "Citron / Beta-Carrotina",
    "Guardian,Mega-Grow": "Grass Knuckles",
    "Kabloom,Smarty": "Nightcap",
    "Kabloom,Mega-Grow": "Captain Combustible",
    "Smarty,Solar": "Rose",

    // Zombies
    "Brainy,Sneaky": "Super Brainz / Huge-Gigantacus",
    "Beastly,Hearty": "The Smash",
    "Crazy,Sneaky": "Impfinity",
    "Brainy,Hearty": "Rustbolt",
    "Beastly,Crazy": "Electric Boogaloo",
    "Beastly,Sneaky": "Brain Freeze",
    "Brainy,Crazy": "Professor Brainstorm",
    "Beastly,Brainy": "Immorticia",
    "Crazy,Hearty": "Z-Mech",
    "Hearty,Sneaky": "Neptuna"
};

document.addEventListener('DOMContentLoaded', () => {
    // --- Random Funny Adjectives ---
    const adjectives = [
        "glorious",
        "delicious",
        "unhinged",
        "questionable",
        "spicy",
        "illegal",
        "sweaty",
        "bricked",
        "starchy", // A little Starch Lord nod
        "absolutely stacked",
        "big brain",
        "toxic",
        "beautiful",
        "chaotic",
        "cursed",
        "devious",
        "high-rolling",
        "diabolical",
        "scrumptious",
        "Weenie Beanie approved",
        "legendary",
        "mildly infuriating",
        "tryhard",
        "S-tier",
        "Ra Zombie approved"
    ];

    // Pick a random adjective and inject it
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const adjElement = document.getElementById('randomAdjective');
    if (adjElement) {
        adjElement.textContent = randomAdj;
    }
    // --- DOM Elements ---
    const deckGrid = document.getElementById('deckGrid');
    const loadingEl = document.getElementById('loading');
    const deckCountEl = document.getElementById('deckCount');
    const searchInput = document.getElementById('searchInput');

    // Modal Elements
    const infoModal = document.getElementById('infoModal');
    const infoBtn = document.getElementById('infoBtn');
    const closeModal = document.getElementById('closeModal');

    // View/Tab Elements
    const deckView = document.getElementById('deckView');
    const statsView = document.getElementById('statsView');
    const guidesView = document.getElementById('guidesView');
    const tiersView = document.getElementById('tiersView');
    const moreMenu = document.querySelector('.home-menu-more');
    const searchWrapper = document.getElementById('searchWrapper');
    const statsBtn = document.getElementById('statsBtn');
    const guidesBtn = document.getElementById('guidesBtn');
    const tiersBtn = document.getElementById('tiersBtn');
    const backBtn = document.getElementById('backBtn');
    const crafterBtn = document.getElementById('crafterBtn');
    const crafterView = document.getElementById('crafterView');
    const gamesView = document.getElementById('gamesView');
    const gamesBtn = document.getElementById('gamesBtn');
    const synergyEasterEgg = document.getElementById('synergyEasterEgg');
    const synergyView = document.getElementById('synergyView');

    // --- Fetch Database ---
    // --- 1. SET UP A "DATA LOADED" FLAG ---
    let isDataLoaded = false;

    // --- 2. YOUR FETCH CALLS (Slightly updated) ---
    // We use Promise.all to wait for BOTH JSON files to finish downloading
    Promise.all([
        fetch('deck_database_final.json').then(res => {
            if (!res.ok) throw new Error("Could not load the database file.");
            return res.json();
        }),
        fetch('card_data.json').then(res => {
            if (!res.ok) throw new Error("Could not load the card data file.");
            return res.json();
        })
    ])
        .then(([deckData, cardData]) => {
            // Both files are successfully downloaded!
            fullDatabase = deckData;
            cardDatabase = cardData;

            loadingEl.style.display = 'none';
            const totalDecks = Object.keys(deckData).length;
            deckCountEl.textContent = totalDecks;

            // We set our flag to true, meaning it is safe to draw charts now.
            isDataLoaded = true;

            // Kick off the initial render of the main deck list
            renderDecks(fullDatabase);

            // KICK OFF THE ROUTER NOW THAT WE HAVE DATA!
            handleRouting();
            renderSeeds(); // Initial render to show empty state
        })
        .catch(error => {
            loadingEl.textContent = `Error loading data: ${error.message}`;
            console.error("Fetch error:", error);
        });
    const gradeFilter = document.getElementById('gradeFilter');
    function handleRouting() {
        // IMPORTANT: If the data hasn't finished downloading yet, stop right here!
        if (!isDataLoaded) return;

        const hash = window.location.hash || '#home';

        // 1. Hide absolutely everything first
        if (moreMenu) moreMenu.classList.add('hidden');
        gradeFilter.classList.add('hidden');
        deckView.classList.add('hidden');
        statsView.classList.add('hidden');
        tiersView.classList.add('hidden');
        guidesView.classList.add('hidden');
        crafterView.classList.add('hidden');
        gamesView.classList.add('hidden');
        searchWrapper.classList.add('hidden');
        statsBtn.classList.add('hidden');
        guidesBtn.classList.add('hidden');
        crafterBtn.classList.add('hidden');
        gamesBtn.classList.add('hidden');
        tiersBtn.classList.add('hidden');
        synergyView.classList.add('hidden');

        if (typeof backBtn !== 'undefined') backBtn.classList.add('hidden');

        // 2. Determine what to show based on the hash & Update Titles
        if (hash === '#stats') {
            statsView.classList.remove('hidden');
            if (typeof backBtn !== 'undefined') backBtn.classList.remove('hidden');

            const currentLimit = document.getElementById('deckLimitFilter') ? document.getElementById('deckLimitFilter').value : 'all';
            if (typeof renderStatsChart === 'function') renderStatsChart(currentLimit);

        } else if (hash === '#crafter') {
            crafterView.classList.remove('hidden');
            if (typeof backBtn !== 'undefined') backBtn.classList.remove('hidden');

        } else if (hash === '#games') {
            gamesView.classList.remove('hidden');
            if (typeof backBtn !== 'undefined') backBtn.classList.remove('hidden');
            if (typeof renderGames === 'function') renderGames();

        } else if (hash === '#synergy') {
            synergyView.classList.remove('hidden');
            if (typeof backBtn !== 'undefined') backBtn.classList.remove('hidden');
            if (typeof renderSynergyWeb === 'function') renderSynergyWeb();

        } else if (hash === '#tiers') {
            tiersView.classList.remove('hidden');
            if (typeof backBtn !== 'undefined') backBtn.classList.remove('hidden');
            if (typeof renderTiers === 'function') renderTiers();

        } else if (hash === '#guides') {
            guidesView.classList.remove('hidden');
            if (typeof backBtn !== 'undefined') backBtn.classList.remove('hidden');
        } else {
            // Default Home UI
            deckView.classList.remove('hidden');
            searchWrapper.classList.remove('hidden');
            statsBtn.classList.remove('hidden');
            guidesBtn.classList.remove('hidden');
            tiersBtn.classList.remove('hidden');
            crafterBtn.classList.remove('hidden');
            gamesBtn.classList.remove('hidden');
            gradeFilter.classList.remove('hidden');
            if (moreMenu) moreMenu.classList.remove('hidden');

        }

        // 3. CRITICAL CHANGE: Track the page view AFTER the DOM and titles have updated
        trackPageView(hash);
    }

    function trackPageView(hash) {
        if (!window.gtag) return;

        const pageSlug = (hash || '#home').replace('#', '');
        const cleanPath = '/' + pageSlug;

        // Construct a flawless virtual URL structure using the URL API
        const virtualLocation = new URL(window.location.href);
        virtualLocation.pathname = cleanPath; // Replaces the root path with the virtual one (e.g., /stats)
        virtualLocation.hash = '';            // Strips the hash entirely so GA4 doesn't get confused

        gtag('event', 'page_view', {
            page_path: cleanPath,
            page_title: document.title,
            page_location: virtualLocation.href // Sends: https://yourdomain.com/stats
        });
    }
    // --- Helper Functions ---
    function getYouTubeId(url) {
        if (!url) return null;
        const match = url.match(/[?&]v=([^&]+)/);
        return match ? match[1] : null;
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    function parseCardEntry(cardString) {
        if (!cardString || typeof cardString !== "string") return null;
        const parts = cardString.trim().split(/\s+/);
        if (parts.length === 0 || !parts[0]) return null;

        let count = 1;
        let nameParts = parts;
        const first = parts[0];
        const m1 = first.match(/^x(\d+)$/i);
        const m2 = first.match(/^(\d+)x$/i);
        const m3 = first.match(/^(\d+)$/);

        if (m1) { count = parseInt(m1[1], 10); nameParts = parts.slice(1); }
        else if (m2) { count = parseInt(m2[1], 10); nameParts = parts.slice(1); }
        else if (m3 && parts.length > 1) { count = parseInt(m3[1], 10); nameParts = parts.slice(1); }

        const rawName = nameParts.join(" ").trim();
        if (!rawName) return null;

        const name = rawName.replace(/_/g, " ").replace(/\s+/g, " ").trim();
        const key = name.replace(/ /g, "_");
        return { name, key, count: Number.isFinite(count) ? count : 1 };
    }

    let _verdictContext = null;
    let _verdictContextSource = null;

    function getVerdictContext() {
        if (_verdictContext && _verdictContextSource === fullDatabase) return _verdictContext;

        const ctx = { cardPopularity: {}, maxMetaCopies: 0, dbDecks: {} };
        if (typeof fullDatabase === "undefined") {
            _verdictContext = ctx;
            _verdictContextSource = fullDatabase;
            return ctx;
        }

        const now = Date.now();
        // Set your half-life here (in days). 
        // 365 means a deck from 1 year ago is worth half as much "Power" as a deck uploaded today.
        const HALF_LIFE_DAYS = 365;

        for (const deckKey in fullDatabase) {
            const dbDeck = fullDatabase[deckKey];
            if (!dbDeck || !Array.isArray(dbDeck.cards)) continue;

            // --- Time Decay Calculation ---
            let timeWeight = 1;
            if (dbDeck.upload_date) {
                const deckDate = new Date(dbDeck.upload_date).getTime();
                if (!isNaN(deckDate)) {
                    // Calculate days elapsed (Math.max caps it at 0 to avoid future-date timezone bugs)
                    const daysAgo = Math.max(0, (now - deckDate) / (1000 * 60 * 60 * 24));
                    timeWeight = Math.pow(0.5, daysAgo / HALF_LIFE_DAYS);
                }
            }

            const seedCounts = new Map(); // spaced name -> count (used for overlap)
            let dbTotalCards = 0;
            const dbCurve = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, "6+": 0 };

            for (const cardString of dbDeck.cards) {
                // EXACT live-builder parsing — do not "improve" this
                const parts = (cardString || "").split(" ");
                if (parts.length < 2) continue;

                const count = parseInt(parts[0].replace('x', '')) || 0;
                const copiesPower = parseInt(parts[0].replace('x', '')) || 1;
                const rawName = parts.slice(1).join(" ");
                const cleanName = rawName.replace(/_/g, ' ');

                seedCounts.set(cleanName, (seedCounts.get(cleanName) || 0) + count);
                dbTotalCards += count;

                // Multiply the raw copies by the timeWeight so old decks have less impact on the meta
                ctx.cardPopularity[cleanName] = (ctx.cardPopularity[cleanName] || 0) + (copiesPower * timeWeight);

                // Mirror the live builder's cost lookup EXACTLY, including the
                // "NaN cost falls to 6+" quirk. Do NOT normalize NaN to 1 here.
                const cardData = cardDatabase[cleanName] || cardDatabase[rawName];
                const cost = cardData ? parseInt(cardData.Cost) : 1;

                if (cost <= 1) dbCurve[1] += count;
                else if (cost === 2) dbCurve[2] += count;
                else if (cost === 3) dbCurve[3] += count;
                else if (cost === 4) dbCurve[4] += count;
                else if (cost === 5) dbCurve[5] += count;
                else dbCurve["6+"] += count;
            }

            if (dbTotalCards === 0) continue;

            ctx.dbDecks[deckKey] = {
                seedCounts,
                totalCards: dbTotalCards,
                shape: [
                    dbCurve[1] / dbTotalCards,
                    dbCurve[2] / dbTotalCards,
                    dbCurve[3] / dbTotalCards,
                    dbCurve[4] / dbTotalCards,
                    dbCurve[5] / dbTotalCards,
                    dbCurve["6+"] / dbTotalCards,
                ],
            };
        }

        const metaValues = Object.values(ctx.cardPopularity);
        ctx.maxMetaCopies = metaValues.length > 0 ? Math.max(...metaValues) : 0;

        _verdictContext = ctx;
        _verdictContextSource = fullDatabase;
        return ctx;
    }

    function getDeckVerdictFromCards(deckCards, selfDeckKey, ctx) {
        if (typeof initSynergyMatrix === "function") {
            initSynergyMatrix();
        }
        ctx = ctx || getVerdictContext();

        // --- Parse own deck ---
        const seedMap = new Map(); // name -> {name, key, count, cost}
        for (const cardString of deckCards || []) {
            const parsed = parseCardEntry(cardString);
            if (!parsed) continue;
            const { name, key, count } = parsed;

            const existing = seedMap.get(name) || { name, key, count: 0, cost: 1 };
            existing.count += count;
            const cardData = cardDatabase?.[key] || cardDatabase?.[name] || {};
            const parsedCost = parseInt(cardData.Cost, 10);
            existing.cost = Number.isFinite(parsedCost) ? parsedCost : 1;
            seedMap.set(name, existing);
        }
        const seeds = [...seedMap.values()];

        // --- Totals, curve, sparks, synergy ---
        let totalCards = 0, totalCost = 0, totalSparks = 0, totalConnection = 0, totalDepth = 0;
        const curve = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, "6+": 0 };

        seeds.forEach(seedA => {
            totalCards += seedA.count;
            const cost = seedA.cost || 1;
            totalCost += cost * seedA.count;

            const cardData = cardDatabase?.[seedA.key] || cardDatabase?.[seedA.name] || {};
            const rarity = cardData.Rarity || "Common";
            let sparks = 0;
            if (rarity === "Uncommon") sparks = 50;
            else if (rarity === "Rare") sparks = 250;
            else if (rarity === "Super-Rare" || rarity === "Event") sparks = 1000;
            else if (rarity === "Legendary") sparks = 4000;
            totalSparks += sparks * seedA.count;

            if (cost <= 1) curve[1] += seedA.count;
            else if (cost === 2) curve[2] += seedA.count;
            else if (cost === 3) curve[3] += seedA.count;
            else if (cost === 4) curve[4] += seedA.count;
            else if (cost === 5) curve[5] += seedA.count;
            else curve["6+"] += seedA.count;

            const freqA = cardFrequencies?.[seedA.key] || 1;

            const partnerScores = [];
            seeds.forEach(seedB => {
                if (seedA.key === seedB.key) return;

                const coOccurrences = synergyMatrix?.[seedA.key]?.[seedB.key] || 0;
                const freqB = cardFrequencies?.[seedB.key] || 1;
                const cs = coOccurrences / Math.sqrt(freqA * freqB);

                partnerScores.push({ key: seedB.key, cs });
            });

            partnerScores.sort((a, b) => b.cs - a.cs);

            const best = partnerScores[0]?.cs || 0;
            const second = partnerScores[1]?.cs || 0;

            // tiny 3-card bonus
            let triadBonus = 0;
            if (partnerScores.length >= 2) {
                const k1 = partnerScores[0].key;
                const k2 = partnerScores[1].key;

                const f1 = cardFrequencies?.[k1] || 1;
                const f2 = cardFrequencies?.[k2] || 1;
                const co12 = synergyMatrix?.[k1]?.[k2] || 0;
                const cs12 = co12 / Math.sqrt(f1 * f2);

                triadBonus = 0.15 * Math.min(best, second, cs12);
            }

            // weighted local cluster score
            const localClusterScore = (0.7 * best) + (0.25 * second) + triadBonus;
            totalConnection += localClusterScore * seedA.count;

            // track how much the 2nd partner supports the 1st
            const depthRatio = best > 0 ? Math.min(1, second / best) : 0;
            totalDepth += depthRatio * seedA.count;
        });

        const avgCost = totalCards > 0 ? totalCost / totalCards : 0;
        const avgSparks = totalCards > 0 ? totalSparks / totalCards : 0;

        let costLabel = "Budget";
        if (avgSparks <= 250) costLabel = "Budget";
        else if (avgSparks <= 600) costLabel = "Moderate";
        else if (avgSparks <= 1400) costLabel = "Expensive";
        else costLabel = "P2W";

        // --- Synergy ---
        let synergyScore = 0;
        if (totalCards > 0 && seeds.length > 1) {
            const rawAvg = totalConnection / totalCards;
            const depthAvg = totalDepth / totalCards;

            synergyScore = Math.min(100, Math.round(rawAvg * 100));

            // Only the very top end is harder now
            // 100 requires stronger 2-level support
            if (synergyScore >= 98) {
                if (depthAvg < 0.55) synergyScore = 97;
                else if (depthAvg < 0.70) synergyScore = 98;
                else if (depthAvg < 0.85) synergyScore = 99;
                else synergyScore = 100;
            }

            if (totalCards < 6) {
                synergyScore = Math.round(synergyScore * (totalCards / 6));
            }
        } else if (totalCards === 1) {
            synergyScore = 5;
        }

        // --- Consistency ---
        let consistencyScore = 0;
        if (totalCards > 0 && seeds.length > 0) {
            let pts = 0;
            seeds.forEach(s => {
                if (s.count === 1) pts += 0;
                else if (s.count === 2) pts += 50;
                else if (s.count === 3) pts += 80;
                else if (s.count >= 4) pts += 100;
            });
            consistencyScore = Math.round(pts / seeds.length);
        }

        // --- Power (uses precomputed popularity) ---
        let powerScore = 0;
        if (totalCards > 0 && ctx.maxMetaCopies > 0) {
            let totalPowerPoints = 0;
            const curveFactor = 1;
            seeds.forEach(seed => {
                const metaCopies = ctx.cardPopularity[seed.name] || 0;
                const rawRatio = metaCopies / ctx.maxMetaCopies;
                totalPowerPoints += Math.pow(rawRatio, curveFactor) * 100 * seed.count;
            });
            powerScore = Math.min(100, Math.round((totalPowerPoints * 2.75) / totalCards));
        }

        // --- Curve health (full archetype envelope, like the live builder) ---
        let curveHealthText = "...";
        let curveNumeric = 55;

        if (totalCards >= 10) {
            const userShape = [
                curve[1] / totalCards, curve[2] / totalCards, curve[3] / totalCards,
                curve[4] / totalCards, curve[5] / totalCards, curve["6+"] / totalCards,
            ];

            const userSeedCounts = new Map();
            seeds.forEach(s => userSeedCounts.set(s.name, s.count));

            const dbComparisons = [];
            let exactCopyAdded = false; // Flag to track exact card-for-card matches

            for (const dbKey in ctx.dbDecks) {

                const db = ctx.dbDecks[dbKey];
                let overlap = 0;
                // iterate the smaller side
                const [a, b] = userSeedCounts.size < db.seedCounts.size
                    ? [userSeedCounts, db.seedCounts]
                    : [db.seedCounts, userSeedCounts];
                for (const [name, c] of a) {
                    const other = b.get(name);
                    if (other !== undefined) overlap += Math.min(c, other);
                }

                // EXACT CARD COPY RULE:
                // If the matched cards equal totalCards AND both decks have the exact same number of unique cards
                if (overlap === totalCards && userSeedCounts.size === db.seedCounts.size) {
                    if (exactCopyAdded) {
                        continue; // We already have our 1 exact copy, skip this one
                    }
                    exactCopyAdded = true;
                }

                if (overlap >= 6) dbComparisons.push({ overlap, shape: db.shape });
            }

            dbComparisons.sort((a, b) => b.overlap - a.overlap);

            let closestDecks = [];
            if (dbComparisons.length > 0) {
                const best = dbComparisons[0].overlap;
                closestDecks = dbComparisons.filter(d => d.overlap >= best * 0.85).slice(0, 10);
                if (closestDecks.length < 4 && dbComparisons.length >= 4) {
                    closestDecks = dbComparisons.slice(0, 4);
                }
            }

            if (closestDecks.length > 0) {
                let totalWeight = 0;
                closestDecks.forEach(d => totalWeight += d.overlap);

                const idealShape = [0, 0, 0, 0, 0, 0];
                closestDecks.forEach(d => {
                    const w = d.overlap / totalWeight;
                    for (let i = 0; i < 6; i++) idealShape[i] += d.shape[i] * w;
                });

                const tolerance = 0.05;
                let totalPenalty = 0;
                for (let i = 0; i < 6; i++) {
                    const diff = Math.abs(userShape[i] - idealShape[i]);
                    if (diff > tolerance) totalPenalty += diff - tolerance;
                }
                const deviationPercent = (totalPenalty / 6) * 100;

                if (deviationPercent <= 2.0) { curveHealthText = "Excellent"; curveNumeric = 100; }
                else if (deviationPercent <= 3.0) { curveHealthText = "Good"; curveNumeric = 80; }
                else if (deviationPercent <= 5.0) { curveHealthText = "Playable"; curveNumeric = 55; }
                else { curveHealthText = "Awkward"; curveNumeric = 20; }
            } else {
                curveHealthText = "Unique";
                curveNumeric = 65;
            }
        }

        // --- Verdict ---
        const base = (curveNumeric * 0.3) + (synergyScore * 0.35) + (powerScore * 0.3) + (consistencyScore * 0.05);
        const consistencyPenalty = consistencyScore < 70 ? (70 - consistencyScore) * 0.8 : 0;
        const overallPercent = Math.max(0, base - consistencyPenalty);
        const allTopTier = curveNumeric >= 87.5 && synergyScore >= 87.5 && consistencyScore >= 87.5 && powerScore >= 87.5;

        const { grade, gradeColor } = getVerdictGrade(overallPercent, allTopTier, totalCards);
        return { grade, gradeColor, score: overallPercent, costLabel, synergyScore, consistencyScore, powerScore, avgCost, curveHealthText, curve, avgSparks, curveNumeric };
    }
    window.getTopDecksByMonth = function (monthNumber, customCtx) {
        // Fallback to find fullDatabase in global scope if not explicitly passed
        const db = window.fullDatabase || (typeof fullDatabase !== 'undefined' ? fullDatabase : null);

        if (!db) {
            console.error("Error: 'fullDatabase' could not be found in the global scope. Please make sure it is defined.");
            return;
        }

        // Maps for dynamic logging and flexible regex generation
        const monthNames = {
            1: "January", 2: "February", 3: "March", 4: "April", 5: "May", 6: "June",
            7: "July", 8: "August", 9: "September", 10: "October", 11: "November", 12: "December"
        };

        const monthPatterns = {
            1: "jan(uary)?", 2: "feb(ruary)?", 3: "mar(ch)?", 4: "apr(il)?",
            5: "may", 6: "jun(e)?", 7: "jul(y)?", 8: "aug(ust)?",
            9: "sep(t(ember)?)?", 10: "oct(ober)?", 11: "nov(ember)?", 12: "dec(ember)?"
        };

        const targetMonthName = monthNames[monthNumber];
        const patternStr = monthPatterns[monthNumber];

        if (!targetMonthName) {
            console.error("Error: Invalid month number. Please provide a number between 1 (January) and 12 (December).");
            return;
        }

        // Dynamically construct the regex for the given month in 2026
        const dateRegex = new RegExp(`^${patternStr}\\s+\\d+,\\s+2026$`, "i");
        const compiledDecks = [];

        for (const deckKey in db) {
            if (!Object.prototype.hasOwnProperty.call(db, deckKey)) continue;

            const deck = db[deckKey];
            if (!deck.upload_date || !deck.cards) continue;

            // Filter strictly for the chosen month in 2026
            if (dateRegex.test(deck.upload_date.trim())) {
                try {
                    const activeCtx = customCtx || window.ctx || undefined;

                    // Run your scoring function
                    const verdict = getDeckVerdictFromCards(deck.cards, deckKey, activeCtx);

                    compiledDecks.push({
                        id: deckKey,
                        name: deck.name,
                        score: parseFloat(verdict.score.toFixed(2)),
                        grade: verdict.grade,
                        cost: verdict.costLabel,
                        synergy: verdict.synergyScore,
                        power: verdict.powerScore,
                        consistency: verdict.consistencyScore,
                        date: deck.upload_date,
                        author: deck.credit || "Unknown"
                    });
                } catch (error) {
                    console.warn(`Skipping deck ${deckKey} due to evaluation error:`, error);
                }
            }
        }

        // Sort descending by score
        compiledDecks.sort((a, b) => b.score - a.score);

        // Slice top 10
        const top10 = compiledDecks.slice(0, 10);

        // Display Results dynamically in console
        if (top10.length === 0) {
            console.log(`%c No decks found for ${targetMonthName} 2026.`, "color: #ff9900; font-weight: bold;");
        } else {
            console.log(`%c--- TOP 10 HIGHEST SCORING DECKS (${targetMonthName.toUpperCase()} 2026) ---`, "color: #00ffcc; font-weight: bold; font-size: 13px;");
            console.table(top10);
        }

        return top10;
    };
    window.getTopDecksForHero = function (targetHero, customCtx) {
        // Fallback lookups for databases in global scope
        const db = window.fullDatabase || (typeof fullDatabase !== 'undefined' ? fullDatabase : null);
        const cardDb = window.cardDatabase || (typeof cardDatabase !== 'undefined' ? cardDatabase : null);

        if (!db) {
            console.error("Error: 'fullDatabase' could not be found in the global scope.");
            return [];
        }
        if (!cardDb) {
            console.error("Error: 'cardDatabase' could not be found in the global scope.");
            return [];
        }
        if (!targetHero) {
            console.error("Error: You must provide a hero name (e.g., 'Rose', 'Rustbolt') as the first parameter.");
            return [];
        }

        const heroMap = {
            // Plants
            "Mega-Grow,Smarty": "Green Shadow",
            "Kabloom,Solar": "Solar Flare",
            "Guardian,Solar": "Wall-Knight",
            "Mega-Grow,Solar": "Chompzilla",
            "Guardian,Kabloom": "Spudow",
            "Guardian,Smarty": "Citron / Beta-Carrotina",
            "Guardian,Mega-Grow": "Grass Knuckles",
            "Kabloom,Smarty": "Nightcap",
            "Kabloom,Mega-Grow": "Captain Combustible",
            "Smarty,Solar": "Rose",

            // Zombies
            "Brainy,Sneaky": "Super Brainz / Huge-Gigantacus",
            "Beastly,Hearty": "The Smash",
            "Crazy,Sneaky": "Impfinity",
            "Brainy,Hearty": "Rustbolt",
            "Beastly,Crazy": "Electric Boogaloo",
            "Beastly,Sneaky": "Brain Freeze",
            "Brainy,Crazy": "Professor Brainstorm",
            "Beastly,Brainy": "Immorticia",
            "Crazy,Hearty": "Z-Mech",
            "Hearty,Sneaky": "Neptuna"
        };

        const normalizedTarget = targetHero.trim().toLowerCase();
        const matchingDecks = []; // Tracks all valid decks found for this hero
        const seenDecks = new Set(); // Tracks unique deck compositions

        for (const deckKey in db) {
            if (!Object.prototype.hasOwnProperty.call(db, deckKey)) continue;

            const deck = db[deckKey];
            if (!deck.upload_date || !deck.cards) continue;

            try {
                const activeCtx = customCtx || window.ctx || undefined;

                // Track unique classes found within this specific deck
                const uniqueClasses = new Set();

                for (const cardRaw of deck.cards) {
                    let parsedCardName = cardRaw.trim();

                    // Strip quantity prefix (e.g., "4x " or "x4 ")
                    const match = cardRaw.match(/^(\d+x?|x\d+)\s+(.+)$/i);
                    if (match) {
                        parsedCardName = match[2].trim();
                    }

                    // Create space and underscore variants to guarantee database hits
                    const keyWithUnderscores = parsedCardName.replace(/\s+/g, '_');
                    const keyWithSpaces = parsedCardName.replace(/_/g, ' ');

                    const cardData = cardDb[keyWithUnderscores] || cardDb[keyWithSpaces] || cardDb[parsedCardName];
                    if (cardData && cardData.Class) {
                        uniqueClasses.add(cardData.Class.trim());
                    }
                }

                // Alphabetize the unique classes found to flawlessly align with heroMap keys
                const classesArray = Array.from(uniqueClasses).sort();
                const classesKey = classesArray.join(',');

                const heroName = heroMap[classesKey];

                // If it doesn't match a valid two-class combo, skip it
                if (!heroName) continue;

                // Check if the current deck's hero matches the requested parameter
                if (!heroName.toLowerCase().includes(normalizedTarget)) continue;

                // Create a unique signature for the deck based on its cards
                const deckSignature = [...deck.cards]
                    .map(c => c.trim().toLowerCase().replace(/\s+/g, ' '))
                    .sort()
                    .join('|');

                // Prevent duplicate deck compositions from being evaluated
                if (seenDecks.has(deckSignature)) {
                    continue;
                }
                seenDecks.add(deckSignature);

                const verdict = getDeckVerdictFromCards(deck.cards, deckKey, activeCtx);
                const currentScore = parseFloat(verdict.score.toFixed(2));

                // Push every matching deck object into the list
                matchingDecks.push({
                    hero: heroName,
                    id: deckKey,
                    name: deck.name,
                    score: currentScore,
                    grade: verdict.grade,
                    cost: verdict.costLabel,
                    synergy: verdict.synergyScore,
                    power: verdict.powerScore,
                    consistency: verdict.consistencyScore,
                    date: deck.upload_date,
                    author: deck.credit || "Unknown",
                    cards: deck.cards
                });

            } catch (error) {
                console.warn(`Skipping deck ${deckKey} due to evaluation error:`, error);
            }
        }

        // Sort descending by score and slice the top 10 results
        const topDecksArray = matchingDecks
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        if (topDecksArray.length === 0) {
            console.log(`%c No valid decks found for hero: "${targetHero}".`, "color: #ff9900; font-weight: bold;");
        } else {
            console.log(`%c--- TOP ${topDecksArray.length} DECKS FOR ${targetHero.toUpperCase()} ---`, "color: #00ffcc; font-weight: bold; font-size: 13px;");

            // Map elements for console.table
            console.table(topDecksArray.map((d, index) => ({
                Rank: index + 1,
                Hero: d.hero,
                "Deck Name": d.name,
                Score: d.score,
                Grade: d.grade,
                Synergy: d.synergy,
                Power: d.power,
                Consistency: d.consistency,
                Author: d.author
            })));

            // Log out the full decklists with clean text separation
            console.log(`%c\n--- FULL DECKLIST BREAKDOWNS ---`, "color: #ffcc00; font-weight: bold; font-size: 13px;");

            topDecksArray.forEach((d, index) => {
                console.log(`%c#${index + 1} - ${d.hero}: ${d.name} (Score: ${d.score} | Grade: ${d.grade})`, "color: #ffffff; background: #1a2226; font-weight: bold; padding: 4px 8px; border-left: 4px solid #00ffcc; margin-top: 10px;");
                console.log(d.cards.join("\n"));
            });
        }

        return topDecksArray;
    };
    window.getTop10DecksForCard = function (targetCard, customCtx) {
        if (!targetCard || typeof targetCard !== 'string') {
            console.error("Error: Please provide a target card name as the first parameter (e.g., 'Teleport').");
            return [];
        }

        // Direct scope lookups since they are not attached to window
        const db = typeof fullDatabase !== 'undefined' ? fullDatabase : null;
        const cardDb = typeof cardDatabase !== 'undefined' ? cardDatabase : null;

        if (!db) {
            console.error("Error: 'fullDatabase' could not be found in the accessible scope.");
            return [];
        }
        if (!cardDb) {
            console.error("Error: 'cardDatabase' could not be found in the accessible scope.");
            return [];
        }

        const heroMap = {
            // Plants
            "Mega-Grow,Smarty": "Green Shadow",
            "Kabloom,Solar": "Solar Flare",
            "Guardian,Solar": "Wall-Knight",
            "Mega-Grow,Solar": "Chompzilla",
            "Guardian,Kabloom": "Spudow",
            "Guardian,Smarty": "Citron / Beta-Carrotina",
            "Guardian,Mega-Grow": "Grass Knuckles",
            "Kabloom,Smarty": "Nightcap",
            "Kabloom,Mega-Grow": "Captain Combustible",
            "Smarty,Solar": "Rose",

            // Zombies
            "Brainy,Sneaky": "Super Brainz / Huge-Gigantacus",
            "Beastly,Hearty": "The Smash",
            "Crazy,Sneaky": "Impfinity",
            "Brainy,Hearty": "Rustbolt",
            "Beastly,Crazy": "Electric Boogaloo",
            "Beastly,Sneaky": "Brain Freeze",
            "Brainy,Crazy": "Professor Brainstorm",
            "Beastly,Brainy": "Immorticia",
            "Crazy,Hearty": "Z-Mech",
            "Hearty,Sneaky": "Neptuna"
        };

        const cardDecks = [];
        const seenDecks = new Set();

        for (const deckKey in db) {
            if (!Object.prototype.hasOwnProperty.call(db, deckKey)) continue;

            const deck = db[deckKey];
            if (!deck.cards) continue;

            try {
                // Safe evaluation of the local ctx variable
                const activeCtx = customCtx || (typeof ctx !== 'undefined' ? ctx : undefined);

                const uniqueClasses = new Set();
                let containsTargetCard = false;

                for (const cardRaw of deck.cards) {
                    let parsedCardName = cardRaw.trim();

                    const match = cardRaw.match(/^(\d+x?|x\d+)\s+(.+)$/i);
                    if (match) {
                        parsedCardName = match[2].trim();
                    }

                    if (parsedCardName.toLowerCase().includes(targetCard.toLowerCase().trim())) {
                        containsTargetCard = true;
                    }

                    const keyWithUnderscores = parsedCardName.replace(/\s+/g, '_');
                    const keyWithSpaces = parsedCardName.replace(/_/g, ' ');

                    const cardData = cardDb[keyWithUnderscores] || cardDb[keyWithSpaces] || cardDb[parsedCardName];
                    if (cardData && cardData.Class) {
                        uniqueClasses.add(cardData.Class.trim());
                    }
                }

                if (!containsTargetCard) {
                    continue;
                }

                const classesArray = Array.from(uniqueClasses).sort();
                const classesKey = classesArray.join(',');

                const heroName = heroMap[classesKey] || "Unknown Hero";

                const deckSignature = [...deck.cards]
                    .map(c => c.trim().toLowerCase().replace(/\s+/g, ' '))
                    .sort()
                    .join('|');

                if (seenDecks.has(deckSignature)) {
                    continue;
                }

                seenDecks.add(deckSignature);

                // Dynamically check for the function in the local scope, falling back to window if needed
                let verdict;
                if (typeof getDeckVerdictFromCards === 'function') {
                    verdict = getDeckVerdictFromCards(deck.cards, deckKey, activeCtx);
                } else {
                    throw new Error("getDeckVerdictFromCards could not be found in the current scope.");
                }

                const currentScore = verdict.score;

                cardDecks.push({
                    hero: heroName,
                    id: deckKey,
                    name: deck.name || "Unnamed Deck",
                    score: parseFloat(currentScore.toFixed(2)),
                    grade: verdict.grade,
                    cost: verdict.costLabel,
                    synergy: verdict.synergyScore,
                    power: verdict.powerScore,
                    consistency: verdict.consistencyScore,
                    date: deck.upload_date || "Unknown Date",
                    author: deck.credit || "Unknown",
                    cards: deck.cards
                });

            } catch (error) {
                console.warn(`Skipping deck ${deckKey} due to evaluation error:`, error);
            }
        }

        cardDecks.sort((a, b) => b.score - a.score);
        const top10Decks = cardDecks.slice(0, 10);

        if (top10Decks.length === 0) {
            console.log(`%c No valid decks found containing the card "${targetCard}".`, "color: #ff9900; font-weight: bold;");
        } else {
            console.log(`%c--- TOP ${top10Decks.length} DECKS CONTAINING "${targetCard.toUpperCase()}" (ALL TIME) ---`, "color: #00ffcc; font-weight: bold; font-size: 13px;");

            console.table(top10Decks.map(d => ({
                "Hero": d.hero,
                "Deck Name": d.name,
                "Score": d.score,
                "Grade": d.grade,
                "Synergy": d.synergy,
                "Power": d.power,
                "Consistency": d.consistency,
                "Year": d.date.split(' ').pop() || d.date,
                "Author": d.author
            })));

            console.log(`%c\n--- FULL DECKLIST BREAKDOWNS ---`, "color: #ffcc00; font-weight: bold; font-size: 13px;");

            top10Decks.forEach((d, index) => {
                console.log(`%c#${index + 1}: ${d.name} | Hero: ${d.hero} (Score: ${d.score} | Grade: ${d.grade})`, "color: #ffffff; background: #1a2226; font-weight: bold; padding: 4px 8px; border-left: 4px solid #00ffcc; margin-top: 10px;");
                console.log(d.cards.join("\n"));
            });
        }

        return top10Decks;
    };
    window.getTop10BudgetDecks = function (customCtx) {
        // Safe lookup for variables not explicitly attached to window
        const db = typeof fullDatabase !== 'undefined' ? fullDatabase : null;
        const cardDb = typeof cardDatabase !== 'undefined' ? cardDatabase : null;

        if (!db) {
            console.error("Error: 'fullDatabase' could not be found in the accessible scope.");
            return [];
        }
        if (!cardDb) {
            console.error("Error: 'cardDatabase' could not be found in the accessible scope.");
            return [];
        }

        const heroMap = {
            // Plants
            "Mega-Grow,Smarty": "Green Shadow",
            "Kabloom,Solar": "Solar Flare",
            "Guardian,Solar": "Wall-Knight",
            "Mega-Grow,Solar": "Chompzilla",
            "Guardian,Kabloom": "Spudow",
            "Guardian,Smarty": "Citron / Beta-Carrotina",
            "Guardian,Mega-Grow": "Grass Knuckles",
            "Kabloom,Smarty": "Nightcap",
            "Kabloom,Mega-Grow": "Captain Combustible",
            "Smarty,Solar": "Rose",

            // Zombies
            "Brainy,Sneaky": "Super Brainz / Huge-Gigantacus",
            "Beastly,Hearty": "The Smash",
            "Crazy,Sneaky": "Impfinity",
            "Brainy,Hearty": "Rustbolt",
            "Beastly,Crazy": "Electric Boogaloo",
            "Beastly,Sneaky": "Brain Freeze",
            "Brainy,Crazy": "Professor Brainstorm",
            "Beastly,Brainy": "Immorticia",
            "Crazy,Hearty": "Z-Mech",
            "Hearty,Sneaky": "Neptuna"
        };

        const sparkCosts = {
            "common": 0,
            "uncommon": 50,
            "rare": 250,
            "super rare": 1000,
            "super-rare": 1000,
            "event": 1000,
            "legendary": 4000
        };

        const compiledDecks = [];
        const seenDecks = new Set();

        for (const deckKey in db) {
            if (!Object.prototype.hasOwnProperty.call(db, deckKey)) continue;

            const deck = db[deckKey];
            if (!deck.cards || !Array.isArray(deck.cards)) continue;

            try {
                const activeCtx = customCtx || (typeof ctx !== 'undefined' ? ctx : undefined);
                const uniqueClasses = new Set();
                let totalSparks = 0;

                for (const cardRaw of deck.cards) {
                    let parsedCardName = cardRaw.trim();
                    let quantity = 1;

                    // Robust format checker matching your structural example: "4x", "4", or "x4"
                    const match = cardRaw.match(/^(\d+x?|x\d+)\s+(.+)$/i);
                    if (match) {
                        quantity = parseInt(match[1].replace(/x/i, ''), 10) || 1;
                        parsedCardName = match[2].trim();
                    }

                    // Database formatting clean-up keys
                    const keyWithUnderscores = parsedCardName.replace(/\s+/g, '_');
                    const keyWithSpaces = parsedCardName.replace(/_/g, ' ');

                    const cardData = cardDb[keyWithUnderscores] || cardDb[keyWithSpaces] || cardDb[parsedCardName];

                    if (cardData) {
                        if (cardData.Rarity) {
                            const rarity = cardData.Rarity.toLowerCase().trim();
                            totalSparks += (sparkCosts[rarity] || 0) * quantity;
                        }
                        if (cardData.Class) {
                            uniqueClasses.add(cardData.Class.trim());
                        }
                    }
                }

                // Filter: Enforce budget cutoff limit (< 40000 sparks)
                if (totalSparks >= 20000) {
                    continue;
                }

                // Unique deck deduplication signature logic
                const deckSignature = [...deck.cards]
                    .map(c => c.trim().toLowerCase().replace(/\s+/g, ' '))
                    .sort()
                    .join('|');

                if (seenDecks.has(deckSignature)) {
                    continue;
                }
                seenDecks.add(deckSignature);

                // Determine Hero via Classes mapping
                const classesArray = Array.from(uniqueClasses).sort();
                const classesKey = classesArray.join(',');
                const heroName = heroMap[classesKey] || "Unknown Hero";

                // Evaluate Deck Score
                let verdict;
                if (typeof getDeckVerdictFromCards === 'function') {
                    verdict = getDeckVerdictFromCards(deck.cards, deckKey, activeCtx);
                } else {
                    throw new Error("getDeckVerdictFromCards could not be found in the current scope.");
                }

                compiledDecks.push({
                    hero: heroName,
                    id: deckKey,
                    name: deck.name || "Unnamed Deck",
                    sparks: totalSparks,
                    score: parseFloat(verdict.score.toFixed(2)),
                    grade: verdict.grade,
                    cost: verdict.costLabel,
                    synergy: verdict.synergyScore,
                    power: verdict.powerScore,
                    consistency: verdict.consistencyScore,
                    date: deck.upload_date || "Unknown Date",
                    author: deck.credit || "Unknown",
                    cards: deck.cards
                });

            } catch (error) {
                console.warn(`Skipping deck ${deckKey} due to evaluation error:`, error);
            }
        }

        // Sort descending by score
        compiledDecks.sort((a, b) => b.score - a.score);
        const top10Budget = compiledDecks.slice(0, 10);

        // Logging output configurations
        if (top10Budget.length === 0) {
            console.log("%c No valid budget decks (under 40,000 sparks) found.", "color: #ff9900; font-weight: bold;");
        } else {
            console.log(`%c--- TOP ${top10Budget.length} HIGHEST SCORING BUDGET DECKS (ALL TIME) ---`, "color: #00ffcc; font-weight: bold; font-size: 13px;");

            // Clean high-level table rendering
            console.table(top10Budget.map(d => ({
                "Hero": d.hero,
                "Deck Name": d.name,
                "Sparks": d.sparks,
                "Score": d.score,
                "Grade": d.grade,
                "Synergy": d.synergy,
                "Power": d.power,
                "Consistency": d.consistency,
                "Year": d.date.split(' ').pop() || d.date,
                "Author": d.author
            })));

            // Print raw vertical decklist breakdown lists down the log stack
            console.log(`%c\n--- FULL DECKLIST BREAKDOWNS ---`, "color: #ffcc00; font-weight: bold; font-size: 13px;");

            top10Budget.forEach((d, index) => {
                console.log(`%c#${index + 1}: ${d.name} | Hero: ${d.hero} (Sparks: ${d.sparks} | Score: ${d.score} | Grade: ${d.grade})`, "color: #ffffff; background: #1a2226; font-weight: bold; padding: 4px 8px; border-left: 4px solid #00ffcc; margin-top: 10px;");
                console.log(d.cards.join("\n"));
            });
        }

        return top10Budget;
    };
    window.synthesizeSuperOriginalSTierDeck = async function (iterations = 50000, customCtx) {
        const db = typeof fullDatabase !== 'undefined' ? fullDatabase : null;
        const cardDb = typeof cardDatabase !== 'undefined' ? cardDatabase : null;

        if (!db || !cardDb) {
            console.error("Error: Missing database scope.");
            return;
        }

        const activeCtx = customCtx || (typeof ctx !== 'undefined' ? ctx : undefined);
        console.log(`%c[Initialization] Prepping high-speed evolutionary synthesizer for ${iterations} iterations...`, "color: #00ffcc");

        // --- STEP 1: Parse DB for Jaccard baselines ---
        const allDbSets = [];
        const seedDecks = [];

        const parseCardName = (raw) => {
            const match = raw.match(/^(\d+x?|x\d+)\s+(.+)$/i);
            return match ? match[2].trim() : raw.trim();
        };

        for (const key in db) {
            if (!db[key].cards) continue;
            const cardSet = new Set(db[key].cards.map(c => parseCardName(c).toLowerCase()));
            allDbSets.push(cardSet);

            try {
                const verdict = getDeckVerdictFromCards(db[key].cards, key, activeCtx);
                if (verdict.grade === 'S') seedDecks.push(db[key].cards);
            } catch (e) { }
        }

        const getSimilarity = (testSet) => {
            let maxSim = 0;
            for (const dbSet of allDbSets) {
                let intersection = 0;
                for (const item of testSet) {
                    // LOWERCASE the item before checking the set!
                    if (dbSet.has(item.toLowerCase())) intersection++;
                }
                const union = testSet.size + dbSet.size - intersection;
                const sim = union === 0 ? 0 : intersection / union;
                if (sim > maxSim) maxSim = sim;
            }
            return maxSim;
        };

        // --- STEP 2: Build Hero Pools ---
        const classPools = {};
        for (const key in cardDb) {
            const card = cardDb[key];
            if (!classPools[card.Class]) classPools[card.Class] = [];
            classPools[card.Class].push(card.Name);
        }

        const HERO_COMBOS = [
            "Mega-Grow,Smarty", "Kabloom,Solar", "Guardian,Solar", "Mega-Grow,Solar", "Guardian,Kabloom",
            "Guardian,Smarty", "Guardian,Mega-Grow", "Kabloom,Smarty", "Kabloom,Mega-Grow", "Smarty,Solar",
            "Brainy,Sneaky", "Beastly,Hearty", "Crazy,Sneaky", "Brainy,Hearty", "Beastly,Crazy",
            "Beastly,Sneaky", "Brainy,Crazy", "Beastly,Brainy", "Crazy,Hearty", "Hearty,Sneaky"
        ];

        const heroMap = {
            "Mega-Grow,Smarty": "Green Shadow", "Kabloom,Solar": "Solar Flare",
            "Guardian,Solar": "Wall-Knight", "Mega-Grow,Solar": "Chompzilla",
            "Guardian,Kabloom": "Spudow", "Guardian,Smarty": "Citron / Beta-Carrotina",
            "Guardian,Mega-Grow": "Grass Knuckles", "Kabloom,Smarty": "Nightcap",
            "Kabloom,Mega-Grow": "Captain Combustible", "Smarty,Solar": "Rose",
            "Brainy,Sneaky": "Super Brainz / Huge-Gigantacus", "Beastly,Hearty": "The Smash",
            "Crazy,Sneaky": "Impfinity", "Brainy,Hearty": "Rustbolt",
            "Beastly,Crazy": "Electric Boogaloo", "Beastly,Sneaky": "Brain Freeze",
            "Brainy,Crazy": "Professor Brainstorm", "Beastly,Brainy": "Immorticia",
            "Crazy,Hearty": "Z-Mech", "Hearty,Sneaky": "Neptuna"
        };

        const DISTRIBUTIONS = [
            [4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
            [4, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3],
            [4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3],
            [4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
        ];

        let globalBestDeck = null;
        let globalBestOriginality = -1;
        let globalBestScore = 0;
        let globalBestHero = "";

        const RUNS = Math.max(5, Math.floor(iterations / 2000));
        const STEPS_PER_RUN = Math.floor(iterations / RUNS);

        console.log(`%c[Search Config] Running ${RUNS} independent evolutionary branches. (${STEPS_PER_RUN} mutations per branch).`, "color: #ff9900");

        for (let run = 0; run < RUNS; run++) {
            await new Promise(r => setTimeout(r, 10)); // Keep UI responsive

            const heroCombo = HERO_COMBOS[Math.floor(Math.random() * HERO_COMBOS.length)];
            const classes = heroCombo.split(',');
            const validPool = [...new Set([...(classPools[classes[0]] || []), ...(classPools[classes[1]] || [])])];

            const dist = DISTRIBUTIONS[Math.floor(Math.random() * DISTRIBUTIONS.length)];
            if (validPool.length < dist.length) {
                console.log(`[Progress] Branch ${run + 1}/${RUNS} skipped (insufficient card pool)...`);
                continue;
            }

            let currentDeckSlots = [];
            let usedCards = new Set();

            let isSeeded = (Math.random() > 0.5 && seedDecks.length > 0);
            if (isSeeded) {
                const seed = seedDecks[Math.floor(Math.random() * seedDecks.length)];
                const seedUnique = seed.map(c => parseCardName(c));
                for (let i = 0; i < dist.length; i++) {
                    let cardName = seedUnique[i] && validPool.includes(seedUnique[i]) ? seedUnique[i] : null;
                    if (!cardName || usedCards.has(cardName)) {
                        const available = validPool.filter(c => !usedCards.has(c));
                        if (available.length === 0) break;
                        cardName = available[Math.floor(Math.random() * available.length)];
                    }
                    usedCards.add(cardName);
                    currentDeckSlots.push({ name: cardName, count: dist[i] });
                }
            } else {
                for (let count of dist) {
                    const available = validPool.filter(c => !usedCards.has(c));
                    if (available.length === 0) break;
                    let cardName = available[Math.floor(Math.random() * available.length)];
                    usedCards.add(cardName);
                    currentDeckSlots.push({ name: cardName, count: count });
                }
            }

            if (currentDeckSlots.length < dist.length) {
                console.log(`[Progress] Branch ${run + 1}/${RUNS} failed to build seed, skipping...`);
                continue;
            }

            let currentScore = 0;
            let isCurrentlySTier = false;
            let currentOriginality = -1;

            const initialArr = currentDeckSlots.map(s => `x${s.count} ${s.name}`);
            try {
                const verdict = getDeckVerdictFromCards(initialArr, "synth", activeCtx);
                currentScore = verdict.score;
                isCurrentlySTier = (verdict.grade === 'S');
                if (isCurrentlySTier) {
                    currentOriginality = 1 - getSimilarity(usedCards);
                }
            } catch (e) { }

            // --- The Climbing Loop ---
            for (let step = 0; step < STEPS_PER_RUN; step++) {
                if (step % 500 === 0) await new Promise(r => setTimeout(r, 0));

                const availableCards = validPool.filter(c => !usedCards.has(c));
                if (availableCards.length === 0) break;

                const swapIndex = Math.floor(Math.random() * currentDeckSlots.length);
                const oldCard = currentDeckSlots[swapIndex].name;
                const newCard = availableCards[Math.floor(Math.random() * availableCards.length)];

                currentDeckSlots[swapIndex].name = newCard;
                usedCards.delete(oldCard);
                usedCards.add(newCard);

                const testArr = currentDeckSlots.map(s => `x${s.count} ${s.name}`);
                try {
                    const verdict = getDeckVerdictFromCards(testArr, "synth", activeCtx);
                    const isTestSTier = (verdict.grade === 'S');
                    let keepMutation = false;

                    if (!isCurrentlySTier) {
                        if (verdict.score > currentScore) keepMutation = true;
                    } else {
                        if (isTestSTier) {
                            const testOriginality = 1 - getSimilarity(usedCards);

                            if (testOriginality > currentOriginality) {
                                keepMutation = true;
                            } else if (testOriginality === currentOriginality) {
                                // The missing logic! Climb score even if originality is maxed out.
                                if (verdict.score > currentScore) keepMutation = true;
                                else if (Math.random() < 0.5) keepMutation = true;
                            }
                        }
                    }

                    if (keepMutation) {
                        currentScore = verdict.score;
                        isCurrentlySTier = isTestSTier;
                        if (isCurrentlySTier) currentOriginality = 1 - getSimilarity(usedCards);

                        // Check for Global Record (Originality first, then Score tie-breaker)
                        let isNewRecord = false;
                        if (isCurrentlySTier) {
                            if (currentOriginality > globalBestOriginality) {
                                isNewRecord = true;
                            } else if (currentOriginality === globalBestOriginality && currentScore > globalBestScore) {
                                isNewRecord = true;
                            }
                        }

                        if (isNewRecord) {
                            globalBestOriginality = currentOriginality;
                            globalBestDeck = [...testArr];
                            globalBestScore = currentScore;
                            globalBestHero = heroMap[heroCombo];
                            console.log(`[New Record] Originality: ${(currentOriginality * 100).toFixed(1)}% | Score: ${globalBestScore.toFixed(2)} | Hero: ${globalBestHero}`);
                        }
                    } else {
                        currentDeckSlots[swapIndex].name = oldCard;
                        usedCards.delete(newCard);
                        usedCards.add(oldCard);
                    }
                } catch (e) {
                    currentDeckSlots[swapIndex].name = oldCard;
                    usedCards.delete(newCard);
                    usedCards.add(oldCard);
                }
            }
            console.log(`%c[Progress] Branch ${run + 1}/${RUNS} completed.`, "color: #888;");
        }

        if (!globalBestDeck) {
            console.error("Failed to synthesize an S-tier deck. Try increasing iterations.");
            return null;
        }

        console.log(`%c--- SYNTHESIS COMPLETE ---`, "color: #00ffcc; font-weight: bold; font-size: 14px;");
        console.log(`%cSUPER ORIGINAL S-TIER DECK FOUND!`, "color: #ffffff; background: #1a2226; padding: 4px; border-left: 4px solid #00ffcc;");
        console.log(`Originality Score: ${(globalBestOriginality * 100).toFixed(1)}%`);
        console.log(`Evaluation Score: ${globalBestScore.toFixed(2)}`);
        console.log(`Hero: ${globalBestHero}`);
        console.log(`\nDecklist:\n` + globalBestDeck.sort().join('\n'));

        return {
            cards: globalBestDeck,
            originalityScore: (globalBestOriginality * 100).toFixed(1),
            hero: globalBestHero
        };
    };

    function pvzBuildAnalyzeDeck(deckInfo) {
        return (deckInfo.cards || []).map(cardRaw => {
            const raw = String(cardRaw).trim();

            // Supports: "x4 Card Name", "4x Card Name", "4 Card Name", or just "Card Name"
            const countMatch = raw.match(/^\s*(?:x(\d+)|(\d+)x|(\d+))\s+/i);
            const count = countMatch
                ? Number(countMatch[1] || countMatch[2] || countMatch[3])
                : 4;

            const cleanName = raw
                .replace(/^[^a-zA-Z]*(x?\d+|\d+x|\d+)\s*/i, '')
                .trim();

            const underscoreName = cleanName.replace(/\s+/g, '_');
            const spaceName = cleanName.replace(/_/g, ' ');

            let finalName = underscoreName;

            if (cardDatabase[underscoreName]) {
                finalName = underscoreName;
            } else if (cardDatabase[cleanName]) {
                finalName = cleanName;
            } else if (cardDatabase[spaceName]) {
                finalName = spaceName;
            }

            return {
                name: finalName,
                count
            };
        });
    }
    let pvzAutoOpenDone = false;

    // Order-independent canonical form so card order in the code doesn't matter.
    function pvzCanonicalizeDeckCode(code) {
        if (!code) return '';
        return code.split('-').map(t => t.trim()).filter(Boolean).sort().join('-');
    }

    function pvzFindTileEl(deckKey, fallbackIndex) {
        const safe = (window.CSS && CSS.escape) ? CSS.escape(deckKey) : deckKey;
        const tile =
            deckGrid.querySelector(`[data-deck-key="${safe}"]`) ||
            deckGrid.querySelector(`[data-key="${safe}"]`) ||
            deckGrid.querySelector(`[data-deck="${safe}"]`);
        // Tiles are appended in pvzDeckCache key order, so position is a safe fallback.
        return tile || deckGrid.children[fallbackIndex] || null;
    }

    function pvzOpenDeckFromUrl() {
        const hash = (window.location.hash || '').replace(/^#/, '').trim();
        if (hash !== '') return;

        const targetCode = new URLSearchParams(window.location.search).get('deck');
        if (!targetCode) return;

        const target = pvzCanonicalizeDeckCode(targetCode);
        if (!target) return;

        if (typeof cardDatabase === 'undefined' || typeof pvzBuildAnalyzeDeck !== 'function') return;

        // Build the dictionary + lookup map ONCE (the analyze button rebuilds it per click).
        const cardDictionary = Object.keys(cardDatabase).sort();
        const indexMap = new Map();
        cardDictionary.forEach((name, i) => indexMap.set(name, i));

        const encode = (deckInfo) => {
            const deck = pvzBuildAnalyzeDeck(deckInfo);
            const tokens = [];
            for (const card of deck) {
                const index = indexMap.get(card.name);
                if (index === undefined) return null;            // unknown card -> can't match
                const cardIndex = index.toString(36);
                tokens.push(card.count === 4 ? cardIndex : `${cardIndex}.${card.count}`);
            }
            return tokens.join('-');
        };

        const keys = Object.keys(pvzDeckCache);
        let fallbackKey = null, fallbackIdx = -1;

        for (let i = 0; i < keys.length; i++) {
            const deckKey = keys[i];
            const rd = pvzDeckCache[deckKey];
            if (!rd || !rd.deckInfo) continue;

            const code = encode(rd.deckInfo);
            if (!code || pvzCanonicalizeDeckCode(code) !== target) continue;

            // Prefer the "real" deck if the same list exists more than once.
            if (!rd.isDup) {
                pvzOpenSheet(deckKey, pvzFindTileEl(deckKey, i));
                return;
            }
            if (fallbackKey === null) { fallbackKey = deckKey; fallbackIdx = i; }
        }

        if (fallbackKey !== null) {
            pvzOpenSheet(fallbackKey, pvzFindTileEl(fallbackKey, fallbackIdx));
        } else {
            console.warn('[pvz] No deck matched the URL deck code:', targetCode);
        }
    }
    let pvzDeckCache = {};     // deckKey -> data the sheet needs (rebuilt each render)
    let pvzActiveTile = null;  // the tile we opened from, so we can fly back on close
    const PVZ_TOUCH_DEVICE = window.matchMedia('(hover:none), (pointer:coarse)').matches;
    const PVZ_RENDER_BATCH_SIZE = PVZ_TOUCH_DEVICE ? 70 : 220;
    const PVZ_REVEAL_LIMIT = PVZ_TOUCH_DEVICE ? 48 : 120;

    let pvzRenderToken = 0;
    const pvzDeckRenderMetaCache = new Map();

    function pvzWaitFrame() {
        return new Promise(resolve => requestAnimationFrame(resolve));
    }

    function pvzCleanCardName(cardRaw) {
        return cardRaw.replace(/^[^a-zA-Z]*(x?\d+|\d+x)\s*/i, '').trim();
    }

    function pvzDeckMetaCacheKey(deckInfo) {
        return [
            (deckInfo.cards || []).join('\u0001'),
            deckInfo.upload_date || '',
            deckInfo.credit || '',
            deckInfo.name || ''
        ].join('\u0002');
    }

    function pvzGetCachedDeckMeta(deckKey, deckInfo, ctx) {
        const cacheKey = pvzDeckMetaCacheKey(deckInfo);
        const cached = pvzDeckRenderMetaCache.get(deckKey);

        if (cached && cached.cacheKey === cacheKey) {
            return cached.meta;
        }

        const cards = deckInfo.cards || [];

        let factionClass = 'plant-deck';
        const uniqueClasses = new Set();
        let factionFound = false;

        for (const cardRaw of cards) {
            const parsed = pvzCleanCardName(cardRaw);
            const cardData =
                cardDatabase[parsed.replace(/ /g, '_')] ||
                cardDatabase[parsed.replace(/_/g, ' ')];

            if (!cardData) continue;

            const cls = cardData.Class || cardData.class;
            if (cls) uniqueClasses.add(cls);

            if (!factionFound && (cardData.Type || cardData.type)) {
                const t = (cardData.Type || cardData.type).toLowerCase();

                if (t.includes('zombie')) {
                    factionClass = 'zombie-deck';
                    factionFound = true;
                } else if (t.includes('plant')) {
                    factionClass = 'plant-deck';
                    factionFound = true;
                }
            }
        }

        let heroes = [];

        if (uniqueClasses.size === 2) {
            const ca = Array.from(uniqueClasses);
            const heroName = heroMap[`${ca[0]},${ca[1]}`] || heroMap[`${ca[1]},${ca[0]}`];

            if (heroName) {
                heroes = heroName.split(/\s*\/\s*/).map(n => ({
                    name: n,
                    img: `hero_images/${n.replace(/[\s-]+/g, '_')}.webp`
                }));
            }
        } else if (uniqueClasses.size === 1) {
            const singleClass = Array.from(uniqueClasses)[0];

            heroes = [{
                name: singleClass,
                img: `hero_images/${singleClass.toLowerCase().replace(/[\s-]+/g, '_')}.webp`
            }];
        }

        const verdict =
            deckInfo.verdict ||
            (deckInfo.verdict = getDeckVerdictFromCards(cards, deckKey, ctx));

        deckInfo.verdict = verdict;

        const dateStr =
            deckInfo.upload_date && deckInfo.upload_date !== "UNKNOWN_DATE"
                ? deckInfo.upload_date
                : "Unknown Date";

        const creditStr = deckInfo.credit || "Unknown";
        const creditIcon = creditStr === "FryEmUp" ? "fryemup.jpg" : "discord.webp";

        let dateVal = 0;
        if (deckInfo.upload_date && deckInfo.upload_date !== "UNKNOWN_DATE") {
            const parsed = Date.parse(deckInfo.upload_date);
            if (!isNaN(parsed)) dateVal = parsed;
        }

        const signature = cards
            .map(c => c.replace(/_/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase())
            .sort()
            .join('|');

        const meta = {
            deckInfo,
            factionClass,
            heroes,
            verdict,
            dateStr,
            creditStr,
            creditIcon,
            dateVal,
            signature
        };

        pvzDeckRenderMetaCache.set(deckKey, { cacheKey, meta });
        return meta;
    }

    function pvzCreateDeckTile(deckKey, rd, isDup, isStarred, cardIndex) {
        const { deckInfo, factionClass, heroes, verdict, creditStr, creditIcon } = rd;

        const tile = document.createElement('div');
        tile.className = `deck-card ${factionClass}`;
        tile.dataset.deckKey = deckKey;
        tile.tabIndex = 0;
        tile.setAttribute('role', 'button');
        tile.setAttribute('aria-label', `Open ${deckInfo.name}`);

        const revealDelay = cardIndex < PVZ_REVEAL_LIMIT
            ? Math.min(cardIndex * 8, 600)
            : 0;

        tile.style.setProperty('--reveal-delay', `${revealDelay}ms`);

        tile.innerHTML = `
    <div class="pvz-tile-inner">
      <div class="pvz-tile-wash"></div>
      <div class="pvz-tile-heroes ${heroes.length === 2 ? 'two' : ''}">
        ${pvzHeroPortraits(heroes)}
      </div>
      <div class="pvz-grade-seal" style="color:${verdict.gradeColor || '#15140d'}">
        ${verdict.grade || '?'}
      </div>
      ${isDup ? `<span class="deck-duplicate-badge" title="Older duplicate">Dup</span>` : ''}
      <button class="deck-star-btn ${isStarred ? 'starred' : ''}" data-deck="${deckKey}" aria-label="Star deck">
        <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
      </button>
      <div class="pvz-tile-foot">
        <p class="pvz-tile-name">${deckInfo.name}</p>
        <span class="pvz-tile-credit">
          <img src="${creditIcon}" alt="" loading="lazy" decoding="async" fetchpriority="low">${creditStr}
        </span>
      </div>
    </div>`;

        return tile;
    }
    function renderDecks(data) {
        const loadingIndicator = document.getElementById('loadingIndicator');
        const thisRenderToken = ++pvzRenderToken;

        if (loadingIndicator) loadingIndicator.classList.remove('hidden');

        deckGrid.classList.add('hidden');

        if (statsBtn) statsBtn.disabled = true;
        if (guidesBtn) guidesBtn.disabled = true;
        if (crafterBtn) crafterBtn.disabled = true;
        if (gamesBtn) gamesBtn.disabled = true;
        if (tiersBtn) tiersBtn.disabled = true;

        setTimeout(async () => {
            if (thisRenderToken !== pvzRenderToken) return;

            deckGrid.innerHTML = '';
            pvzDeckCache = {};

            const ctx = getVerdictContext();
            const starredDecks = JSON.parse(localStorage.getItem('pvz_starred_decks') || '{}');

            const entries = Object.entries(data);
            const prepared = [];

            const signatureMap = new Map();

            for (const [deckKey, deckInfo] of entries) {
                const rd = pvzGetCachedDeckMeta(deckKey, deckInfo, ctx);
                prepared.push([deckKey, rd]);

                if (!signatureMap.has(rd.signature)) {
                    signatureMap.set(rd.signature, []);
                }

                signatureMap.get(rd.signature).push({
                    key: deckKey,
                    dateVal: rd.dateVal
                });
            }

            const duplicateKeys = new Set();

            for (const decks of signatureMap.values()) {
                if (decks.length > 1) {
                    decks.sort((a, b) => b.dateVal - a.dateVal);

                    for (let i = 1; i < decks.length; i++) {
                        duplicateKeys.add(decks[i].key);
                    }
                }
            }

            let cardIndex = 0;

            for (let start = 0; start < prepared.length; start += PVZ_RENDER_BATCH_SIZE) {
                if (thisRenderToken !== pvzRenderToken) return;

                const fragment = document.createDocumentFragment();
                const end = Math.min(start + PVZ_RENDER_BATCH_SIZE, prepared.length);

                for (let i = start; i < end; i++) {
                    const [deckKey, rd] = prepared[i];

                    const isDup = duplicateKeys.has(deckKey);
                    const isStarred = starredDecks[deckKey] === true;

                    pvzDeckCache[deckKey] = {
                        ...rd,
                        isDup
                    };

                    fragment.appendChild(
                        pvzCreateDeckTile(deckKey, rd, isDup, isStarred, cardIndex)
                    );

                    cardIndex++;
                }

                deckGrid.appendChild(fragment);

                // Yield to the browser so phones do not freeze during huge renders.
                await pvzWaitFrame();
            }

            if (thisRenderToken !== pvzRenderToken) return;

            if (loadingIndicator) loadingIndicator.classList.add('hidden');

            deckGrid.classList.remove('hidden');

            if (statsBtn) statsBtn.disabled = false;
            if (guidesBtn) guidesBtn.disabled = false;
            if (tiersBtn) tiersBtn.disabled = false;
            if (crafterBtn) crafterBtn.disabled = false;
            if (gamesBtn) gamesBtn.disabled = false;

            pvzBindGrid();
            // Auto-open a deck when the page is loaded with ?deck=... and NOT #crafter
            if (!pvzAutoOpenDone) {
                pvzAutoOpenDone = true;
                pvzOpenDeckFromUrl();
            }
        }, 50);
    }

    function pvzHeroPortraits(heroes, eager = false) {
        if (!heroes.length) {
            return `<div class="pvz-hero-portrait" aria-hidden="true">?</div>`;
        }

        const loading = eager ? 'eager' : 'lazy';
        const priority = eager ? 'high' : 'low';

        return heroes.map(h => {
            const initials = h.name
                .split(/[\s-]+/)
                .map(w => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();

            return `<div class="pvz-hero-portrait" title="${h.name}">
        <img src="${h.img}" alt="${h.name}" loading="${loading}" decoding="async" fetchpriority="${priority}" onerror="this.remove()">${initials}
      </div>`;
        }).join('');
    }

    /* one delegated handler for opening the sheet — bound once */
    function pvzBindGrid() {
        const grid = document.getElementById('deckGrid');
        if (grid.dataset.pvzBound) return;     // don't double-bind on re-render
        grid.dataset.pvzBound = '1';

        grid.addEventListener('click', (e) => {
            // let your existing star handler deal with stars; ignore them here
            if (e.target.closest('.deck-star-btn')) return;
            const tile = e.target.closest('.deck-card');
            if (tile) pvzOpenSheet(tile.dataset.deckKey, tile);
        });

        grid.addEventListener('keydown', (e) => {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            if (e.target.closest('.deck-star-btn')) return;
            const tile = e.target.closest('.deck-card');
            if (tile) { e.preventDefault(); pvzOpenSheet(tile.dataset.deckKey, tile); }
        });
    }
    /* ---------- OPEN: fly from the tile to center, then the deck unfolds ---------- */
    function pvzOpenSheet(deckKey, tileEl) {
        const rd = pvzDeckCache[deckKey];
        if (!rd) return;
        pvzActiveTile = tileEl;
        const { deckInfo, factionClass, heroes, verdict, dateStr, creditStr, creditIcon, isDup } = rd;

        // 1. Setup Sparks Map & Tracker
        let totalSparks = 0;
        const rarityCosts = {
            'common': 0,
            'basic': 0,
            'uncommon': 50,
            'rare': 250,
            'super rare': 1000,
            'super-rare': 1000,
            'event': 1000,
            'legendary': 4000
        };

        // real card images, using YOUR card_images path + png→webp fallback
        const cardsHtml = (deckInfo.cards || []).map((cardString, i) => {
            const m = cardString.trim().match(/^x(\d+)\s+(.+)$/i);
            let count = 1, raw = cardString;
            if (m) { count = parseInt(m[1], 10); raw = m[2]; }
            const display = raw.replace(/_/g, ' ');
            const db = display.replace(/ /g, '_');

            // 2. Look up the card and add to Spark Total
            if (typeof cardDatabase !== 'undefined' && cardDatabase[db]) {
                const rarity = (cardDatabase[db].Rarity || '').toLowerCase();
                totalSparks += (rarityCosts[rarity] || 0) * count;
            }

            return `<div class="pvz-card" style="--i:${i}">
        <img src="card_images/${db}.png" alt="${display}" title="${display}" loading="lazy" decoding="async" fetchpriority="low"
     onerror="this.onerror=null;this.src='card_images/${db}.webp'">
        <span class="pvz-card-qty">x${count}</span>
      </div>`;
        }).join('');

        // 3. Format sparks string
        const formattedSparks = totalSparks.toLocaleString();

        const videoId = getYouTubeId(deckInfo.youtube_url);
        const thumb = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : '';
        const videoHtml = (creditStr === "FryEmUp" && deckInfo.youtube_url && thumb) ? `
      <a class="pvz-sheet-video" href="${deckInfo.youtube_url}" target="_blank" rel="noopener" title="${deckInfo.youtube_title || ''}">
        <span class="pvz-video-thumb"><img src="${thumb}" alt="" loading="lazy" decoding="async" fetchpriority="low"><span class="pvz-play"></span></span>
        <span class="pvz-video-title">${deckInfo.youtube_title || 'Watch on YouTube'}</span>
      </a>` : '';

        const overlay = document.createElement('div');
        overlay.className = 'pvz-sheet-overlay';

        // 4. Moved Sparks UI under Analyze button, reusing the Rating CSS classes
        overlay.innerHTML = `
  <div class="pvz-sheet ${factionClass}" role="dialog" aria-modal="true" aria-label="${deckInfo.name}">
    <button class="pvz-sheet-close" aria-label="Close">&times;</button>

    <div class="pvz-sheet-banner">
      <div class="pvz-sheet-heroes ${heroes.length === 2 ? 'two' : ''}">
        ${pvzHeroPortraits(heroes, true)}
      </div>

      <div class="pvz-sheet-titlewrap">
        <h2 class="pvz-sheet-title">${deckInfo.name}</h2>

        <div class="pvz-sheet-meta">
          <span class="pvz-meta-text">
            <span class="pvz-meta-item">
              <img class="pvz-meta-credit" src="${creditIcon}" alt="">${creditStr}
            </span>
            <span class="pvz-meta-item">${dateStr}</span>
            ${isDup ? `<span class="pvz-meta-item pvz-meta-dup">older dup</span>` : ''}
          </span>
        </div>
      </div>
    </div>

    <div class="pvz-sheet-body">
      <div class="pvz-card-grid">${cardsHtml}</div>

      <div class="pvz-deck-side" style="display: flex; flex-direction: column; gap: 12px; align-items: flex-end;">
        
        <div class="pvz-deck-rating" style="color:${verdict.gradeColor || '#fff'}; margin-bottom: 0 !important;">
          <span class="pvz-rating-label">Rating</span>
          <span class="pvz-rating-grade">${verdict.grade || '?'}</span>
        </div>

        <div class="pvz-deck-rating pvz-deck-sparks" style="color: #4dd0e1; margin-bottom: 0 !important;">
          <span class="pvz-rating-label">Sparks</span>
          <span class="pvz-rating-grade">${formattedSparks}</span>
        </div>

        <button id="pvzAnalyzeDeckBtn" class="pvz-analyze-deck-btn" type="button" style="margin-top: 6px;">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0;">
    <path d="m12 14 4-4"/>
    <path d="M3.34 19a10 10 0 1 1 17.32 0"/>
  </svg>
  Analyze Deck
</button>

<button id="pvzShareDeckBtn" class="pvz-analyze-deck-btn" type="button" style="margin-top: 6px;">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink: 0;">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <polyline points="16 6 12 2 8 6"/>
    <line x1="12" y1="2" x2="12" y2="15"/>
  </svg>
  Share Link
</button>

      </div>

      ${videoHtml}
    </div>
  </div>`;

        const analyzeBtn = overlay.querySelector('#pvzAnalyzeDeckBtn');

        if (analyzeBtn) {
            analyzeBtn.onclick = function (e) {
                e.stopPropagation();

                const deckToAnalyze = pvzBuildAnalyzeDeck(deckInfo);
                const cardDictionary = Object.keys(cardDatabase).sort();

                const encodedCards = deckToAnalyze.map(card => {
                    const index = cardDictionary.indexOf(card.name);

                    if (index === -1) {
                        console.error(`🚨 Could not find card in dictionary: ${card.name}`);
                        return null;
                    }

                    const cardIndex = index.toString(36);

                    return card.count === 4 ? cardIndex : `${cardIndex}.${card.count}`;
                });

                if (encodedCards.includes(null)) {
                    alert("Could not analyze this deck because one or more cards could not be found.");
                    return;
                }

                const minimalDeckString = encodedCards.join('-');
                const analyzeUrl = `${window.location.origin}${window.location.pathname}?deck=${minimalDeckString}#crafter`;

                console.log("Encoding complete. Target URL:", analyzeUrl);
                const sameQuery = window.location.search === `?deck=${minimalDeckString}`;

                window.location.href = analyzeUrl;

                if (sameQuery) {
                    window.location.reload();
                }
            };
        }
        const shareBtn = overlay.querySelector('#pvzShareDeckBtn');

        if (shareBtn) {
            shareBtn.onclick = function (e) {
                e.stopPropagation();

                const deckToShare = pvzBuildAnalyzeDeck(deckInfo);
                const cardDictionary = Object.keys(cardDatabase).sort();

                const encodedCards = deckToShare.map(card => {
                    const index = cardDictionary.indexOf(card.name);
                    if (index === -1) {
                        console.error(`🚨 Could not find card in dictionary: ${card.name}`);
                        return null;
                    }
                    const cardIndex = index.toString(36);
                    return card.count === 4 ? cardIndex : `${cardIndex}.${card.count}`;
                });

                if (encodedCards.includes(null)) {
                    alert("Could not share this deck because one or more cards could not be found.");
                    return;
                }

                const minimalDeckString = encodedCards.join('-');
                // No #crafter — bare link so it auto-opens the panel on the home screen.
                const shareUrl = `${window.location.origin}${window.location.pathname}?deck=${minimalDeckString}`;

                const originalText = shareBtn.textContent;
                const flash = (msg) => {
                    shareBtn.textContent = msg;
                    shareBtn.disabled = true;
                    setTimeout(() => {
                        shareBtn.textContent = originalText;
                        shareBtn.disabled = false;
                    }, 1500);
                };

                const fallbackCopy = () => {
                    const ta = document.createElement('textarea');
                    ta.value = shareUrl;
                    ta.style.position = 'fixed';
                    ta.style.opacity = '0';
                    document.body.appendChild(ta);
                    ta.focus();
                    ta.select();
                    let ok = false;
                    try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
                    document.body.removeChild(ta);
                    flash(ok ? 'Copied!' : 'Copy failed');
                };

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(shareUrl)
                        .then(() => flash('Copied!'))
                        .catch(fallbackCopy);
                } else {
                    fallbackCopy();
                }
            };
        }
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';

        const sheet = overlay.querySelector('.pvz-sheet');
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!reduce && tileEl) {
            const t = tileEl.getBoundingClientRect();
            const p = sheet.getBoundingClientRect();
            const dx = (t.left + t.width / 2) - (p.left + p.width / 2);
            const dy = (t.top + t.height / 2) - (p.top + p.height / 2);
            const scale = Math.max(t.width / p.width, t.height / p.height);
            sheet.style.setProperty('transform', `translate(${dx}px,${dy}px) scale(${scale})`, 'important');
            sheet.style.setProperty('opacity', '0', 'important');
            overlay.style.setProperty('opacity', '0', 'important');
            sheet.getBoundingClientRect(); // reflow
            requestAnimationFrame(() => {
                overlay.style.setProperty('transition', 'opacity .3s ease', 'important');
                overlay.style.setProperty('opacity', '1', 'important');
                sheet.style.setProperty('transition', 'transform .55s cubic-bezier(.16,1,.3,1), opacity .4s ease', 'important');
                sheet.style.setProperty('transform', 'translate(0,0) scale(1)', 'important');
                sheet.style.setProperty('opacity', '1', 'important');
            });
        }
        requestAnimationFrame(() => overlay.classList.add('open'));

        const close = () => pvzCloseSheet(overlay);
        overlay.querySelector('.pvz-sheet-close').addEventListener('click', close);
        overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close(); });
        overlay._esc = (e) => { if (e.key === 'Escape') close(); };
        document.addEventListener('keydown', overlay._esc);

        overlay.querySelector('.pvz-sheet-close').focus();
    }
    window.calculateDeckSparkStats = function () {
        if (typeof pvzDeckCache === 'undefined' || typeof cardDatabase === 'undefined') {
            console.error("🚨 pvzDeckCache or cardDatabase is not available.");
            return null;
        }

        const rarityCosts = {
            'common': 0,
            'basic': 0,
            'uncommon': 50,
            'rare': 250,
            'super rare': 1000,
            'super-rare': 1000,
            'event': 1000,
            'legendary': 4000
        };

        const sparkTotals = [];

        // 1. Calculate sparks for every deck in the cache
        for (const rd of Object.values(pvzDeckCache)) {
            if (!rd.deckInfo || !rd.deckInfo.cards) continue;

            let totalSparks = 0;

            for (const cardString of rd.deckInfo.cards) {
                const m = cardString.trim().match(/^x(\d+)\s+(.+)$/i);
                let count = 1, raw = cardString;
                if (m) { count = parseInt(m[1], 10); raw = m[2]; }
                const db = raw.replace(/ /g, '_');

                if (cardDatabase[db]) {
                    const rarity = (cardDatabase[db].Rarity || '').toLowerCase();
                    totalSparks += (rarityCosts[rarity] || 0) * count;
                }
            }

            sparkTotals.push(totalSparks);
        }

        if (sparkTotals.length === 0) {
            console.warn("No decks found to calculate.");
            return null;
        }

        // 2. Sort the array numerically to calculate stats
        sparkTotals.sort((a, b) => a - b);

        // Helper function to find the median of an array
        const getMedian = (arr) => {
            if (arr.length === 0) return 0;
            const mid = Math.floor(arr.length / 2);
            return arr.length % 2 !== 0 ? arr[mid] : (arr[mid - 1] + arr[mid]) / 2;
        };

        // 3. Calculate statistics
        const totalDecks = sparkTotals.length;
        const mean = sparkTotals.reduce((sum, val) => sum + val, 0) / totalDecks;
        const median = getMedian(sparkTotals);

        // To find Q1 and Q3, split the array in half
        const midIndex = Math.floor(totalDecks / 2);
        const lowerHalf = sparkTotals.slice(0, midIndex);

        // If odd, exclude the exact middle value from both halves
        const upperHalf = totalDecks % 2 === 0
            ? sparkTotals.slice(midIndex)
            : sparkTotals.slice(midIndex + 1);

        const q1 = getMedian(lowerHalf);
        const q3 = getMedian(upperHalf);

        // 4. Format the final output
        const stats = {
            "Total Decks": totalDecks,
            "Min Sparks": sparkTotals[0],
            "Q1 (25th %)": q1,
            "Median (50th %)": median,
            "Mean (Average)": Math.round(mean),
            "Q3 (75th %)": q3,
            "Max Sparks": sparkTotals[totalDecks - 1]
        };

        // Log as a clean visual table in the console
        console.table(stats);

        return stats;
    };
    function pvzCloseSheet(overlay) {
        const sheet = overlay.querySelector('.pvz-sheet');
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        document.removeEventListener('keydown', overlay._esc);
        const done = () => { overlay.remove(); document.body.style.overflow = ''; };

        if (reduce || !pvzActiveTile || !document.body.contains(pvzActiveTile)) {
            overlay.style.setProperty('transition', 'opacity .25s ease', 'important');
            overlay.style.setProperty('opacity', '0', 'important');
            setTimeout(done, 250); return;
        }
        const t = pvzActiveTile.getBoundingClientRect();
        const p = sheet.getBoundingClientRect();
        const dx = (t.left + t.width / 2) - (p.left + p.width / 2);
        const dy = (t.top + t.height / 2) - (p.top + p.height / 2);
        const scale = Math.max(t.width / p.width, t.height / p.height);
        overlay.style.setProperty('transition', 'opacity .35s ease', 'important');
        overlay.style.setProperty('opacity', '0', 'important');
        sheet.style.setProperty('transition', 'transform .4s cubic-bezier(.16,1,.3,1), opacity .35s ease', 'important');
        sheet.style.setProperty('transform', `translate(${dx}px,${dy}px) scale(${scale})`, 'important');
        sheet.style.setProperty('opacity', '0', 'important');
        setTimeout(done, 400);
    }

    // 2. Global Event Listener for Star Buttons (Put this outside renderDecks so it runs once)
    document.getElementById('deckGrid').addEventListener('click', (e) => {
        const starBtn = e.target.closest('.deck-star-btn');
        if (!starBtn) return;

        const deckKey = starBtn.getAttribute('data-deck');
        const starredDecks = JSON.parse(localStorage.getItem('pvz_starred_decks') || '{}');

        if (starBtn.classList.contains('starred')) {
            // Unstar
            starBtn.classList.remove('starred');
            delete starredDecks[deckKey];
        } else {
            // Star! (Triggers CSS animation)
            starBtn.classList.add('starred');
            starredDecks[deckKey] = true;
        }

        localStorage.setItem('pvz_starred_decks', JSON.stringify(starredDecks));
    });

    // --- Combined Search + Grade Filter ---

    let currentSearchTerm = "";
    let currentGradeFilter = "";


    const gradeButtons = document.querySelectorAll(".grade-chip");

    function matchesSearch(deckInfo, searchRegex) {
        const deckName = deckInfo.name || "";
        const ytTitle = deckInfo.youtube_title || "";
        const credit = deckInfo.credit || "";

        // --- NEW: LAZY-CACHE HERO NAME FOR SEARCHING ---
        if (deckInfo.heroName === undefined) {
            deckInfo.heroName = ""; // Default fallback if it doesn't meet the 2-class rule

            if (Array.isArray(deckInfo.cards) && deckInfo.cards.length > 0) {
                const uniqueClasses = new Set();

                for (const cardRaw of deckInfo.cards) {
                    let parsedCardName = cardRaw.replace(/^[^a-zA-Z]*(x?\d+|\d+x)\s*/i, '').trim();
                    const nameWithSpaces = parsedCardName.replace(/_/g, ' ');
                    const nameWithUnderscores = parsedCardName.replace(/ /g, '_');

                    const cardData = cardDatabase[nameWithUnderscores] || cardDatabase[nameWithSpaces];
                    if (cardData) {
                        const cls = cardData.Class || cardData.class;
                        if (cls) uniqueClasses.add(cls);
                    }
                }

                // Only map to a hero if it has exactly 2 classes
                if (uniqueClasses.size === 2) {
                    const classesArray = Array.from(uniqueClasses);
                    const comboA = `${classesArray[0]},${classesArray[1]}`;
                    const comboB = `${classesArray[1]},${classesArray[0]}`;
                    deckInfo.heroName = heroMap[comboA] || heroMap[comboB] || "";
                }
            }
        }
        // -----------------------------------------------

        const creditMatches = credit
            .split(",")
            .some(author => searchRegex.test(author.trim()));

        const hasMatchingCard = Array.isArray(deckInfo.cards) && deckInfo.cards.some(card => {
            const cleanName = card.replace(/_/g, " ");
            return searchRegex.test(cleanName);
        });

        return (
            searchRegex.test(deckName) ||
            searchRegex.test(ytTitle) ||
            searchRegex.test(deckInfo.heroName) || // <-- NEW: Matches against the resolved Hero Name(s)
            creditMatches ||
            hasMatchingCard
        );
    }

    function applyFilters() {
        const filteredData = {};

        const searchRegex = currentSearchTerm
            ? new RegExp("\\b" + escapeRegExp(currentSearchTerm), "i")
            : null;

        const starredDecks = JSON.parse(localStorage.getItem('pvz_starred_decks') || '{}');

        for (const [deckKey, deckInfo] of Object.entries(fullDatabase)) {
            const grade = deckInfo.verdict?.grade || "—";

            // Starred filter
            if (currentGradeFilter === "STARRED") {
                if (!starredDecks[deckKey]) continue;
            }
            // Normal grade filter
            else if (currentGradeFilter && grade !== currentGradeFilter) {
                continue;
            }

            // Search filter
            if (searchRegex && !matchesSearch(deckInfo, searchRegex)) continue;

            filteredData[deckKey] = deckInfo;
        }

        renderDecks(filteredData);
    }

    // --- Search input ---
    searchInput.addEventListener("input", (e) => {
        currentSearchTerm = e.target.value.trim();
        applyFilters();
    });
    const gradesBtn = document.getElementById("gradesBtn");
    const gradesDropdown = document.getElementById("gradesDropdown");

    gradesBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        const open = !gradesDropdown.hidden;
        gradesDropdown.hidden = open;

        gradesBtn.setAttribute("aria-expanded", String(!open));
    });

    document.addEventListener("click", () => {
        gradesDropdown.hidden = true;
        gradesBtn.setAttribute("aria-expanded", "false");
    });
    // --- Grade buttons ---
    gradeButtons.forEach(button => {
        button.addEventListener("click", () => {
            gradeButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            currentGradeFilter = button.dataset.grade; // "" = All
            applyFilters();
        });
    });

    // --- Modal Logic ---
    infoBtn.addEventListener('click', () => infoModal.style.display = 'block');
    closeModal.addEventListener('click', () => infoModal.style.display = 'none');
    window.addEventListener('click', (event) => {
        if (event.target === infoModal) infoModal.style.display = 'none';
    });


    // NEW: Listen for when the user changes the dropdown
    const filterDropdown = document.getElementById('deckLimitFilter');
    if (filterDropdown) {
        filterDropdown.addEventListener('change', (e) => {
            renderStatsChart(e.target.value);
        });
    }

    backBtn.addEventListener('click', () => {
        // Hide BOTH secondary views and the back button
        statsView.classList.add('hidden');
        tiersView.classList.add('hidden');
        guidesView.classList.add('hidden');
        crafterView.classList.add('hidden'); // Hide the new view
        backBtn.classList.add('hidden');

        // Restore Main UI
        deckView.classList.remove('hidden');
        searchWrapper.classList.remove('hidden');
        statsBtn.classList.remove('hidden');
        guidesBtn.classList.remove('hidden');
        tiersBtn.classList.remove('hidden');
        crafterBtn.classList.remove('hidden'); // Restore the new button
        gamesBtn.classList.remove('hidden'); // Restore the games button


    });

    // --- Stats Rendering Logic ---
    function renderStatsChart(limit = 'all') {
        // --- NEW: Hero Deduction Matrix ---
        const heroCounts = {};
        const heroMatrix = {
            // Plants (Alphabetical order of classes)
            "Mega-Grow,Smarty": "Green Shadow",
            "Kabloom,Solar": "Solar Flare",
            "Guardian,Solar": "Wall-Knight",
            "Mega-Grow,Solar": "Chompzilla",
            "Guardian,Kabloom": "Spudow",
            "Guardian,Smarty": "Citron / Beta-Carrotina",
            "Guardian,Mega-Grow": "Grass Knuckles",
            "Kabloom,Smarty": "Nightcap",
            "Smarty,Solar": "Rose",
            "Kabloom,Mega-Grow": "Captain Combustible",

            // Zombies (Alphabetical order of classes)
            "Beastly,Hearty": "The Smash",
            "Crazy,Sneaky": "Impfinity",
            "Brainy,Hearty": "Rustbolt",
            "Beastly,Crazy": "Electric Boogaloo",
            "Beastly,Sneaky": "Brain Freeze",
            "Brainy,Crazy": "Professor Brainstorm",
            "Beastly,Brainy": "Immorticia",
            "Crazy,Hearty": "Z-Mech",
            "Hearty,Sneaky": "Neptuna",
            "Brainy,Sneaky": "Super Brainz / HG"
        };
        // Existing Data Accumulators
        const cardCopies = {};
        const deckPresence = {};
        const uploadsByYear = {};
        const dailyUploads = {};
        const pairCounts = {};
        const wordCounts = {};
        const stopWords = [
            // Standard English fluff
            "the", "in", "a", "of", "and", "to", "is", "for", "with", "this", "on", "most", "ever",
            "one", "when", "vs", "are", "that", "my", "i", "but", "it", "at", "an", "how", "why", "what", "you", "your", "can", "out",

            // YouTube / Gaming Fluff
            "part", "gameplay", "highlights", "guide", "guides", "video", "new", "best", "top",
            "update", "play", "playing", "wins", "win", "stream", "ep", "episode", "season", "let", "lets",

            // PvZ Heroes Specific Boilerplate
            "pvz", "pvzh", "plants", "zombies", "heroes", "hero", "deck", "decks", "game", "cards", "card", "zombie", "plant"
        ];

        // NEW Data Accumulators for card_data
        const costCurve = {};
        const classCounts = {};
        const rarityCounts = {};
        const typeCounts = {};
        const statsByCost = {};
        const cardPresenceByYear = {};

        // --- NEW: Pay-to-Win Tracking Variables ---
        let maxSparkCost = -1;
        let minSparkCost = Infinity;
        let mostExpensiveDeck = null;
        let leastExpensiveDeck = null;
        let maxAvgCost = -1;
        let minAvgCost = Infinity;
        let heaviestDeck = null;
        let lightestDeck = null;
        let numDecks = Object.keys(fullDatabase).length;
        let totalUniqueCardSlots = 0;
        const allSparkCosts = [];
        const allAvgCosts = [];

        // --- NEW: Trending Data Variables ---
        const RECENT_DECK_COUNT = 100;
        const recentCardFreq = {};

        // --- FIX: Safely sort allDecks from newest to oldest ---
        let allDecks = Object.values(fullDatabase).sort((a, b) => {
            const dateA = a.upload_date && a.upload_date !== "UNKNOWN_DATE" ? new Date(a.upload_date).getTime() : 0;
            const dateB = b.upload_date && b.upload_date !== "UNKNOWN_DATE" ? new Date(b.upload_date).getTime() : 0;
            return dateB - dateA;
        });

        // --- Apply the timeframe filter! ---
        if (limit !== 'all') {
            // Split the value (e.g., "latest_500") into direction ("latest") and amount ("500")
            const [direction, amountStr] = limit.split('_');
            const sliceAmount = parseInt(amountStr, 10);

            if (direction === 'latest') {
                // Since newest are at the front (index 0), grab from 0 up to the sliceAmount
                allDecks = allDecks.slice(0, sliceAmount);
            } else if (direction === 'oldest') {
                // Grab the last 'sliceAmount' of elements from the end of the array
                allDecks = allDecks.slice(-sliceAmount);
            }
        }

        const totalDecks = allDecks.length;

        // Process the database
        allDecks.forEach((deck, index) => {
            let uniqueInThisDeck = 0;
            const deckCardNames = [];
            let currentDeckSparkCost = 0;
            let currentDeckTotalMana = 0;
            const currentDeckClasses = new Set();

            // 1. Process Timeline
            let deckYear = null;
            if (deck.upload_date && deck.upload_date !== "UNKNOWN_DATE") {
                const yearMatch = deck.upload_date.match(/\b(20\d{2})\b/);
                if (yearMatch) {
                    deckYear = yearMatch[1];
                    const year = yearMatch[1];
                    uploadsByYear[year] = (uploadsByYear[year] || 0) + 1;
                }
            }
            if (deck.upload_date && deck.upload_date !== "UNKNOWN_DATE") {
                const parsedDate = new Date(deck.upload_date);

                if (!isNaN(parsedDate)) {
                    const dateKey = parsedDate.toISOString().split('T')[0];
                    dailyUploads[dateKey] = (dailyUploads[dateKey] || 0) + 1;
                }
            }

            // 2. Process Title Buzzwords
            if (deck.youtube_title) {
                // Lowercase -> Strip punctuation & underscores -> Strip numbers -> Split by spaces
                const words = deck.youtube_title.toLowerCase()
                    .replace(/[^\w\s]|_/g, '')
                    .replace(/\d+/g, '')
                    .split(/\s+/);

                words.forEach(w => {
                    // I increased the minimum length to > 3 to filter out random 3-letter junk
                    if (w.length > 3 && !stopWords.includes(w)) {

                        // Optional: Naively group some common plural/singular words together 
                        // so "garg" and "gargs" count as the same buzzword
                        let normalizedWord = w;
                        if (w === "gargs") normalizedWord = "garg";
                        if (w === "otks") normalizedWord = "otk";

                        wordCounts[normalizedWord] = (wordCounts[normalizedWord] || 0) + 1;
                    }
                });
            }

            // 3. Process Cards & Metadata
            deck.cards.forEach(card => {
                const match = card.match(/^x(\d+)\s+(.+)$/);
                if (match) {
                    const count = parseInt(match[1]);
                    const rawName = match[2];
                    const name = rawName.replace(/_/g, ' ');

                    // Basic Stats
                    cardCopies[name] = (cardCopies[name] || 0) + count;
                    deckPresence[name] = (deckPresence[name] || 0) + 1;
                    deckCardNames.push(name);
                    uniqueInThisDeck++;

                    // If this deck is one of the 50 newest, tally it for the recent pool
                    if (index < RECENT_DECK_COUNT) {
                        recentCardFreq[name] = (recentCardFreq[name] || 0) + count;
                    }
                    if (deckYear) {
                        if (!cardPresenceByYear[name]) cardPresenceByYear[name] = {};
                        cardPresenceByYear[name][deckYear] = (cardPresenceByYear[name][deckYear] || 0) + 1;
                    }
                    // Process Extended Card Data
                    if (typeof cardDatabase !== 'undefined' && cardDatabase[rawName]) {
                        const info = cardDatabase[rawName];

                        // Calculate Sparks
                        if (info.Rarity) {
                            const rarity = info.Rarity.toLowerCase();
                            let sparkCost = 0;
                            if (rarity.includes('uncommon')) sparkCost = 50;
                            else if (rarity.includes('rare') && !rarity.includes('super')) sparkCost = 250;
                            else if (rarity.includes('super') || rarity.includes('event')) sparkCost = 1000;
                            else if (rarity.includes('legendary')) sparkCost = 4000;

                            currentDeckSparkCost += (sparkCost * count);
                            rarityCounts[info.Rarity] = (rarityCounts[info.Rarity] || 0) + count;
                        }

                        if (info.Cost !== null && info.Cost !== undefined) {
                            currentDeckTotalMana += (info.Cost * count);
                            costCurve[info.Cost] = (costCurve[info.Cost] || 0) + count;

                        }
                        if (info.Class) {
                            classCounts[info.Class] = (classCounts[info.Class] || 0) + count;
                            currentDeckClasses.add(info.Class);
                        }

                        if (info.Type) {
                            let broadType = "Fighter / Minion";
                            if (info.Type.includes("Trick")) broadType = "Trick";
                            else if (info.Type.includes("Environment")) broadType = "Environment";
                            typeCounts[broadType] = (typeCounts[broadType] || 0) + count;
                        }

                        if (info.Strength !== null && info.Health !== null) {
                            if (!statsByCost[info.Cost]) {
                                statsByCost[info.Cost] = { str: [], hp: [] };
                            }
                            for (let i = 0; i < count; i++) {
                                statsByCost[info.Cost].str.push(info.Strength);
                                statsByCost[info.Cost].hp.push(info.Health);
                            }
                        }
                    }
                }
            });
            const sortedClasses = Array.from(currentDeckClasses).sort().join(",");

            // If it finds a match, use it. If a deck is somehow mono-class, label it as such.
            const heroName = heroMatrix[sortedClasses] || (sortedClasses ? `Mono: ${sortedClasses}` : "Unknown");
            heroCounts[heroName] = (heroCounts[heroName] || 0) + 1;

            totalUniqueCardSlots += uniqueInThisDeck;
            allSparkCosts.push(currentDeckSparkCost);

            if (currentDeckSparkCost >= 0) {
                if (currentDeckSparkCost > maxSparkCost) {
                    maxSparkCost = currentDeckSparkCost;
                    mostExpensiveDeck = deck;
                }
                if (currentDeckSparkCost < minSparkCost) {
                    minSparkCost = currentDeckSparkCost;
                    leastExpensiveDeck = deck;
                }
            }
            if (currentDeckTotalMana > 0) {
                // Since decks are strictly 40 cards, we can hardcode the divisor
                const avgCost = currentDeckTotalMana / 40;
                allAvgCosts.push(avgCost);

                if (avgCost > maxAvgCost) {
                    maxAvgCost = avgCost;
                    heaviestDeck = deck;
                }
                if (avgCost < minAvgCost) {
                    minAvgCost = avgCost;
                    lightestDeck = deck;
                }
            }

            // 4. Calculate Synergies
            for (let i = 0; i < deckCardNames.length; i++) {
                for (let j = i + 1; j < deckCardNames.length; j++) {
                    const pair = [deckCardNames[i], deckCardNames[j]].sort();
                    const pairStr = `${pair[0]} + ${pair[1]}`;
                    pairCounts[pairStr] = (pairCounts[pairStr] || 0) + 1;
                }
            }




        });

        const MIN_PAIR_APPEARANCES = 5;
        const normalizedPairsObj = {};

        for (const [pairStr, count] of Object.entries(pairCounts)) {
            if (count >= MIN_PAIR_APPEARANCES) {
                const [cardA, cardB] = pairStr.split(' + ');
                const presenceA = deckPresence[cardA] || 0;
                const presenceB = deckPresence[cardB] || 0;

                const union = presenceA + presenceB - count;
                const jaccardScore = union > 0 ? (count / union) : 0;

                normalizedPairsObj[pairStr] = parseFloat((jaccardScore * 100).toFixed(1));
            }
        }

        // Update Quick Stats DOM
        document.getElementById('statTotalDecks').innerText = totalDecks;
        document.getElementById('statUniqueCards').innerText = Object.keys(cardCopies).length;
        document.getElementById('statAvgVariety').innerText = totalDecks ? (totalUniqueCardSlots / totalDecks).toFixed(1) : 0;

        function getYouTubeId(url) {
            if (!url) return null;
            const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
            return match ? match[1] : null;
        }

        function setExtremeCard({
            linkId,
            imgId,
            nameId,
            costId,
            deck,
            costText,
            youtubeId
        }) {
            const linkEl = document.getElementById(linkId);
            const imgEl = document.getElementById(imgId);
            const nameEl = document.getElementById(nameId);
            const costEl = document.getElementById(costId);

            if (!linkEl || !imgEl || !nameEl || !costEl) return;

            nameEl.innerText = deck.name || deck.youtube_title || '-';
            costEl.innerText = costText;

            if (youtubeId) {
                imgEl.src = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
            } else {
                imgEl.removeAttribute('src');
            }

            imgEl.alt = `${deck.name || deck.youtube_title || 'Deck'} thumbnail`;
            linkEl.href = deck.youtube_url || "#";
        }


        // Prepare Data for Charts 
        const topCopied = Object.entries(cardCopies).sort((a, b) => b[1] - a[1]);
        const topCopiedSliced = topCopied.slice(0, 15);
        const topPresence = Object.entries(deckPresence).sort((a, b) => b[1] - a[1]).slice(0, 10);
        const yearsSorted = Object.keys(uploadsByYear).sort();
        const sortedDates = Object.keys(dailyUploads).sort();
        const cumulativeData = [];
        let runningTotal = 0;

        sortedDates.forEach(dateStr => {
            runningTotal += dailyUploads[dateStr];

            // Convert date to a pure numeric timestamp (milliseconds) for linear spacing
            const timestamp = new Date(dateStr + 'T12:00:00Z').getTime();

            // Store as an x/y coordinate pair
            cumulativeData.push({ x: timestamp, y: runningTotal });
        });
        const topRawPairs = Object.entries(pairCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
        const topNormalizedPairs = Object.entries(normalizedPairsObj).sort((a, b) => b[1] - a[1]).slice(0, 10);
        const topWords = Object.entries(wordCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
        const costsSorted = Object.keys(costCurve).sort((a, b) => parseInt(a) - parseInt(b));

        // Destroy existing charts AND clear their references
        Object.keys(charts).forEach(key => {
            if (charts[key]) {
                charts[key].destroy();
                delete charts[key]; // <--- This is the magic fix
            }
        });

        const gridColor = '#30363d';
        const textColor = '#8b949e';
        const standardColors = ['#ff7b72', '#79c0ff', '#d2a8ff', '#a5d6ff', '#ffa657', '#3fb950', '#f85149', '#8957e5', '#2f81f7', '#d4ed31'];
        // --- 1. SET UP THE PAST BASELINE ---
        const dropCount = Math.min(100, Math.floor(totalDecks * 0.5));
        const safeDropCount = Math.max(1, dropCount);
        const pastDecks = allDecks.slice(safeDropCount);

        // --- 2. DYNAMIC RANKING FUNCTIONS ---
        // Helper function to extract a sorted array of card names, WITH filtering logic included
        function getRankedCards(deckArray, filterValue = 'all') {
            const counts = {};

            deckArray.forEach(deck => {
                deck.cards.forEach(cardString => {
                    const match = cardString.match(/^x(\d+)\s+(.+)$/);

                    if (match) {
                        const count = parseInt(match[1], 10);
                        const cardName = match[2].replace(/_/g, ' ');

                        // --- Apply the filter check ---
                        let keep = true;
                        if (filterValue !== 'all') {
                            const dbKey = cardName.replace(/ /g, '_');
                            const info = cardDatabase[dbKey] || {};

                            const typeStr = info.Type ? info.Type.toLowerCase() : "";
                            const isTrick = typeStr.includes("trick");
                            const isEnv = typeStr.includes("environment");
                            const isMinion = info.Type && !isTrick && !isEnv;
                            const cost = parseInt(info.Cost, 10) || 0;

                            keep = false;
                            if (filterValue === "minion" && isMinion) keep = true;
                            else if (filterValue === "trick" && isTrick) keep = true;
                            else if (filterValue === "environment" && isEnv) keep = true;
                            else if (filterValue === "wincon" && cost >= 5) keep = true;
                        }

                        if (keep) {
                            counts[cardName] = (counts[cardName] || 0) + count;
                        }
                    }
                });
            });

            // Sort by total copies (highest first) and return just an array of the names
            return Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .map(entry => entry[0]);
        }

        // Function to generate the dictionary of text arrows based on a specific category
        function generateRankChanges(filterValue) {
            const currentList = getRankedCards(allDecks, filterValue);
            const pastList = getRankedCards(pastDecks, filterValue);

            const changes = {};
            currentList.forEach((card, currentIndex) => {
                const pastIndex = pastList.indexOf(card);

                if (pastIndex === -1) {
                    changes[card] = '  (NEW)';
                } else {
                    const change = pastIndex - currentIndex;
                    if (change > 0) changes[card] = `  (+${change} ▲)`;
                    else if (change < 0) changes[card] = `  (-${Math.abs(change)} ▼)`;
                    else changes[card] = `  (--)`;
                }
            });
            return changes;
        }

        // Initialize the global rankings for the default 'all' view when page loads
        let currentRankChanges = generateRankChanges('all');


        // --- 3. CHART 1: Total Copies ---
        const ctx1 = document.getElementById('topCardsChart').getContext('2d');
        charts.topCards = new Chart(ctx1, {
            type: 'bar',
            data: {
                // Use currentRankChanges to map the initial labels
                labels: topCopiedSliced.map(i => `${i[0]}${currentRankChanges[i[0]] || ''}`),
                datasets: [{ label: 'Total Copies', data: topCopiedSliced.map(i => i[1]), backgroundColor: '#238636', borderRadius: 4, hoverBackgroundColor: '#2ea043' }]
            },
            options: {
                responsive: true, maintainAspectRatio: false, indexAxis: 'y',
                scales: { x: { grid: { color: gridColor }, ticks: { color: textColor } }, y: { ticks: { color: '#c9d1d9' }, grid: { display: false } } },
                plugins: { legend: { display: false }, tooltip: { callbacks: { footer: () => '👉 Click to search for this card' } } },
                onClick: (e, activeElements) => {
                    if (activeElements.length > 0) {
                        const clickedCard = charts.topCards.data.labels[activeElements[0].index];

                        window.location.hash = '#';

                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                const searchInput = document.getElementById('searchInput');
                                if (searchInput) {
                                    const cleanCardName = clickedCard.split(/  \(/)[0];
                                    searchInput.value = cleanCardName;
                                    searchInput.dispatchEvent(new Event('input'));
                                }
                            });
                        });
                    }
                },
                onHover: (e, activeElements) => { e.native.target.style.cursor = activeElements.length ? 'pointer' : 'default'; }
            }
        });


        // --- 4. TOP CARDS FILTER LOGIC ---
        window.applyTopCardsFilter = function (filterValue) {
            if (!charts.topCards) return;

            let filteredArray = [];

            Object.entries(cardCopies).forEach(([cardName, count]) => {
                if (count === 0) return;

                const dbKey = cardName.replace(/ /g, '_');
                const info = cardDatabase[dbKey] || {};

                const typeStr = info.Type ? info.Type.toLowerCase() : "";
                const isTrick = typeStr.includes("trick");
                const isEnv = typeStr.includes("environment");
                const isMinion = info.Type && !isTrick && !isEnv;
                const cost = parseInt(info.Cost, 10) || 0;

                let keep = false;
                if (filterValue === "all") keep = true;
                else if (filterValue === "minion" && isMinion) keep = true;
                else if (filterValue === "trick" && isTrick) keep = true;
                else if (filterValue === "environment" && isEnv) keep = true;
                else if (filterValue === "wincon" && cost >= 5) keep = true;

                if (keep) {
                    filteredArray.push([cardName, count]);
                }
            });

            // Sort by count (highest first) and slice the top 15
            filteredArray.sort((a, b) => b[1] - a[1]);
            const newTopSliced = filteredArray.slice(0, 15);

            // --- THE FIX: Recalculate rank changes for this specific category ---
            currentRankChanges = generateRankChanges(filterValue);

            charts.topCards.data.labels = newTopSliced.map(i => {
                const cleanName = i[0];
                // Use the freshly generated context-aware arrows
                return `${cleanName}${currentRankChanges[cleanName] || ''}`;
            });

            charts.topCards.data.datasets[0].data = newTopSliced.map(i => i[1]);

            // Update Colors based on filter
            let newColor = '#238636';
            let hoverColor = '#2ea043';

            if (filterValue === 'trick') { newColor = '#8957e5'; hoverColor = '#a371f7'; }
            else if (filterValue === 'environment') { newColor = '#58a6ff'; hoverColor = '#79c0ff'; }
            else if (filterValue === 'wincon') { newColor = '#f85149'; hoverColor = '#ff7b72'; }

            charts.topCards.data.datasets[0].backgroundColor = newColor;
            charts.topCards.data.datasets[0].hoverBackgroundColor = hoverColor;

            // Redraw smoothly
            charts.topCards.update();
        };

        const currentTopCardsFilter = document.getElementById('topCardsFilter').value;
        if (currentTopCardsFilter !== 'all') {
            window.applyTopCardsFilter(currentTopCardsFilter);
        }
        // --- CHART 2: Deck Presence ---
        const ctx2 = document.getElementById('deckPresenceChart').getContext('2d');
        charts.deckPresence = new Chart(ctx2, {
            type: 'doughnut',
            data: { labels: topPresence.map(i => i[0]), datasets: [{ data: topPresence.map(i => i[1]), backgroundColor: standardColors, borderColor: '#161b22', borderWidth: 2 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#c9d1d9', font: { size: 10 } } } } }
        });

        // --- CHART 3: Cumulative Upload Timeline ---
        const ctx3 = document.getElementById('timelineChart').getContext('2d');
        charts.timeline = new Chart(ctx3, {
            type: 'line',
            data: {
                // Notice we removed the "labels" array entirely!
                datasets: [{
                    label: 'Total Decks',
                    data: cumulativeData, // Now contains {x, y} coordinate objects
                    borderColor: '#58a6ff',
                    backgroundColor: 'rgba(88, 166, 255, 0.2)',
                    borderWidth: 3,
                    tension: 0.1,
                    fill: true,
                    pointBackgroundColor: '#1f6feb',
                    pointRadius: 1,
                    pointHitRadius: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'linear', // CRITICAL: This mathematically spaces out the dates!
                        grid: { color: gridColor },
                        ticks: {
                            color: textColor,
                            maxTicksLimit: 8,
                            // Convert the raw timestamp back into a readable Date string
                            callback: function (value) {
                                return new Date(value).toLocaleDateString('en-US', {
                                    month: 'short',
                                    year: 'numeric'
                                });
                            }
                        }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: { color: textColor, precision: 0 }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            // Make the tooltip show the exact date when you hover over a point
                            title: function (tooltipItems) {
                                const rawTimestamp = tooltipItems[0].parsed.x;
                                return new Date(rawTimestamp).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                });
                            }
                        }
                    }
                }
            }
        });

        // --- CHART 4: Ultimate Synergies ---
        const ctx4 = document.getElementById('pairsChart').getContext('2d');
        charts.pairs = new Chart(ctx4, {
            type: 'bar',
            data: {
                labels: topRawPairs.map(i => i[0]),
                datasets: [{
                    label: 'Raw Count',
                    data: topRawPairs.map(i => i[1]),
                    backgroundColor: '#8957e5',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: { grid: { color: gridColor }, ticks: { color: textColor } },
                    y: { ticks: { color: '#c9d1d9', font: { size: 10 } }, grid: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });

        // --- FIX: The Toggle Logic ---
        // Attach to 'window' so the HTML <input onchange="..."> can find it
        window.toggleSynergyChart = function (mode) {
            if (!charts.pairs) return; // Safety check

            if (mode === 'normalized') {
                charts.pairs.data.labels = topNormalizedPairs.map(i => i[0]);
                charts.pairs.data.datasets[0].data = topNormalizedPairs.map(i => i[1]);
                charts.pairs.data.datasets[0].label = 'Overlap %';
                charts.pairs.data.datasets[0].backgroundColor = '#d2a8ff'; // Lighter purple for visual change
            } else {
                charts.pairs.data.labels = topRawPairs.map(i => i[0]);
                charts.pairs.data.datasets[0].data = topRawPairs.map(i => i[1]);
                charts.pairs.data.datasets[0].label = 'Raw Count';
                charts.pairs.data.datasets[0].backgroundColor = '#8957e5'; // Original purple
            }
            charts.pairs.update(); // Redraw the chart
        };

        // Reset the HTML toggle to "Raw" every time we re-render the dashboard (like when changing timeframes)
        const rawToggle = document.getElementById('synergyRaw');
        if (rawToggle) rawToggle.checked = true;

        // --- POPULATE HISTORICAL AUTOCOMPLETE DATALIST ---
        const historicalDataList = document.getElementById('historicalOptions');
        if (historicalDataList && historicalDataList.options.length === 0 && typeof cardDatabase !== 'undefined') {
            Object.keys(cardDatabase).forEach(rawName => {
                const cleanName = rawName.replace(/_/g, ' ');
                const option = document.createElement('option');
                option.value = cleanName;
                historicalDataList.appendChild(option);
            });
        }

        // --- NEW CHART: Historical Card Tracker ---
        const historicalCtx = document.getElementById('historicalCardChart');

        window.updateHistoricalChart = function () {
            if (!historicalCtx) return; // Safety check

            // Grab both inputs (Assuming you rename the first to '1' and add a '2')
            const input1 = document.getElementById('historicalSearchInput1');
            const input2 = document.getElementById('historicalSearchInput2');

            const searchInput1 = input1 ? input1.value.trim() : '';
            const searchInput2 = input2 ? input2.value.trim() : '';

            const emptyMsg = document.getElementById('historicalEmptyMsg');
            const canvas = document.getElementById('historicalCardChart');

            // Check if inputs are valid and exist in our filtered data
            const valid1 = searchInput1 && cardPresenceByYear[searchInput1];
            const valid2 = searchInput2 && cardPresenceByYear[searchInput2];

            // If NEITHER input is valid, hide the chart
            if (!valid1 && !valid2) {
                canvas.style.display = 'none';
                emptyMsg.style.display = 'flex';
                return;
            }

            canvas.style.display = 'block';
            emptyMsg.style.display = 'none';

            const years = Object.keys(uploadsByYear).sort();
            const activeDatasets = [];

            // Helper function to generate percentage arrays
            const getPercentages = (cardName) => {
                return years.map(year => {
                    const totalDecksThisYear = uploadsByYear[year] || 1;
                    const cardDecksThisYear = cardPresenceByYear[cardName]?.[year] || 0;
                    return ((cardDecksThisYear / totalDecksThisYear) * 100).toFixed(1);
                });
            };

            // Build dataset for Card 1 (Blue)
            if (valid1) {
                activeDatasets.push({
                    label: `${searchInput1} Usage (%)`,
                    data: getPercentages(searchInput1),
                    borderColor: '#79c0ff',
                    backgroundColor: 'rgba(121, 192, 255, 0.2)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: '#2f81f7',
                    pointRadius: 4,
                    pointHoverRadius: 6
                });
            }

            // Build dataset for Card 2 (Coral/Red for contrast)
            if (valid2) {
                activeDatasets.push({
                    label: `${searchInput2} Usage (%)`,
                    data: getPercentages(searchInput2),
                    borderColor: '#ff7b72',
                    backgroundColor: 'rgba(255, 123, 114, 0.2)',
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true,
                    pointBackgroundColor: '#f85149',
                    pointRadius: 4,
                    pointHoverRadius: 6
                });
            }

            // Update existing chart or create a new one
            if (charts.historical) {
                charts.historical.data.labels = years;
                charts.historical.data.datasets = activeDatasets; // Swap in the new array
                charts.historical.update();
            } else {
                charts.historical = new Chart(historicalCtx.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: years,
                        datasets: activeDatasets
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { grid: { color: gridColor }, ticks: { color: textColor } },
                            y: {
                                grid: { color: gridColor },
                                ticks: { color: textColor },
                                beginAtZero: true,
                                title: { display: true, text: '% of Decks that year', color: textColor }
                            }
                        },
                        plugins: {
                            // Make sure legend is visible now that we have multiple lines
                            legend: { display: true, labels: { color: textColor } },
                            tooltip: {
                                callbacks: {
                                    label: (ctx) => ` ${ctx.dataset.label.replace(' Usage (%)', '')}: ${ctx.parsed.y}%`
                                }
                            }
                        }
                    }
                });
            }
        };

        // Initialize the chart with the top 2 most popular cards on first load
        const historicalInput1 = document.getElementById('historicalSearchInput1');
        const historicalInput2 = document.getElementById('historicalSearchInput2');

        if (historicalInput1) {
            const defaultCard1 = topCopiedSliced.length > 0 ? topCopiedSliced[0][0] : null;
            const defaultCard2 = topCopiedSliced.length > 1 ? topCopiedSliced[1][0] : null;

            if (defaultCard1) {
                historicalInput1.value = defaultCard1;

                // Populate the second input if the element and data exist
                if (historicalInput2 && defaultCard2) {
                    historicalInput2.value = defaultCard2;
                }

                // Call the update function once both inputs are populated
                window.updateHistoricalChart();
            } else {
                document.getElementById('historicalCardChart').style.display = 'none';
                document.getElementById('historicalEmptyMsg').style.display = 'flex';
            }
        }

        // --- CHART 5: Title Buzzwords (Word Cloud) ---
        const ctx5 = document.getElementById('buzzwordChart').getContext('2d');

        // If you want more words in the cloud, change your topWords slice from (0, 10) to (0, 30) or more!
        charts.buzzwords = new Chart(ctx5, {
            type: 'wordCloud',
            data: {
                labels: topWords.map(i => i[0].toUpperCase()),
                datasets: [{
                    data: topWords.map(i => i[1]),
                    // Randomize colors for a cool visual effect, or keep it to your theme
                    color: () => {
                        const colors = ['#58a6ff', '#f85149', '#3fb950', '#d2a8ff', '#e3b341'];
                        return colors[Math.floor(Math.random() * colors.length)];
                    }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            // Make the tooltip say "GARG: 42 uses" instead of just "42"
                            label: (context) => `${context.parsed.y} uses`
                        }
                    }
                },
                elements: {
                    wordText: {
                        fontFamily: 'sans-serif',
                        fontStyle: 'bold',
                        // Keep the words mostly horizontal or slightly tilted for readability
                        minRotation: -15,
                        maxRotation: 15,
                    }
                }
            }
        });

        // --- CHART 6: Cost Curve ---
        const ctx6 = document.getElementById('costCurveChart').getContext('2d');
        charts.costCurve = new Chart(ctx6, {
            type: 'bar',
            data: {
                labels: costsSorted.map(cost => `Cost ${cost}`),
                datasets: [{ label: 'Total Copies Across Decks', data: costsSorted.map(cost => costCurve[cost]), backgroundColor: '#3fb950', borderRadius: 4 }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false }, ticks: { color: textColor } }, y: { grid: { color: gridColor }, ticks: { color: textColor } } }, plugins: { legend: { display: false } } }
        });

        // --- Spark Cost Distribution (smooth KDE over all decks) ---
        const sparkCanvas = document.getElementById('sparkDistributionChart');
        if (sparkCanvas && allSparkCosts.length > 1) {
            const data = allSparkCosts;
            const n = data.length;
            const minVal = Math.min(...data);
            const maxVal = Math.max(...data);

            // Spread stats for an automatic bandwidth (Silverman's rule of thumb)
            const mean = data.reduce((a, b) => a + b, 0) / n;
            const std = Math.sqrt(data.reduce((a, b) => a + (b - mean) ** 2, 0) / n);

            const sorted = [...data].sort((a, b) => a - b);
            const quantile = (q) => {
                const pos = (sorted.length - 1) * q;
                const base = Math.floor(pos);
                const rest = pos - base;
                return sorted[base + 1] !== undefined
                    ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
                    : sorted[base];
            };
            const iqr = quantile(0.75) - quantile(0.25);

            const spread = iqr > 0 ? Math.min(std, iqr / 1.34) : std;
            let bandwidth = 1.06 * spread * Math.pow(n, -1 / 5);
            if (!bandwidth || bandwidth <= 0) bandwidth = (maxVal - minVal) / 20 || 50;

            // Reference window keeps the y-axis on the same "# of decks" scale as before
            const refWindow = Math.max(50, Math.round(bandwidth / 50) * 50);
            const invH = 1 / bandwidth;

            // Evaluate the curve across a fine grid (200 points = visually smooth)
            const STEPS = 200;
            const pad = bandwidth * 3;
            const lo = Math.max(0, minVal - pad);
            const hi = maxVal + pad;
            const step = (hi - lo) / STEPS;

            const sparkPoints = [];
            for (let i = 0; i <= STEPS; i++) {
                const x = lo + i * step;
                let sum = 0;
                for (let j = 0; j < n; j++) {
                    const u = (x - data[j]) * invH;
                    sum += Math.exp(-0.5 * u * u);
                }
                // density * N * window  ≈  expected # of decks in a window that wide
                const y = (sum / n) / (Math.sqrt(2 * Math.PI) * bandwidth) * n * refWindow;
                sparkPoints.push({ x, y });
            }

            const avgSpark = mean;

            charts.sparkDistribution = new Chart(sparkCanvas.getContext('2d'), {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'Decks',
                        data: sparkPoints,
                        borderColor: '#d2a8ff',
                        backgroundColor: 'rgba(210, 168, 255, 0.2)',
                        borderWidth: 3,
                        tension: 0,        // points are dense, so straight segments already look smooth
                        fill: true,
                        pointRadius: 0,    // no dots — it's a continuous curve now
                        pointHoverRadius: 4,
                        pointHoverBackgroundColor: '#a371f7'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    scales: {
                        x: {
                            type: 'linear',
                            grid: { color: gridColor },
                            ticks: {
                                color: textColor,
                                maxTicksLimit: 8,
                                callback: (value) => Math.round(value).toLocaleString()
                            },
                            title: { display: true, text: 'Total Spark Cost', color: textColor }
                        },
                        y: {
                            grid: { color: gridColor },
                            ticks: { color: textColor, precision: 0 },
                            beginAtZero: true,
                            title: { display: true, text: '# of Decks', color: textColor }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                title: (items) => `${Math.round(items[0].parsed.x).toLocaleString()} Sparks`,
                                label: (ctx) => ` ~${Math.round(ctx.parsed.y)} decks nearby`,
                                footer: () => `Avg: ${Math.round(avgSpark).toLocaleString()} Sparks`
                            }
                        }
                    }
                }
            });
            // --- Mana Cost Distribution (smooth KDE over all decks) ---
            const manaCanvas = document.getElementById('manaDistributionChart');
            if (manaCanvas && allAvgCosts.length > 1) {
                const data = allAvgCosts;
                const n = data.length;
                const minVal = Math.min(...data);
                const maxVal = Math.max(...data);

                const mean = data.reduce((a, b) => a + b, 0) / n;
                const std = Math.sqrt(data.reduce((a, b) => a + (b - mean) ** 2, 0) / n);

                const sorted = [...data].sort((a, b) => a - b);
                const quantile = (q) => {
                    const pos = (sorted.length - 1) * q;
                    const base = Math.floor(pos);
                    const rest = pos - base;
                    return sorted[base + 1] !== undefined
                        ? sorted[base] + rest * (sorted[base + 1] - sorted[base])
                        : sorted[base];
                };
                const iqr = quantile(0.75) - quantile(0.25);

                const spread = iqr > 0 ? Math.min(std, iqr / 1.34) : std;
                let bandwidth = 1.06 * spread * Math.pow(n, -1 / 5);
                if (!bandwidth || bandwidth <= 0) bandwidth = (maxVal - minVal) / 20 || 0.1;

                // Reference window = histogram-style bin width (scale-independent → clean "# of decks" axis)
                const numBins = Math.min(30, Math.max(10, Math.round(Math.sqrt(n))));
                const refWindow = (maxVal - minVal) > 0 ? (maxVal - minVal) / numBins : bandwidth;
                const invH = 1 / bandwidth;

                const STEPS = 200;
                const pad = bandwidth * 3;
                const lo = Math.max(0, minVal - pad);
                const hi = maxVal + pad;
                const step = (hi - lo) / STEPS;

                const manaPoints = [];
                for (let i = 0; i <= STEPS; i++) {
                    const x = lo + i * step;
                    let sum = 0;
                    for (let j = 0; j < n; j++) {
                        const u = (x - data[j]) * invH;
                        sum += Math.exp(-0.5 * u * u);
                    }
                    const y = (sum / n) / (Math.sqrt(2 * Math.PI) * bandwidth) * n * refWindow;
                    manaPoints.push({ x, y });
                }

                const avgMana = mean;

                charts.manaDistribution = new Chart(manaCanvas.getContext('2d'), {
                    type: 'line',
                    data: {
                        datasets: [{
                            label: 'Decks',
                            data: manaPoints,
                            borderColor: '#3fb950',
                            backgroundColor: 'rgba(63, 185, 80, 0.2)',
                            borderWidth: 3,
                            tension: 0,
                            fill: true,
                            pointRadius: 0,
                            pointHoverRadius: 4,
                            pointHoverBackgroundColor: '#2ea043'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        interaction: { mode: 'index', intersect: false },
                        scales: {
                            x: {
                                type: 'linear',
                                grid: { color: gridColor },
                                ticks: {
                                    color: textColor,
                                    maxTicksLimit: 8,
                                    callback: (value) => value.toFixed(2)
                                },
                                title: { display: true, text: 'Average Mana Cost', color: textColor }
                            },
                            y: {
                                grid: { color: gridColor },
                                ticks: { color: textColor, precision: 0 },
                                beginAtZero: true,
                                title: { display: true, text: '# of Decks', color: textColor }
                            }
                        },
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    title: (items) => `${items[0].parsed.x.toFixed(2)} avg mana`,
                                    label: (ctx) => ` ~${Math.round(ctx.parsed.y)} decks nearby`,
                                    footer: () => `Avg: ${avgMana.toFixed(2)} mana`
                                }
                            }
                        }
                    }
                });
            }
        }
        // --- CHART 6.5: Hot & Cold Trending Cards ---
        const trendingCanvas = document.getElementById('trendingCardsChart');
        const trendingEmptyMsg = document.getElementById('trendingEmptyMsg');

        if (trendingCanvas) {
            // If we are looking at 50 or fewer decks, trends don't make mathematical sense
            if (totalDecks <= RECENT_DECK_COUNT) {
                trendingCanvas.style.display = 'none';
                if (trendingEmptyMsg) {
                    // Remove the inline display:none and use flex to center it
                    trendingEmptyMsg.style.display = 'flex';
                }
            } else {
                // We have enough data! Show the canvas, hide the message
                trendingCanvas.style.display = 'block';
                if (trendingEmptyMsg) {
                    trendingEmptyMsg.style.display = 'none';
                }

                const trendingScores = [];
                // Use cardCopies instead of allTimeCardFreq since it holds the exact same data
                Object.keys(cardCopies).forEach(card => {
                    const allTimeAvg = cardCopies[card] / totalDecks;
                    const recentAvg = (recentCardFreq[card] || 0) / RECENT_DECK_COUNT;
                    const delta = recentAvg - allTimeAvg;

                    if (cardCopies[card] >= 10 || (recentCardFreq[card] || 0) >= 4) {
                        trendingScores.push({ name: card, delta: delta });
                    }
                });

                trendingScores.sort((a, b) => b.delta - a.delta);

                const hottest = trendingScores.slice(0, 5);
                const coldest = trendingScores.slice(-5);
                const hotAndCold = [...hottest, ...coldest];

                const ctx10 = trendingCanvas.getContext('2d');
                charts.trending = new Chart(ctx10, {
                    type: 'bar',
                    data: {
                        labels: hotAndCold.map(item => item.name),
                        datasets: [{
                            label: 'Usage Change',
                            data: hotAndCold.map(item => item.delta.toFixed(2)),
                            backgroundColor: hotAndCold.map(item => item.delta > 0 ? '#ff7b72' : '#58a6ff'),
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        const val = context.raw;
                                        return val > 0 ? `🔥 Trending Up: +${val} copies/deck` : `🧊 Trending Down: ${val} copies/deck`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: { grid: { color: gridColor }, ticks: { color: textColor } },
                            y: { ticks: { color: '#c9d1d9', font: { weight: 'bold' } }, grid: { display: false } }
                        }
                    }
                });
            }
        }

        // --- CHART 7: Class Dominance ---
        const ctx7 = document.getElementById('classRadarChart').getContext('2d');

        // Sort the classes by count (highest to lowest) to create a smooth shape
        const sortedClassEntries = Object.entries(classCounts).sort((a, b) => b[1] - a[1]);
        const sortedClassLabels = sortedClassEntries.map(e => e[0]);
        const sortedClassData = sortedClassEntries.map(e => e[1]);

        charts.classDominance = new Chart(ctx7, {
            type: 'radar',
            data: {
                labels: sortedClassLabels,
                datasets: [{
                    label: 'Total Copies Across Decks',
                    data: sortedClassData,
                    backgroundColor: 'rgba(210, 168, 255, 0.4)',
                    borderColor: '#d2a8ff',
                    pointBackgroundColor: '#a371f7',
                    borderWidth: 2,
                    tension: 0.3 // NEW: Curves the lines between points to reduce jaggedness
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true, // NEW: Keeps the center anchored
                        grid: { color: gridColor },
                        angleLines: { color: gridColor },
                        ticks: { display: false },
                        pointLabels: { color: '#c9d1d9', font: { size: 12 } }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });

        // --- CHART 10: Hero Playrates (Toggleable Radar) ---

        // 1. Define the base lists to determine who belongs to which faction
        const plantHeroes = [
            "Captain Combustible", "Chompzilla", "Citron / Beta-Carrotina",
            "Grass Knuckles", "Green Shadow", "Nightcap", "Rose",
            "Solar Flare", "Spudow", "Wall-Knight"
        ];
        const zombieHeroes = [
            "Brain Freeze", "Electric Boogaloo", "Immorticia", "Impfinity",
            "Neptuna", "Professor Brainstorm", "Rustbolt", "Super Brainz / HG",
            "The Smash", "Z-Mech"
        ];

        // NEW: Helper function to map counts AND sort them from highest to lowest
        const getSortedHeroData = (heroList) => {
            // Pair the heroes with their counts
            const paired = heroList.map(hero => ({
                name: hero,
                count: heroCounts[hero] || 0
            }));

            // Sort descending by count
            paired.sort((a, b) => b.count - a.count);

            // Return separated arrays for Chart.js
            return {
                labels: paired.map(item => item.name),
                data: paired.map(item => item.count)
            };
        };

        // 2. Initialize the chart with sorted Plant data
        const initialPlantData = getSortedHeroData(plantHeroes);

        const ctx10 = document.getElementById('heroChart').getContext('2d');
        charts.heroPlayrates = new Chart(ctx10, {
            type: 'radar',
            data: {
                labels: initialPlantData.labels,
                datasets: [{
                    label: 'Decks Played',
                    data: initialPlantData.data,
                    backgroundColor: 'rgba(63, 185, 80, 0.3)', // Green for plants
                    borderColor: '#3fb950',
                    pointBackgroundColor: '#ffffff',
                    pointBorderColor: '#3fb950',
                    pointHoverBackgroundColor: '#ffffff',
                    pointHoverBorderColor: '#3fb950',
                    borderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    tension: 0.3 // Keeps the lines between points curved
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { color: '#c9d1d9', font: { size: 11 } },
                        ticks: { display: false, backdropColor: 'transparent' },
                        beginAtZero: true // Anchors the center smoothly
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(22, 27, 34, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#c9d1d9',
                        borderColor: '#30363d',
                        borderWidth: 1,
                        callbacks: {
                            label: function (context) {
                                return ` ${context.raw} Decks`;
                            }
                        }
                    }
                }
            }
        });

        // 3. Tab Click Event Listeners to swap data smoothly
        document.querySelectorAll('.hero-tab').forEach(tab => {
            tab.onclick = (e) => {
                // Remove active class from all tabs, add to clicked tab
                document.querySelectorAll('.hero-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');

                const faction = e.target.getAttribute('data-faction');
                const dataset = charts.heroPlayrates.data.datasets[0];

                if (faction === 'plants') {
                    const sortedPlants = getSortedHeroData(plantHeroes);
                    charts.heroPlayrates.data.labels = sortedPlants.labels;
                    dataset.data = sortedPlants.data;

                    dataset.backgroundColor = 'rgba(63, 185, 80, 0.3)'; // Plant Green
                    dataset.borderColor = '#3fb950';
                    dataset.pointBorderColor = '#3fb950';
                } else {
                    const sortedZombies = getSortedHeroData(zombieHeroes);
                    charts.heroPlayrates.data.labels = sortedZombies.labels;
                    dataset.data = sortedZombies.data;

                    dataset.backgroundColor = 'rgba(137, 87, 229, 0.3)'; // Zombie Purple
                    dataset.borderColor = '#8957e5';
                    dataset.pointBorderColor = '#8957e5';
                }

                // Animate the transition
                charts.heroPlayrates.update();
            };
        });

        // --- CHART 9: Average Deck Composition (Card Types) ---
        // Ensure typeCounts has fallback values to prevent undefined errors
        const minions = typeCounts["Fighter / Minion"] || 0;
        const tricks = typeCounts["Trick"] || 0;
        const environments = typeCounts["Environment"] || 0;

        const avgMinions = allDecks.length ? (minions / allDecks.length).toFixed(1) : 0;
        const avgTricks = allDecks.length ? (tricks / allDecks.length).toFixed(1) : 0;
        const avgEnvironments = allDecks.length ? (environments / allDecks.length).toFixed(1) : 0;

        const ctx9 = document.getElementById('averageDeckChart').getContext('2d');
        charts.averageDeck = new Chart(ctx9, {
            type: 'doughnut',
            data: {
                labels: ['Minions', 'Tricks', 'Environments'],
                datasets: [{
                    data: [avgMinions, avgTricks, avgEnvironments],
                    // Green for Minions, Purple for Tricks, Blue for Environments
                    backgroundColor: ['#3fb950', '#8957e5', '#58a6ff'],
                    borderColor: '#161b22',
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { color: '#c9d1d9' } },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return ` ${context.raw} cards per deck`;
                            }
                        }
                    }
                }
            }
        });

    }


    // --- AI DECK BUILDER: SMART SEED MANAGEMENT ---

    const plantClasses = new Set(["Mega-Grow", "Kabloom", "Smarty", "Guardian", "Solar"]);
    let currentSeeds = [];
    let heroAnnounced = false;
    let currentFaction = null;
    let activeClasses = new Set();
    let currentClipboardText = "";
    let lastAddedCard = null; // Memory for AI context

    // UI Elements
    const seedInput = document.getElementById('seedSearchInput');
    const suggestionsBox = document.getElementById('smartSuggestions');
    const generateDeckBtn = document.getElementById('generateDeckBtn');
    const clearSeedsBtn = document.getElementById('clearSeedsBtn');
    const budgetToggle = document.getElementById('budgetToggle');
    const superBudgetToggle = document.getElementById('superBudgetToggle');

    // Toggles Logic
    if (budgetToggle && superBudgetToggle) {
        budgetToggle.addEventListener('change', function () {
            if (this.checked) superBudgetToggle.checked = false;
        });
        superBudgetToggle.addEventListener('change', function () {
            if (this.checked) budgetToggle.checked = false;
        });
    }

    const getTotalCards = () => currentSeeds.reduce((sum, seed) => sum + seed.count, 0);


    // --- 1. Smart Autocomplete ---
    seedInput.addEventListener('input', function () {
        const query = this.value.toLowerCase().trim();
        suggestionsBox.innerHTML = '';

        if (getTotalCards() >= 40) {
            suggestionsBox.innerHTML = '<li style="color: #ff7b72; justify-content: center;">Deck is full! (40 cards)</li>';
            suggestionsBox.style.display = 'block';
            return;
        }

        if (query.length < 2) {
            suggestionsBox.style.display = 'none';
            return;
        }

        let matches = 0;
        Object.keys(cardDatabase).forEach(rawName => {
            if (matches >= 15) return;

            const cleanName = rawName.replace(/_/g, ' ');
            if (cleanName.toLowerCase().includes(query)) {
                const cardInfo = cardDatabase[rawName];
                const cardClass = cardInfo.Class;
                const cardFaction = plantClasses.has(cardClass) ? "Plant" : "Zombie";

                if (currentFaction !== null && currentFaction !== cardFaction) return;
                if (!activeClasses.has(cardClass) && activeClasses.size >= 2) return;

                const existing = currentSeeds.find(s => s.name === rawName);
                if (existing && existing.count >= 4) return;

                const li = document.createElement('li');
                li.innerHTML = `<span>${cleanName}</span> <span class="suggestion-class">${cardClass}</span>`;
                // Add via autocomplete defaults to 4 copies
                li.onclick = () => addSeed(rawName, cardClass, cardFaction, 4);
                suggestionsBox.appendChild(li);
                matches++;
            }
        });

        suggestionsBox.style.display = matches > 0 ? 'block' : 'none';
    });

    document.addEventListener('click', (e) => {
        if (e.target !== seedInput && e.target !== suggestionsBox) {
            suggestionsBox.style.display = 'none';
        }
    });

    function addSeed(rawName, cardClass, cardFaction, requestedAmount = 4) {
        const spaceLeft = 40 - getTotalCards();
        if (spaceLeft <= 0) return;

        const existing = currentSeeds.find(s => s.name === rawName);
        const currentCount = existing ? existing.count : 0;
        const roomForThisCard = 4 - currentCount;

        // Automatically calculate how many we can actually add
        let amountToAdd = Math.min(requestedAmount, spaceLeft, roomForThisCard);
        if (amountToAdd <= 0) return;

        if (existing) {
            existing.count += amountToAdd;
        } else {
            currentSeeds.push({
                name: rawName,
                count: amountToAdd,
                class: cardClass,
                faction: cardFaction,
                cost: cardDatabase[rawName].Cost
            });
        }

        lastAddedCard = rawName; // Update AI memory
        currentFaction = cardFaction;
        activeClasses.add(cardClass);

        seedInput.value = '';
        suggestionsBox.style.display = 'none';
        renderSeeds();
    }

    // --- 2. Unified Visual Rendering ---
    function renderSeeds() {
        const resultsContainer = document.getElementById('generatedDeckList');
        const tracker = document.getElementById('cardCountTracker');
        const title = document.getElementById('generatedDeckTitle');
        const actionContainer = document.getElementById('deckActionContainer');
        const totalCards = getTotalCards();

        // NEW: Always dynamically reconstruct the active classes to prevent de-sync bugs!
        activeClasses.clear();
        currentSeeds.forEach(seed => {
            const cardClass = cardDatabase[seed.name]?.Class;
            if (cardClass) activeClasses.add(cardClass);
        });

        resultsContainer.innerHTML = '';
        resultsContainer.className = 'visual-deck-grid';

        if (tracker) tracker.innerText = `${totalCards}/40`;

        if (currentSeeds.length === 0) {
            resultsContainer.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #888;">No cards added yet. Search above to begin!</div>';
            generateDeckBtn.disabled = true;
            if (title) title.classList.add('hidden');
            if (actionContainer) actionContainer.style.display = 'none';
            currentFaction = null;
            activeClasses.clear();
            lastAddedCard = null;
            triggerAICoPilot();
            return;
        }

        generateDeckBtn.disabled = totalCards >= 40;

        if (totalCards >= 40) {
            const classArray = Array.from(activeClasses).sort();
            let heroName = "";
            let heroesData = [];

            // Handle single vs multiple classes
            if (classArray.length === 1) {
                const singleClass = classArray[0];
                heroName = `Any ${singleClass} Hero`; // Used for clipboard
                heroesData = [{
                    name: singleClass, // Used for the label under the avatar
                    imgFilename: `${singleClass.toLowerCase().replace(/[\s-]+/g, '_')}.webp`
                }];
            } else {
                heroName = heroMap[classArray.join(',')] || `Any ${classArray.join(' / ')} Hero`;
                heroesData = heroName.split(/\s*\/\s*/).map(name => ({
                    name: name,
                    imgFilename: `${name.replace(/[\s-]+/g, '_')}.webp`
                }));
            }

            const isPlant = currentFaction === "Plant";
            const aiDeckName = generateDeckName(currentSeeds, isPlant);

            if (title) {
                title.classList.remove('hidden');

                const heroBadgesHtml = heroesData.map(hero => {
                    return `
            <div class="title-hero-pill">
                <img src="hero_images/${hero.imgFilename}" alt="${hero.name}" class="title-hero-avatar">
                <span class="title-hero-label">${hero.name}</span>
            </div>
        `;
                }).join('');

                title.innerHTML = `
        <div style="font-size: 1.2em; color: var(--accent); font-style: italic; margin-bottom: 8px; text-align: center;">"${aiDeckName}"</div>
        <div class="title-hero-container">
            ${heroBadgesHtml}
        </div>
    `;
            }

            currentClipboardText = `Deck: ${aiDeckName}\nHero: ${heroName}\n\n`;
            if (actionContainer) {
                actionContainer.classList.remove('hidden');
                actionContainer.style.display = 'flex';
            }
        } else {
            if (title) title.classList.add('hidden');
            if (actionContainer) actionContainer.style.display = 'none';
        }

        let displaySeeds = [...currentSeeds].sort((a, b) => {
            const costA = cardDatabase[a.name]?.Cost || 0;
            const costB = cardDatabase[b.name]?.Cost || 0;
            if (costA !== costB) return costA - costB;
            return a.name.localeCompare(b.name);
        });

        displaySeeds.forEach((seed, index) => {
            const displayName = seed.name.replace(/_/g, ' ');
            const dbName = displayName.replace(/ /g, '_');
            const disablePlus = seed.count >= 4 || totalCards >= 40;

            const cardDiv = document.createElement('div');
            // 2. ADD THE ANIMATION CLASS AND DYNAMIC DELAY
            cardDiv.className = 'visual-card pop-animate';
            cardDiv.style.animationDelay = `${index * 35}ms`;

            const img = document.createElement('img');
            img.src = `card_images/${dbName}.png`;
            img.alt = displayName;
            img.title = displayName;
            img.onerror = function () { this.onerror = null; this.src = `card_images/${dbName}.webp`; };

            const badge = document.createElement('div');
            badge.className = 'card-quantity';
            badge.textContent = `x${seed.count}`;

            const controls = document.createElement('div');
            controls.className = 'visual-card-controls';
            controls.innerHTML = `
            <button class="seed-btn minus-btn" data-name="${seed.name}">-</button>
            <button class="seed-btn swap-btn" data-name="${seed.name}">↔</button>
            <button class="seed-btn plus-btn" data-name="${seed.name}" ${disablePlus ? 'disabled' : ''}>+</button>
        `;

            cardDiv.appendChild(img);
            cardDiv.appendChild(badge);
            cardDiv.appendChild(controls);
            resultsContainer.appendChild(cardDiv);

            cardDiv.addEventListener('click', () => {
                const isOpen = cardDiv.classList.contains('show-controls');
                document.querySelectorAll('.visual-card.show-controls').forEach(el => el.classList.remove('show-controls'));
                if (!isOpen) cardDiv.classList.add('show-controls');
            });

            controls.addEventListener('click', e => {
                e.stopPropagation();
            });

            if (totalCards >= 40) {
                currentClipboardText += `${seed.count}x ${displayName}\n`;
            }
        });

        attachQuantityListeners();
        triggerAICoPilot();
        updateDeckStats();
    }

    function attachQuantityListeners() {
        document.querySelectorAll('.minus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = e.target.getAttribute('data-name');
                const seed = currentSeeds.find(s => s.name === name);
                if (seed) {
                    seed.count--;
                    if (seed.count <= 0) {
                        currentSeeds = currentSeeds.filter(s => s.name !== name);
                        activeClasses.clear();
                        currentSeeds.forEach(s => activeClasses.add(s.class));
                        if (lastAddedCard === name) lastAddedCard = null;
                        if (activeClasses.size < 2) heroAnnounced = false;
                    }
                    renderSeeds();
                }
            });
        });

        document.querySelectorAll('.plus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = e.target.getAttribute('data-name');
                const seed = currentSeeds.find(s => s.name === name);
                if (seed && seed.count < 4 && getTotalCards() < 40) {
                    seed.count++;
                    lastAddedCard = name; // Update context to the card they modified
                    renderSeeds();
                }
            });
        });
        document.querySelectorAll('.swap-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const name = e.target.getAttribute('data-name');
                showSwapSuggestions(name);
            });
        });
    }

    if (clearSeedsBtn) {
        clearSeedsBtn.addEventListener('click', () => {
            currentSeeds = [];
            currentFaction = null;
            activeClasses.clear();
            lastAddedCard = null;
            heroAnnounced = false;
            seedInput.value = '';
            renderSeeds();
            if (typeof updateDeckStats === 'function') updateDeckStats();
        });
    }
    // --- SPECIFIC COMBO CALLOUTS ---
    const comboDictionary = [
        {
            // Pogo + MUG
            cards: ["Pogo_Zombie", "Mixed-Up_Gravedigger"],
            message: "**Pogo Zombie** clears a lane, and **Mixed-Up Gravedigger** resets him into a gravestone to do it all over again. Brutal!"
        },
        {
            // Pineclone + Swarm
            cards: ["Pineclone", "Shroom_For_Two"],
            message: "**Shroom for Two** gives you two bodies for 1 sun, perfectly setting up a massive board-wide **Pineclone** transformation."
        },
        {
            // Valkyrie + Mustache Monument
            cards: ["Valkyrie", "Mustache_Monument"],
            message: "Grow her massive in your hand, then drop her on the **Mustache Monument** for a devastating bonus attack."
        },
        {
            // Hearty Coach + Sports
            cards: ["Zombie_Coach", "Team_Mascot"],
            message: "**Team Mascot** buffs your team, and **Zombie Coach** makes them completely invincible. Unstoppable!"
        },
        {
            // Barrel + Mission
            cards: ["Barrel_Of_Deadbeards", "Final_Mission"],
            message: "**Final Mission** destroys your **Barrel of Deadbeards** to deal 4 damage, which triggers the Barrel to wipe out 1-health plants and spawn a 4/3 pirate. Pure value!"
        },
        {
            // Buddy + Pepper
            cards: ["Li'l_Buddy", "Pepper_M.D."],
            message: "A 0-cost **Lil Buddy** instantly heals you, immediately triggering **Pepper M.D.**'s ability to give it a massive growth spurt on the exact same turn!"
        },
        {
            // ANB + Jelly
            cards: ["Admiral_Navy_Bean", "Jelly_Bean"],
            message: "**Admiral Navy Bean** continuously chips away at the Zombie Hero, and makes the perfect Bean evolution target for **Jelly Bean** to bounce massive threats away!"
        },
        {
            // Photosynthesizer + Tricarrotops
            cards: ["Photosynthesizer", "Tricarrotops"],
            message: "**Photosynthesizer** beefs up your **Tricarrotops**'s health, and the card it conjures instantly triggers its Dino-Roar! A massive dino for super cheap."
        },
        {
            // Spinach + Beanstalk
            cards: ["Savage_Spinach", "Typical_Beanstalk"],
            message: "Evolving **Savage Spinach** off your Leafy **Typical Beanstalk** gives every Plant in your hand a massive +2/+2 boost."
        },
        {
            // Imp-Throwing + Toxic
            cards: ["Imp_Throwing_Imp", "Toxic_Waste_Imp"],
            message: "**Toxic Waste Imp** gives all Imps Deadly, turning the tiny Swabbies thrown by your **Imp-Throwing Imp** into lethal, guaranteed removal tools!"
        },
        {
            // Commander + Imp-Throwing
            cards: ["Imp_Commander", "Imp_Throwing_Imp"],
            message: "When **Imp-Throwing Imp** tosses buddies into empty water lanes, **Imp Commander** ensures they draw you cards every time they hit the hero. Incredible draw engine!"
        },
        {
            // Pea Patch + Spinach
            cards: ["Pea_Patch", "Savage_Spinach"],
            message: "**Pea Patch** is the perfect Leafy target for **Savage Spinach**. Your hand gets the +2/+2 evolution buff, and the Spinach itself gets the Pea Patch stats!"
        },
        {
            // Flag + Manager
            cards: ["Flag_Zombie", "Middle_Manager"],
            message: "**Flag Zombie** makes your swarms cheap, and since he's a Professional, he permanently buffs your **Middle Manager** whenever he takes a hit. Synergistic synergy!"
        },
        {
            // Heartichoke + Flytraplanet
            cards: ["Heartichoke", "Venus_Flytraplanet"],
            message: "When **Heartichoke** damages the Zombie Hero on a **Venus Flytraplanet**, it heals you. That heal triggers the Heartichoke to deal damage again, creating an endless cycle of healing and pain!"
        },
        {
            // Snowdrop + Winter Squash
            cards: ["Snowdrop", "Winter_Squash"],
            message: "**Winter Squash** instantly shatters any Zombie that gets frozen, while **Snowdrop** simultaneously absorbs that freeze to gain a massive +2/+2. Cold and calculated!"
        },
        {
            // Goat + Hover-Goat
            cards: ["Goat", "Hover-Goat_3000"],
            message: "**Hover-Goat_3000** gives your regular **Goat** a beefy +2/+2 stats boost, and whenever a Goat takes damage, it just keeps growing stronger!"
        },
        {
            // Fig (Transfiguration) + Imitater
            cards: ["Fig", "Imitater"], // Change "Transfiguration" to "Fig" if that's how it is named in your cardDatabase!
            message: "Playing **Transfiguration** into an **Imitater** gives you TWO massive bodies that will both mutate into more expensive, game-ending threats at the end of the turn!"
        },
        {
            // CycleCap
            cards: ["Astro_Shroom", "Planet_of_the_Grapes"],
            message: "**Astro-Shroom** deals damage when you play a plant, triggering **Planet of the Grapes** to draw a card, which lets you play MORE plants!"
        },
        {
            // Con Man + Regifter
            cards: ["Quickdraw_Con_Man", "Regifting_Zombie"],
            message: "**Regifting Zombie** forces both players to draw cards, instantly triggering **Quickdraw Con Man**'s ability to burn the Plant Hero's health. Aggressive draw!"
        },
        {
            // Teacher + Going Viral
            cards: ["Teacher", "Going_Viral"],
            message: "**Zombology Teacher** reduces the cost of tricks, making **Going Viral** incredibly cheap to play and shuffle, easily swarming the board with Frenzy-fueled zombies."
        },
        {
            // Three-Nut + Garlic
            cards: ["Three-Nut", "Garlic"],
            message: "**Three-Nut** instantly sets any plant's attack to 3. Combine this with the massive 5-health of a 1-cost **Garlic** to create an aggressively cheap and beefy front line."
        },
        {
            // Onion Rings + Lil Buddy
            cards: ["Onion_Rings", "Li'l_Buddy"],
            message: "**Onion Rings** turns every plant in your hand into a 4/4. Suddenly, your free **Lil Buddy** becomes a 0-cost 4/4 that still heals you. Insane value!"
        },
        {
            // Cob Cannon + Lil Buddy
            cards: ["Cob_Cannon", "Li'l_Buddy"],
            message: "Need instant removal? Drop a 0-cost **Lil Buddy**, then immediately evolve your **Cob Cannon** on it to destroy a Zombie and leave behind a 4/6 body."
        },
        {
            // Warlord + MUG
            cards: ["Intergalactic_Warlord", "Mixed-Up_Gravedigger"],
            message: "**Intergalactic Warlord** buffs your entire board permanently. Use **Mixed-Up Gravedigger** to hide him, and when he pops back out, he triggers his massive team-buff all over again!"
        },
        {
            // Briar Rose + Poppin' Poppies
            cards: ["Briar_Rose", "Poppin'_Poppies"],
            message: "**Poppin' Poppies** floods the board with 1-health Lil' Buddies. With **Briar Rose** on the field, every single one of those tiny flowers becomes a lethal, zombie-destroying trap!"
        },
        {
            // GTI + Fireworks
            cards: ["Gargantuar-Throwing_Imp", "Fireworks_Zombie"],
            message: "**Fireworks Zombie** deals 1 damage to everything, which instantly pokes your **Gargantuar-Throwing Imp** and causes him to immediately throw a massive Gargantuar onto the board!"
        },
        {
            // Dr. Spacetime + Buried Treasure
            cards: ["Dr._Spacetime", "Buried_Treasure"],
            message: "Play **Buried Treasure** with **Dr. Spacetime** on the board. The Treasure conjures a Legendary, and Spacetime makes it cheaper. You're swimming in discounted, high-tier cards!"
        },
        {
            // Galacta-Cactus + Pear Cub
            cards: ["Galacta-Cactus", "Pear_Cub"],
            message: "When **Galacta-Cactus** gets destroyed, its 1-damage explosion is the perfect trigger to crack open your **Pear Cub** and unleash the massive Grizzly Pear inside."
        }
    ];
    function parseCardList(cardList) {
        const map = {};
        (cardList || []).forEach(entry => {
            const firstSpace = entry.indexOf(' ');
            const countStr = entry.substring(0, firstSpace).replace(/x/i, '');
            const count = parseInt(countStr) || 1;
            const cardName = entry.substring(firstSpace + 1).trim();
            map[cardName] = (map[cardName] || 0) + count;
        });
        return map;
    }

    function getClosestDeckMatch() {
        if (!fullDatabase) return null;

        const currentMap = {};
        currentSeeds.forEach(seed => {
            currentMap[seed.name] = seed.count;
        });

        let bestDeck = null;
        let bestScore = -1;

        Object.values(fullDatabase).forEach(deck => {
            const deckMap = parseCardList(deck.cards);

            let overlap = 0;
            for (const cardName in currentMap) {
                overlap += Math.min(currentMap[cardName] || 0, deckMap[cardName] || 0);
            }

            if (overlap > bestScore) {
                bestScore = overlap;
                bestDeck = deck;
            }
        });

        return bestDeck;
    }
    function getVerdictGrade(overallPercent, allTopTier, totalCards) {
        let grade, gradeColor;

        if (totalCards <= 8) {
            grade = "—";
            gradeColor = "rgba(255,255,255,0.3)";
        } else if (overallPercent >= 95) {
            grade = "S";
            gradeColor = "#00E5FF";
        } else if (overallPercent >= 87.5) {
            grade = "A";
            gradeColor = "#4CAF50";
        } else if (overallPercent >= 75) {
            grade = "B";
            gradeColor = "#8BC34A";
        } else if (overallPercent >= 65) {
            grade = "C";
            gradeColor = "#ffb300";
        } else if (overallPercent >= 50) {
            grade = "D";
            gradeColor = "#ff8800";
        } else {
            grade = "F";
            gradeColor = "#ff4b4b";
        }

        return { grade, gradeColor };
    }
    // --- LIVE DECK ANALYTICS ENGINE ---

    document.getElementById('shareDeckBtn').addEventListener('click', function () {
        const cardDictionary = Object.keys(cardDatabase).sort();

        const minimalDeckString = currentSeeds.map(card => {
            const cardIndex = cardDictionary.indexOf(card.name).toString(36);
            // Use a DOT for counts, and omit it entirely if the count is 4
            return card.count === 4 ? cardIndex : `${cardIndex}.${card.count}`;
        }).join('-'); // Use a HYPHEN to separate cards (100% URL safe!)

        const shareUrl = `${window.location.origin}${window.location.pathname}?deck=${minimalDeckString}#crafter`;

        navigator.clipboard.writeText(shareUrl);

        const originalBg = this.style.background;
        this.innerText = "Link Copied!";
        this.style.background = "#4CAF50";

        setTimeout(() => {
            this.innerText = "Share Link";
            this.style.background = originalBg;
        }, 2000);
    });
    window.addEventListener('DOMContentLoaded', () => {
        const deckCode = new URLSearchParams(window.location.search).get('deck');
        const isCrafterHash = window.location.hash === '#crafter';
        if (!deckCode || !isCrafterHash) return;

        let attempts = 0;
        const dataWatcher = setInterval(() => {
            attempts++;

            // CHECK ALL REQUIRED DATA, NOT JUST cardDatabase
            const isDatabaseReady = typeof cardDatabase !== 'undefined' && cardDatabase && Object.keys(cardDatabase).length > 0;
            const isFullDatabaseReady = typeof fullDatabase !== 'undefined' && fullDatabase && Object.keys(fullDatabase).length > 0;
            // Add checks for cardAverageCopies or comboDictionary if they load asynchronously too

            // Only proceed if ALL dependencies are locked and loaded
            if (isDatabaseReady && isFullDatabaseReady) {
                clearInterval(dataWatcher);
                if (typeof initSynergyMatrix === 'function') initSynergyMatrix();

                try {
                    // ... [Rest of your URL parsing logic stays exactly the same]
                    const cardDictionary = Object.keys(cardDatabase).sort();

                    // Set up validation trackers
                    let totalCards = 0;
                    let isDeckValid = true;
                    const parsedSeeds = [];
                    const seenCards = new Set(); // Tracks unique cards

                    const pairs = deckCode.split('-');

                    for (const pair of pairs) {
                        const [indexStr, countStr] = pair.split('.');
                        const cardIndex = parseInt(indexStr, 36);

                        // Rule 3: Reject if we have already seen this card
                        if (seenCards.has(cardIndex)) {
                            isDeckValid = false;
                            break; // Stop parsing immediately
                        }
                        seenCards.add(cardIndex);

                        const cardName = cardDictionary[cardIndex];
                        const fullCardData = cardDatabase[cardName];

                        if (fullCardData) {
                            const count = countStr ? parseInt(countStr, 10) : 4;

                            // Rule 1: Reject if any card count is not 1, 2, 3, or 4
                            if (isNaN(count) || count < 1 || count > 4) {
                                isDeckValid = false;
                                break; // Stop parsing immediately
                            }

                            totalCards += count;

                            // Rule 2: Reject if total deck size exceeds 40
                            if (totalCards > 40) {
                                isDeckValid = false;
                                break; // Stop parsing immediately
                            }

                            if (!currentFaction) {
                                currentFaction = plantClasses.has(fullCardData.Class) ? "Plant" : "Zombie";
                            }

                            parsedSeeds.push({
                                ...fullCardData,
                                name: cardName,
                                count: count,
                                class: fullCardData.Class,
                                cost: fullCardData.Cost
                            });
                        }
                    }

                    // If validation failed, silently exit and do nothing to the UI
                    if (!isDeckValid) return;

                    // If we get here, the URL is safe and valid. Apply it.
                    currentSeeds = parsedSeeds;

                    const crafterView = document.getElementById('crafterView');
                    if (crafterView) crafterView.classList.remove('hidden');

                    if (typeof updateDeckStats === 'function') updateDeckStats();
                    if (typeof renderSeeds === 'function') renderSeeds();

                } catch (error) {
                    // Silently catch manual URL tampering
                }
            } else if (attempts > 50) {
                clearInterval(dataWatcher);
            }
        }, 100);
    });


    function getTopThreeRecommendations(baseCardName = null) {
        let candidatePool = Object.keys(cardDatabase);
        let scoredCandidates = [];

        const baseSeed = baseCardName ? currentSeeds.find(c => c.name === baseCardName) : null;
        const baseCount = baseSeed ? baseSeed.count : 0;

        // Build the class set after removing the clicked card entirely
        let postSwapClasses = new Set();
        currentSeeds.forEach(card => {
            if (baseCardName && card.name === baseCardName) return;
            postSwapClasses.add(card.class || card.Class); // fallback for safety
        });

        // Fetch grading context ONCE to prevent massive performance drops in the loop
        const ctx = typeof getVerdictContext === "function" ? getVerdictContext() : {};

        candidatePool.forEach(candidateName => {
            if (baseCardName && candidateName === baseCardName) return;

            const candidateData = cardDatabase[candidateName];
            if (!candidateData) return;

            const candidateClass = candidateData.Class;
            const candidateFaction = plantClasses.has(candidateClass) ? "Plant" : "Zombie";

            if (candidateFaction !== currentFaction) return;

            // Enforce 2-class limit AFTER the swap
            const trialClasses = new Set(postSwapClasses);
            trialClasses.add(candidateClass);
            if (trialClasses.size > 2) return;

            const existingCopy = currentSeeds.find(c => c.name === candidateName);

            // Capacity Checks
            if (baseCardName) {
                // Swap mode: replacement must fit within the copies being removed
                const existingCandidateCount = existingCopy ? existingCopy.count : 0;
                if (existingCandidateCount + baseCount > 4) return;
            } else {
                // Normal add mode: can't exceed 4 copies, and respect active class limits
                if (existingCopy && existingCopy.count >= 4) return;
                if (!activeClasses.has(candidateClass) && activeClasses.size >= 2) return;
            }

            // --- NEW: Build the Phantom Deck ---
            let simulatedStrings = [];

            currentSeeds.forEach(deckCard => {
                if (baseCardName && deckCard.name === baseCardName) return; // Skip removed card entirely

                if (deckCard.name === candidateName) return; // Skip existing copies (we merge them below)

                simulatedStrings.push(`${deckCard.count}x ${deckCard.name}`);
            });

            // Add the candidate we are currently testing
            const countToAdd = baseCardName ? baseCount : 1;
            const existingCount = existingCopy ? existingCopy.count : 0;
            simulatedStrings.push(`${countToAdd + existingCount}x ${candidateName}`);

            // --- NEW: Grade it using the True Engine ---
            const simVerdict = getDeckVerdictFromCards(simulatedStrings, null, ctx);

            // Store the final score and secondary stats for tie-breakers
            if (simVerdict.score > 0) {
                scoredCandidates.push({
                    name: candidateName,
                    score: simVerdict.score,
                    synergy: simVerdict.synergyScore,
                    power: simVerdict.powerScore
                });
            }
        });

        // Sort by the true Verdict score first. 
        // If scores are tied, use Synergy, then Power as tie-breakers.
        scoredCandidates.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (b.synergy !== a.synergy) return b.synergy - a.synergy;
            return b.power - a.power;
        });

        return scoredCandidates.slice(0, 3);
    }
    // ============================================================
    // PvZ HEROES DECK BUILDER — VISUAL UPGRADE (JS)
    // Replaces: updateDeckStats(), triggerAICoPilot(), showSwapSuggestions()
    // All scoring / recommendation / simulation logic is untouched —
    // only the rendering changed. Requires deck-builder-visuals.css
    // and the new ai-pane HTML.
    // ============================================================

    // ------------------------------------------------------------
    // Shared helpers (new — rendering only)
    // ------------------------------------------------------------

    // Grade cutoffs — the gauge (zones, letters, marker mapping) is built
    // entirely from this constant, so editing it here is all you need to do.
    // `label` is the plain-language meaning shown instead of a raw /100 score.
    const GRADE_CUTOFFS = [
        { letter: 'S', min: 95, label: 'Excellent' },
        { letter: 'A', min: 87.5, label: 'Good' },
        { letter: 'B', min: 75, label: 'Average' },
        { letter: 'C', min: 65, label: 'Weak' },
        { letter: 'D', min: 50, label: 'Bad' },
        { letter: 'F', min: 0, label: 'Awful' },
    ];

    const GRADE_COLORS = {
        F: 'var(--grade-f)', D: 'var(--grade-d)', C: 'var(--grade-c)',
        B: 'var(--grade-b)', A: 'var(--grade-a)', S: 'var(--grade-s)',
    };

    // Ascending bands with explicit [min, max) ranges, derived once
    const GRADE_BANDS = [...GRADE_CUTOFFS]
        .sort((a, b) => a.min - b.min)
        .map((g, i, arr) => ({
            letter: g.letter,
            label: g.label,
            min: g.min,
            max: i < arr.length - 1 ? arr[i + 1].min : 100,
        }));

    // Maps a raw 0–100 score to a visual % on the gauge.
    // Each grade occupies an equal-width zone; the score is interpolated
    // within its own band. So mid-B (81 of 75–87.5) sits mid-way through
    // the B segment — F no longer hogs half the bar, S isn't a sliver.
    function scoreToGaugePercent(score) {
        const s = Math.max(0, Math.min(100, score));
        const bandWidth = 100 / GRADE_BANDS.length;
        const i = GRADE_BANDS.findIndex(b => s >= b.min && s < b.max);
        const idx = i === -1 ? GRADE_BANDS.length - 1 : i;   // score === 100
        const band = GRADE_BANDS[idx];
        const frac = band.max > band.min ? (s - band.min) / (band.max - band.min) : 1;
        return idx * bandWidth + frac * bandWidth;
    }

    // Builds the gauge zones + letters from GRADE_CUTOFFS (runs once, lazily)
    let _gaugeBuilt = false;
    function buildPowerGauge() {
        const zonesHost = document.getElementById('pmZones');
        const lettersHost = document.getElementById('pmLetters');
        if (!zonesHost || !lettersHost || _gaugeBuilt) return;

        const bandWidth = 100 / GRADE_BANDS.length;

        zonesHost.innerHTML = GRADE_BANDS.map(b =>
            `<div class="pm-zone" data-g="${b.letter}" title="${b.letter} · ${b.min}–${b.max}"></div>`
        ).join('');

        lettersHost.innerHTML = GRADE_BANDS.map((b, i) =>
            `<span class="pm-letter" data-g="${b.letter}" style="left: ${(i + 0.5) * bandWidth}%; --g: ${GRADE_COLORS[b.letter] || '#fff'};">${b.letter}</span>`
        ).join('');

        _gaugeBuilt = true;
    }

    // Wraps a message in Dave's speech bubble (mini avatar + tail + pop animation)
    function daveSay(innerHtml) {
        return `
    <div class="dave-msg">
        <img src="crazydave.webp" alt="" class="dave-msg-avatar">
        <div class="speech-bubble">${innerHtml}</div>
    </div>`;
    }

    // Dave "thinking" bubble with bouncing dots
    function daveThinking(text) {
        return daveSay(`
        <span style="display:inline-flex; align-items:center; gap:8px;">
            <span class="typing-dots"><span></span><span></span><span></span></span>
            <em style="opacity:0.8;">${text}</em>
        </span>`);
    }

    // Smoothly counts the "pts to next grade" number toward its new value
    let _pmTweenRaf = null;
    function tweenNumber(el, target, suffix = '') {
        if (!el) return;
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            el.innerText = Math.round(target * 10) / 10 + suffix;
            return;
        }
        cancelAnimationFrame(_pmTweenRaf);
        const start = parseFloat(el.innerText) || 0;
        const t0 = performance.now();
        const dur = 700;
        const step = (now) => {
            const p = Math.min((now - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
            el.innerText = Math.round((start + (target - start) * eased) * 10) / 10 + suffix;
            if (p < 1) _pmTweenRaf = requestAnimationFrame(step);
        };
        _pmTweenRaf = requestAnimationFrame(step);
    }

    // ------------------------------------------------------------
    // LIVE DECK ANALYTICS — Power Meter edition
    // ------------------------------------------------------------
    function updateDeckStats() {
        const hud = document.getElementById('deckStatsHud');
        const totalCards = getTotalCards();

        if (!hud || totalCards === 0) {
            if (hud) hud.style.display = 'none';
            return;
        }

        hud.style.display = 'block';

        // 1. Format the current seeds into the string array getDeckVerdictFromCards expects
        const deckCards = currentSeeds.map(s => `${s.count}x ${s.name}`);

        // 2. Delegate all heavy lifting to the verdict function (unchanged)
        const stats = getDeckVerdictFromCards(deckCards);

        // ==========================================
        // UI 1: Score gauge — marker mapped piecewise through grade zones
        // ==========================================
        buildPowerGauge();

        const score = Math.max(0, Math.min(100, stats.score || 0));

        const marker = document.getElementById('pmMarker');
        if (marker) marker.style.left = `${scoreToGaugePercent(score)}%`;

        // Light up the active grade zone + letter
        const activeBand = GRADE_BANDS.find(b => score >= b.min && score < b.max)
            || GRADE_BANDS[GRADE_BANDS.length - 1];
        const activeLetter = activeBand.letter;

        // Plain-language verdict ("Average") instead of a misleading /100 number,
        // plus a "pts to next grade" countdown for live feedback
        const qualityEl = document.getElementById('pmQualityWord');
        const nextEl = document.getElementById('pmNextGrade');
        if (qualityEl) {
            qualityEl.innerText = activeBand.label;
            qualityEl.style.color = stats.gradeColor;
        }
        if (nextEl) {
            const bandIdx = GRADE_BANDS.indexOf(activeBand);
            const nextBand = GRADE_BANDS[bandIdx + 1];
            if (nextBand) {
                const ptsToNext = Math.max(nextBand.min - score, 0);
                nextEl.style.display = '';
                // tween the number, keep the static text outside the tween target
                nextEl.innerHTML = `<span id="pmNextPts">${nextEl.querySelector('#pmNextPts')?.innerText || 0}</span> pts to ${nextBand.letter}`;
                tweenNumber(document.getElementById('pmNextPts'), Math.round(ptsToNext * 10) / 10);
            } else {
                nextEl.style.display = '';
                nextEl.innerText = 'Top grade!';
            }
        }
        document.querySelectorAll('.pm-zone').forEach(z =>
            z.classList.toggle('active', z.dataset.g === activeLetter));
        document.querySelectorAll('.pm-letter').forEach(l =>
            l.classList.toggle('active', l.dataset.g === activeLetter));

        // Big grade letter (uses the verdict's own grade + color)
        const gradeEl = document.getElementById('verdictGrade');
        gradeEl.innerText = stats.grade;
        gradeEl.style.color = stats.gradeColor;

        // ==========================================
        // UI 2: Mana Curve Chart (SVG — unchanged renderer)
        // ==========================================
        const chart = document.getElementById('manaCurveChart');
        const counts = [stats.curve[1], stats.curve[2], stats.curve[3], stats.curve[4], stats.curve[5], stats.curve["6+"]];
        const maxCurveVal = Math.max(...counts, 1);

        const width = chart.clientWidth > 0 ? chart.clientWidth : 300;
        const height = 40;
        const xStep = width / (counts.length - 1);

        let pathD = `M 0,${height} `;
        const points = [];

        counts.forEach((count, i) => {
            const x = i * xStep;
            const y = height - ((count / maxCurveVal) * (height - 4)) - 2;
            points.push({ x, y });
            pathD += `L ${x},${y} `;
        });

        pathD += `L ${width},${height} Z`;

        chart.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%; overflow: visible; display: block;">
        <defs>
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#4CAF50" stop-opacity="0.5"/>
                <stop offset="100%" stop-color="#4CAF50" stop-opacity="0.0"/>
            </linearGradient>
        </defs>
        <path d="${pathD}" fill="url(#curveGradient)" stroke="#4CAF50" stroke-width="2" stroke-linejoin="round" />
        ${points.map(p => `<circle cx="${p.x}" cy="${p.y}" r="3" fill="#1e1e24" stroke="#4CAF50" stroke-width="1.5" />`).join('')}
    </svg>
`;

        // ==========================================
        // UI 3: Speed / cost computations (unchanged math — feeds subtitle)
        // ==========================================
        let speedLabel = "Midrange";

        if (stats.avgCost <= 2.2) {
            speedLabel = "Aggro/Rush";
        } else if (stats.avgCost > 2.2 && stats.avgCost <= 3.5) {
            speedLabel = "Midrange";
        } else {
            speedLabel = "Control/Late";
        }

        const archetype = speedLabel.split('/')[0];
        document.getElementById('verdictArchetype').innerText = archetype;
        document.getElementById('verdictSubtitle').innerText =
            `${totalCards} cards · avg cost ${stats.avgCost.toFixed(1)} · ${stats.costLabel.toLowerCase()}`;

        // ==========================================
        // UI 4: Callouts (same logic, rendered as pill chips)
        // ==========================================
        const callouts = [];
        if (totalCards >= 6) {
            if (stats.synergyScore >= 88) callouts.push({ dir: 'up', text: 'Elite synergy', val: stats.synergyScore + '%', pri: 5 });
            else if (stats.synergyScore >= 75) callouts.push({ dir: 'up', text: 'Strong synergy', val: stats.synergyScore + '%', pri: 3 });
            else if (stats.synergyScore < 65) callouts.push({ dir: 'down', text: 'Weak synergy', val: stats.synergyScore + '%', pri: 5 });
            else if (stats.synergyScore < 50) callouts.push({ dir: 'down', text: 'Low synergy', val: stats.synergyScore + '%', pri: 3 });

            if (stats.consistencyScore >= 85) callouts.push({ dir: 'up', text: 'Highly consistent', val: stats.consistencyScore + '%', pri: 4 });
            else if (stats.consistencyScore < 40) callouts.push({ dir: 'down', text: 'Inconsistent', val: stats.consistencyScore + '%', pri: 5 });
            else if (stats.consistencyScore < 65) callouts.push({ dir: 'down', text: 'Low consistency', val: stats.consistencyScore + '%', pri: 3 });

            if (stats.powerScore >= 85) callouts.push({ dir: 'up', text: 'Meta powerhouse', val: stats.powerScore + '%', pri: 4 });
            else if (stats.powerScore < 50) callouts.push({ dir: 'down', text: 'Off-meta', val: stats.powerScore + '%', pri: 2 });

            if (stats.curveHealthText === "Excellent") callouts.push({ dir: 'up', text: 'Excellent curve', val: '', pri: 4 });
            else if (stats.curveHealthText === "Awkward") callouts.push({ dir: 'down', text: 'Awkward curve', val: '', pri: 5 });

            if (stats.costLabel === "P2W") callouts.push({ dir: 'down', text: 'P2W cost', val: '', pri: 2 });
            else if (stats.costLabel === "Budget" && stats.powerScore >= 60) callouts.push({ dir: 'up', text: 'Budget powerhouse', val: '', pri: 3 });
        }

        callouts.sort((a, b) => b.pri - a.pri);
        const top = callouts.slice(0, 3);
        const calloutHost = document.getElementById('verdictCallouts');

        calloutHost.innerHTML = top.map((c, i) => `
        <span class="pm-chip ${c.dir}" style="animation-delay:${i * 70}ms;">
            ${c.dir === 'up' ? '↑' : '↓'} ${c.text}
            ${c.val ? `<span class="pm-chip-val">${c.val}</span>` : ''}
        </span>
    `).join('');
    }

    // ------------------------------------------------------------
    // CONVERSATIONAL AI CO-PILOT — speech bubble edition
    // ------------------------------------------------------------
    function triggerAICoPilot() {
        window.activeSwapTarget = null;
        const chatFeed = document.getElementById('aiChatFeed');
        if (!chatFeed) return;

        if (currentSeeds.length === 0) {
            const cardNames = Object.keys(cardDatabase);
            const randomCard = cardNames[Math.floor(Math.random() * cardNames.length)].replace(/_/g, ' ');

            chatFeed.innerHTML = daveSay(`
            Heey I'm Craaaazy Dave! I'm the best at creating amazing PvZ Heroes decks!
            Enter a card to get started. Maybe <strong>${randomCard}</strong>?
        `);
            return;
        }

        if (getTotalCards() >= 40) {
            const closestDeck = getClosestDeckMatch();
            let baseHtml = "";

            if (!closestDeck) {
                baseHtml = daveSay(`Your deck is complete! I could not find a close match in the deck database.`);
            } else {
                const deckName = (closestDeck.name || "").trim();
                const uploadDate = closestDeck.upload_date || "Unknown date";

                if (closestDeck.youtube_url) {
                    baseHtml = daveSay(`
                    Your deck is complete! Your deck is closest to
                    <a href="${closestDeck.youtube_url}" target="_blank" rel="noopener noreferrer">${deckName}</a>
                    (from ${uploadDate}).
                    <span class="bubble-sub">Video: ${closestDeck.youtube_title || "YouTube deck video"}</span>
                `);
                } else {
                    baseHtml = daveSay(`
                    Your deck is complete! Your deck is closest to
                    <strong style="color: var(--accent, #4CAF50);">${deckName}</strong>
                    (from ${uploadDate}).
                `);
                }
            }

            // Show thinking bubble immediately so the UI doesn't feel frozen
            chatFeed.innerHTML = baseHtml + daveThinking("Hmm, let me study this deck...");

            // Yield the main thread so the browser paints the thinking bubble
            setTimeout(() => {
                initSynergyMatrix();

                const ctx = typeof getVerdictContext === "function" ? getVerdictContext() : {};

                const currentDeckStrings = currentSeeds.map(s => `${s.count}x ${s.name}`);
                const baselineVerdict = getDeckVerdictFromCards(currentDeckStrings, null, ctx);
                const baselineScore = baselineVerdict.score;

                let bestSwapIdea = null;
                let maxImprovement = 0;

                currentSeeds.forEach(seed => {
                    const recommendations = getTopThreeRecommendations(seed.name);

                    recommendations.forEach(rec => {
                        const simulatedStrings = currentSeeds.map(s => {
                            if (s.name === seed.name) return `${s.count}x ${rec.name}`;
                            return `${s.count}x ${s.name}`;
                        });

                        const simVerdict = getDeckVerdictFromCards(simulatedStrings, null, ctx);
                        const simScore = simVerdict.score;
                        const improvement = simScore - baselineScore;

                        if (improvement > maxImprovement) {
                            maxImprovement = improvement;
                            bestSwapIdea = {
                                removeCard: seed.name,
                                addCard: rec.name,
                                oldScore: baselineScore,
                                newScore: simScore
                            };
                        }
                    });
                });

                let swapHtml = "";

                if (bestSwapIdea) {
                    const weakName = bestSwapIdea.removeCard.replace(/_/g, ' ');
                    const topName = bestSwapIdea.addCard.replace(/_/g, ' ');
                    const boostText = `+${Math.round(maxImprovement)}% rating`;

                    swapHtml = daveSay(`
                    I found something! Swapping out <strong>${weakName}</strong> for
                    <strong>${topName}</strong> will improve your deck's curve and synergy!
                `) + `
                <div class="swap-duel">
                    <div class="swap-duel-label">Top swap idea · ${boostText}</div>
                    <div class="swap-duel-cards">
                        <div class="swap-card out">
                            <img src="card_images/${bestSwapIdea.removeCard}.png" alt="${weakName}" title="${weakName}"
                                onerror="this.onerror=null; this.src='card_images/${bestSwapIdea.removeCard}.webp';">
                            <span class="swap-tag">Out</span>
                        </div>
                        <span class="swap-arrow">➜</span>
                        <div class="swap-card in">
                            <img src="card_images/${bestSwapIdea.addCard}.png" alt="${topName}" title="${topName}"
                                onerror="this.onerror=null; this.src='card_images/${bestSwapIdea.addCard}.webp';">
                            <span class="swap-tag">In</span>
                        </div>
                    </div>
                    <button class="add-rec-btn generate-btn" data-remove="${bestSwapIdea.removeCard}" data-add="${bestSwapIdea.addCard}">
                        Make the swap
                    </button>
                </div>`;
                } else {
                    swapHtml = daveSay(`Great job on such a well-optimized and balanced deck!`);
                }

                chatFeed.innerHTML = baseHtml + swapHtml;

                const swapBtn = chatFeed.querySelector('.add-rec-btn[data-remove]');
                if (swapBtn) {
                    swapBtn.addEventListener('click', (e) => {
                        const removeName = e.target.getAttribute('data-remove');
                        const addName = e.target.getAttribute('data-add');
                        applyFullSwap(removeName, addName);
                    });
                }
            }, 50);

            return;
        }

        // --- Deck NOT complete: greeting + 3 recommendations ---
        initSynergyMatrix();
        chatFeed.innerHTML = daveThinking("Analyzing synergies...");

        setTimeout(() => {
            const recommendations = getTopThreeRecommendations();

            if (recommendations.length === 0) {
                chatFeed.innerHTML = daveSay(`I can't find any more valid cards for this combination! Try removing a card.`);
                return;
            }

            const spaceLeft = 40 - getTotalCards();
            const classArray = Array.from(activeClasses).sort();
            const heroName = heroMap[classArray.join(',')] || `a ${classArray.join(' / ')} Hero`;

            const recData = recommendations.map(rec => {
                const displayName = rec.name.replace(/_/g, ' ');
                const data = cardDatabase[rec.name];
                let targetCopies = 3;

                if (cardAverageCopies && cardAverageCopies[rec.name] && cardAverageCopies[rec.name].appearances > 0) {
                    targetCopies = Math.round(cardAverageCopies[rec.name].total / cardAverageCopies[rec.name].appearances);
                }
                targetCopies = Math.min(targetCopies, spaceLeft, 4);
                if (targetCopies < 1) targetCopies = 1;

                return { name: rec.name, displayName, data, targetCopies };
            });

            // 1. Average play frequency → smart adjectives (unchanged)
            let avgFreq = 1;
            if (Object.keys(cardFrequencies).length > 0) {
                const sumFreq = Object.values(cardFrequencies).reduce((a, b) => a + b, 0);
                avgFreq = sumFreq / Object.keys(cardFrequencies).length;
            }

            let aiDialogue = "";

            // 2. Contextual greeting based on last action (unchanged)
            let comboTriggered = false;

            if (lastAddedCard) {
                const triggeredCombo = comboDictionary.find(combo =>
                    combo.cards.includes(lastAddedCard) &&
                    combo.cards.every(c => currentSeeds.some(s => s.name === c))
                );

                if (triggeredCombo) {
                    let formattedMessage = triggeredCombo.message
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>');

                    aiDialogue = formattedMessage + "<br><br>";
                    comboTriggered = true;
                }

                if (!comboTriggered) {
                    const lastNameClean = lastAddedCard.replace(/_/g, ' ');
                    const lastCardData = cardDatabase[lastAddedCard];
                    const lastClass = lastCardData ? lastCardData.Class : "Unknown";

                    const myFreq = cardFrequencies[lastAddedCard] || 0;
                    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

                    let popAdj = "";

                    if (myFreq > avgFreq * 3.0) {
                        popAdj = pickRandom([
                            "an absolute powerhouse",
                            "a ridiculously popular",
                            "an everywhere-all-at-once",
                            "a top-tier, essential"
                        ]);
                    } else if (myFreq > avgFreq * 1.8) {
                        popAdj = pickRandom([
                            "a super reliable",
                            "a heavy-hitting, competitive",
                            "a widely-used",
                            "a trusty, go-to"
                        ]);
                    } else if (myFreq > avgFreq * 0.8) {
                        popAdj = pickRandom([
                            "a solid, standard",
                            "a completely reasonable",
                            "a fair, middle-of-the-road",
                            "an okay, everyday"
                        ]);
                    } else if (myFreq > avgFreq * 0.3) {
                        popAdj = pickRandom([
                            "a pretty clunky, situational",
                            "a definitely off-meta (and maybe a bit weak)",
                            "a rarely played",
                            "a somewhat questionable"
                        ]);
                    } else {
                        popAdj = pickRandom([
                            "a bottom-of-the-barrel",
                            "a straight-up desperate",
                            "a very, uh... *brave*",
                            "a highly unpopular (probably for a good reason)"
                        ]);
                    }

                    if (currentSeeds.length === 1 && currentSeeds[0].count === getTotalCards()) {
                        aiDialogue = `<strong>${lastNameClean}</strong> is ${popAdj} ${lastClass} card! <br><br>`;
                    } else if (activeClasses.size === 2 && !heroAnnounced) {
                        aiDialogue = `This is now officially a <strong>${heroName}</strong> deck! <strong>${lastNameClean}</strong> adds some great synergy. <br><br>`;
                        heroAnnounced = true;
                    } else {
                        aiDialogue = `Adding <strong>${lastNameClean}</strong> gives us a great direction! <br><br>`;
                    }
                }
            } else {
                if (activeClasses.size === 2) {
                    aiDialogue = `This is a <strong>${heroName}</strong> deck! You have some great options from here.<br><br>`;
                } else {
                    aiDialogue = `You have some great options for this <strong>${currentFaction}</strong> deck! <br><br>`;
                }
            }

            // 3. Suggestion sentence (unchanged)
            if (recData.length >= 3) {
                aiDialogue += `<strong>${recData[0].displayName}</strong> would fit really well here! My 2nd choice would be <strong>${recData[1].displayName}</strong>, and my 3rd choice is <strong>${recData[2].displayName}</strong>.`;
            } else if (recData.length > 0) {
                aiDialogue += `<strong>${recData[0].displayName}</strong> is my top recommendation to add next!`;
            }

            // 4. Render: speech bubble + staggered recommendation cards
            let htmlString = daveSay(aiDialogue);

            htmlString += `<div class="rec-row">`;

            recData.forEach((rec, index) => {
                const badgeText = index === 0 ? "Best Fit" : (index === 1 ? "2nd Choice" : "3rd Choice");

                htmlString += `
            <div class="rec-card" style="--d: ${index * 70}ms;">
                <span class="rec-badge ${index === 0 ? 'gold' : ''}">${badgeText}</span>
                <img src="card_images/${rec.name}.png" alt="${rec.displayName}" title="${rec.displayName}"
                    onerror="this.onerror=null; this.src='card_images/${rec.name}.webp';">
                <button class="add-rec-btn generate-btn" data-name="${rec.name}" data-class="${rec.data.Class}" data-amount="${rec.targetCopies}">
                    Add x${rec.targetCopies}
                </button>
            </div>`;
            });

            htmlString += `</div>`;

            chatFeed.innerHTML = htmlString;

            chatFeed.querySelectorAll('.add-rec-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const amount = parseInt(e.target.getAttribute('data-amount')) || 1;
                    addSeed(e.target.getAttribute('data-name'), e.target.getAttribute('data-class'), currentFaction, amount);
                });
            });

        }, 50);
    }

    // ------------------------------------------------------------
    // SWAP SUGGESTIONS — speech bubble edition
    // ------------------------------------------------------------
    function showSwapSuggestions(baseCardName) {
        const chatFeed = document.getElementById('aiChatFeed');
        if (!chatFeed) return;

        // QoL toggle (unchanged)
        if (window.activeSwapTarget === baseCardName) {
            window.activeSwapTarget = null;
            triggerAICoPilot();
            return;
        }
        window.activeSwapTarget = baseCardName;

        const baseSeed = currentSeeds.find(c => c.name === baseCardName);
        if (!baseSeed) return;

        const displayName = baseCardName.replace(/_/g, ' ');
        initSynergyMatrix();

        chatFeed.innerHTML = daveThinking(`Finding the best replacements for ${displayName}...`);

        setTimeout(() => {
            const replacements = getTopThreeRecommendations(baseCardName);

            if (replacements.length === 0) {
                chatFeed.innerHTML = daveSay(`I could not find any good replacements for <strong>${displayName}</strong>.`);
                return;
            }

            // True baseline score of the current deck (unchanged)
            const ctx = typeof getVerdictContext === "function" ? getVerdictContext() : {};
            const currentDeckStrings = currentSeeds.map(s => `${s.count}x ${s.name}`);
            const baselineVerdict = getDeckVerdictFromCards(currentDeckStrings, null, ctx);
            const baselineScore = baselineVerdict.score;

            let html = daveSay(`Here are the top alternatives for <strong>${displayName}</strong>:`);
            html += `<div class="rec-row">`;

            replacements.forEach((rec, index) => {
                const cardName = rec.name.replace(/_/g, ' ');
                const badgeText = index === 0 ? "Best Fit" : (index === 1 ? "2nd Choice" : "3rd Choice");

                // Compare true percentage scores (unchanged)
                const scoreDiff = Math.round(rec.score - baselineScore);

                let comparisonText = "Equal";
                let comparisonColor = "#9e9e9e";

                if (scoreDiff > 0) {
                    comparisonText = `Better (+${scoreDiff}%)`;
                    comparisonColor = "#4CAF50";
                } else if (scoreDiff < 0) {
                    comparisonText = `Worse (${scoreDiff}%)`;
                    comparisonColor = "#f44336";
                }

                html += `
            <div class="rec-card" style="--d: ${index * 70}ms;">
                <span class="rec-badge ${index === 0 ? 'gold' : ''}">${badgeText}</span>
                <img src="card_images/${rec.name}.png" alt="${cardName}" title="${cardName}"
                    onerror="this.onerror=null; this.src='card_images/${rec.name}.webp';">
                <button class="add-rec-btn generate-btn" data-remove="${baseCardName}" data-add="${rec.name}">
                    Swap
                </button>
                <div class="rec-compare" style="color: ${comparisonColor};">${comparisonText}</div>
            </div>`;
            });

            html += `</div>`;
            chatFeed.innerHTML = html;

            chatFeed.querySelectorAll('.add-rec-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const removeName = e.target.getAttribute('data-remove');
                    const addName = e.target.getAttribute('data-add');
                    applyFullSwap(removeName, addName);
                });
            });

        }, 50);
    }
    function applyFullSwap(removeName, addName) {
        const removeSeed = currentSeeds.find(s => s.name === removeName);
        const addData = cardDatabase[addName];
        if (!removeSeed || !addData) return;

        const removeCount = removeSeed.count;
        const existingAdd = currentSeeds.find(s => s.name === addName);

        // If the replacement would exceed 4 copies, do nothing.
        if (existingAdd && existingAdd.count + removeCount > 4) return;

        // Remove all copies of the chosen card
        currentSeeds = currentSeeds.filter(s => s.name !== removeName);

        // Add the same number of copies of the replacement
        if (existingAdd) {
            existingAdd.count += removeCount;
        } else {
            currentSeeds.push({
                name: addName,
                count: removeCount,
                class: addData.Class,
                faction: plantClasses.has(addData.Class) ? "Plant" : "Zombie",
                cost: addData.Cost
            });
        }

        activeClasses.clear();
        currentSeeds.forEach(s => activeClasses.add(s.class));
        if (activeClasses.size < 2) heroAnnounced = false;

        lastAddedCard = addName;
        renderSeeds();
    }

    // --- 4. SYNERGY ENGINE (Background Math) ---
    let synergyMatrix = null;
    let cardFrequencies = null;
    let cardAverageCopies = null;

    function initSynergyMatrix() {
        if (synergyMatrix) return;
        synergyMatrix = {};
        cardFrequencies = {};
        cardAverageCopies = {};

        const rawDecks = Object.values(fullDatabase);
        const seenSignatures = new Set();

        // ==========================================
        // PASS 0: Assign Weights to Decks
        // ==========================================
        const decks = rawDecks.map(deck => {
            // Fallback for empty/malformed decks
            if (!deck.cards || deck.cards.length === 0) {
                return { ...deck, weight: 1.0 };
            }

            // Generate the unique signature for the 60-card list
            const signature = deck.cards.map(c => {
                const firstSpace = c.indexOf(' ');
                const countStr = c.substring(0, firstSpace).replace(/x/i, '');
                const count = parseInt(countStr) || 1;
                const cardName = c.substring(firstSpace + 1).trim().toLowerCase();
                return `${count}x ${cardName}`;
            }).sort().join('|');

            let weight = 1.0;
            if (seenSignatures.has(signature)) {
                weight = 0.5; // It's a duplicate, halve its value
            } else {
                seenSignatures.add(signature); // First time seeing it, keep full value
            }

            // Return a new deck object that includes our calculated weight
            return { ...deck, weight: weight };
        });

        const deckTimestamps = decks.map(d => {
            const time = d.upload_date ? new Date(d.upload_date).getTime() : 0;
            return isNaN(time) ? 0 : time;
        });

        deckTimestamps.sort((a, b) => a - b);
        const totalDecks = deckTimestamps.length;

        // Split point for "Historical" vs "Recent" era 
        // Set to 94% to isolate the most recent 6% of decks
        const thresholdIndex = Math.floor(totalDecks * 0.94);
        const recentThreshold = deckTimestamps[thresholdIndex];

        // ==========================================
        // PASS 1: Calculate Card Momentum (Trending)
        // ==========================================
        const oldFreq = {};
        const newFreq = {};
        let oldDeckCount = 0;
        let newDeckCount = 0;

        decks.forEach(deck => {
            const time = deck.upload_date ? new Date(deck.upload_date).getTime() : 0;
            const validTime = isNaN(time) ? 0 : time;
            const isNewEra = validTime >= recentThreshold;

            // Add the deck's weight instead of just a flat "1"
            if (isNewEra) newDeckCount += deck.weight;
            else oldDeckCount += deck.weight;

            // Get unique cards in this deck to track play rate
            const uniqueCards = new Set();
            deck.cards.forEach(c => {
                const firstSpace = c.indexOf(' ');
                const cardName = c.substring(firstSpace + 1).trim();
                uniqueCards.add(cardName);
            });

            uniqueCards.forEach(cardName => {
                if (isNewEra) {
                    newFreq[cardName] = (newFreq[cardName] || 0) + deck.weight;
                } else {
                    oldFreq[cardName] = (oldFreq[cardName] || 0) + deck.weight;
                }
            });
        });

        const cardMomentum = {};
        const allUniqueCards = new Set([...Object.keys(oldFreq), ...Object.keys(newFreq)]);

        allUniqueCards.forEach(card => {
            // Laplace smoothing (add 5 fake decks) prevents a card played 0 times in old
            // and 1 time in new from mathematically getting an infinite growth multiplier.
            const oldRate = ((oldFreq[card] || 0) + 5) / (oldDeckCount + 5);
            const newRate = ((newFreq[card] || 0) + 5) / (newDeckCount + 5);

            let momentum = newRate / oldRate;

            // Clamp the momentum so it doesn't skew the AI too violently.
            // A dying card is cut in half (0.5x), a surging card is heavily boosted (2.5x).
            momentum = Math.max(0.5, Math.min(momentum, 2.5));
            cardMomentum[card] = momentum;
        });

        // ==========================================
        // PASS 2: Build Synergy Graph Using Momentum
        // ==========================================
        decks.forEach(deck => {
            const parsedCards = deck.cards.map(c => {
                const firstSpace = c.indexOf(' ');
                const countStr = c.substring(0, firstSpace).replace(/x/i, '');
                const count = parseInt(countStr) || 1;
                const cardName = c.substring(firstSpace + 1).trim();
                return { name: cardName, count: count };
            });

            const cleanCards = parsedCards.map(pc => pc.name);

            parsedCards.forEach(card => {
                // Include both the individual card meta momentum AND the deck's uniqueness weight
                const momentum = cardMomentum[card.name] || 1.0;
                const finalWeight = momentum * deck.weight;

                cardFrequencies[card.name] = (cardFrequencies[card.name] || 0) + finalWeight;

                if (!cardAverageCopies[card.name]) {
                    cardAverageCopies[card.name] = { total: 0, appearances: 0 };
                }
                cardAverageCopies[card.name].total += (card.count * finalWeight);
                cardAverageCopies[card.name].appearances += finalWeight;
            });

            for (let i = 0; i < cleanCards.length; i++) {
                const cardA = cleanCards[i];
                const momentumA = cardMomentum[cardA] || 1.0;

                if (!synergyMatrix[cardA]) synergyMatrix[cardA] = {};

                for (let j = 0; j < cleanCards.length; j++) {
                    if (i === j) continue;
                    const cardB = cleanCards[j];
                    const momentumB = cardMomentum[cardB] || 1.0;

                    // Synergy is amplified by both cards trending, but dampened if the deck is a clone
                    const synergyWeight = momentumA * momentumB * deck.weight;

                    synergyMatrix[cardA][cardB] = (synergyMatrix[cardA][cardB] || 0) + synergyWeight;
                }
            }
        });
    }

    // --- 5. FINISH FOR ME (Auto-Generate Remaining) ---
    generateDeckBtn.addEventListener('click', () => {
        initSynergyMatrix();
        generateDeckBtn.disabled = true;
        generateDeckBtn.innerText = "Calculating Synergies...";

        setTimeout(() => {
            currentSeeds = buildOptimizedDeck();
            lastAddedCard = null; // Clear context so AI summarizes full deck
            renderSeeds();
            generateDeckBtn.innerText = "Finish For Me ✨";
        }, 50);
    });

    function buildOptimizedDeck() {
        let workingDeck = currentSeeds.map(s => ({ ...s }));
        let workingClasses = new Set(activeClasses);
        let deckFaction = currentFaction;

        const rawWeight = 0.2 + (Math.random() * 0.40);
        const affinityWeight = 1.0 - rawWeight;
        const isBudget = budgetToggle ? budgetToggle.checked : false;
        const isSuperBudget = superBudgetToggle ? superBudgetToggle.checked : false;

        while (true) {
            let totalCards = workingDeck.reduce((sum, c) => sum + c.count, 0);
            if (totalCards >= 40) break;

            let expensiveCount = workingDeck.reduce((sum, c) => {
                if (!cardDatabase[c.name]) return sum;
                const r = cardDatabase[c.name].Rarity;
                return (r === "Super-Rare" || r === "Event") ? sum + c.count : sum;
            }, 0);

            let bestCard = null;
            let bestScore = -1;
            let candidatePool = Object.keys(cardDatabase);
            const slotsLeft = 40 - totalCards;
            const currentOrphans = workingDeck.filter(c => c.count === 1).length;

            if (slotsLeft <= currentOrphans || slotsLeft === 1) {
                candidatePool = workingDeck.map(c => c.name);
            }

            candidatePool.forEach(candidateName => {
                const candidateData = cardDatabase[candidateName];
                const candidateClass = candidateData.Class;
                const candidateFaction = plantClasses.has(candidateClass) ? "Plant" : "Zombie";

                if (candidateFaction !== deckFaction) return;
                if (!workingClasses.has(candidateClass) && workingClasses.size >= 2) return;

                const existingCopy = workingDeck.find(c => c.name === candidateName);
                const currentCopies = existingCopy ? existingCopy.count : 0;
                if (currentCopies >= 4) return;

                if (isBudget || isSuperBudget) {
                    const rarity = candidateData.Rarity;
                    if (rarity === "Legendary") return;

                    if (rarity === "Super-Rare" || rarity === "Event") {
                        if (isSuperBudget) {
                            if (expensiveCount >= 4) return;
                            if (currentCopies === 0 && expensiveCount > 0) return;
                        } else {
                            if (currentCopies === 0 && expensiveCount > 13) return;
                        }
                    }
                }

                let score = 0;
                workingDeck.forEach(deckCard => {
                    if (synergyMatrix && synergyMatrix[candidateName] && synergyMatrix[candidateName][deckCard.name]) {
                        const coOccurrences = synergyMatrix[candidateName][deckCard.name];
                        const candidateTotalPlays = cardFrequencies[candidateName] || 1;

                        let rawSynergy = coOccurrences;
                        let affinitySynergy = (coOccurrences * coOccurrences) / candidateTotalPlays;
                        let blendedSynergy = (rawSynergy * rawWeight) + (affinitySynergy * affinityWeight);

                        let classModifier = 1.0;
                        if (cardDatabase[candidateName].Class !== cardDatabase[deckCard.name].Class) {
                            classModifier = 4.0;
                        }

                        const deckCardPlays = cardFrequencies[deckCard.name] || 1;
                        const volumeEqualizer = 1000 / deckCardPlays;
                        const isOriginalSeed = currentSeeds.some(s => s.name === deckCard.name);

                        score += (blendedSynergy * classModifier * volumeEqualizer) * deckCard.count * (isOriginalSeed ? 3 : 1);
                    }
                });

                if (score === 0) score = 0.1;

                let avgCopies = 3;
                if (cardAverageCopies && cardAverageCopies[candidateName]) {
                    avgCopies = cardAverageCopies[candidateName].total / cardAverageCopies[candidateName].appearances;
                }

                let consistencyMultiplier = 1.0;
                if (currentCopies === 1) {
                    consistencyMultiplier = 75.0;
                } else if (currentCopies === 2) {
                    consistencyMultiplier = 1.5;
                }

                if (currentCopies >= Math.round(avgCopies)) {
                    consistencyMultiplier *= 0.5;
                }

                score *= consistencyMultiplier;
                if (score > bestScore) {
                    bestScore = score;
                    bestCard = candidateName;
                }
            });

            if (bestCard) {
                const existing = workingDeck.find(c => c.name === bestCard);
                if (existing) {
                    existing.count++;
                } else {
                    workingDeck.push({
                        name: bestCard,
                        count: 1,
                        class: cardDatabase[bestCard].Class,
                        cost: cardDatabase[bestCard].Cost
                    });
                    workingClasses.add(cardDatabase[bestCard].Class);
                }
            } else {
                break;
            }
        }
        return workingDeck;
    }

    // --- 6. NAMING & COPY LOGIC ---
    function generateDeckName(deck, isPlant) {
        if (!deck || deck.length === 0) return isPlant ? "Plant Deck" : "Zombie Deck";

        // 1. Cleaner, mechanic-focused prefixes instead of cheesy adjectives
        const plantPrefixes = ["Green", "Bloom", "Thicket", "Solar", "Savage", "Root", "Petal", "Timber"];
        const zombiePrefixes = ["Grave", "Brain", "Scrap", "Tech", "Doom", "Bolt", "Plague", "Rust"];
        const neutralPrefixes = ["Turbo", "Heavy", "Classic", "Greedy", "Miracle", "Tempo", "Core", "Value"];

        // 2. Real CCG archetype nouns
        const aggroNouns = ["Rush", "Swarm", "Burn", "Zoo", "Face", "Blitz", "Beatdown"];
        const midNouns = ["Midrange", "Tempo", "Stompy", "Goodstuff", "Engine", "Flex", "Company"];
        const controlNouns = ["Control", "Ramp", "Grinder", "Stall", "Prison", "Endgame", "Attrition"];

        // 3. SMART SIGNATURE CARDS: Find the top 2 highest (cost * count) cards
        // This allows for "Card A / Card B" formats.
        const sortedDeck = [...deck].sort((a, b) => (b.count * b.cost) - (a.count * a.cost));

        const cleanName = (name) => name.replace(/_/g, ' ').replace(/^The /i, '');

        const sigCard1 = cleanName(sortedDeck[0].name);
        // Fallback to sigCard1 if the deck only has 1 unique card in it
        const sigCard2 = sortedDeck.length > 1 ? cleanName(sortedDeck[1].name) : sigCard1;

        // 4. ARCHETYPE DETECTION: Calculate average cost
        let totalCost = 0;
        let totalCards = 0;
        deck.forEach(c => {
            totalCost += (c.cost * c.count);
            totalCards += c.count;
        });
        const avgCost = totalCost / (totalCards || 1);

        // Pick the noun pool and a baseline archetype name based on deck speed
        let nounPool = midNouns;
        let baseArchetype = "Midrange";

        if (avgCost <= 2.8) {
            nounPool = aggroNouns;
            baseArchetype = "Aggro";
        } else if (avgCost >= 4.0) {
            nounPool = controlNouns;
            baseArchetype = "Control";
        }

        // 5. GENERATION
        const factionPrefixes = isPlant ? plantPrefixes : zombiePrefixes;
        const prefix = factionPrefixes[Math.floor(Math.random() * factionPrefixes.length)];
        const neutral = neutralPrefixes[Math.floor(Math.random() * neutralPrefixes.length)];
        const noun = nounPool[Math.floor(Math.random() * nounPool.length)];

        // Serious, community-style CCG formats
        const formats = [
            `${sigCard1} ${noun}`,                     // e.g., Valkyrie Burn
            `${prefix} ${sigCard1}`,                   // e.g., Scrap Valkyrie
            `${neutral} ${sigCard1}`,                  // e.g., Turbo Valkyrie
            `${sigCard1} ${baseArchetype}`,            // e.g., Valkyrie Midrange
            `${sigCard1} / ${sigCard2}`,               // e.g., Valkyrie / Trickster
            `${sigCard1} & ${sigCard2} ${noun}`,       // e.g., Valkyrie & Trickster Control
            `${prefix} ${noun}`,                       // e.g., Scrap Midrange
            `${sigCard1} Core`,                        // e.g., Valkyrie Core
            `${noun} ${sigCard1}`                      // e.g., Burn Valkyrie
        ];

        // Optional: Filter out duplicates if sigCard1 and sigCard2 are the same 
        // (Happens if a deck only has 1 type of card)
        const validFormats = formats.filter(f => !f.includes(`${sigCard1} / ${sigCard1}`));

        return validFormats[Math.floor(Math.random() * validFormats.length)];
    }

    const copyDeckBtn = document.getElementById('copyDeckBtn');
    if (copyDeckBtn) {
        copyDeckBtn.addEventListener('click', (e) => {
            if (!currentClipboardText) return;
            navigator.clipboard.writeText(currentClipboardText).then(() => {
                const btn = e.target;
                btn.innerText = "Copied!";
                btn.style.background = "#4CAF50";
                setTimeout(() => {
                    btn.innerText = "Copy Text";
                    btn.style.background = "";
                }, 2000);
            }).catch(err => console.error("Failed to copy text: ", err));
        });
    }
    const downloadBtn = document.getElementById('downloadImageBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', async (e) => {
            if (currentSeeds.length === 0) return;

            const btn = e.target;
            const originalText = btn.innerText;
            btn.innerText = "Saving...";
            btn.disabled = true;

            try {
                // 1. Setup Canvas Grid Math
                const padding = 30; // Increased padding slightly for a better frame
                const cardBoxWidth = 110;
                const cardBoxHeight = 140;
                const gap = 18; // Slightly larger gap to accommodate shadows
                const columns = 4;
                const rows = Math.ceil(currentSeeds.length / columns);

                const watermarkHeight = 40; // Increased to give the new watermark pill room
                const canvasWidth = padding * 2 + (columns * cardBoxWidth) + ((columns - 1) * gap);
                const rowHeight = cardBoxHeight;
                const canvasHeight = padding * 2 + (rows * rowHeight) + ((rows - 1) * gap) + watermarkHeight;

                const canvas = document.createElement('canvas');
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                const ctx = canvas.getContext('2d');

                // 2. Draw Premium Background (Radial Gradient)
                const cx = canvasWidth / 2;
                const cy = canvasHeight / 2;
                const bgGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, canvasWidth);
                bgGradient.addColorStop(0, '#2c333a'); // Lighter center spotlight
                bgGradient.addColorStop(1, '#111417'); // Darker edges

                ctx.fillStyle = bgGradient;
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);

                // Optional: subtle border around the entire canvas
                ctx.strokeStyle = '#3e464f';
                ctx.lineWidth = 4;
                ctx.strokeRect(2, 2, canvasWidth - 4, canvasHeight - 4);

                // 3. SORT THE CARDS
                const sortedSeeds = [...currentSeeds].sort((a, b) => {
                    const costA = cardDatabase[a.name]?.Cost || 0;
                    const costB = cardDatabase[b.name]?.Cost || 0;
                    if (costA !== costB) return costA - costB;
                    return a.name.localeCompare(b.name);
                });

                // 4. Load Images
                const loadedImages = await Promise.all(sortedSeeds.map(seed => {
                    return new Promise((resolve) => {
                        const img = new Image();
                        img.crossOrigin = "anonymous";
                        const dbName = seed.name.replace(/ /g, '_');

                        img.onload = () => resolve({ img, seed });
                        img.onerror = () => {
                            const imgWebp = new Image();
                            imgWebp.crossOrigin = "anonymous";
                            imgWebp.onload = () => resolve({ img: imgWebp, seed });
                            imgWebp.onerror = () => resolve({ img: null, seed });
                            imgWebp.src = `card_images/${dbName}.webp`;
                        };
                        img.src = `card_images/${dbName}.png`;
                    });
                }));

                // 5. Draw the Cards and Badges
                loadedImages.forEach((item, index) => {
                    const col = index % columns;
                    const row = Math.floor(index / columns);

                    const x = padding + (col * (cardBoxWidth + gap));
                    const y = padding + (row * (rowHeight + gap));

                    let drawWidth = cardBoxWidth;
                    let drawHeight = cardBoxHeight;
                    let dx = x;
                    let dy = y;

                    if (item.img) {
                        const imgAspect = item.img.width / item.img.height;
                        const boxAspect = cardBoxWidth / cardBoxHeight;

                        if (imgAspect > boxAspect) {
                            drawWidth = cardBoxWidth;
                            drawHeight = cardBoxWidth / imgAspect;
                        } else {
                            drawHeight = cardBoxHeight;
                            drawWidth = cardBoxHeight * imgAspect;
                        }

                        dx = x + (cardBoxWidth - drawWidth) / 2;
                        dy = y + (cardBoxHeight - drawHeight) / 2;

                        // Add Drop Shadow to Cards
                        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
                        ctx.shadowBlur = 12;
                        ctx.shadowOffsetY = 6;
                        ctx.shadowOffsetX = 0;

                        ctx.drawImage(item.img, dx, dy, drawWidth, drawHeight);

                        // Reset shadow so it doesn't mess up badges/text
                        ctx.shadowColor = 'transparent';
                    } else {
                        ctx.fillStyle = '#1e2226';
                        ctx.strokeStyle = '#3e464f';
                        ctx.lineWidth = 2;
                        ctx.fillRect(x, y, cardBoxWidth, cardBoxHeight);
                        ctx.strokeRect(x, y, cardBoxWidth, cardBoxHeight);
                    }

                    // Overlay the Premium Quantity Badge
                    const text = `x${item.seed.count}`;
                    ctx.font = 'bold 16px "Segoe UI", sans-serif';
                    const textWidth = ctx.measureText(text).width;

                    const badgeWidth = textWidth + 16;
                    const badgeHeight = 26;
                    const badgeX = dx - 6;
                    const badgeY = dy + drawHeight - badgeHeight - 6;

                    // Badge Gradient Background
                    const badgeGradient = ctx.createLinearGradient(badgeX, badgeY, badgeX, badgeY + badgeHeight);
                    badgeGradient.addColorStop(0, '#3a4149');
                    badgeGradient.addColorStop(1, '#1d2126');

                    ctx.fillStyle = badgeGradient;
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                    ctx.shadowBlur = 6;
                    ctx.shadowOffsetY = 3;

                    ctx.beginPath();
                    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 6);
                    ctx.fill();

                    // Badge Border
                    ctx.shadowColor = 'transparent'; // Reset shadow for border
                    ctx.strokeStyle = '#5a6470';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();

                    // Badge Text
                    ctx.fillStyle = '#ffffff';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    // Added slight text shadow for extra crispness
                    ctx.shadowColor = 'rgba(0,0,0,0.8)';
                    ctx.shadowBlur = 2;
                    ctx.fillText(text, badgeX + (badgeWidth / 2), badgeY + (badgeHeight / 2) + 1);
                    ctx.shadowColor = 'transparent';
                });

                // 6. Draw Modern Watermark (Pill Shape)
                const wmText = 'pvzhvault.com';
                ctx.font = 'bold 15px "Segoe UI", sans-serif';
                const wmTextWidth = ctx.measureText(wmText).width;

                const wmPadX = 14;
                const wmPadY = 8;
                const wmWidth = wmTextWidth + (wmPadX * 2);
                const wmHeight = 15 + (wmPadY * 2);
                const wmX = canvasWidth - padding - wmWidth + 10;
                const wmY = canvasHeight - padding - wmHeight + 15;

                // Watermark Pill Background
                ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
                ctx.beginPath();
                ctx.roundRect(wmX, wmY, wmWidth, wmHeight, wmHeight / 2);
                ctx.fill();

                // Watermark Text with slight gradient
                const textGrad = ctx.createLinearGradient(wmX, wmY, wmX, wmY + wmHeight);
                textGrad.addColorStop(0, '#ffffff');
                textGrad.addColorStop(1, '#b0b5ba');

                ctx.fillStyle = textGrad;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(wmText, wmX + (wmWidth / 2), wmY + (wmHeight / 2) + 1);

                // 7. Export
                const link = document.createElement('a');
                link.download = `deck_export.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();

                btn.innerText = "Downloaded!";
                btn.style.background = "#4CAF50";
            } catch (err) {
                console.error("Canvas generation failed: ", err);
                btn.innerText = "Error";
                btn.style.background = "#f44336";
            } finally {
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.background = "";
                    btn.disabled = false;
                }, 2000);
            }
        });
    }

    // --- ROUTING LOGIC ---

    window.addEventListener('hashchange', handleRouting);

    statsBtn.addEventListener('click', () => {
        window.location.hash = 'stats';
    });

    crafterBtn.addEventListener('click', () => {
        window.location.hash = 'crafter';
    });

    guidesBtn.addEventListener('click', () => {
        window.location.hash = 'guides';
    });

    gamesBtn.addEventListener('click', () => { // <-- NEW
        window.location.hash = 'games';
    });

    tiersBtn.addEventListener('click', () => { // <-- NEW
        window.location.hash = 'tiers';
    });

    if (synergyEasterEgg) {
        synergyEasterEgg.addEventListener('click', () => {
            window.location.hash = 'synergy';
        });
    }

    if (typeof backBtn !== 'undefined') {
        backBtn.addEventListener('click', () => {
            window.location.hash = ''; // Clearing the hash triggers the default Home UI
        });
    }
});

// --- Modal Elements ---
const modal = document.getElementById('deckVisualModal');
const modalTitle = document.getElementById('modalDeckTitle');
const modalGrid = document.getElementById('modalDeckGrid');
const closeModalBtn = document.querySelector('.close-modal-btn');

// --- Event Delegation for "View Visual Deck" buttons ---
// We attach the listener to the whole grid instead of 1700 individual buttons
document.getElementById('deckGrid').addEventListener('click', function (e) {
    if (e.target.classList.contains('view-visual-btn')) {
        e.preventDefault();
        const title = e.target.getAttribute('data-title');
        const cardsArray = JSON.parse(decodeURIComponent(e.target.getAttribute('data-cards')));

        openVisualModal(title, cardsArray);
    }
});

function openVisualModal(title, cardsArray) {
    modalTitle.textContent = title;
    modalGrid.innerHTML = ''; // Clear previous deck

    // We will populate this array so the encoder can read it
    const deckToAnalyze = [];

    // Loop directly through the strings in your array
    cardsArray.forEach(cardString => {
        const match = cardString.trim().match(/^x(\d+)\s+(.+)$/i);

        let count = 1;
        let rawName = cardString;

        if (match) {
            count = parseInt(match[1], 10);
            rawName = match[2];
        }

        const displayName = rawName.replace(/_/g, ' ');
        const dbName = displayName.replace(/ /g, '_');

        // FIXED: Push dbName (with underscores) instead of displayName
        deckToAnalyze.push({ name: dbName, count: count });

        const cardDiv = document.createElement('div');
        cardDiv.className = 'visual-card';

        const img = document.createElement('img');
        img.src = `card_images/${dbName}.png`;
        img.alt = displayName;
        img.title = displayName;
        img.style.objectFit = 'contain';

        img.onerror = function () {
            this.onerror = null;
            this.src = `card_images/${dbName}.webp`;
        };

        const badge = document.createElement('div');
        badge.className = 'card-quantity';
        badge.textContent = `x${count}`;

        cardDiv.appendChild(img);
        cardDiv.appendChild(badge);
        modalGrid.appendChild(cardDiv);
    });

    // --- Attach Analyze Logic to the Button ---
    const analyzeBtn = document.getElementById('modalAnalyzeBtn');

    if (analyzeBtn) {
        analyzeBtn.onclick = function () {
            const cardDictionary = Object.keys(cardDatabase).sort();

            const minimalDeckString = deckToAnalyze.map(card => {
                // Find the index using the underscore name
                const index = cardDictionary.indexOf(card.name);

                // Debugging logs just in case!
                if (index === -1) {
                    console.error(`🚨 Could not find card in dictionary: ${card.name}`);
                }

                const cardIndex = index.toString(36);

                return card.count === 4 ? cardIndex : `${cardIndex}.${card.count}`;
            }).join('-');

            const analyzeUrl = `${window.location.origin}${window.location.pathname}?deck=${minimalDeckString}#crafter`;

            console.log("Encoding complete. Target URL:", analyzeUrl);

            // Navigate the user to the encoded URL!
            window.location.href = analyzeUrl;
        };
    }

    // Show the modal
    modal.classList.remove('hidden');
}
// --- Close Modal Logic ---
closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
});

// Close modal if user clicks the dark background outside the content
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.add('hidden');
    }
});
function renderGames() {
    // ==========================================
    // CORE SYSTEM DATA PARSING & COMPILE
    // ==========================================
    let deckCounts = {};
    let validHlCards = [];

    Object.keys(cardDatabase).forEach(card => deckCounts[card] = 0);

    Object.values(fullDatabase).forEach(deck => {
        if (!deck || !deck.cards) return;
        deck.cards.forEach(cardString => {
            const cleanName = cardString.replace(/^x\d\s+/, '');
            if (deckCounts[cleanName] !== undefined) {
                deckCounts[cleanName]++;
            } else {
                deckCounts[cleanName] = 1;
            }
        });
    });

    validHlCards = Object.keys(deckCounts).filter(k => cardDatabase[k] !== undefined);

    // ==========================================
    // ARCADE METRIC STATE CONFIGURATION
    // ==========================================
    let hlScore = 0;
    let hlStreak = 0;
    let peakSessionStreak = 0;
    let hlCombo = 1.0;
    let hlBestScore = parseInt(localStorage.getItem('hlBestScoreArcade') || '0');
    let hlTimeLeft = 60;
    let hlTimerInterval = null;
    const hlTimerText = document.getElementById('hlTimerText');
    // Mechanics State
    let hlSkipsLeft = 3;
    let hlPerfectRun = true;
    let hlIsFever = false;
    let hlIsAnimating = false;

    let currentCardLeft = null;
    let currentCardRight = null;

    // DOM UI Bindings
    const hlArcadeContainer = document.getElementById('hlArcadeContainer');
    const hlCardLeftEl = document.getElementById('hlCardLeft');
    const hlCardRightEl = document.getElementById('hlCardRight');
    const hlTimerBar = document.getElementById('hlTimerBar');
    const hlVsBadge = document.getElementById('hlVsBadge');

    const hlScoreVal = document.getElementById('hlScoreVal');
    const hlComboVal = document.getElementById('hlComboVal');
    const hlStreakVal = document.getElementById('hlStreakVal');
    const hlBestVal = document.getElementById('hlBestVal');

    const hlSkipBtn = document.getElementById('hlSkipBtn');
    const hlSkipCount = document.getElementById('hlSkipCount');

    const hlStartScreen = document.getElementById('hlStartScreen');
    const hlGameOverScreen = document.getElementById('hlGameOverScreen');
    const hlFinalSummary = document.getElementById('hlFinalSummary');

    hlBestVal.textContent = hlBestScore;

    // ==========================================
    // UTILITY HELPER UTILITIES
    // ==========================================
    function setCardImage(imgElement, cardKey) {
        imgElement.src = `card_images/${cardKey}.png`;
        imgElement.onerror = function () {
            this.onerror = null;
            this.src = `card_images/${cardKey}.webp`;
        };
    }

    function getRandomCard(excludeCard) {
        let selection;
        do {
            selection = validHlCards[Math.floor(Math.random() * validHlCards.length)];
        } while (selection === excludeCard);
        return selection;
    }

    function animateValue(element, start, end, duration, postfix = " Decks") {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentVal = Math.floor(easeProgress * (end - start) + start);

            element.textContent = `${currentVal}${postfix}`;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                element.textContent = `${end}${postfix}`;
            }
        };
        window.requestAnimationFrame(step);
    }

    // Spawns Combat Text (+150, -10s, etc.) over the target card
    function spawnFloatingText(wrapperElement, text, color) {
        const popup = document.createElement('div');
        popup.textContent = text;
        popup.className = 'hl-floating-text';
        popup.style.color = color;
        wrapperElement.appendChild(popup);
        setTimeout(() => popup.remove(), 1000);
    }

    // ==========================================
    // ENGINE RUNTIME CONTROLLERS
    // ==========================================
    function initMatchup() {
        document.getElementById('hlNameLeft').textContent = currentCardLeft.replace(/_/g, ' ');
        document.getElementById('hlCountLeft').textContent = `${deckCounts[currentCardLeft]} Decks`;
        setCardImage(document.getElementById('hlImgLeft'), currentCardLeft);

        document.getElementById('hlNameRight').textContent = currentCardRight.replace(/_/g, ' ');
        document.getElementById('hlCountRight').textContent = `??? Decks`;
        setCardImage(document.getElementById('hlImgRight'), currentCardRight);

        hlIsAnimating = false;
    }

    function cycleCards(targetEl) {
        setTimeout(() => {
            if (targetEl) {
                targetEl.classList.remove('hl-correct-flash');
                targetEl.classList.remove('hl-wrong-flash');
            }
            hlCardLeftEl.classList.add('hl-slide-out');
            hlCardRightEl.classList.add('hl-slide-out');

            setTimeout(() => {
                currentCardLeft = targetEl ? currentCardRight : getRandomCard(null); // Full reset if skipped or wrong
                currentCardRight = getRandomCard(currentCardLeft);

                hlCardLeftEl.classList.remove('hl-slide-out');
                hlCardRightEl.classList.remove('hl-slide-out');
                initMatchup();
            }, 250);
        }, 900);
    }

    function handleGuess(selectedSide) {
        if (hlIsAnimating || hlTimeLeft <= 0) return;
        hlIsAnimating = true;

        const countLeft = deckCounts[currentCardLeft];
        const countRight = deckCounts[currentCardRight];
        animateValue(document.getElementById('hlCountRight'), 0, countRight, 500);

        let isCorrect = false;
        if (selectedSide === 'left' && countLeft >= countRight) isCorrect = true;
        if (selectedSide === 'right' && countRight >= countLeft) isCorrect = true;

        const targetEl = selectedSide === 'left' ? hlCardLeftEl : hlCardRightEl;

        if (isCorrect) {
            hlStreak++;
            peakSessionStreak = Math.max(peakSessionStreak, hlStreak);

            const pointsEarned = Math.round(100 * hlCombo);
            hlScore += pointsEarned;

            hlCombo = parseFloat((hlCombo + 0.2).toFixed(1));

            // --- UPDATED: Floating point precision adjustment & gain flash ---
            hlTimeLeft = Math.min(60, parseFloat((hlTimeLeft + 3).toFixed(1)));
            hlTimerBar.classList.add('timer-gain-flash');
            setTimeout(() => hlTimerBar.classList.remove('timer-gain-flash'), 400);
            // -----------------------------------------------------------------

            // Visual Updates
            hlScoreVal.textContent = hlScore;
            hlStreakVal.textContent = hlStreak;

            hlComboVal.textContent = `${hlCombo}x`;
            hlComboVal.classList.add('hl-combo-pop');
            setTimeout(() => hlComboVal.classList.remove('hl-combo-pop'), 400);

            targetEl.classList.add('hl-correct-flash');

            // Combat Text
            spawnFloatingText(targetEl, `+${pointsEarned}`, '#00f5d4');
            spawnFloatingText(hlCardLeftEl === targetEl ? hlCardRightEl : hlCardLeftEl, `+3s`, '#00b4d8');

            // Fever Mode Check
            if (hlCombo >= 2.0 && !hlIsFever) {
                hlIsFever = true;
                hlArcadeContainer.classList.add('fever-active');
                hlComboVal.style.color = '#ffea00';
                hlVsBadge.textContent = "FEVER!";
                hlVsBadge.style.color = "#ffea00";
            }

            if (hlScore > hlBestScore) {
                hlBestScore = hlScore;
                hlBestVal.textContent = hlBestScore;
                localStorage.setItem('hlBestScoreArcade', hlBestScore.toString());
            }

            cycleCards(targetEl);

        } else {
            hlPerfectRun = false; // Lost the perfect run
            const penalty = hlIsFever ? 15 : 10;

            // --- UPDATED: Floating point precision adjustment & loss flash ---
            hlTimeLeft = Math.max(0, parseFloat((hlTimeLeft - penalty).toFixed(1)));
            hlTimerBar.classList.add('timer-loss-flash');
            setTimeout(() => hlTimerBar.classList.remove('timer-loss-flash'), 400);
            // -----------------------------------------------------------------

            // Reset Combo & Fever
            hlStreak = 0;
            hlCombo = 1.0;
            hlIsFever = false;
            hlArcadeContainer.classList.remove('fever-active');
            hlComboVal.style.color = '#00b4d8';
            hlVsBadge.textContent = "VS";
            hlVsBadge.style.color = "#ff007f";

            hlStreakVal.textContent = hlStreak;
            hlComboVal.textContent = "1.0x";

            targetEl.classList.add('hl-wrong-flash');
            spawnFloatingText(targetEl, `-${penalty}s`, '#ff007f');

            cycleCards(targetEl);
        }
    }

    function handleSkip() {
        if (hlIsAnimating || hlTimeLeft <= 0 || hlSkipsLeft <= 0) return;
        hlIsAnimating = true;

        hlSkipsLeft--;
        hlSkipCount.textContent = hlSkipsLeft;
        if (hlSkipsLeft === 0) hlSkipBtn.disabled = true;

        hlTimeLeft = Math.max(0, hlTimeLeft - 2);
        spawnFloatingText(hlCardRightEl, `SKIPPED (-2s)`, '#ffea00');

        cycleCards(null); // Cycle without evaluating a win/loss
    }

    // ==========================================
    // CHRONO TIMER CLOCK LOOP MANAGEMENT
    // ==========================================
    function startClock() {
        if (hlTimerInterval) clearInterval(hlTimerInterval);

        hlTimerInterval = setInterval(() => {
            // Drop by 0.1 seconds every 100ms loop execution
            hlTimeLeft = parseFloat((hlTimeLeft - 0.1).toFixed(1));
            if (hlTimeLeft < 0) hlTimeLeft = 0;

            // Update precise digital readout text
            hlTimerText.textContent = `${hlTimeLeft.toFixed(1)}s`;

            // Update bar width percentile
            const percent = (hlTimeLeft / 60) * 100;
            hlTimerBar.style.width = `${percent}%`;

            // Handle Alert Stages
            if (hlTimeLeft <= 15) {
                hlTimerBar.classList.add('timer-warning', 'timer-panic');
                hlTimerText.style.color = '#ff007f';
                hlTimerText.style.textShadow = '0 0 10px rgba(255,0,127,0.5)';
                // Make the text slightly pulse size-wise on mobile/desktop
                hlTimerText.style.transform = 'scale(1.1)';
            } else {
                hlTimerBar.classList.remove('timer-warning', 'timer-panic');
                hlTimerText.style.color = '#00f5d4';
                hlTimerText.style.textShadow = '0 0 10px rgba(0,245,212,0.4)';
                hlTimerText.style.transform = 'scale(1)';
            }

            if (hlTimeLeft <= 0) {
                terminateGameLoop();
            }
        }, 100); // 100ms frequency for arcade-grade smoothness
    }

    function terminateGameLoop() {
        clearInterval(hlTimerInterval);

        // Perfect Run Calculation
        let perfectRunHTML = "";
        if (hlPerfectRun && hlScore > 0) {
            hlScore += 5000;
            perfectRunHTML = `<br><span style="color:#ffea00; font-weight:900;">🔥 PERFECT RUN! +5000 🔥</span>`;
            if (hlScore > hlBestScore) {
                hlBestScore = hlScore;
                hlBestVal.textContent = hlBestScore;
                localStorage.setItem('hlBestScoreArcade', hlBestScore.toString());
            }
        }

        // Inside your game over function:
        hlFinalSummary.innerHTML = `
    <div class="hl-stat-line hl-gameover-animate" style="animation-delay: 0.3s;">
        Final Score: <span style="color: #00f5d4; font-weight: 900;">${hlScore}</span>
    </div>
    <div class="hl-stat-line hl-gameover-animate" style="animation-delay: 0.6s;">
        Peak Streak: <span style="color: #ffea00; font-weight: 900;">${peakSessionStreak}</span>
    </div>
    <div class="hl-stat-line hl-gameover-animate" style="animation-delay: 0.9s;">
        All-Time High: <span style="color: #00b4d8; font-weight: 900;">${hlBestScore}</span>
    </div>
`;

        // Show the screen (make sure this happens at the same time so animations sync)
        document.getElementById('hlGameOverScreen').style.display = 'flex';
    }

    function beginGameSession() {
        // Reset Base Stats
        hlScore = 0;
        hlStreak = 0;
        peakSessionStreak = 0;
        hlCombo = 1.0;
        hlTimeLeft = 60;
        hlIsAnimating = false;

        // Reset Mechanics
        hlPerfectRun = true;
        hlIsFever = false;
        hlSkipsLeft = 3;

        hlArcadeContainer.classList.remove('fever-active');
        hlComboVal.style.color = '#00b4d8';
        hlVsBadge.textContent = "VS";
        hlVsBadge.style.color = "#ff007f";

        hlSkipCount.textContent = hlSkipsLeft;
        hlSkipBtn.disabled = false;

        hlScoreVal.textContent = "0";
        hlStreakVal.textContent = "0";
        hlComboVal.textContent = "1.0x";
        hlTimerBar.style.width = "100%";
        hlTimerBar.classList.remove('timer-warning');

        hlStartScreen.style.display = 'none';
        hlGameOverScreen.style.display = 'none';

        currentCardLeft = getRandomCard(null);
        currentCardRight = getRandomCard(currentCardLeft);

        initMatchup();
        startClock();
    }

    // ==========================================
    // ACTION LISTENERS ASSIGNMENTS
    // ==========================================
    hlCardLeftEl.onclick = () => handleGuess('left');
    hlCardRightEl.onclick = () => handleGuess('right');
    hlSkipBtn.onclick = handleSkip;

    document.getElementById('hlStartBtn').onclick = beginGameSession;
    document.getElementById('hlRestartBtn').onclick = beginGameSession;
}

// Keep a global reference to the graph so we don't recreate it every time they click the tab
let currentSynergyGraph = null;

async function renderSynergyWeb() {
    const container = document.getElementById('synergyCanvasContainer');
    const overlay = document.getElementById('synergyLoadingOverlay');
    const progressBar = document.getElementById('synergyProgressBar');
    const progressText = document.getElementById('synergyLoadingText');

    if (!container || currentSynergyGraph) return;

    overlay.style.opacity = '1';
    overlay.style.pointerEvents = 'all';

    // Step 1: Crunch the data (Wait a frame so UI updates)
    await new Promise(r => setTimeout(r, 50));
    const graphData = buildSynergyData();

    // Step 2: Preload all required images for a flawless reveal
    progressText.innerText = `Loading ${graphData.nodes.length} Cards...`;
    let loadedCount = 0;

    const preloadImage = (node) => {
        return new Promise((resolve) => {
            const img = new Image();
            const formattedName = node.id.replaceAll(' ', '_');

            // 1. If it loads successfully (whether PNG or WEBP), attach it and resolve
            img.onload = () => {
                node.img = img;
                resolve();
            };

            // 2. If it fails, check what failed
            img.onerror = () => {
                // If the PNG failed, let's try the WEBP!
                // We overwrite the onerror so if the WEBP *also* fails, it just gives up and resolves (preventing a frozen loading bar)
                img.onerror = () => {
                    console.warn(`Missing image for: ${node.id}`);
                    resolve();
                };

                // Swap the source to WEBP
                img.src = `card_images/${formattedName}.webp`;
            };

            // 3. Kick off the loading process by assuming it's a PNG first
            img.src = `card_images/${formattedName}.png`;
        });
    };

    // Load images in parallel chunks to speed it up while updating the bar
    const batchSize = 20;
    for (let i = 0; i < graphData.nodes.length; i += batchSize) {
        const batch = graphData.nodes.slice(i, i + batchSize);
        await Promise.all(batch.map(preloadImage));

        loadedCount += batch.length;
        const percent = Math.min(100, Math.round((loadedCount / graphData.nodes.length) * 100));
        progressBar.style.width = `${percent}%`;
    }

    // Step 3: Fade out loading screen
    progressText.innerText = "Weaving the Web...";
    setTimeout(() => {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.style.display = 'none', 500); // Hide completely
    }, 400);
    // Keep track of the highlighted neighborhood
    let activeNode = null;
    const highlightNodes = new Set();
    const highlightLinks = new Set();
    // Step 4: Render the stunning Force-Graph
    currentSynergyGraph = ForceGraph()(container)
        .graphData(graphData)
        .backgroundColor('#0f172a')
        .nodeId('id')
        // 1. Dynamic Link Styling
        .linkColor(link => {
            if (activeNode) {
                // If in focus mode, highlight active links in bright green, hide the rest
                return highlightLinks.has(link) ? 'rgba(76, 175, 80, 0.8)' : 'rgba(180, 200, 255, 0.02)';
            }
            // Default icy blue galaxy look
            return `rgba(180, 200, 255, ${Math.min(0.6, link.weight / 25)})`;
        })
        .linkWidth(link => {
            if (activeNode) {
                return highlightLinks.has(link) ? Math.min(5, Math.max(2, link.weight / 10)) : 0.5;
            }
            return Math.min(3, Math.max(0.5, link.weight / 15));
        })

        // 2. THE SPECTACULAR EFFECT: Glowing Energy Particles
        .linkDirectionalParticles(link => highlightLinks.has(link) ? 4 : 0) // Only animate active links
        .linkDirectionalParticleWidth(4)
        .linkDirectionalParticleColor(() => '#a7f3d0') // Pale green energy
        .linkDirectionalParticleSpeed(0.006)

        // 3. Interactions: The Camera Swoop & Focus State
        .onNodeClick(node => {
            // If they click the same node again, turn off focus mode
            if (activeNode === node) {
                activeNode = null;
                highlightNodes.clear();
                highlightLinks.clear();
                return;
            }

            // Set the new active node and find its neighborhood
            activeNode = node;
            highlightNodes.clear();
            highlightLinks.clear();
            highlightNodes.add(node);

            graphData.links.forEach(link => {
                if (link.source.id === node.id || link.target.id === node.id) {
                    highlightLinks.add(link);
                    highlightNodes.add(link.source);
                    highlightNodes.add(link.target);
                }
            });

            // Smoothly fly the camera to the tapped card
            currentSynergyGraph.centerAt(node.x, node.y, 800); // 800ms pan
            currentSynergyGraph.zoom(1.8, 800); // Zoom in closer
        })
        .onBackgroundClick(() => {
            // Clicking empty space resets the view
            activeNode = null;
            highlightNodes.clear();
            highlightLinks.clear();
        })

        // Physics Setup
        .d3Force('charge', d3.forceManyBody().strength(-200))
        .d3Force('link', d3.forceLink().distance(80).id(d => d.id))
        .d3Force('center', d3.forceCenter())
        .d3Force('x', d3.forceX(0).strength(0.05))
        .d3Force('y', d3.forceY(0).strength(0.05))
        .d3Force('collide', d3.forceCollide(node => {
            return Math.max(20, Math.min(50, node.popularity / 3)) + 5;
        }).iterations(2))

        // 4. Update Node Rendering to Handle Fading
        .nodeCanvasObject((node, ctx, globalScale) => {
            const baseSize = Math.max(20, Math.min(50, node.popularity / 3));

            // Check if we should dim this card
            const isFaded = activeNode && !highlightNodes.has(node);

            ctx.save();

            // Fade out cards that aren't connected to the active node
            ctx.globalAlpha = isFaded ? 0.15 : 1;

            if (node.img && node.img.complete && node.img.naturalHeight !== 0) {

                // Keep the stunning shadows
                ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
                ctx.shadowBlur = 12;
                ctx.shadowOffsetX = 3;
                ctx.shadowOffsetY = 6;

                // If this is the specifically clicked node, give it an extra glowing aura!
                if (node === activeNode) {
                    ctx.shadowColor = '#4CAF50';
                    ctx.shadowBlur = 25;
                }

                const imgAspect = node.img.naturalWidth / node.img.naturalHeight;
                let drawWidth = baseSize * 2;
                let drawHeight = baseSize * 2;

                if (imgAspect > 1) {
                    drawHeight = drawWidth / imgAspect;
                } else {
                    drawWidth = drawHeight * imgAspect;
                }

                ctx.drawImage(
                    node.img,
                    node.x - (drawWidth / 2),
                    node.y - (drawHeight / 2),
                    drawWidth,
                    drawHeight
                );

            } else {
                ctx.fillStyle = '#334155';
                ctx.fillRect(node.x - baseSize, node.y - baseSize * 1.4, baseSize * 2, baseSize * 2.8);
            }

            ctx.restore();
        })
        .nodePointerAreaPaint((node, color, ctx) => {
            const baseSize = Math.max(20, Math.min(50, node.popularity / 3));

            // Create a clickable rectangle that roughly matches the card dimensions
            const hitWidth = baseSize * 2.2;
            const hitHeight = baseSize * 2.8;

            ctx.fillStyle = color; // The engine passes a unique hidden color to track clicks

            // Draw the invisible clickable box perfectly over the image
            ctx.fillRect(
                node.x - (hitWidth / 2),
                node.y - (hitHeight / 2),
                hitWidth,
                hitHeight
            );
        })
}

// --- Sync Data Cruncher ---
function buildSynergyData() {
    const nodesMap = new Map();
    const edgesMap = new Map();

    for (const key in fullDatabase) {
        const deck = fullDatabase[key];
        if (!deck.cards || !Array.isArray(deck.cards)) continue;

        const deckCards = deck.cards.map(c => c.replace(/^x\d+\s+/, '').trim().replaceAll('_', ' '));

        deckCards.forEach(card => {
            if (!nodesMap.has(card)) {
                nodesMap.set(card, { id: card, popularity: 1 });
            } else {
                nodesMap.get(card).popularity += 1;
            }
        });

        for (let i = 0; i < deckCards.length; i++) {
            for (let j = i + 1; j < deckCards.length; j++) {
                const pair = [deckCards[i], deckCards[j]].sort();
                const edgeId = `${pair[0]}|||${pair[1]}`;

                if (!edgesMap.has(edgeId)) {
                    edgesMap.set(edgeId, { source: pair[0], target: pair[1], weight: 1 });
                } else {
                    edgesMap.get(edgeId).weight += 1;
                }
            }
        }
    }

    const MIN_SYNERGY_WEIGHT = 10;
    const links = Array.from(edgesMap.values()).filter(e => e.weight >= MIN_SYNERGY_WEIGHT);

    const connectedNodes = new Set();
    links.forEach(link => {
        connectedNodes.add(link.source);
        connectedNodes.add(link.target);
    });
    const nodes = Array.from(nodesMap.values()).filter(n => connectedNodes.has(n.id));

    return { nodes, links };
}

function calculateCardScores(decksData) {
    const decks = [];
    let mostRecentDate = 0;

    // A. Parse the decks
    for (const [deckId, deckInfo] of Object.entries(decksData)) {
        if (!deckInfo.upload_date) continue;

        const dateObj = new Date(deckInfo.upload_date);
        if (isNaN(dateObj.getTime())) continue;

        if (dateObj.getTime() > mostRecentDate) {
            mostRecentDate = dateObj.getTime();
        }

        const cardsList = [];
        for (const cardStr of (deckInfo.cards || [])) {
            // Split "x4" and "Clique Peas"
            const spaceIndex = cardStr.indexOf(' ');
            if (spaceIndex !== -1) {
                const countPart = cardStr.substring(0, spaceIndex);
                const namePart = cardStr.substring(spaceIndex + 1);

                if (countPart.startsWith('x')) {
                    const count = parseInt(countPart.substring(1), 10);
                    if (!isNaN(count)) {
                        const cardName = namePart.replace(/_/g, " ");
                        cardsList.push({ name: cardName, count: count });
                    }
                }
            }
        }

        decks.push({ id: deckId, date: dateObj, cards: cardsList });
    }

    if (decks.length === 0) return [];

    // B. Calculate Meta-Metrics
    const totalDecks = decks.length;
    const cardDeckCounts = {};
    const cardWeightedCopies = {};

    // C. Calculate Time-Weighted Copies (TF)
    decks.forEach(deck => {
        // Time-decay: 1-year (365.25 days) half-life.
        const daysOld = (mostRecentDate - deck.date.getTime()) / (1000 * 60 * 60 * 24);
        const timeWeight = Math.pow(0.5, daysOld / 365.25);
        const deckCardsSeen = new Set();

        deck.cards.forEach(card => {
            if (!cardDeckCounts[card.name]) cardDeckCounts[card.name] = 0;
            if (!cardWeightedCopies[card.name]) cardWeightedCopies[card.name] = 0;

            if (!deckCardsSeen.has(card.name)) {
                cardDeckCounts[card.name]++;
                deckCardsSeen.add(card.name);
            }

            cardWeightedCopies[card.name] += (card.count * timeWeight);
        });
    });

    const cardScores = [];

    // D. Apply TF-IDF
    for (const [card, weightedCopies] of Object.entries(cardWeightedCopies)) {
        const docFrequency = cardDeckCounts[card];
        const idf = Math.log(totalDecks / docFrequency);
        const finalScore = weightedCopies * idf;

        cardScores.push({ card, score: finalScore });
    }

    // E. Sort from best to worst
    cardScores.sort((a, b) => b.score - a.score);
    return cardScores;
}

// Keep your existing calculateCardScores function exactly as it is above!

// State variables for the Tier List Navigation
let tierListInitialized = false;
let availableClasses = [];
let currentClassIndex = 0;
let cachedScoredCards = [];

function renderTiers() {
    // 1. One-time initialization when the view is first opened
    if (!tierListInitialized) {
        // Calculate all TF-IDF scores globally and cache them
        cachedScoredCards = calculateCardScores(fullDatabase);

        // Extract a unique, sorted list of all Classes from cardDatabase
        const classSet = new Set();
        for (const key in cardDatabase) {
            if (cardDatabase[key].Class) {
                classSet.add(cardDatabase[key].Class);
            }
        }
        availableClasses = Array.from(classSet).sort();

        // Start on a random class
        if (availableClasses.length > 0) {
            currentClassIndex = Math.floor(Math.random() * availableClasses.length);
        }

        // Hook up the Previous/Next buttons
        document.getElementById('prevClassBtn').addEventListener('click', () => {
            // This math handles negative looping cleanly
            currentClassIndex = (currentClassIndex - 1 + availableClasses.length) % availableClasses.length;
            drawCurrentClassTiers();
        });

        document.getElementById('nextClassBtn').addEventListener('click', () => {
            currentClassIndex = (currentClassIndex + 1) % availableClasses.length;
            drawCurrentClassTiers();
        });

        tierListInitialized = true;
    }

    // 2. Actually draw the list for the current class
    drawCurrentClassTiers();
}

function drawCurrentClassTiers() {
    const container = document.querySelector('.tier-list-container');
    container.innerHTML = ''; // Clear out the old tiers before drawing new ones

    const titleEl = document.getElementById('tierClassTitle');
    const currentClass = availableClasses[currentClassIndex];

    // Update the title visually
    titleEl.textContent = `${currentClass} Tier List`;

    // 3. Filter the cached cards to ONLY include cards belonging to this class
    const classCards = cachedScoredCards.filter(cardData => {
        // Format name to match cardDatabase keys (e.g., "Party Thyme" -> "Party_Thyme")
        const formattedKey = cardData.card.replace(/ /g, "_");
        const dbInfo = cardDatabase[formattedKey];
        return dbInfo && dbInfo.Class === currentClass;
    });

    if (classCards.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No ranked cards found for this class.</p>';
        return;
    }

    // 4. Determine the highest score IN THIS CLASS so the curve fits the page perfectly
    const topScore = classCards[0].score;

    const tiers = [
        { grade: 'S', colorClass: 'tier-s', title: 'Overpowered', cards: [], minScore: topScore * 0.75 },
        { grade: 'A', colorClass: 'tier-a', title: 'Excellent', cards: [], minScore: topScore * 0.45 },
        { grade: 'B', colorClass: 'tier-b', title: 'Great', cards: [], minScore: topScore * 0.25 },
        { grade: 'C', colorClass: 'tier-c', title: 'Average', cards: [], minScore: topScore * 0.10 },
        { grade: 'D', colorClass: 'tier-d', title: 'Niche', cards: [], minScore: topScore * 0.03 },
        { grade: 'F', colorClass: 'tier-f', title: 'Terrible', cards: [], minScore: 0 }
    ];

    // Assign cards to tiers based on the class curve
    classCards.forEach(cardData => {
        for (let i = 0; i < tiers.length; i++) {
            if (cardData.score >= tiers[i].minScore) {
                tiers[i].cards.push(cardData);
                break;
            }
        }
    });

    // 5. Build the DOM
    tiers.forEach(tier => {
        const row = document.createElement('div');
        row.className = 'tier-row';

        const label = document.createElement('div');
        label.className = `tier-label ${tier.colorClass}`;
        label.textContent = tier.grade;
        label.title = tier.title;

        const cardsArea = document.createElement('div');
        cardsArea.className = 'tier-cards';

        tier.cards.forEach(cardData => {
            const imgWrap = document.createElement('div');
            imgWrap.className = 'tier-card-wrapper';

            imgWrap.title = `${cardData.card}\nScore: ${cardData.score.toFixed(2)}`;

            const formattedName = cardData.card.replace(/ /g, "_");

            const img = document.createElement('img');
            img.className = 'tier-actual-card';

            // Default to PNG
            img.src = `card_images/${formattedName}.png`;

            // Fallback to WebP if the PNG is missing
            img.onerror = function () {
                this.onerror = null; // Prevent infinite loop
                this.src = `card_images/${formattedName}.webp`;
            };

            imgWrap.appendChild(img);
            cardsArea.appendChild(imgWrap);
        });

        row.appendChild(label);
        row.appendChild(cardsArea);
        container.appendChild(row);
    });
}

const guidesData = [
    {
        title: "Top 10 Best Decks in PvZH",
        description: "A data-backed ranking of the strongest decks in the current meta.",
        href: "/best-decks-pvzh-june-2026",
        badge: "Most searched",
        time: "6 min read",
        date: "June 11, 2026",
        icon: "stack"
    },
    {
        title: "Best Immorticia Decks",
        description: "Taking a look at the most powerful Immorticia decks.",
        href: "/best-immorticia-decks",
        badge: "Hero Guide",
        time: "4 min read",
        date: "June 12, 2026",
        icon: "hero"
    },
    {
        title: "Top 10 Espresso Fiesta Decks",
        description: "A breakdown of the highest-scoring decks featuring the Espresso Fiesta finisher.",
        href: "/best-espresso-fiesta-decks",
        badge: "Card Guide",
        time: "5 min read",
        date: "June 16, 2026",
        icon: "book"
    },
    {
        title: "Top 10 Bad Moon Rising Decks",
        description: "A showcase of the most chaotic and competitive decks relying on the Bad Moon Rising finisher.",
        href: "/best-bad-moon-rising-decks",
        badge: "Card Guide",
        time: "5 min read",
        date: "June 17, 2026",
        icon: "book"
    },
    {
        title: "Top 10 Budget Decks",
        description: "A roundup of the highest-scoring, low-spark decks for players on a budget.",
        href: "/best-budget-decks",
        badge: "Budget Guide",
        time: "5 min read",
        date: "June 19, 2026",
        icon: "budget"
    },
    {
        title: "Best Decks for Every Hero in PvZH",
        description: "A complete hero-by-hero guide to the best Plant and Zombie decks, including budget and maxed options.",
        href: "/best-decks-for-every-hero",
        badge: "Mega Guide",
        time: "12 min read",
        date: "June 20, 2026",
        icon: "tiers"
    },
    {
        title: "Best Rose Decks",
        description: "A breakdown of the most dominant Rose decks, from infuriating Heal/Freeze combos to Midrange powerhouses.",
        href: "/best-rose-decks",
        badge: "Hero Guide",
        time: "5 min read",
        date: "June 22, 2026",
        icon: "hero"
    },
];

function guideIconSvg(type) {
    // All icons standardized to a crisp 24x24 outline grid
    const baseAttrs = 'class="guide-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

    const icons = {
        stack: `<svg ${baseAttrs}><path d="M7 3h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M3 7H2v10a2 2 0 0 0 2 2h10v-1"/></svg>`,
        hero: `<svg ${baseAttrs}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
        budget: `<svg ${baseAttrs}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
        tiers: `<svg ${baseAttrs}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
        book: `<svg ${baseAttrs}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
        arrow: `<svg ${baseAttrs}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`
    };

    return icons[type] || icons.stack;
}

function renderGuides() {
    const grid = document.getElementById("guidesGrid");
    if (!grid) return;

    // 1. Sort all guides by date descending (Most recent first)
    const sortedGuides = [...guidesData].sort((a, b) => new Date(b.date) - new Date(a.date));

    // 2. Map structural icon identifiers to clean display categories
    const categoryMapping = {
        stack: "Meta & Core Tier Lists",
        tiers: "Meta & Core Tier Lists",
        hero: "Hero Strategy Guides",
        book: "Card & Finisher Breakdowns",
        budget: "Budget Archetypes"
    };

    // 3. Group the chronologically sorted guides into categories
    const groupedGuides = {};
    sortedGuides.forEach(guide => {
        const categoryName = categoryMapping[guide.icon] || "General Resources";
        if (!groupedGuides[categoryName]) {
            groupedGuides[categoryName] = [];
        }
        groupedGuides[categoryName].push(guide);
    });

    // 4. Set an intentional sequence for how categories stack down the page
    const categoryOrder = [
        "Meta & Core Tier Lists",
        "Hero Strategy Guides",
        "Card & Finisher Breakdowns",
        "Budget Archetypes"
    ];

    // 5. Generate structured HTML chunks
    let htmlContent = "";

    categoryOrder.forEach(category => {
        const guidesInCat = groupedGuides[category];

        // If you haven't written a guide for this category yet, skip rendering the header entirely
        if (!guidesInCat || guidesInCat.length === 0) return;

        htmlContent += `
            <div class="guide-category-group">
                <h2 class="category-heading">${category}</h2>
                <div class="category-cards-grid">
                    ${guidesInCat.map(guide => `
                        <a class="guide-card" href="${guide.href}">
                            <div class="guide-top">
                                <div class="guide-icon-wrap">
                                    ${guideIconSvg(guide.icon)}
                                </div>
                                <div class="guide-badge">${guide.badge}</div>
                            </div>

                            <h3>${guide.title}</h3>
                            <p>${guide.description}</p>

                            <div class="guide-meta">
                                <div class="guide-meta-left">
                                    <span class="guide-date">${guide.date}</span>
                                    <span class="guide-separator">•</span>
                                    <span class="guide-time">${guide.time}</span>
                                </div>
                                <div class="guide-arrow" aria-hidden="true">→</div>
                            </div>
                        </a>
                    `).join("")}
                </div>
            </div>
        `;
    });

    grid.innerHTML = htmlContent;
}
document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector('.featured-decks-container');
    if (container) {
        const links = container.querySelectorAll('.featured-decks-link');
        if (links.length > 0) {
            // Choose a random index between 0 and the total number of links
            const randomIndex = Math.floor(Math.random() * links.length);

            // Un-hide the chosen link
            links[randomIndex].classList.add('is-visible');
        }
    }
});
document.addEventListener("DOMContentLoaded", renderGuides);

// ============================================================
// "More" dropdown behavior — paste at the BOTTOM of app.js
// (or anywhere after the DOM is loaded)
//
// Your existing click handlers for #statsBtn, #guidesBtn, and
// #gamesBtn keep working untouched — this only opens/closes
// the menu around them.
// ============================================================

(function () {
    const moreBtn = document.getElementById('moreBtn');
    const dropdown = document.getElementById('moreDropdown');
    if (!moreBtn || !dropdown) return;

    function openMenu() {
        dropdown.hidden = false;
        moreBtn.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
        dropdown.hidden = true;
        moreBtn.setAttribute('aria-expanded', 'false');
    }

    moreBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdown.hidden ? openMenu() : closeMenu();
    });

    // Picking any item (Stats / Guides / Mini Game) closes the menu.
    // The item's own existing handler still fires normally.
    dropdown.addEventListener('click', function () {
        closeMenu();
    });

    // Click anywhere else closes it
    document.addEventListener('click', function (e) {
        if (!dropdown.hidden && !dropdown.contains(e.target) && e.target !== moreBtn) {
            closeMenu();
        }
    });

    // Escape closes it
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
    });
})();

