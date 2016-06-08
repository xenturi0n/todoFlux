import dispatcher from './dispatcher.js';

const originalTodos= [
            {
                id: 12312312312,
                text: "APRENDER REACT",
                complete: false
            },
            {
                id: 2323323443,
                text: "TERMINAR 10 PROYECTOS UDEMY",
                complete: false
            },
            {
                id: 534545345534,
                text: "TERMINAR PROYECTO KANBANAPP DE PRO REACT",
                complete: false
            }
        ];

export function createTodo(text){
    dispatcher.dispatch({
        type: "CREATE_TODO",
        text: text
    });
}

export function deleteTodo(id){
    dispatcher.dispatch({
        type: "CREATE_TODO",
        text: id
    });
}

export function reloadTodos() {
    console.log ("ACTION ejecutanto reloadTodos()");
    
    dispatcher.dispatch({
        type: "RELOADING_TODOS",
        loading: true
    });
    
    dispatcher.dispatch({
            type: "RELOADED_TODOS",
            todos: originalTodos
        });

    // setTimeout(function(){
    //     dispatcher.dispatch({
    //         type: "RELOADED_TODOS",
    //         todos: originalTodos
    //     });
    // },0);
}