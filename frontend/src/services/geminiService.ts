import axios from 'axios';

export const chatWithGemini = async (message: string, history: any[] = []) => {
  console.log('[DEBUG Frontend] chatWithGemini called:', { message: message?.substring(0, 50), historyLength: history?.length });
  try {
    const response = await axios.post('/api/ai/chat', { message, history });
    console.log('[DEBUG Frontend] Response received:', response.data);
    return response.data.text;
  } catch (error: any) {
    console.error('[DEBUG Frontend] Error in chatWithGemini:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status
    });
    return "I am currently unavailable. Please try again later.";
  }
};

export const analyzeMediaStructured = async (base64Data: string, mimeType: string) => {
  try {
    const response = await axios.post('/api/ai/analyze-media-structured', { base64Data, mimeType });
    return response.data;
  } catch (e) {
    console.error("Failed to call AI analysis backend:", e);
    return null;
  }
};

export const getThinkingResponse = async (prompt: string) => {
  try {
    const response = await axios.post('/api/ai/thinking-response', { prompt });
    return response.data.text;
  } catch (error) {
    return "";
  }
};

export const analyzeComplaintForAdmin = async (complaintData: { title: string; description: string; category?: string; mediaDescription?: string }) => {
  console.log('[DEBUG Frontend] analyzeComplaintForAdmin called:', complaintData.title?.substring(0, 50));
  try {
    const response = await axios.post('/api/ai/admin-analyze-complaint', complaintData);
    console.log('[DEBUG Frontend] Admin analysis received');
    return response.data.analysis;
  } catch (error: any) {
    console.error('[DEBUG Frontend] Error in analyzeComplaintForAdmin:', {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status
    });
    return null;
  }
};
