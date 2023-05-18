import { Client } from '../db';

interface Task {
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
