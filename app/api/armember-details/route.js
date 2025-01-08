import axios from "axios";
const userPlanDetailsURL = "https://reliabilitymanagement.co.uk/wp-json/armember/v1/arm_member_details?arm_api_key=7ZsGlv13oWjyqDZLbGeUoOGV4uDq32";

const userMembershipsDetailsURL =
  "https://reliabilitymanagement.co.uk/wp-json/armember/v1/arm_member_memberships?arm_api_key=7ZsGlv13oWjyqDZLbGeUoOGV4uDq32";
export async function POST(req) {
  try {
    const body = await req.json();
    const { arm_member_id } = body;

    const { data } = await axios.get(`${userMembershipsDetailsURL}&arm_user_id=${arm_member_id}`);

    return new Response(JSON.stringify({ message: "AR Member Details Fetched Successfully", data: data }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ message: "Hello from App Router API!" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
