function quoteSplitter(quotes) {
    let arr = []
    let split = quotes.split('|').map(quote => quote.trim());
    split.forEach(q => {
        const proper_q = q.replace(/"/g, '');
        arr.push(proper_q);
    });
    return arr;
}


let s = '"123"|"456"|"789"';

console.log(quoteSplitter(s)); // [ '123', '456', '789' ]