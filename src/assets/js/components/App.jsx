import React, {Component} from 'react';
import {render} from 'react-dom';

import todoStore from '../flux/TodoStore.js';
import * as TodoActions from '../flux/TodoActions.js';
import TodoList from './TodoList.jsx';


class App extends Component{
    constructor(){
        super();
        this.state = {
            todos: todoStore.getTodos(),
            getingTodos: false
        }
    }

    componentWillMount(){
        todoStore.on('change', ()=>{
            console.log('evento CHANGE todoStore.getloadingTodos(): ', todoStore.getloadingTodos());            
            this.setState({todos: todoStore.getTodos(), getingTodos: todoStore.getloadingTodos()},()=>{
                console.log("SetState Ejecutado -> getingTodos=", this.state.getingTodos);
            });
        })
    }

    componentWillUnmount(){
        console.log ("componentWillUnmount");
    }

    _createTodo(){
        TodoActions.createTodo(Date.now());
    }

    _reloadTodos(){
        console.log("CLICK reload");
        TodoActions.reloadTodos();
        console.log("end CLICK reload");
    }

    render(){
        console.log("Renderizando Componente -> this.state.getingTodos=", this.state.getingTodos);            
        return(
            <div className="container">
                <div className="row">
                    <div className="col-xs-12">
                        <button onClick={this._reloadTodos.bind(this)}>Reload!</button>
                        {this.state.getingTodos ? <h1 className="well">Loading ...</h1> : <TodoList {...this.state}/>}
                    </div>
                </div>
            </div>
        );
    }
}

export default App;