import React, { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import axiosConfig from "../../configs/AxiosConfig";

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onRegister = async (values) => {
    setLoading(true);
    const formattedValues = {
      name: values.name,
      email: values.email,
      password: values.password,
    };

    try {
      const result = await axiosConfig.post(
        "/api/auth/register",
        formattedValues,
      );

      if (result.status === 201) {
        message.success({
          content: "Registration successful!",
        });

        if (result.data?.token) {
          localStorage.setItem("access_token", result.data.token);
        }

        navigate("/dashboard");
      } else {
        message.error({
          content: "Registration failed. Please try again.",
        });
      }
    } catch (error) {
      console.log("Registration error:", error);
      message.error({
        content:
          error?.response?.data?.message ||
          "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* LEFT SIDE */}
          <div className="hidden md:flex flex-col justify-center items-center bg-linear-to-br from-green-700 to-emerald-500 text-white p-10">
            <h1 className="text-4xl font-bold mb-4 text-center">
              Get Started 🚀
            </h1>
            <p className="text-center opacity-90">
              Join TASKMINT and manage your tasks efficiently.
            </p>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-md">
              <p className="text-green-500 text-2xl text-center font-semibold">
                TASKMINT
              </p>
              <h2 className="text-2xl font-semibold mb-2 text-center text-green-700">
                Create Account
              </h2>

              <Form
                form={form}
                layout="vertical"
                onFinish={onRegister}
                size="large"
              >
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[
                    { required: true, message: "Please enter your name" },
                  ]}
                >
                  <Input size="large" placeholder="Enter your name" />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Enter a valid email" },
                  ]}
                >
                  <Input size="large" placeholder="Enter your email" />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: "Please enter your password" },
                    {
                      min: 6,
                      message: "Password must be at least 6 characters",
                    },
                  ]}
                >
                  <Input.Password size="large" placeholder="Create password" />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Confirm Password"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Please confirm your password" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Passwords do not match"),
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password size="large" placeholder="Confirm password" />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full mt-2"
                >
                  Create Account
                </Button>

                <p className="text-center mt-4">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-green-700 font-medium"
                  >
                    Login
                  </button>
                </p>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
