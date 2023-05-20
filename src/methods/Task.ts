import { ObjectId } from 'mongodb';
import { Client } from '../db';

interface Task {
  _id: ObjectId;
  task: string;
}

export async function getTasks() {
  const query = {};
  const tasks = Client.db('thm-tt').collection<Task>('tasks');

  const cursor = await tasks.find(query).limit(10);

  if ((await tasks.countDocuments(query)) === 0) {
    console.warn('No documents found!');
  }

  const result = await cursor.toArray();

  console.log(result);

  return result;
}

export async function addTask(task: Task) {
  const tasks = Client.db('thm-tt').collection<Task>('tasks');
  const cursor = await tasks.insertOne(task);
  return await tasks.findOne(cursor.insertedId);
}

export async function deleteTask(id: string) {
  const tasks = Client.db('thm-tt').collection<Task>('tasks');
  const cursor = await tasks.findOneAndDelete({ _id: new ObjectId(id) });
  console.log(cursor);
  return cursor.ok;
}

export async function updateTask(id: string, values: Task) {
  const tasks = Client.db('thm-tt').collection<Task>('tasks');
  await tasks.findOneAndUpdate({ _id: new ObjectId(id) }, { $set: values });
  return await tasks.findOne({ _id: new ObjectId(id) });
}
