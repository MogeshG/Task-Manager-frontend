import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCorners,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
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
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
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

const TaskCard = ({ task, refreshTasks }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const openModal = () => {
    form.setFieldsValue({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? dayjs(task.dueDate) : null,
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();

      await axiosConfig.put(`/api/tasks/${task._id}`, {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
      });

      message.success("Task updated successfully");
      setIsModalOpen(false);
      refreshTasks();
    } catch (err) {
      message.error("Failed to update task");
    }
  };

  return (
    <>
      <div
        onClick={openModal}
        className="cursor-pointer mb-3 rounded-xl border bg-white p-4 hover:shadow-lg"
      >
        <h3 className="font-semibold text-sm">{task.title}</h3>
        <p className="text-xs text-gray-500">{task.description}</p>
      </div>

      <Modal
        title="Update Task"
        open={isModalOpen}
        onOk={handleUpdate}
        onCancel={() => setIsModalOpen(false)}
        okText="Update"
        destroyOnClose
      >
        <Form layout="vertical" form={form}>
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Title is required" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Priority" name="priority">
            <Select>
              <Option value="Low">Low</Option>
              <Option value="Medium">Medium</Option>
              <Option value="High">High</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Due Date" name="dueDate">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const Column = ({ id, title, tasks, fetchTasks }) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const colors = columnStyles[id];

  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border ${colors.border}
        p-3 transition-all
        ${isOver ? colors.glow : "bg-gray-50"}
        flex flex-col min-h-120 md:min-h-80`}
    >
      {/* header */}
      <div
        className={`px-3 py-2 rounded-lg mb-3 text-sm font-semibold ${colors.header}`}
      >
        {title} ({tasks.length})
      </div>

      <SortableContext
        items={tasks.map((t) => t._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex-1 overflow-y-auto min-h-0 pt-2 hover-scroll">
          {tasks.length === 0 && (
            <div className="text-xs text-gray-400 text-center py-6 border-2 border-dashed rounded-lg">
              Drop tasks here
            </div>
          )}

          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} refreshTasks={fetchTasks} />
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
  const [search, setSearch] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

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

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title?.toLowerCase().includes(search.toLowerCase()) ||
        task.description?.toLowerCase().includes(search.toLowerCase());

      const matchesPriority =
        !selectedPriority || task.priority?.toLowerCase() === selectedPriority;

      const matchesDate =
        selectedDate === "" ||
        (task.dueDate &&
          dayjs(task.dueDate).format("YYYY-MM-DD") === selectedDate);

      return matchesSearch && matchesPriority && matchesDate;
    });
  }, [tasks, search, selectedPriority, selectedDate]);

  const columns = useMemo(
    () => ({
      notStarted: filteredTasks
        .filter((t) => t.status === "notStarted")
        .sort((a, b) => a.order - b.order),

      inProgress: filteredTasks
        .filter((t) => t.status === "inProgress")
        .sort((a, b) => a.order - b.order),

      done: filteredTasks
        .filter((t) => t.status === "done")
        .sort((a, b) => a.order - b.order),
    }),
    [filteredTasks],
  );

  const findColumn = (id) => {
    if (columns[id]) return id;
    return tasks.find((t) => t._id === id)?.status;
  };

  const handleDragStart = ({ active }) => {
    const task = tasks.find((t) => t._id === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async ({ active, over }) => {
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

    const activeTask = tasks.find((t) => t._id === active.id);
    if (!activeTask) return;

    const sourceTasks = columns[fromColumn].filter((t) => t._id !== active.id);

    let destinationTasks =
      fromColumn === toColumn ? sourceTasks : [...columns[toColumn]];

    let newIndex;
    const overTask = tasks.find((t) => t._id === over.id);

    if (overTask) {
      newIndex = destinationTasks.findIndex((t) => t._id === over.id);
    } else {
      newIndex = destinationTasks.length;
    }

    const movedTask = {
      ...activeTask,
      status: toColumn,
    };

    destinationTasks.splice(newIndex, 0, movedTask);

    const updatedDestination = destinationTasks.map((task, index) => ({
      ...task,
      order: index,
    }));

    const updatedSource =
      fromColumn === toColumn
        ? []
        : sourceTasks.map((task, index) => ({
            ...task,
            order: index,
          }));

    const updatedTasks = [
      ...tasks.filter((t) => t.status !== fromColumn && t.status !== toColumn),
      ...updatedSource,
      ...updatedDestination,
    ];

    // Optimistic UI (still using short keys for board logic)
    setTasks(updatedTasks);

    try {
      const affected =
        fromColumn === toColumn
          ? updatedDestination
          : [...updatedSource, ...updatedDestination];

      const displayStatusMap = {
        notStarted: "Not Started",
        inProgress: "In Progress",
        done: "Done",
      };

      await axiosConfig.patch("/api/tasks/reorder", {
        tasks: affected.map((task) => ({
          _id: task._id,
          status: displayStatusMap[task.status] || task.status,
          order: task.order,
        })),
      });
    } catch (error) {
      console.error("Reorder failed", error);
    }

    setActiveTask(null);
  };

  return (
    <div className="bg-white w-full rounded-xl p-3 md:p-5 flex-1 h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-bold whitespace-nowrap">
          Kanban Board
        </h2>

        <div className="flex flex-row gap-2">
          <Input
            placeholder="Search..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            className="!py-0"
            style={{ width: 250 }}
          />

          <Dropdown
            trigger={["click"]}
            dropdownRender={() => (
              <div
                style={{
                  background: "#fff",
                  padding: 12, // ⬅ reduce from 14
                  borderRadius: 10, // slightly tighter
                  width: 220, // smaller dropdown
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              >
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div>
                    <div className="text-xs font-semibold mb-1">Due Date</div>
                    <DatePicker
                      style={{ width: "100%" }}
                      value={selectedDate ? dayjs(selectedDate) : null}
                      onChange={(date) =>
                        setSelectedDate(date ? date.format("YYYY-MM-DD") : "")
                      }
                    />
                  </div>

                  <div>
                    <div className="text-xs font-semibold mb-1">Priority</div>
                    <Select
                      style={{ width: "100%" }}
                      value={selectedPriority || undefined}
                      onChange={(value) => setSelectedPriority(value || "")}
                      allowClear
                      placeholder="Select"
                      options={[
                        { value: "low", label: "Low" },
                        { value: "medium", label: "Medium" },
                        { value: "high", label: "High" },
                      ]}
                    />
                  </div>

                  <Button
                    type="link"
                    danger
                    block
                    style={{ padding: 0 }} // ⬅ removes extra vertical space
                    onClick={() => {
                      setSelectedDate("");
                      setSelectedPriority("");
                    }}
                  >
                    Clear
                  </Button>
                </Space>
              </div>
            )}
          >
            <Badge dot={selectedDate || selectedPriority}>
              <Button icon={<FilterOutlined />}>Filters</Button>
            </Badge>
          </Dropdown>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/tasks/create-task")}
          >
            Create
          </Button>
        </div>
      </div>
      <DndContext
        onDragStart={handleDragStart}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="flex flex-col md:grid md:grid-cols-3 gap-3 md:gap-5 h-full min-h-0 overflow-y-auto md:overflow-hidden px-1 md:px-0 scrollbar-hide">
            <Column
              id="notStarted"
              title="Not Started"
              tasks={columns.notStarted}
              fetchTasks={fetchTasks}
            />
            <Column
              id="inProgress"
              title="In Progress"
              tasks={columns.inProgress}
              fetchTasks={fetchTasks}
            />
            <Column
              id="done"
              title="Done"
              tasks={columns.done}
              fetchTasks={fetchTasks}
            />
          </div>
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default Tasks;
