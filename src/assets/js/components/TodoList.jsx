import React from 'react';
import Todo from './Todo.jsx';


const TodoList = (props)=>{
    const TodoComponents = props.todos.map((todo)=>{
        return(
            <Todo todo={todo} key={todo.id}/>
        );
    });
    return(
        <div className="well">
            <h1>Todo List</h1>
            <hr/>
            <div className="list-group">
                {TodoComponents}
            </div>
        </div>
    );
}

export default TodoList;