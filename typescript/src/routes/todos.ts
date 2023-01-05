import { Router } from 'express';

import { Todo } from '../models/todo';

type RequestBody = { text: string };
type RequestParams = { todoId: string };

const router = Router();

let todos: Todo[] = [];

router.post('/', (req, res, next) => {
    const body = req.body as RequestBody;

    const newTodo: Todo = {
        id: Date.now().toString(),
        text: body.text
    };

    todos.push(newTodo);

    res.status(201).json({
        message: 'Todo created!',
        todo: newTodo,
        todos
    });
});
router.get('/', (req, res, next) => {
    res.status(200).json({todos});
});

router.put('/:todoId', (req, res, next) => {
    const body = req.body as RequestBody;
    const params = req.params as RequestParams;

    const todoIndex = todos.findIndex(todo => todo.id === params.todoId);
    if (todoIndex > -1) {
        const currentTodo = todos[todoIndex];
        todos[todoIndex] = {
            ...currentTodo,
            text: body.text
        };

        return res.status(200).json({message: 'Todo updated!', todos});
    }

    res.status(404).json({message: 'Todo not found!'});
});

router.delete('/:todoId', (req, res, next) => {
    const params = req.params as RequestParams;

    todos = todos.filter(todo => todo.id !== params.todoId);

    res.status(200).json({message: 'Todo deleted!', todos});
});

export default router;
