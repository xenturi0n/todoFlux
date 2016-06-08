import { EventEmitter } from 'events';
import dispatcher from './dispatcher.js';


class TodoStore extends EventEmitter {
    constructor(){
        super();
        this.todos = [
            {
                id: 12312312312,
                text: "Aprender React como un ",
                complete: false
            },
            {
                id: 2323323443,
                text: "Pay Bills",
                complete: false
            },
            {
                id: 534545345534,
                text: "Aprender Flux",
                complete: false
            }
        ];
        this.loadingTodos= false;
    }

    createTodo(text){
        const id = Date.now();
        this.todos.push({
            id: id,
            text: text,
            complete: false
        });

        this.emit('change');
    }

    getTodos(){        
        return this.todos;
    }
    getloadingTodos(){
        return this.loadingTodos;
    }

    handleActions(action){
        switch(action.type){

            case "CREATE_TODO":
                this.createTodo(action.text);
                break;

            case "RELOADING_TODOS":     
                this.loadingTodos=true;
                console.log("STORE ejecutando RELOADING_TODOS this.getloadingTodos(): ", this.getloadingTodos());
                this.emit('change');
                break;

            case "RELOADED_TODOS":
                this.todos = action.todos;
                this.loadingTodos = false;
                this.emit('change');
                break;
        }
    } 
}

const todoStore = new TodoStore;
dispatcher.register(todoStore.handleActions.bind(todoStore));

window.dispatcher = dispatcher;
export default todoStore;