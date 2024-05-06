let AI_positions = [];
let player_positions = [0,4,1];
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
        //player can't win in the next move, so return false
    }
    return false

}

console.log(player_wins_in_the_next_move());