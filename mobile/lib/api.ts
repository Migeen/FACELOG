import axios, { AxiosError } from "axios";

const API_BASE_URL = "http://192.168.1.9:8000/api/v1"; // Adjust for emulator or device

// Define response and error types (optional but recommended)
interface ApiError {
  message: string;
  [key: string]: any;
}

export const validateEmployee = async (email: string, password: string) => {
  try {
    console.log("Sending login payload:", { email, password });
    const response = await axios.post(`${API_BASE_URL}/auth/validate`, { email, password });
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("API Error:", err.response?.data); // 👀 log actual backend response
      throw err.response?.data || { message: "Validation failed" };
    }
    throw { message: "Unexpected error" };
  }
};

export const checkInOut = async (employeeId: number | string, type: "checkin" | "checkout") => {
  try {
    const response = await axios.post(`${API_BASE_URL}/attendance/check`, {
      employee_id: employeeId,
      type,
    });
    return response.data;
  } catch (err) {
    const error = err as AxiosError<ApiError>;
    throw error.response?.data || { message: "Check-in/out failed" };
  }
};

export const getReport = async (employeeId: number | string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/attendance/reports/${employeeId}`);
    return response.data;
  } catch (err) {
    const error = err as AxiosError<ApiError>;
    throw error.response?.data || { message: "Report fetch failed" };
  }
};
