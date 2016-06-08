import React from 'react';

const Todo = (props)=>{

    return(
        <a className="list-group-item">
            {props.todo.text}
        </a>
    );
}

export default Todo;