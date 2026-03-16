import axios from "axios";

const handleRegister = async (name, email, password) => {
  try {
    const response = await axios.post("http://localhost:3000/auth/register", {
      name,
      email,
      password
    });

    console.log("Register Success:", response.data);
    alert("Account created successfully!");
  } catch (error) {
    console.error("Register Error:", error.response?.data);
    alert(error.response?.data.message || "Something went wrong");
  }
};