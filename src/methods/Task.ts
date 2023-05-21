import { ObjectId } from 'mongodb';
import { Client } from '../db';
import { Request, Response, NextFunction } from 'express';
import { wsClients } from '..';
import { WebSocket } from 'ws';

/**
 * @typedef Task
 * @property {ObjectId} _id - The unique id of the task.
 * @property {string} task - The description of the task.
 * @property {string} status - The status of the task.
 * @property {ObjectId} [userId] - The id of the user assigned to the task.
 */
interface Task {
  _id: ObjectId;
  task: string;
  status: string;
  userId?: ObjectId;
}

const DATABASE_NAME = 'thm-tt';
const COLLECTION_NAME = 'tasks';

/**
 * Gets the tasks collection.
 * @returns {Collection} The tasks collection.
 */
const tasks = () => Client.db(DATABASE_NAME).collection<Task>(COLLECTION_NAME);

/**
 * Notifies all connected WebSocket clients with a given message.
 * @param {string} type - The type of the message.
 * @param {any} data - The data to be sent in the message.
 */
const notifyClients = (type: string, data: any) => {
  const message = JSON.stringify({ type, data });
  wsClients.forEach((client: WebSocket) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

/**
 * Handles errors by logging them and sending a 500 response.
 * @param {Error} err - The error to handle.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const errorHandler = (err: Error, req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
};

/**
 * Gets all tasks.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
export async function getTasks(req: Request, res: Response) {
  try {
    const result = await tasks().find({}).toArray();

    res.json(result.length > 0 ? result : { warning: 'No documents found!' });
  } catch (err) {
    errorHandler(err, req, res);
  }
}

/**
 * Adds a new task.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
export async function addTask(req: Request, res: Response) {
  try {
    const cursor = await tasks().insertOne(req.body);
    const task = await tasks().findOne(cursor.insertedId);

    notifyClients('task_added', task);

    res.json(task);
  } catch (err) {
    errorHandler(err, req, res);
  }
}

/**
 * Deletes a task.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
export async function deleteTask(req: Request, res: Response) {
  try {
    const cursor = await tasks().findOneAndDelete({
      _id: new ObjectId(req.params.id),
    });

    notifyClients('task_deleted', req.params.id);

    res.json(
      cursor.ok
        ? { success: 'Task deleted successfully' }
        : { error: 'Failed to delete task' }
    );
  } catch (err) {
    errorHandler(err, req, res);
  }
}

/**
 * Updates a task.
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
export async function updateTask(req: Request, res: Response) {
  try {
    const id = new ObjectId(req.params.id);
    const updateFields: Partial<Task> = req.body;

    if (updateFields.userId) {
      updateFields.userId = new ObjectId(updateFields.userId);
    }

    await tasks().findOneAndUpdate({ _id: id }, { $set: updateFields });

    const task = await tasks().findOne(id);

    notifyClients('task_updated', task);

    res.json(task);
  } catch (err) {
    errorHandler(err, req, res);
  }
}
