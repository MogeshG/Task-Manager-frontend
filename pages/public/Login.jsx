import React, { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    console.log("Form Values:", values);

    try {
      setLoading(true);

      const result = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
        values,
      );
      console.log("Login Response:", result);

      if (result.status !== 200) {
        throw new Error("Login failed");
      }

      localStorage.setItem("access_token", result.data.token);

      message.success({ content: "Login successful!" });

      // ✅ SPA navigation (no reload)
      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      message.error({
        content: "Login failed. Please check your credentials.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-100 p-4">
      <p className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-green-700">TASKMINT</p>

      <div className="w-full max-w-5xl grid md:grid-cols-2 bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-lg md:shadow-xl">
        <div className="hidden md:flex flex-col justify-center items-center bg-linear-to-br from-green-700 to-emerald-500 text-white p-8 md:p-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome Back 👋</h1>
        </div>

        <div className="flex items-center justify-center p-4 md:p-10">
          <Card className="w-full max-w-sm border-none shadow-none">
            <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center">
              Login to your account
            </h2>

            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: "Please enter your email" }]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "Please enter your password" }]}
              >
                <Input.Password size="large" />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                className="w-full text-sm md:text-base"
              >
                Login
              </Button>

              <p className="text-center mt-4 text-xs md:text-sm">
                New here?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="text-green-700 font-medium hover:underline"
                >
                  Register
                </button>
              </p>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
