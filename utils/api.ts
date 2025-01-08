import axios from "axios";

const jwtAuthURL = "https://reliabilitymanagement.co.uk/wp-json/jwt-auth/v1/token";

export async function login(username: string, password: string) {
  try {
    return await axios.post(jwtAuthURL, { username, password });
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getUserDetails(userId: string) {
  try {
    return await fetch("/api/armember-details", {
      body: JSON.stringify({ arm_member_id: userId }),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
  } catch (error) {
    console.log(error);
    return null;
  }
}
