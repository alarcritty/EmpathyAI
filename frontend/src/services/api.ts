import axios from "axios";

const API_URL = "http://127.0.0.1:8002";

export const sendMessage = (data: any) => axios.post(`${API_URL}/chat`, data);
