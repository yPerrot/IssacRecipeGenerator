import { btree_nodes, rng_offsets, item_pool_data, item_config_data } from './resources.js'

export function str2seed(seed) {
    if (seed.length != 9) return 0;
    //"xxxx xxxx"
    if (seed[4] != ' ') {
        return 0;
    }

    let dict = []
    for (let i = 0; i < 255; i++) {
        dict[i] = 0xFF;
    }
    for (let i = 0; i < 32; i++) {
        dict["ABCDEFGHJKLMNPQRSTWXYZ01234V6789".charCodeAt(i)] = i;
    }

    let num_seed = []
    for (let i = 0; i < 9; i++) {
        if (i == 4)
            continue;
        let j = i;
        if (i > 4) {
            j = i - 1;
        }
        num_seed[j] = dict[seed.charCodeAt(i)];
        if (num_seed[j] == 0xFF)
            return 0;
    }

    let v8 = 0;
    let v10;

    //num_seed[x] j is unsigned int8
    for (let j = ((num_seed[6] >>> 3) | (4
        * (num_seed[5] | (32
            * (num_seed[4] | (32
                * (num_seed[3] | (32
                    * (num_seed[2] | (32 * (num_seed[1] | (32 * num_seed[0])))))))))))) ^ 0xFEF7FFD;
        j != 0;
        v8 = ((v10 >>> 7) + 2 * v10) & 0xFF) {
        v10 = ((j & 0xFF) + v8) & 0xFF;
        j >>>= 5;
    }
    if (v8 == (num_seed[7] | (0xFF & (32 * num_seed[6])))) {
        return ((num_seed[6] >> 3) | (4
            * (num_seed[5] | (32
                * (num_seed[4] | (32
                    * (num_seed[3] | (32
                        * (num_seed[2] | (32 * (num_seed[1] | (32 * num_seed[0])))))))))))) ^ 0xFEF7FFD;
    }
    return 0;
}

export function bucket_sort_list_toint64(item_array) {
    console.assert(item_array.length == 8)

    let item_count = []

    //initial value
    for (let i = 0; i < 0x1F; i++) {
        item_count[i] = 0;
    }

    item_count[item_array[0]]++
    item_count[item_array[1]]++
    item_count[item_array[2]]++
    item_count[item_array[3]]++
    item_count[item_array[4]]++
    item_count[item_array[5]]++
    item_count[item_array[6]]++
    item_count[item_array[7]]++

    let offset = 0n


    let v12 = 0n // v12 is 64 bit
    for (let i = 0n; i < 0x1Fn; i++) {
        for (let j = 0; j < item_count[i]; j++) {
            //此代码一定会执行8遍
            v12 |= i << offset
            offset += 8n
        }
    }
    //v12 = 0x08 07 06 05 04 03 02 01
    return v12;
}

let btree = btree_nodes["0B73A168"]
export function binary_tree_search_element(sorted_items){
    console.assert(typeof sorted_items == 'bigint')
    let root = btree_nodes[btree.upper]

    let output = {
        node:root,
        finded:false,
        found_node:btree
    }

    while(!root.over){
        output.node = root
        if(root.input >= sorted_items){
            output.found_node = root
            output.finded = 1
            root = btree_nodes[root.left]
        }else{
            root = btree_nodes[root.right]
            output.finded = 0
        }
    }
    return output
}

export function RNG_Next(num, offset_id){
    let offset_a = rng_offsets[offset_id * 3]
    let offset_b = rng_offsets[offset_id * 3 + 1]
    let offset_c = rng_offsets[offset_id * 3 + 2]
    num = num ^ ((num >>> offset_a) & 0xFFFFFFFF)
    num = num ^ ((num << offset_b) & 0xFFFFFFFF)
    num = num ^ ((num >>> offset_c) & 0xFFFFFFFF)
    return num >>> 0 /* to unsigned */
}

export function GetItemPoolData(item_pool_id){
    console.assert(item_pool_data[item_pool_id] != undefined)
    return item_pool_data[item_pool_id]
}

export function GetItemConfig(item_id){
    console.assert(item_config_data[item_id] != undefined)
    return item_config_data[item_id]
}

export function GetAchievementUnlocked(achievement_id){
    if(achievement_id >= 0x27E)
        return false
    if(achievement_id == 0)
        return true
        
    // FIXME: What is this ?
    // if(document.getElementById("achievement_unlocked").checked /* xxxx */) 
    //    return true

    // I dont know what it is, maybe daily run
    // if( cond1 == 2 && (cond2.x || cond2.y))
    //     return true
    return false
}

export function get_result(input_array, gameStartSeed){

    // console.log("-START-");
    // console.log(input_array);
    // console.log("-MID-");
    // console.log(gameStartSeed);
    // console.log("-END-");

    let sorted_items = bucket_sort_list_toint64(input_array)


    let search_result = binary_tree_search_element(sorted_items).found_node
    if(search_result.over || sorted_items < search_result.input){
        search_result = btree
    }
    if(search_result == btree || search_result.output == 0){
        //you can use this BSearch algorithm from game, or just scan recipes.xml 

        //总之就是没有查到固定组合
        //中间是一系列算法
        //GetBagOfCraftItemId L131
        let item_count = []
        for(let i=0;i<0x1F;i++){
            item_count[i] = 0
        }
        item_count[input_array[0]]++
        item_count[input_array[1]]++
        item_count[input_array[2]]++
        item_count[input_array[3]]++
        item_count[input_array[4]]++
        item_count[input_array[5]]++
        item_count[input_array[6]]++
        item_count[input_array[7]]++
        
        let score_matrix = [
            0x00000000, 0x00000001, 0x00000004, 0x00000005, 0x00000005, 0x00000005, 0x00000005,
            0x00000001, 0x00000001, 0x00000003, 0x00000005, 0x00000008, 0x00000002, 0x00000007, 
            0x00000005, 0x00000002, 0x00000007, 0x0000000A, 0x00000002, 0x00000004, 0x00000008, 
            0x00000002, 0x00000002, 0x00000004, 0x00000004, 0x00000002, 0x00000007, 0x00000007, 
            0x00000007, 0x00000000, 0x00000001]
        
        let item_score_sum = 
            score_matrix[input_array[0]] + 
            score_matrix[input_array[1]] + 
            score_matrix[input_array[2]] + 
            score_matrix[input_array[3]] + 
            score_matrix[input_array[4]] + 
            score_matrix[input_array[5]] + 
            score_matrix[input_array[6]] + 
            score_matrix[input_array[7]]

        // console.log("item score sum = " + item_score_sum)
        let weight_list = [
            {id:0,weight:1.0},
            {id:1,weight:2.0},
            {id:2,weight:2.0},
            {id:4,weight:item_count[4] * 10.0},
            {id:3,weight:item_count[3] * 10.0},
            {id:5,weight:item_count[6] * 5.0},
            {id:8,weight:item_count[5] * 10.0},
            {id:12,weight:item_count[7] * 10.0},
            {id:9,weight:item_count[25] * 10.0},
            {id:7,weight:item_count[29] * 10.0},
        ]
        if(item_count[15] + item_count[12] + item_count[8] + item_count[1] == 0){
            weight_list.push(
                {id:26, weight:item_count[23] * 10.0}
            )
        }
        if(gameStartSeed == 0){
            throw "Error"
        }

        let currentSeed = gameStartSeed

        for(let item_i = 0;item_i < 0x1F;item_i++){
            for(let j=0;j<item_count[item_i];j++){
                currentSeed = RNG_Next(currentSeed, item_i)
            }
        }
        // console.log(currentSeed)
        let collectible_count = 733 // it equals to some_variable_a - some_variable_b
        
        let collectible_list = []
        for(let i=0;i<collectible_count;i++){
            collectible_list[i] = 0.0
        }

        let all_weight = 0.0
        // console.log(weight_list)
        if(weight_list.length > 0){
            for(let weight_select_i = 0;weight_select_i < weight_list.length;weight_select_i++){
                if(weight_list[weight_select_i].weight <= 0.0){
                    continue
                }
                let score = item_score_sum
                if(weight_list[weight_select_i].id == 4 || weight_list[weight_select_i].id == 3 || weight_list[weight_select_i].id == 5){
                    score -= 5
                }

                let quality_min = 0
                let quality_max = 1
                if ( score > 34 )
                {
                    quality_max = 4;
                    quality_min = 4;
                }
                else if ( score > 30 )
                {
                    quality_max = 4;
                    quality_min = 3;
                }
                else if ( score > 26 )
                {
                    quality_max = 4;
                    quality_min = 3;
                }
                else if ( score > 22 )
                {
                    quality_max = 4;
                    quality_min = 2;
                }
                else if ( score > 18 )
                {
                    quality_max = 3;
                    quality_min = 2;
                }
                else if ( score > 14 )
                {
                    quality_min = 1;
                    quality_max = 2;
                }else if ( score > 8 )
                {
                    quality_min = 0;
                    quality_max = 2;
                }
                
                let item_pools = GetItemPoolData(weight_list[weight_select_i].id)
                for(let item_pool_i = 0;item_pool_i < item_pools.length;item_pool_i++){
                    // if(some_address == 0){//v53, dword_1779AEC
                    //     //not handled
                    //     //i dont know
                    // }
                    let item_config = undefined
                    if(item_pools[item_pool_i].id >= 0){
                        if(item_pools[item_pool_i].id >= collectible_count){
                            item_config = undefined
                        }else{
                            item_config = GetItemConfig(item_pools[item_pool_i].id)
                        }
                        //goto label 86
                    }else{
                        //what's wrong with item ID?
                        //i dont know if it is right...
                        console.assert(false, "Unknown condition")
                        let tempid = ~item_pools[item_pool_i].id
                        if(tempid < 0 || tempid > collectible_count /* it is not collectible_count, i dont know what it is */)
                        {
                            item_config = undefined  
                        }else{
                            item_config = GetItemConfig(tempid) /* it is not ItemConfig, i dont know what it is */
                        }
                    }

                    let item_quality = 0 + item_config.quality /* there is not a zero, but a var from item_config, which is always zero when i'm testing */
                    if(item_quality >= quality_min && item_quality <= quality_max){
                        //be careful:the game use float instead of double, so js in not accurate!!!
                        let item_weight = item_pools[item_pool_i].weight * weight_list[weight_select_i].weight
                        all_weight += item_weight
                        // console.log(all_weight)
                        collectible_list[item_pools[item_pool_i].id] += item_weight
                    }
                }
            }
            //label 92
            //for break condition, nothing to do here
        }
        //all weight is not accurate
        // console.log("all weight = " + all_weight)

        // console.log("current seed = " + currentSeed)

        let retry_count = 0

        let selected

        while(true){
            currentSeed = RNG_Next(currentSeed,6)
            //use float instead!!!
            let remains = Number(currentSeed) * 2.3283062e-10 * all_weight
            // console.log(remains)
            selected = 25
            for(let current_select=0;current_select < collectible_count;current_select++){
                // console.log(collectible_list[current_select])
                if(collectible_list[current_select] > remains){
                    selected = current_select
                    break
                }
                remains -= collectible_list[current_select]
            }
            // console.log(selected)
            
            // if(something == null){ dword_1779AEC
            //     break
            // }

            if(selected >= 0){
                //label 109
                if(selected >= collectible_count){
                    //goto label 120
                }
            }else{
                console.assert(false, "not tested")
                //v72 be careful
            }
            
            // if(v72) yes, sure, v72 = something[select]
            let item_config = GetItemConfig(selected)
            // console.log(item_config)
            if(item_config != undefined && 
                (
                    item_config.achievement_id == undefined ||
                    GetAchievementUnlocked(item_config.achievement_id)
                )
            ){
                break
            }
            if(++retry_count >= 20)
                break
        }
        return selected
    }
    
    // console.log(search_result);
    // console.log(search_result.output);
    
    return search_result.output
}
