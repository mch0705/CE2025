// 檔案路徑: netlify/functions/gemini.js

exports.handler = async function(event, context) {
  // 只允許 POST 請求
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 從前端請求中獲取 prompt
    const { prompt } = JSON.parse(event.body);

    // 從 Netlify 的安全環境變數中讀取 API 金鑰
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("API 金鑰未設定。");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // 代表前端去呼叫真正的 Google API
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Google API Error:", errorBody);
      return { statusCode: response.status, body: `Google API 請求失敗: ${errorBody}` };
    }

    const data = await response.json();

    // 將從 Google 得到的結果回傳給前端
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error("Serverless Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};