import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCorners,
  useDroppable,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Input,
  Button,
  Space,
  Dropdown,
  DatePicker,
  Select,
  Badge,
  Modal,
  Form,
  message,
  Tooltip,
  Popconfirm,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
  DeleteOutlined,
  CalendarOutlined,
  EditOutlined,
  HolderOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import axiosConfig from "../../configs/AxiosConfig";

dayjs.extend(relativeTime);

/* ===========================
   Column Styles
=========================== */

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

/* ===========================
   Helpers
=========================== */

const getPriorityColor = (priority) => {
  const p = priority?.toLowerCase();
  switch (p) {
    case "high":
      return { bg: "red", text: "text-red-700", border: "border-red-300" };
    case "medium":
      return { bg: "orange", text: "text-amber-700", border: "border-amber-300" };
    case "low":
      return { bg: "blue", text: "text-blue-700", border: "border-blue-300" };
    default:
      return { bg: "default", text: "text-gray-700", border: "border-gray-300" };
  }
};

const getDueDateStatus = (dueDate) => {
  if (!dueDate) return { label: "No Date", color: "gray", isUrgent: false };

  const due = dayjs(dueDate).startOf("day");
  const today = dayjs().startOf("day");
  const diff = due.diff(today, "day");

  if (diff < 0) {
    return {
      label: "Overdue",
      color: "red",
      isUrgent: true,
    };
  }

  if (diff <= 7) {
    return {
      label: `${diff}d left`,
      color: diff <= 2 ? "red" : "orange",
      isUrgent: true,
    };
  }

  return {
    label: due.format("MMM DD"),
    color: "blue",
    isUrgent: false,
  };
};

const TaskCard = ({ task, refreshTasks, isDragging, onEdit, dragListeners }) => {
  const priorityColor = getPriorityColor(task.priority);
  const dueStatus = getDueDateStatus(task.dueDate);

  const handleDelete = async () => {
    try {
      await axiosConfig.delete(`/api/tasks/${task._id}`);
      message.success("Task deleted successfully");
      refreshTasks();
    } catch {
      message.error("Failed to delete task");
    }
  };

  return (
    <div
      onClick={() => onEdit(task)}
      className={`mb-3 rounded-lg border-2 outline-none! bg-white p-3 transition-all cursor-pointer
        ${isDragging ? "opacity-50 shadow-md" : "hover:shadow-md"}
        ${priorityColor.border}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-sm flex-1 text-gray-800 line-clamp-2">{task.title}</h3>

        <div className="flex items-center gap-2">
          <Badge
            className={`px-2! py-0.5! rounded-sm text-xs font-semibold ${priorityColor.text}`}
            color={priorityColor.bg}
            count={task.priority}
          />
          <div
            {...dragListeners}
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            <HolderOutlined />
          </div>
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
        {task.dueDate && (
          <Tooltip title={dayjs(task.dueDate).format("MMM DD, YYYY")}>
            <div
              className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md
               ${dueStatus.isUrgent ? "bg-red-50 text-red-600" : "bg-gray-100"}`}
            >
              <CalendarOutlined />
              <span>{dueStatus.label}</span>
            </div>
          </Tooltip>
        )}

        <div className="flex gap-1 ml-auto">
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
            />
          </Tooltip>

          <Popconfirm
            title="Delete Task"
            onConfirm={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            onCancel={(e) => e.stopPropagation()}
          >
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </div>
      </div>
    </div>
  );
};

const DraggableTaskCard = ({ task, refreshTasks, onEdit }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TaskCard
        task={task}
        refreshTasks={refreshTasks}
        isDragging={isDragging}
        onEdit={onEdit}
        dragListeners={listeners}
      />
    </div>
  );
};

const Column = ({ id, title, tasks, fetchTasks, onEdit }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const colors = columnStyles[id];

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border ${colors.border}
        p-3 transition-all 
        ${isOver ? colors.glow : "bg-gray-50"}
        flex flex-col min-h-100 lg:min-h-0`}
    >
      <div className={`px-3 py-2 rounded-lg mb-3 text-sm font-semibold ${colors.header}`}>
        {title} ({tasks.length})
      </div>

      <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 overflow-y-auto min-h-0 pr-1 hover-scroll">
          {tasks.map((task) => (
            <DraggableTaskCard
              key={task._id}
              task={task}
              refreshTasks={fetchTasks}
              onEdit={onEdit}
            />
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const fetchTasks = async () => {
    const result = await axiosConfig.get("/api/tasks/");
    const normalized = result.data.tasks.map((t) => ({
      ...t,
      status:
        t.status === "In Progress" ? "inProgress" : t.status === "Done" ? "done" : "notStarted",
    }));
    setTasks(normalized);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
  }, []);

  const openEditModal = (task) => {
    setEditingTask(task);
    form.setFieldsValue({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? dayjs(task.dueDate) : null,
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    const values = await form.validateFields();

    // Convert status format for backend
    const statusMap = {
      notStarted: "Not Started",
      inProgress: "In Progress",
      done: "Done",
    };

    await axiosConfig.put(`/api/tasks/${editingTask._id}`, {
      ...values,
      status: statusMap[values.status] || values.status,
      dueDate: values.dueDate?.toISOString() || null,
    });
    message.success("Task updated");
    setIsModalOpen(false);
    fetchTasks();
  };

  const handleDragStart = ({ active }) => {
    const task = tasks.find((t) => t._id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const statusMap = {
      notStarted: "Not Started",
      inProgress: "In Progress",
      done: "Done",
    };

    const activeTask = tasks.find((t) => t._id === active.id);
    if (!activeTask) return;

    const overTask = tasks.find((t) => t._id === over.id);

    let newStatus = activeTask.status;

    if (statusMap[over.id]) {
      newStatus = over.id;
    } else if (overTask) {
      newStatus = overTask.status;
    }

    const columnTasks = {
      notStarted: tasks.filter((t) => t.status === "notStarted"),
      inProgress: tasks.filter((t) => t.status === "inProgress"),
      done: tasks.filter((t) => t.status === "done"),
    };

    columnTasks[activeTask.status] = columnTasks[activeTask.status].filter(
      (t) => t._id !== active.id,
    );

    const targetColumn = columnTasks[newStatus];

    let insertIndex = targetColumn.length; // default = append

    if (overTask) {
      const overIndex = targetColumn.findIndex((t) => t._id === over.id);

      if (overIndex !== -1) {
        if (activeTask.status === newStatus) {
          const activeIndex = tasks
            .filter((t) => t.status === newStatus)
            .findIndex((t) => t._id === active.id);

          if (activeIndex < overIndex) {
            insertIndex = overIndex + 1;
          } else {
            insertIndex = overIndex;
          }
        } else {
          insertIndex = overIndex + 1;
        }
      }
    }

    targetColumn.splice(insertIndex, 0, {
      ...activeTask,
      status: newStatus,
    });

    Object.keys(columnTasks).forEach((col) => {
      columnTasks[col] = columnTasks[col].map((task, index) => ({
        ...task,
        order: index,
      }));
    });

    const updatedTasks = [
      ...columnTasks.notStarted,
      ...columnTasks.inProgress,
      ...columnTasks.done,
    ];

    setTasks(updatedTasks);

    try {
      await axiosConfig.patch("/api/tasks/reorder", {
        tasks: updatedTasks.map((t) => ({
          _id: t._id,
          status: statusMap[t.status],
          order: t.order,
        })),
      });
    } catch (error) {
      console.error(error);
      message.error("Reorder failed");
      fetchTasks();
    }
  };

  const columns = useMemo(
    () => ({
      notStarted: tasks
        .filter((t) => t.status === "notStarted")
        .sort((a, b) => (a.order || 0) - (b.order || 0)),
      inProgress: tasks
        .filter((t) => t.status === "inProgress")
        .sort((a, b) => (a.order || 0) - (b.order || 0)),
      done: tasks
        .filter((t) => t.status === "done")
        .sort((a, b) => (a.order || 0) - (b.order || 0)),
    }),
    [tasks],
  );

  return (
    <div className="bg-white w-full rounded-xl select-none p-5 flex flex-col h-[calc(100vh-120px)] overflow-hidden">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-bold">Kanban Board</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("/tasks/create-task")}
        >
          Create
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid lg:grid-cols-3 gap-5 flex-1 min-h-0 overflow-y-auto lg:overflow-hidden">
          <Column
            id="notStarted"
            title="Not Started"
            tasks={columns.notStarted}
            fetchTasks={fetchTasks}
            onEdit={openEditModal}
          />
          <Column
            id="inProgress"
            title="In Progress"
            tasks={columns.inProgress}
            fetchTasks={fetchTasks}
            onEdit={openEditModal}
          />
          <Column
            id="done"
            title="Done"
            tasks={columns.done}
            fetchTasks={fetchTasks}
            onEdit={openEditModal}
          />
        </div>

        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              refreshTasks={fetchTasks}
              isDragging
              onEdit={openEditModal}
              dragListeners={{}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <Modal
        title="Update Task"
        open={isModalOpen}
        onOk={handleUpdate}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="priority" label="Priority">
            <Select>
              <Select.Option value="Low">Low</Select.Option>
              <Select.Option value="Medium">Medium</Select.Option>
              <Select.Option value="High">High</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select>
              <Select.Option value="notStarted">Not Started</Select.Option>
              <Select.Option value="inProgress">In Progress</Select.Option>
              <Select.Option value="done">Done</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="dueDate" label="Due Date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Tasks;
