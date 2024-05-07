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
        this.all_positions = [0,1,2,3,4,5,6,7,8];
        this.board = "0   1   2\n3   4   5\n6   7   8"
        this.current_path_to_victory = null;
        this.next_position_in_path = 0;
    }
    take_position(position, player_name){
        //gives a position to the player with the corresponding player name

        let positions = (player_name === "AI") ? this.AI_positions : this.player_positions
        //give the position to the player/AI
        positions.push(position);
        //update the match.board string;
        if(player_name ==="player"){
            this.board = this.board.replace(String(position),"H");
        }
        else{
            this.board = this.board.replace(String(position),"AI");
        }
    }
    match_status(){
        //checks weather the match ended.
        // returns "ai", "oponent", "draw" or "continue"
        let free_positions = false;
        let winner = "none";
        for(let victory of posible_victories){
            if(victory.every(position => this.AI_positions.includes(position))){
                winner = "ai";
                break;
            }
            if(victory.every(position => this.player_positions.includes(position))){
                winner="player"
                break;
            }
            //check if the position dosen't belong to anyone
            if(victory.some(position => {return (!this.player_positions.includes(position)) && (!this.AI_positions.includes(position))})){
                free_positions = true;
            }
        }
        
        if(winner !== "none"){
            return winner
        }
        if(free_positions && winner == "none"){
            return "continue";
        }
        if(!free_positions && winner =="none"){
            return "draw"
        }
    }
}

function is_the_match_over(match, loop_control){
    let play_again;    
    let is_match_over = false;
    loop_control.status = "continue";
    switch (match.match_status()){
        case "ai":
            play_again = confirm("Gano la I.A\n clica en ok para jugar otra vez\n"+match.board);
            is_match_over = true;
            break;
        case "player":
            play_again = confirm("Felicitaciones, ganaste!\nClica en Ok para jugar otra vez\n"+match.board);
            is_match_over = true;
            break;
        case "draw":
            play_again = confirm("He encontrado un adversario digno, hemos empatado\nClica en Ok para jugar otra vez\n"+match.board);
            is_match_over = true;
            break;
        default:
            break;
    }
    if(is_match_over && play_again){
        reset_match(match);
        loop_control.status = "continue";
        alert("Ha comenzado una nueva partida!");        
    }
    if(is_match_over && !play_again){
        loop_control.status = "break";
        alert("ha sido un gusto jugar con tigo!");        
    }
}

function player_wins_in_the_next_move(match, player_name){
    //If the player passed in as parameter can win in his netx move, this returns the position they lack to win.
    //Otherwise returns false.

    let player_positions = (player_name === "AI") ? match.AI_positions : match.player_positions;
    let oponent_positions = (player_name === "AI") ?  match.player_positions : match.AI_positions;

    for(i= 0; i<8; i++){
        let victory = posible_victories[i];
        let player_held_positions = 0;
        for (position_index = 0; position_index < 3; position_index++){
            //player cant win if the oponent has one position.
            if(victory.some(position => oponent_positions.includes(position))){
                continue;
            }
            //player can win if he has at least 2 positions
            if (player_positions.includes(victory[position_index])){
                player_held_positions ++;
            }
            if (player_held_positions == 2){
                //find with position is not held by the player and return it
                for (j = 0; j < 3; j++){       
                    if (!(player_positions.includes(victory[j]))){                        
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

    //if winning is no longer possible, take the next empty positions
    if(victories.length == 0){        
        let free_positions = match.all_positions.filter(position => !match.player_positions.includes(position) && !match.AI_positions.includes(position));
        return free_positions.slice(0,3);
    }
    
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
    loop_control = {status:"continue"}
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
        
        //give the position to the player
        match.take_position(position,"player");

        //check if the match is over
        is_the_match_over(match, loop_control);
        

        // AI turn begins.
        //check if the player or AI can win
        let AI_win_position = player_wins_in_the_next_move(match,"AI")
        let block_position = player_wins_in_the_next_move(match,"player")        
        
        //if the AI can win, do so
        if(AI_win_position !== false){
            match.take_position(AI_win_position,"AI")            
        }
        //if the player can win, prevent him from winning.
        else if(block_position !== false){
            match.take_position(block_position,"AI")
        }
        //if neither can win in this turn, follow the path to victory strategy
        else{
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
            match.take_position(match.current_path_to_victory[match.next_position_in_path],"AI")
            match.next_position_in_path ++;
        }
        
        //check if the match is over
        is_the_match_over(match, loop_control);
    }
}

draw_board();