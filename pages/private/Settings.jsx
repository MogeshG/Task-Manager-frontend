import { useEffect, useMemo, useState } from "react";
import { Menu, Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import axiosConfig from "../../configs/AxiosConfig";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialProfileValues, setInitialProfileValues] = useState(null);

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axiosConfig.get("/api/auth/verify");
      const user = res.data.user;

      const values = {
        name: user.name,
        email: user.email,
        age: user.age,
      };

      profileForm.setFieldsValue(values);
      setInitialProfileValues(values);
    } catch (error) {
      console.log(error);
      message.error({ content: "Failed to load user" });
    }
  };

  const profileValues = Form.useWatch([], profileForm);

  const isProfileChanged = useMemo(() => {
    if (!initialProfileValues) return false;
    return JSON.stringify(profileValues) !== JSON.stringify(initialProfileValues);
  }, [profileValues, initialProfileValues]);

  const handleProfileUpdate = async (values) => {
    try {
      setLoading(true);
      await axiosConfig.patch("/api/auth/profile", values);
      message.success({ content: "Profile updated successfully" });
      setInitialProfileValues(values);
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
      await axiosConfig.patch("/api/auth/password", values);
      message.success({ content: "Password updated successfully" });
      passwordForm.resetFields();
    } catch (error) {
      message.error({
        content: error.response?.data?.message || "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col md:flex-row bg-white rounded-xl overflow-hidden">
        {/* SIDEBAR / MOBILE TABS */}
        <div className="w-64 bg-white border-b md:border-b-0 md:border-r border-gray-300">
          {/* Mobile Menu */}
          <Menu
            mode="horizontal"
            selectedKeys={[activeTab]}
            onClick={(e) => setActiveTab(e.key)}
            className="visible md:hidden!"
            items={[
              {
                key: "profile",
                icon: <UserOutlined />,
                label: "Profile",
              },
              {
                key: "password",
                icon: <LockOutlined />,
                label: "Password",
              },
            ]}
          />

          <div className="hidden md:flex flex-col h-full">
            <div className="px-6 py-5 text-lg font-semibold">Settings</div>

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
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* PROFILE TAB */}
          {activeTab === "profile" && (
            <div className="max-w-3xl">
              <h2 className="text-xl font-bold mb-4">Update Profile</h2>

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

                {isProfileChanged && (
                  <Button type="primary" size="large" htmlType="submit" loading={loading}>
                    Save Changes
                  </Button>
                )}
              </Form>
            </div>
          )}

          {/* PASSWORD TAB */}
          {activeTab === "password" && (
            <div className="max-w-3xl">
              <h2 className="text-xl font-bold mb-4">Change Password</h2>

              <Form form={passwordForm} layout="vertical" onFinish={handlePasswordChange}>
                <Form.Item
                  name="currentPassword"
                  label="Current Password"
                  rules={[{ required: true }]}
                >
                  <Input.Password size="large" />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  label="New Password"
                  rules={[{ required: true }, { min: 6, message: "Minimum 6 characters" }]}
                >
                  <Input.Password size="large" />
                </Form.Item>

                <Button type="primary" size="large" htmlType="submit" loading={loading}>
                  Update Password
                </Button>
              </Form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
