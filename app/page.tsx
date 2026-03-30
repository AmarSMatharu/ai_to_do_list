'use client'

import { useState, useEffect } from 'react'
import { Task } from '@/types/task'

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showInput, setShowInput] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetch('/api/tasks')
      .then(r => r.json())
      .then(setTasks)
  }, [])

  async function addTask(taskInput: string) {
    if (!taskInput.trim()) return
    setLoading(true)
    setInput('')
    setShowInput(false)
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: taskInput })
    })
    const newTask = await res.json()
    setTasks(prev => [newTask, ...prev])
    setLoading(false)
  }

  async function toggleTask(id: string, completed: boolean) {
    await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !completed })
    })
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !completed } : t))
  }

  async function deleteTask(id: string) {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const pending = tasks.filter(t => !t.completed)
  const completed = tasks.filter(t => t.completed)

  function priorityColor(p: number) {
    if (p >= 8) return '#db4035'
    if (p >= 5) return '#ff9a14'
    return '#246fe0'
  }

  function priorityLabel(p: number) {
    if (p >= 8) return 'P1'
    if (p >= 5) return 'P2'
    return 'P3'
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', sans-serif;
          background: #fafafa;
          color: #202020;
          height: 100vh;
          overflow: hidden;
        }

        .app { display: flex; height: 100vh; }

        /* Sidebar */
        .sidebar {
          width: 260px;
          min-width: 260px;
          background: #f5f0eb;
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 16px 0;
          border-right: 1px solid rgba(0,0,0,0.06);
        }

        .sidebar-top {
          padding: 0 16px 16px;
          display: flex;
          align-items: center;
        }

        .avatar {
          width: 28px; height: 28px;
          background: linear-gradient(135deg, #db4035, #e8735a);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .user-name {
          font-size: 13px;
          font-weight: 500;
          color: #202020;
          margin-left: 8px;
        }

        .add-task-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 16px;
          margin: 0 8px 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: #808080;
          background: none;
          border: none;
          font-family: 'Inter', sans-serif;
          transition: background 0.15s, color 0.15s;
          width: calc(100% - 16px);
          text-align: left;
        }

        .add-task-btn:hover { background: rgba(0,0,0,0.06); color: #db4035; }

        .add-icon {
          width: 20px; height: 20px;
          background: #db4035;
          border-radius: 50%;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          line-height: 1;
          flex-shrink: 0;
        }

        .nav-section { padding: 4px 8px; }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 10px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #202020;
          background: rgba(0,0,0,0.08);
          user-select: none;
        }

        .nav-icon { font-size: 13px; width: 16px; text-align: center; color: #db4035; }
        .nav-count { margin-left: auto; font-size: 12px; color: #888; }

        /* Main */
        .main {
          flex: 1;
          height: 100vh;
          overflow-y: auto;
          background: #fff;
        }

        .main-header {
          padding: 24px 40px 0;
          position: sticky;
          top: 0;
          background: #fff;
          z-index: 10;
        }

        .page-title {
          font-size: 20px;
          font-weight: 700;
          color: #202020;
          letter-spacing: -0.02em;
        }

        .main-content { padding: 16px 40px 80px; }

        .ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: #db4035;
          background: #ffeee8;
          border-radius: 4px;
          padding: 3px 8px;
          font-weight: 500;
          margin-bottom: 20px;
        }

        .section-heading {
          font-size: 13px;
          font-weight: 600;
          color: #202020;
          margin: 20px 0 6px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .section-heading::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #f0f0f0;
        }

        .task-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 9px 8px;
          border-bottom: 1px solid #f5f5f5;
          transition: background 0.1s;
          border-radius: 6px;
          position: relative;
        }

        .task-row:hover { background: #fafafa; }
        .task-row:hover .task-actions { opacity: 1; }

        .circle-check {
          width: 18px; height: 18px;
          border-radius: 50%;
          border: 1.5px solid #ccc;
          flex-shrink: 0;
          margin-top: 2px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
        }

        .circle-check:hover { border-color: #db4035; }
        .circle-check.p1 { border-color: #db4035; }
        .circle-check.p2 { border-color: #ff9a14; }
        .circle-check.p3 { border-color: #246fe0; }
        .circle-check.done { background: #e0e0e0; border-color: #e0e0e0; }
        .check-done-icon { color: #aaa; font-size: 10px; }

        .task-main { flex: 1; min-width: 0; }

        .task-name {
          font-size: 14px;
          color: #202020;
          line-height: 1.45;
          margin-bottom: 4px;
        }

        .task-name.done { text-decoration: line-through; color: #bbb; }

        .task-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          align-items: center;
        }

        .chip-date {
          font-size: 11px;
          color: #058527;
          font-weight: 400;
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .chip-priority {
          font-size: 10px;
          font-weight: 600;
          padding: 1px 6px;
          border-radius: 3px;
          letter-spacing: 0.02em;
        }

        .chip-suggestion {
          font-size: 11px;
          color: #808080;
          background: #f5f5f5;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
          border-radius: 4px;
          font-weight: 400;
          padding: 2px 7px;
          font-family: 'Inter', sans-serif;
        }

        .chip-suggestion:hover { background: #ffeee8; color: #db4035; }

        .task-actions {
          display: flex;
          gap: 2px;
          opacity: 0;
          transition: opacity 0.15s;
        }

        .action-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #ccc;
          font-size: 13px;
          padding: 3px 6px;
          border-radius: 4px;
          transition: color 0.15s, background 0.15s;
          font-family: 'Inter', sans-serif;
          line-height: 1;
        }

        .action-btn:hover { color: #db4035; background: #ffeee8; }

        .add-task-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 8px;
          cursor: pointer;
          color: #ccc;
          font-size: 13px;
          transition: color 0.15s;
          border-radius: 6px;
          border: none;
          background: none;
          font-family: 'Inter', sans-serif;
          width: 100%;
          text-align: left;
        }

        .add-task-row:hover { color: #db4035; }

        .inline-form {
          border: 1px solid #e0e0e0;
          border-radius: 10px;
          padding: 12px 14px;
          margin: 8px 0;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }

        .inline-input {
          width: 100%;
          border: none;
          outline: none;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #202020;
          background: transparent;
          margin-bottom: 10px;
        }

        .inline-input::placeholder { color: #ccc; }

        .inline-actions { display: flex; gap: 8px; align-items: center; }

        .btn-submit {
          background: #db4035;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: opacity 0.15s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-submit:hover:not(:disabled) { opacity: 0.85; }
        .btn-submit:disabled { opacity: 0.4; cursor: not-allowed; }

        .btn-cancel {
          background: none;
          border: none;
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 13px;
          color: #808080;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          transition: background 0.15s;
        }

        .btn-cancel:hover { background: #f5f5f5; color: #202020; }

        .spinner-sm {
          width: 10px; height: 10px;
          border: 1.5px solid rgba(255,255,255,0.4);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 60px 20px;
          text-align: center;
        }

        .empty-icon { font-size: 40px; margin-bottom: 14px; opacity: 0.25; }
        .empty-title { font-size: 15px; font-weight: 500; color: #aaa; margin-bottom: 5px; }
        .empty-sub { font-size: 13px; color: #ccc; font-weight: 300; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.2s ease forwards; }
      `}</style>

      <div className="app">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-top">
            <div className="avatar">U</div>
            <span className="user-name">My Workspace</span>
          </div>

          <button className="add-task-btn" onClick={() => setShowInput(true)}>
            <div className="add-icon">+</div>
            Add task
          </button>

          <div className="nav-section">
            <div className="nav-item">
              <span className="nav-icon">◆</span>
              Today
              {pending.length > 0 && <span className="nav-count">{pending.length}</span>}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          <div className="main-header">
            <h1 className="page-title">Today</h1>
          </div>

          <div className="main-content">
            <div className="ai-badge">✦ Claude AI · tasks parsed automatically</div>

            {/* Pending tasks */}
            {pending.length > 0 && (
              <>
                <div className="section-heading">My Tasks</div>
                {pending.map((task) => {
                  const pLabel = priorityLabel(task.priority)
                  const pColor = priorityColor(task.priority)
                  const pClass = task.priority >= 8 ? 'p1' : task.priority >= 5 ? 'p2' : 'p3'
                  return (
                    <div key={task.id} className="task-row fade-in">
                      <div className={`circle-check ${pClass}`} onClick={() => toggleTask(task.id, task.completed)} />
                      <div className="task-main">
                        <div className="task-name">{task.content}</div>
                        <div className="task-chips">
                          {task.dueDate && (
                            <span className="chip-date">
                              📅 {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                          <span className="chip-priority" style={{ color: pColor, background: `${pColor}18` }}>
                            {pLabel}
                          </span>
                          {task.suggestions?.slice(0, 2).map((s, i) => (
                            <button key={i} className="chip-suggestion" onClick={() => addTask(s)}>
                              + {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="task-actions">
                        <button className="action-btn" onClick={() => deleteTask(task.id)}>✕</button>
                      </div>
                    </div>
                  )
                })}
              </>
            )}

            {/* Add task row / inline form */}
            {!showInput ? (
              <button className="add-task-row" onClick={() => setShowInput(true)}>
                <span style={{ fontSize: 18, lineHeight: 1, color: 'inherit' }}>+</span>
                Add task
              </button>
            ) : (
              <div className="inline-form fade-in">
                <input
                  autoFocus
                  className="inline-input"
                  placeholder="Try 'Send report by Friday noon, urgent'"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') addTask(input)
                    if (e.key === 'Escape') { setShowInput(false); setInput('') }
                  }}
                  disabled={loading}
                />
                <div className="inline-actions">
                  <button className="btn-submit" onClick={() => addTask(input)} disabled={loading || !input.trim()}>
                    {loading ? <><span className="spinner-sm" /> Parsing...</> : 'Add task'}
                  </button>
                  <button className="btn-cancel" onClick={() => { setShowInput(false); setInput('') }}>Cancel</button>
                </div>
              </div>
            )}

            {/* Completed tasks */}
            {completed.length > 0 && (
              <>
                <div className="section-heading" style={{ marginTop: 28, color: '#bbb' }}>
                  Completed · {completed.length}
                </div>
                {completed.map((task) => (
                  <div key={task.id} className="task-row" style={{ opacity: 0.45 }}>
                    <div className="circle-check done" onClick={() => toggleTask(task.id, task.completed)}>
                      <span className="check-done-icon">✓</span>
                    </div>
                    <div className="task-main">
                      <div className="task-name done">{task.content}</div>
                    </div>
                    <div className="task-actions">
                      <button className="action-btn" onClick={() => deleteTask(task.id)}>✕</button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Empty state */}
            {tasks.length === 0 && mounted && !showInput && (
              <div className="empty-state">
                <div className="empty-icon">✓</div>
                <div className="empty-title">What do you need to get done today?</div>
                <div className="empty-sub">Click "Add task" and describe it naturally — Claude handles the rest.</div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
