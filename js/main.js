let AI_positions = [1,2,3,6,8];
let player_positions = [4,5,7];
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

function is_the_match_over(){
    //checks weather the match ended.
    // returns "ai", "oponent", "draw" or "continue"
    let free_positions = false;
    let winner = "none"
    posible_victories.forEach(victory =>{
        if(victory.every(position => AI_positions.includes(position))){
            winner = "ai";                     
        }
        if(victory.every(position => player_positions.includes(position))){
            winner="player"
        }
        //check if the position dosen't belong to anyone
        if(victory.some(
            position => {
            (!player_positions.includes(position)) && (!AI_positions.includes(position))
            }
        )){
            free_positions = true;
        }
    })
    if(winner !== "none"){
        return winner
    }
    if(free_positions){
        return "continue";
    }
    return "draw"
}

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

function select_victory_path(){
    //Used to decide wich positions, and in wich order the AI should take when the oponent isn't going to win in his next move.
    //Returns an ordered list with the positions the AI should take in the next rounds.

    //get the available victories for the AI.
    let victories = available_victories();
    
    //Used to keep track of how many times each position apears among the available victories.
    function Position_ocurrence (position, ocurrences){
        this.position = position;
        this.ocurrences = ocurrences;
    }
    
    //calculate how many times each position appears among the available victories
    let positions_ocurrence = Array(9);
    for(i = 0; i < 9; i++){
        positions_ocurrence[i] = new Position_ocurrence(i,0)
    }
    
    victories.flat().forEach(position => {
        positions_ocurrence[position].ocurrences++;
    });

    //find the most comon position
    //create a deep copy of positions_ocurrence
    let positions_ocurrence_copy = JSON.parse(JSON.stringify(positions_ocurrence));
    positions_ocurrence_copy.sort( (pos1,pos2) => pos2.ocurrences - pos1.ocurrences );
    let most_comon_position = positions_ocurrence_copy[0].position;

    // get the victories that include the most common possition.
    victories = victories.filter(victory => victory.includes(most_comon_position));
    
    // get the victory with the most common possitions.
    let max_ocurrences = 0;
    let selected_victory;
    victories.forEach(victory =>{
        let total_ocurences = 0;
        victory.forEach(position => {
            total_ocurences += positions_ocurrence[position].ocurrences;
        })
        if (total_ocurences > max_ocurrences){
            max_ocurrences = total_ocurences;
            selected_victory = victory;
        }
    });



    //sort the selected victory positions acording the their frequency
    let selected_victory_position_ocurence = [];
    selected_victory.forEach(position =>{
        selected_victory_position_ocurence.push(positions_ocurrence[position])    
    })

    selected_victory_position_ocurence.sort( (pos1,pos2) => pos2.ocurrences - pos1.ocurrences );
    
    let ordered_selected_victory = selected_victory_position_ocurence.map(position => position.position);
    
    return ordered_selected_victory;
}

function draw_board(){
    let board = "0   1   2\n3   4   5\n6   7   8"
    while(true){
        //read the user position and validate it
        let position = Number(prompt("El juego de la vieja:\n"+board + "\nIngresa una posicion"));
        if(isNaN(position) || position > 8 || position < 0){
            alert("La posición ingresada no es válida, debe ser un numero entre 0 y 8");
            continue;
        }
        if(AI_positions.includes(position)){
            alert("esta posición le pertenece a la IA, selecciona otra");
            continue;
        }
        if(player_positions.includes(position)){
            alert("esta posición ya era tuya, selecciona otra");
            continue;
        }
        let is_match_over = false;
        let play_again;
        switch (is_the_match_over()){
            case "ai":
                play_again = confirm("Gano la I.A\n clica en ok para jugar otra vez");
                is_match_over = true;
                break;
            case "player":
                play_again = confirm("Felicitaciones, ganaste!\nClica en Ok para jugar otra vez");
                is_match_over = true;
                break;
            case "draw":
                play_again = confirm("He encontrado un adversario digno, hemos empatado\nClica en Ok para jugar otra vez");
                is_match_over = true;
                break;
            default:
                break;
        }
        
        if(is_match_over && play_again){
            reset_match();
            alert("Ha comenzado una nueva partida!");
            continue;
        }
        if(is_match_over && !play_again){
            alert("ha sido un gusto jugar con tigo!");
            break;
        }
    }
}

function reset_match(){
    player_positions = [];
    AI_positions = [];
}

draw_board()