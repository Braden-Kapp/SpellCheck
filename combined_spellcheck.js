//I originally had all of these separated into different files, but i used exports and fs
//Both of these things had trouble working in a web browser but worked fine in node.js 
//I combined all the files to this single one so there's no export and switched fs for fetch


// ========================================
//This will be the dictionary, eventually, scoped globally
let wordsArray = [];

// ========================================
//Sequence Alignment functions
function calculate_mismatch(char1, char2) {
    if (char1 === char2) return 0; // Complete Match

    // Is it a vowel or not check
    let isVowel1 = /[aeiou]/i.test(char1); 
    let isVowel2 = /[aeiou]/i.test(char2); 

    // Both vowels or both not vowels
    if (isVowel1 === isVowel2) return 1;

    // Complete Mismatch
    return 3;
}

function sequence_alignment(word1, word2) {
    let rows = word1.length;
    let cols = word2.length;

    // Gap Penalty
    let gap = 2;
    
    // Setting up arr
    let arr = [];
    for (let i = 0; i < rows + 1; i++) {
        arr[i] = []; // Initialize each row as an empty array
        for (let j = 0; j < cols + 1; j++) {
            arr[i][j] = Infinity; // Assigning all a base value of Infinity 
        }
    }
    
    // Set up gap values
    arr[0][0] = 0;
    for (let i = 1; i <= rows; i++) {
        arr[i][0] = i * gap;
    }
   
    for (let j = 1; j <= cols; j++) {
        arr[0][j] = j * gap;
    }

    for (let i = 1; i < rows + 1; i++) {
        let rowChar = word1.charAt(i - 1);
        for (let j = 1; j < cols + 1; j++) {
            let colChar = word2.charAt(j - 1);
            let mismatch = calculate_mismatch(rowChar, colChar);
            arr[i][j] = Math.min(
                arr[i - 1][j - 1] + mismatch,   // diagonal (match/mismatch)
                arr[i - 1][j] + gap,            
                arr[i][j - 1] + gap             
            );
        }
    }
    return arr[word1.length][word2.length];
}

// ========================================
//Max Heap Class
//This is the same MaxHeap used in c++ for project3 exept it has been translated to js
//It also now usese node.score when comparing due to the new way it is uesd
class MaxHeap {
    constructor(arr = null) {
        this.A = [];
        this.heapSize = 0;

        if (arr !== null) { 
            this.A = [...arr]; // copy the array
            this.heapSize = arr.length;
            this.buildMaxHeap();
        }
    }

    parent(i) { return Math.floor((i - 1) / 2); } //Change from C++ have to use Math.floor(), not int div
    left(i) { return 2 * i + 1; }
    right(i) { return 2 * i + 2; }

    maxHeapify(i) {
        let largest = i;
        const l = this.left(i);
        const r = this.right(i);
        
        //Change from c++, what is being given is objs with words and score so .score is needed
        if (l < this.heapSize && this.A[l].score > this.A[largest].score) largest = l;
        if (r < this.heapSize && this.A[r].score > this.A[largest].score) largest = r;

        if (largest !== i) {
            [this.A[i], this.A[largest]] = [this.A[largest], this.A[i]];
            this.maxHeapify(largest);
        }
    }

    buildMaxHeap() {
        for (let i = Math.floor(this.heapSize / 2); i >= 0; i--) {
            this.maxHeapify(i);
        }
    }

    heapSort() {
        const originalSize = this.heapSize;
        for (let i = this.heapSize - 1; i > 0; i--) {
            [this.A[0], this.A[i]] = [this.A[i], this.A[0]];
            this.heapSize--;
            this.maxHeapify(0);
        }
        this.heapSize = originalSize;
    }
    maximum() {
        return this.A[0];
    }
    extractMax() {
        if (this.heapSize === 0) return null;
        const max = this.A[0];
        this.A[0] = this.A[this.heapSize - 1];
        this.heapSize--;
        this.A.pop();
        this.maxHeapify(0);
        return max;
    } 
    printHeap(limit = 10) { //Made limit of 10 instead of printing all
        console.log(this.A.slice(0, Math.min(limit, this.heapSize)));
    }
    return10() {
        const results = [];
        for (let i = 0; i < 10; i++) {
            if (i < this.A.length) {
                results.push(this.A[i]);
            }
        }
        return results;
    }
}

// =======================================
//Function to load dictionary.txt, will be called in index.html
async function loadDictionary() {
    try {
        const response = await fetch('dictionary.txt');
        const data = await response.text();
        //Split dictionary into individual words in the array
        wordsArray = data.split(/\s+/).filter(word => word.length > 0);
        console.log(`Dictionary loaded: ${wordsArray.length} words`); //For error checking
        return true;
    } catch (error) {
        console.error('Error loading dictionary:', error); //More error checking(this wasn't working for a while)
        return false;
    }
}

// ========================================
//mainFunction
function mainFunc(givenWord) {
    if (wordsArray.length === 0) {
        //Error checking for fetching the dictionary
        console.error('Dictionary not loaded');
        return [];
    }
    
    const results = []; // array to store word objects
    wordsArray.forEach(dictWord => { //Call sequence alignment on each word in the dictionary 
        const wordObj = {
            word: dictWord,
            score: sequence_alignment(givenWord, dictWord)
        }; 
        results.push(wordObj);//add each word object to results
    });
    
    const heap = new MaxHeap(results);
    heap.heapSort(); //Sort results
    let res = heap.return10(); //Take top 10
    return res; //return top 10
}