import React, { useEffect, useState } from "react";
import { Layout, Menu, Form, Input, Button, message, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axiosConfig from "../../configs/AxiosConfig";

const { Sider, Content } = Layout;

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axiosConfig.get("/api/auth/verify");
      const user = res.data.user;

      profileForm.setFieldsValue({
        name: user.name,
        email: user.email,
        age: user.age,
      });
    } catch (error) {
      console.log(error);
      message.error({ content: "Failed to load user" });
    }
  };

  const handleProfileUpdate = async (values) => {
    try {
      setLoading(true);
      await axiosConfig.patch("/api/users/profile", values);
      message.success({ content: "Profile updated successfully" });
    } catch (error) {
      console.log(error);
      message.error({ content: "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      setLoading(true);
      await axiosConfig.patch("/api/users/password", values);
      message.success({ content: "Password updated successfully" });
      passwordForm.resetFields();
    } catch (error) {
      message.error({ content: error.response?.data?.message || "Failed to change password" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 flex bg-gray-50 rounded-xl overflow-hidden">
        {/* SIDEBAR */}
        <div className="w-64 bg-white border-r flex flex-col">
          <div className="px-6 py-5 text-lg font-semibold border-b">Settings</div>

          <Menu
            mode="inline"
            selectedKeys={[activeTab]}
            onClick={(e) => setActiveTab(e.key)}
            className="flex-1 border-none"
            items={[
              {
                key: "profile",
                icon: <UserOutlined />,
                label: "Profile",
              },
              {
                key: "password",
                icon: <LockOutlined />,
                label: "Change Password",
              },
            ]}
          />
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "profile" && (
            <Card
              title="Profile Settings"
              bordered={false}
              className="max-w-3xl rounded-xl shadow-sm"
            >
              <Form form={profileForm} layout="vertical" onFinish={handleProfileUpdate}>
                <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                  <Input size="large" />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[{ required: true, type: "email" }]}
                >
                  <Input size="large" />
                </Form.Item>

                <Form.Item name="age" label="Age">
                  <Input size="large" type="number" />
                </Form.Item>

                <Button type="primary" size="large" htmlType="submit" loading={loading}>
                  Save Changes
                </Button>
              </Form>
            </Card>
          )}

          {activeTab === "password" && (
            <Card
              title="Change Password"
              bordered={false}
              className="max-w-3xl rounded-xl shadow-sm"
            >
              <Form form={passwordForm} layout="vertical" onFinish={handlePasswordChange}>
                <Form.Item
                  name="currentPassword"
                  label="Current Password"
                  rules={[{ required: true }]}
                >
                  <Input.Password size="small" className="rounded-lg!" />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  label="New Password"
                  rules={[{ required: true }, { min: 6, message: "Minimum 6 characters" }]}
                >
                  <Input.Password size="small" className="rounded-lg!" />
                </Form.Item>

                <Button type="primary" size="large" htmlType="submit" loading={loading}>
                  Update Password
                </Button>
              </Form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
