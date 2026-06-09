const getApiBase = () => {
  // 🚀 ثبتنا الرابط على اللوكل هوست بالبورت الجديد تبعك
  // استخدمنا http بدلاً من https بناءً على تعديلاتنا في الـ Backend
  return "http://localhost:5029/api/v1";
};

export default getApiBase();