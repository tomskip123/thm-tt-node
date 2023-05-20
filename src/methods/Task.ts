import { ObjectId } from 'mongodb';
import { Client } from '../db';
import { Request, Response } from 'express';

// Define Task interface
interface Task {
  _id: ObjectId;
  task: string;
  status: string;
  userId?: ObjectId;
}

// Function to get all tasks
export async function getTasks(req: Request, res: Response) {
  try {
    const tasks = Client.db('thm-tt').collection<Task>('tasks');

    // Get all tasks from the collection
    const cursor = await tasks.find({});
    const result = await cursor.toArray();

    // If no tasks found, return a warning message
    if (result.length === 0) {
      console.warn('No documents found!');
    }

    // Send the list of tasks
    res.json(result);
  } catch (err) {
    // Log error if any
    console.error(err);
  }
}

// Function to add a task
export async function addTask(req: Request, res: Response) {
  try {
    const tasks = Client.db('thm-tt').collection<Task>('tasks');

    // Insert a new task in the collection
    const cursor = await tasks.insertOne(req.body);

    // Retrieve and send the inserted task
    res.json(await tasks.findOne(cursor.insertedId));
  } catch (err) {
    // Log error if any
    console.error(err);
  }
}

// Function to delete a task
export async function deleteTask(req: Request, res: Response) {
  try {
    const tasks = Client.db('thm-tt').collection<Task>('tasks');

    // Delete the task and return the status
    const cursor = await tasks.findOneAndDelete({
      _id: new ObjectId(req.params.id),
    });

    res.json(cursor.ok);
  } catch (err) {
    // Log error if any
    console.error(err);
  }
}

// Function to update a task
export async function updateTask(req: Request, res: Response) {
  try {
    const id = req.params.id;
    const tasks = Client.db('thm-tt').collection<Task>('tasks');

    // Extract the fields to be updated from the request body
    const updateFields: Partial<Task> = req.body;

    // If the userId field is provided, convert it to an ObjectId
    if (updateFields.userId) {
      updateFields.userId = new ObjectId(updateFields.userId);
    }

    // Update the task in the collection
    await tasks.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    // Retrieve and send the updated task
    res.json(await tasks.findOne({ _id: new ObjectId(id) }));
  } catch (err) {
    // Log error if any
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
}
