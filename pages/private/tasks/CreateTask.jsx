import { useState } from "react";
import { Button, DatePicker, Input, message, Select } from "antd";
import axiosConfig from "../../../configs/AxiosConfig";
import { useNavigate } from "react-router-dom";

const CreateTask = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState({
    title: "",
    status: "Not Started",
    description: "",
    dueDate: "",
    priority: "Medium",
  });

  const CreateTask = async () => {
    try {
      setLoading(true);
      const formattedData = {
        ...taskData,
        dueDate: taskData.dueDate ? taskData.dueDate.format("YYYY-MM-DD") : null,
      };
      const result = await axiosConfig.post("/api/tasks/", formattedData);
      if (result.status === 201) {
        message.success({ content: "Task created successfully!" });
        setTaskData({
          title: "",
          status: "Not Started",
          description: "",
          dueDate: "",
          priority: "Medium",
        });
        navigate("/tasks");
      } else {
        message.error({ content: "Failed to create task. Please try again." });
      }
    } catch (error) {
      console.log("Error creating task:", error);
      message.error({ content: "Failed to create task. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full h-full justify-between bg-white rounded-md mt-2 p-4">
      <span className="text-2xl font-bold w-full text-center py-1">Create New Task</span>
      <div className="w-full h-full grid sm:grid-cols-2 md:grid-cols-3 gap-10  auto-rows-min">
        <div className="flex flex-col h-fit justify-start">
          <span className="text-lg font-semibold">Task Title</span>
          <Input
            value={taskData.title}
            onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
            placeholder="Enter task title"
            size="large"
            required
            //   className="max-w-70"
          />
        </div>
        <div className="flex flex-col h-fit justify-start">
          <span className="text-lg font-semibold">Task Status</span>
          <Select
            value={taskData.status}
            size="large"
            onChange={(value) => setTaskData({ ...taskData, status: value })}
            placeholder="Select task status"
            className="w-full sm:w-70"
            required
          >
            <Select.Option value="Not Started">Not Started</Select.Option>
            <Select.Option value="In Progress">In Progress</Select.Option>
            <Select.Option value="Done">Done</Select.Option>
          </Select>
        </div>
        <div className="flex flex-col h-fit justify-start">
          <span className="text-lg font-semibold">Task Priority</span>
          <Select
            value={taskData.priority}
            size="large"
            onChange={(value) => setTaskData({ ...taskData, priority: value })}
            placeholder="Select task priority"
            className="sm:w-70 w-full"
            required
          >
            <Select.Option value="Low">Low</Select.Option>
            <Select.Option value="Medium">Medium</Select.Option>
            <Select.Option value="High">High</Select.Option>
          </Select>
        </div>
        <div className="flex flex-col h-fit justify-start">
          <span className="text-lg font-semibold"> Description</span>
          <Input.TextArea
            value={taskData.description}
            rows={5}
            onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
            placeholder="Enter task description"
            size="large"
            className="max-w-70"
          />
        </div>
        <div className="flex flex-col h-fit justify-start">
          <span className="text-lg font-semibold">Due Date</span>
          <DatePicker
            value={taskData.dueDate}
            format="DD-MM-YYYY"
            size="large"
            required
            onChange={(value) => setTaskData({ ...taskData, dueDate: value })}
            placeholder="Select due date"
            className="max-w-70"
          />
        </div>
      </div>
      <div className="flex justify-end p-4">
        <Button
          type="primary"
          loading={loading}
          onClick={() => CreateTask()}
          className="text-white font-bold py-2 px-4 rounded"
        >
          Create Task
        </Button>
      </div>
    </div>
  );
};

export default CreateTask;
