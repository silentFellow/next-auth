import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const Home = async () => {
  const data = await getServerSession(authOptions);

  return (
    <div>{JSON.stringify(data)}</div>
  )
}

export default Home;
