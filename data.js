/**
 * Masterpiece Dictionary & Generator
 * Strict QWERTY Hand Isolation Engine
 */

const Dictionary = {
    // Strictly Left Hand Keys: q,w,e,r,t,a,s,d,f,g,z,x,c,v,b
    left: [
        "sad", "bad", "wax", "vast", "fear", "bat", "cat", "tree", "car", "base",
        "face", "fact", "deaf", "dead", "secret", "water", "star", "brave", "cater",
        "create", "dart", "exact", "fast", "grab", "abstract", "street", "bear",
        "west", "card", "care", "case", "cast", "date", "draw", "east", "gate",
        "gear", "great", "rate", "read", "safe", "save", "seat", "trade", "wave",
        "after", "craft", "draft", "grace", "track", "tract", "verse", "asset"
    ],

    // Strictly Right Hand Keys: y,u,i,o,p,h,j,k,l,n,m
    right: [
        "him", "you", "ill", "mom", "nip", "pip", "pup", "joy", "ink", "lip",
        "oil", "pool", "loop", "holy", "yolk", "minimum", "onion", "million",
        "pop", "pump", "link", "jump", "noon", "moon", "hook", "lion", "milk",
        "hill", "look", "pull", "upon", "join", "kill", "only", "poly", "monk",
        "john", "phono", "polio", "unhook", "johnny", "phony", "plump", "pink",
        "pimp", "lump", "limp", "hymn", "homo", "loom", "mull"
    ],

    // Common English words for both hands
    both: [
        "meow",
        "the", "quick", "brown", "fox", "jumps", "over", "lazy", "dog", "hello",
        "world", "practice", "makes", "perfect", "typing", "speed", "keyboard",
        "screen", "monitor", "focus", "learning", "journey", "success", "future",
        "number", "people", "way", "water", "words", "part", "sound", "work",
        "place", "years", "things", "name", "sentence", "man", "line", "boy",
        "farm", "end", "men", "rock", "order", "problem", "room", "friend"
    ]
};

/**
 * Generates a string of text based on the active hand setting
 * @param {string} mode - "left", "right", or "both"
 * @param {number} wordCount - Number of words to generate
 * @returns {string} - The generated lesson text
 */
function generateLesson(mode = "both", wordCount = 20) {
    const bank = Dictionary[mode] || Dictionary.both;
    let lessonWords = [];

    // Ensure pseudo-random distribution
    for (let i = 0; i < wordCount; i++) {
        const randomIndex = Math.floor(Math.random() * bank.length);
        lessonWords.push(bank[randomIndex]);
    }

    return lessonWords.join(" ");
}
