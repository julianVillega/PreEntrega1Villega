// let AI_positions = [];
// let player_positions = [];
// let board = "0   1   2\n3   4   5\n6   7   8"
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

class Match{
    constructor(){
        this.AI_positions = [];
        this.player_positions = [];
        this.board = "0   1   2\n3   4   5\n6   7   8"
        this.current_path_to_victory = null;
        this.next_position_in_path = 0;
        this.is_match_over = false;
        this.play_again = false;
    }
}

function is_the_match_over(match){
    //checks weather the match ended.
    // returns "ai", "oponent", "draw" or "continue"
    let free_positions = false;
    let winner = "none";
    match.is_match_over = false;
    let result;
    posible_victories.forEach(victory =>{
        if(victory.every(position => match.AI_positions.includes(position))){
            winner = "ai";                     
        }
        if(victory.every(position => match.player_positions.includes(position))){
            winner="player"
        }
        //check if the position dosen't belong to anyone
        if(victory.some(position => {return (!match.player_positions.includes(position)) && (!match.AI_positions.includes(position))})){
            free_positions = true;
        }
    })
    
    if(winner !== "none"){
        result = winner
    }
    if(free_positions && winner == "none"){
        result = "continue";
    }
    if(!free_positions && winner =="none"){
        result = "draw"
    }

    switch (result){
        case "ai":
            match.play_again = confirm("Gano la I.A\n clica en ok para jugar otra vez\n"+match.board);
            match.is_match_over = true;
            break;
        case "player":
            match.play_again = confirm("Felicitaciones, ganaste!\nClica en Ok para jugar otra vez\n"+match.board);
            match.is_match_over = true;
            break;
        case "draw":
            match.play_again = confirm("He encontrado un adversario digno, hemos empatado\nClica en Ok para jugar otra vez\n"+match.board);
            match.is_match_over = true;
            break;
        default:
            break;
    }
}

function player_wins_in_the_next_move(match){
    //If the player can win in his netx move, this returns the position the AI must take to block the player.
    //Otherwise returns false.

    for(i= 0; i<8; i++){
        let victory = posible_victories[i];
        let player_held_positions = 0;
        for (position_index = 0; position_index < 3; position_index++){
            if (match.player_positions.includes(victory[position_index])){
                player_held_positions ++;
            }
            if (player_held_positions == 2){
                //find with position is not held by the player and return it
                for (j = 0; j < 3; j++){       
                    if (!(match.player_positions.includes(victory[j]))){
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


function available_victories(match){
    //returns the victories that are still available, that is, those of which no positions belong to the oponent.
    
    //deep copy the possible victories
    let available_victories = JSON.parse(JSON.stringify(posible_victories));

    //filter victories with at least one position belonging to the oponent
    available_victories = available_victories.filter(victory => !victory.some(position => match.player_positions.includes(position)));

    return available_victories;
}

function select_victory_path(match){
    //Used to decide wich positions, and in wich order the AI should take when the oponent isn't going to win in his next move.
    //Returns an ordered list with the positions the AI should take in the next rounds.

    //get the available victories for the AI.
    let victories = available_victories(match);
    
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

function is_victory_path_available(current_path_to_victory, match){
    return !current_path_to_victory.some(position => match.player_positions.includes(position))
}

function reset_match(match){
    match.player_positions = [];
    match.AI_positions = [];
    match.current_path_to_victory = null;
    match.next_position_in_path = 0;
    match.board = "0   1   2\n3   4   5\n6   7   8"
}

function draw_board(){
    let match = new Match()
    while(true){
        //read the user position and validate it        
        let position = prompt("El juego de la vieja:\n"+match.board + "\nIngresa una posicion");
        if(position == null){
            alert("ha sido un gusto jugar con tigo!");
            break;
        }

        position = Number(position);

        if(isNaN(position) || position > 8 || position < 0){
            alert("La posición ingresada no es válida, debe ser un numero entre 0 y 8");
            continue;
        }
        if(match.AI_positions.includes(position)){
            alert("esta posición le pertenece a la IA, selecciona otra");
            continue;
        }
        if(match.player_positions.includes(position)){
            alert("esta posición ya era tuya, selecciona otra");
            continue;
        }
        
        // add the position to the player's positions
        match.player_positions.push(position);
        //update the match.board string;
        match.board = match.board.replace(String(position),"H");


        //check if the match is over
        is_the_match_over(match);
        
        if(match.is_match_over && match.play_again){
            reset_match(match);
            alert("Ha comenzado una nueva partida!");
            continue;
        }
        if(match.is_match_over && !match.play_again){
            alert("ha sido un gusto jugar con tigo!");
            break;
        }

        //Get a new victory path if there is none or if it is no longer valid
        if(match.current_path_to_victory == null || !is_victory_path_available(match.current_path_to_victory, match)){
            match.current_path_to_victory = select_victory_path(match);
            for(i = 0; i < match.current_path_to_victory.length; i++){
                //find wich position of the current path the ai should take next.
                if(!match.AI_positions.includes(match.current_path_to_victory[i])){
                    match.next_position_in_path = i;
                    break;
                }
            }
        }

        //take the next position in the victory path and update the board string
        match.AI_positions.push(match.current_path_to_victory[match.next_position_in_path]);
        match.board = match.board.replace(match.current_path_to_victory[match.next_position_in_path],"AI");
        match.next_position_in_path ++;

        //check if the match is over
        is_the_match_over(match);
        
        if(match.is_match_over && match.play_again){
            reset_match(match);
            alert("Ha comenzado una nueva partida!");
            continue;
        }
        if(match.is_match_over && !match.play_again){
            alert("ha sido un gusto jugar con tigo!");
            break;
        }
    }
}


draw_board()