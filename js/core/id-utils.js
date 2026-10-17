/**
 * Sequential id generator for records.
 * Defines: nextId()
 */
function nextId(arr){ return arr.length?Math.max.apply(null,arr.map(function(x){return x.id;}))+1:1; }
