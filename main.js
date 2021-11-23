import { get_result } from './utils.js'
import { item_name_data } from './resources.js'

// const LIST = [1, 2, 8, 9, 12, 15]
// const LIST_LENGTH = LIST.length;

function makeListBasicPickUp(pickUps) {

    const length = pickUps.length;
    let res = new Set();

    for (let i = 0; i < length; i++) {
        for (let j = 0; j < length; j++) {
            for (let k = 0; k < length; k++) {
                for (let l = 0; l < length; l++) {
                    for (let m = 0; m < length; m++) {
                        for (let n = 0; n < length; n++) {
                            for (let o = 0; o < length; o++) {
                                for (let p = 0; p < length; p++) {
                                    let r = [pickUps[i], pickUps[j], pickUps[k], pickUps[l], pickUps[m], pickUps[n], pickUps[o], pickUps[p]]
                                    r.sort(function(a, b){return a-b});
                                    res.add(r.toString());
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return res;

}

function getArray(input_string) {
    return input_string.split(',').map(e => +e);
}

function msToTime(s) {

    // Pad to 2 or 3 digits, default is 2
    function pad(n, z) {
      z = z || 2;
      return ('00' + n).slice(-z);
    }
  
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;
  
    return pad(hrs) + ':' + pad(mins) + ':' + pad(secs) + '.' + pad(ms, 3);
}

export function main(seed, pickUps) {

    
    let main_elem = document.querySelector('main');
    main_elem.innerHTML = '';
    // let loader = document.createElement('div');
    // loader.classList.add('loader');
    // main_elem.appendChild(loader);

    const list = makeListBasicPickUp(pickUps);

    console.log("List generated (size: " + list.size + ")");

    let elem = new Map();

    console.log("Start generate result");
    const start = new Date();
    
    list.forEach(input_string => {
        const input_array = getArray(input_string);
        let itemId = get_result(input_array, seed);
        // if (itemId != 64) return;
        elem.set(input_array.toString(), itemId)
    })
    const elemSorted = new Map([...elem.entries()].sort((a, b) => a[1] - b[1]));
    
    printElems(elemSorted)

    const end = new Date();
    console.log("End generation");
    console.log("Duration: " + msToTime(end - start));
}

function printElems(elemSorted) {

    let previous;

    let main = document.querySelector('main');
    main.innerHTML = '';

    let div;

    elemSorted.forEach( (itemId, input_string) =>  {
        if (itemId != previous) {

            if (div != undefined) {
                main.appendChild(div);
            }

            div = document.createElement('div');

            let item = document.createElement('img');
    
            let truItemId;
            if (itemId < 10) truItemId = '00' + itemId;
            else if (itemId < 100) truItemId = '0' + itemId;
            else truItemId = itemId;
            
            item.classList.add('collectible');
            item.classList.add('collectibles_'+truItemId)

            div.dataset.id = itemId
            div.dataset.name = item_name_data[itemId];
            
            div.appendChild(item)
            div.appendChild(document.createElement('br'))

            previous = itemId;
        }

        const input_array = getArray(input_string)

        input_array.forEach(e => {
            let pickup = document.createElement('img')
            pickup.classList.add('bofsym_'+e);
            pickup.classList.add('bofsym');
            div.appendChild(pickup)
        })
        div.appendChild(document.createElement('br'))
    })

    main.appendChild(div);

}
