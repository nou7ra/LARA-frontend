import api from "./api";

export const handleLogin = async (email, password, role) => {
  let endpoint = "";

  // تحديد المسار بناءً على النوع المختار من القائمة
  if (role === "instructor") {
    endpoint = "/instructor/login"; // الرابط الذي نجح في Postman
  } else if (role === "admin") {
    endpoint = "/admin/login"; // أو المسار الخاص بالأدمن عندك
  } else {
    endpoint = "/auth/login"; // مسار الطالب الافتراضي
  }

  const response = await api.post(endpoint, { email, password });

  // حفظ التوكن في المتصفح
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
  }

  return response.data;
};