import LoginForm from '@/components/forms/LoginForm'

const Login = () => {
  return (
    <section className="w-screen h-screen flex justify-center items-center bg-[#f0f0f0]">
      <div className="p-3 bg-white w-[360px]">
        <LoginForm />
      </div>
    </section>
  )
}

export default Login;
