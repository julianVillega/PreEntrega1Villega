let AI_positions = [];
let player_positions = [4];
const posible_victories = [
    [0,1,2],//victory by row
    [3,4,5],//victory by row
    [6,7,8],//victory by row
    [0,3,6],//victory by column
    [1,4,7],//victory by column
    [2,5,8],//victory by column
    [0,4,8],//victory by diagonal
    [2,4,6] //victory by diagonal
];


function player_wins_in_the_next_move(){
    //If the player can win in his netx move, this returns the position the AI must take to block the player.
    //Otherwise returns false.

    for(i= 0; i<8; i++){
        let victory = posible_victories[i];
        let player_held_positions = 0;
        for (position_index = 0; position_index < 3; position_index++){
            if (player_positions.includes(victory[position_index])){
                player_held_positions ++;
            }
            if (player_held_positions == 2){
                //find with position is not held by the player and return it
                for (j = 0; j < 3; j++){       
                    if (!(player_positions.includes(victory[j]))){
                        console.log(victory)
                        return victory[j];
                    }
                }
            }
        }
    }
    //player can't win in the next move, so return false
    return false
}


function available_victories(){
    //returns the victories that are still available, that is, those of which no positions belong to the oponent.
    
    //deep copy the possible victories
    let available_victories = JSON.parse(JSON.stringify(posible_victories));

    //filter victories with at least one position belonging to the oponent
    available_victories = available_victories.filter(victory => !victory.some(position => player_positions.includes(position)));

    return available_victories;
}


available_victories();