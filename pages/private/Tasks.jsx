import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, closestCorners, useDroppable, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import axiosConfig from "../../configs/AxiosConfig";

const columnStyles = {
  notStarted: {
    header: "bg-slate-100 text-slate-700",
    border: "border-slate-200",
    glow: "bg-slate-50",
  },
  inProgress: {
    header: "bg-amber-100 text-amber-700",
    border: "border-amber-200",
    glow: "bg-amber-50",
  },
  done: {
    header: "bg-emerald-100 text-emerald-700",
    border: "border-emerald-200",
    glow: "bg-emerald-50",
  },
};

const priorityStyles = {
  low: {
    badge: "bg-slate-100 text-slate-600",
    rail: "bg-slate-400",
  },
  medium: {
    badge: "bg-amber-100 text-amber-700",
    rail: "bg-amber-500",
  },
  high: {
    badge: "bg-red-100 text-red-700",
    rail: "bg-red-500",
  },
};

const TaskCard = ({ task }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && dueDate < new Date();

  const formattedDate = dueDate
    ? dueDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  const priorityKey = task.priority?.toLowerCase() || "low";
  const pStyle = priorityStyles[priorityKey];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group relative mb-3 rounded-xl overflow-hidden border bg-white
        transition-all duration-200 ease-out
        cursor-grab active:cursor-grabbing
        ${
          isDragging
            ? "opacity-50 scale-[0.97] shadow-lg"
            : "hover:shadow-lg hover:-translate-y-0.5"
        }`}
    >
      <div className={`absolute left-0 top-0 h-full w-2 rounded-l-2xl ${pStyle.rail}`} />

      <div className="p-4 pl-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-[13px] leading-snug text-gray-800 line-clamp-2">
            {task.title}
          </h3>

          {task.priority && (
            <span
              className={`text-[10px] px-2.5 py-1 rounded-md font-semibold whitespace-nowrap
                ${pStyle.badge}`}
            >
              {task.priority}
            </span>
          )}
        </div>

        {task.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          {formattedDate ? (
            <div
              className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg
                ${
                  isOverdue
                    ? "bg-red-50 text-red-600 ring-1 ring-red-200"
                    : "bg-gray-100 text-gray-600"
                }`}
            >
              {isOverdue && <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />}
              <span>📅 {formattedDate}</span>
            </div>
          ) : (
            <span />
          )}

          <div className="opacity-0 group-hover:opacity-100 transition">
            <div className="text-gray-300 text-sm">⋮⋮</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Column = ({ id, title, tasks }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const colors = columnStyles[id];

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border ${colors.border} p-3 transition-all
        ${isOver ? colors.glow : "bg-gray-50"}
        h-full flex flex-col min-h-0`}
    >
      {/* header */}
      <div className={`px-3 py-2 rounded-lg mb-3 text-sm font-semibold ${colors.header}`}>
        {title} ({tasks.length})
      </div>

      <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto min-h-0 pt-2">
          {tasks.length === 0 && (
            <div className="text-xs text-gray-400 text-center py-6 border-2 border-dashed rounded-lg">
              Drop tasks here
            </div>
          )}

          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

const Tasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);

  const fetchTasks = async () => {
    try {
      const result = await axiosConfig.get("/api/tasks/");

      const normalized = result.data.tasks.map((t) => {
        let statusKey = "notStarted";

        if (t.status === "Not Started") statusKey = "notStarted";
        if (t.status === "In Progress") statusKey = "inProgress";
        if (t.status === "Done") statusKey = "done";

        return {
          ...t,
          status: statusKey,
        };
      });

      setTasks(normalized);
    } catch (error) {
      console.log("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
  }, []);

  const columns = useMemo(
    () => ({
      notStarted: tasks.filter((t) => t.status === "notStarted"),
      inProgress: tasks.filter((t) => t.status === "inProgress"),
      done: tasks.filter((t) => t.status === "done"),
    }),
    [tasks],
  );

  const findColumn = (id) => {
    if (columns[id]) return id;
    return tasks.find((t) => t._id === id)?.status;
  };

  const handleDragStart = ({ active }) => {
    const task = tasks.find((t) => t._id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over) {
      setActiveTask(null);
      return;
    }

    const fromColumn = findColumn(active.id);
    const toColumn = findColumn(over.id);

    if (!fromColumn || !toColumn) {
      setActiveTask(null);
      return;
    }

    if (fromColumn === toColumn) {
      const columnTasks = columns[fromColumn];

      const oldIndex = columnTasks.findIndex((t) => t._id === active.id);
      const newIndex = columnTasks.findIndex((t) => t._id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(columnTasks, oldIndex, newIndex);

        setTasks((prev) => {
          const others = prev.filter((t) => t.status !== fromColumn);
          return [...others, ...reordered];
        });
      }
    } else {
      setTasks((prev) => prev.map((t) => (t._id === active.id ? { ...t, status: toColumn } : t)));
    }

    setActiveTask(null);
  };

  return (
    <div className="bg-white w-full rounded-xl p-5 flex flex-col overflow-hidden min-h-0">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Kanban Board</h2>

        <button
          onClick={() => navigate("/tasks/create-task")}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl transition"
        >
          + Create Task
        </button>
      </div>

      <DndContext
        onDragStart={handleDragStart}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 min-h-0 h-full overflow-hidden w-full">
          <div className="flex-1 min-h-0">
            <div className="grid md:grid-cols-3 gap-5 h-full">
              <Column id="notStarted" title="Not Started" tasks={columns.notStarted} />
              <Column id="inProgress" title="In Progress" tasks={columns.inProgress} />
              <Column id="done" title="Done" tasks={columns.done} />
            </div>
          </div>
        </div>

        <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
};

export default Tasks;
