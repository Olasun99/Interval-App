import React, { useState, useEffect } from 'react';
import { ListTodo, Plus, Check, X, Play } from 'lucide-react';
import { Task } from '../types';

interface TasksViewProps {
  onStartTaskTimer: (taskTitle: string) => void;
}

export function TasksView({ onStartTaskTimer }: TasksViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('timer_tasks');
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem('timer_tasks', JSON.stringify(newTasks));
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    saveTasks([...tasks, task]);
    setNewTaskTitle('');
  };

  const toggleTask = (id: string) => {
    saveTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-full animate-in fade-in duration-300">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
          <ListTodo className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Tasks</h2>
          <p className="text-slate-500 font-medium">Manage your focus session objectives.</p>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-xl p-6 md:p-8 flex-1 flex flex-col min-h-0 border-4 border-white">
        <div className="flex gap-3 mb-6 shrink-0">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add a new task..."
            className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-slate-800 font-bold outline-none focus:border-orange-500 transition-colors"
          />
          <button 
            onClick={addTask}
            className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-2xl shadow-lg shadow-orange-500/30 transition-colors shrink-0"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2">
          {tasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ListTodo className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-bold uppercase tracking-widest text-sm">No tasks yet</p>
            </div>
          ) : (
            tasks.map(task => (
              <div 
                key={task.id}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  task.completed ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:border-orange-200 shadow-sm'
                }`}
              >
                <button 
                  onClick={() => toggleTask(task.id)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
                    task.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 text-transparent hover:border-orange-500'
                  }`}
                >
                  <Check className="w-3 h-3" strokeWidth={3} />
                </button>
                
                <span className={`flex-1 font-bold ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {task.title}
                </span>

                {!task.completed && (
                  <button 
                    onClick={() => onStartTaskTimer(task.title)}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shrink-0"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    Focus
                  </button>
                )}

                <button 
                  onClick={() => deleteTask(task.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
